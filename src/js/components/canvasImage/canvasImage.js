/**
 * Encode information in the lower bits of a byte
 * @param {Nummber} nibble Number between 0 and 15
 * @param {Number} byte Number between 0 and 255
 * @return {Number} Byte value offset by nibble
 */
function encodeNibble(nibble = 0, byte = 127) {
  return byte - (byte & 0xF) + (nibble & 0xF);
}

/**
 * Get encoded bits from a byte encoded with encodNibble
 * @param {Number} byte Number between 0 and 255
 * @return {Number} Encoded number (lower four bits)
 */
function decodeByte(byte = 255) {
  return byte & 0xF;
}

/**
 * Ensure that two indices don't fall on a cell
 *  that is a multiple of four. This is used
 *  to prevent modification of the alpha channel.
 *  @param {Number} a First index
 *  @param {Number} b Second index
 *  @return {[ Number, Number]} New indexes (may be the same)
 */
function shiftNoFour(a, b) {
  let [ first, second, shifts ] = [ a, b, 0 ];

  if (first % 4 === 3) {
    ++first;
    ++second;
    shifts = 2;
  } else if (second % 4 === 3) {
    ++second;
    shifts = 1;
  }

  return [ first, second, shifts ];
}

/**
 * Encode a string onto an array of bytes
 * @param {String} string String to be encoded
 * @param {Uint8ClampedArray} data Array of bytes to encode onto
 * @return {Uint8ClampedArray} Array of encoded info
 */
function encodeData(string = "", data = new Uint8ClampedArray) {
  if (2 * string.length >= data.length) {
    throw new Error("Not enough data to encode string.");
  }

  // Create new array for output
  const out = [ ... data ];

  // Encode each character onto two nibbles
  let head = 0;
  for (const char of string) {
    const asciiCode = char.charCodeAt(0);
    const [ upper, lower ] = [ 0xF0, 0x0F ].map(mask => asciiCode & mask);

    const [ upperIdx, lowerIdx, shifts ] = shiftNoFour(head, head + 1);

    out[upperIdx] = encodeNibble(upper >> 4, out[upperIdx]);
    out[lowerIdx] = encodeNibble(lower, out[lowerIdx]);

    head += 2 + shifts;
  }

  // Termination condition
  out[head + 1] = encodeNibble(0, out[head + 1]);
  out[head + 2] = encodeNibble(0, out[head + 2]);

  return Uint8ClampedArray.from(out);
}

/**
 * Decode string data from an encoded array of bytes
 * @param {Uint8ClampedArray} data Array of bytes with data
 * @return {String} Encoded string data
 */
function decodeData(data = new Uint8ClampedArray) {
  let out = "";

  let head = 0;
  while (head < data.length) {
    const [ upperIdx, lowerIdx, shifts ] = shiftNoFour(head, head + 1);
    head += 2 + shifts;
    const [ upper, lower ] = [ data[upperIdx], data[lowerIdx] ].map(decodeByte);
    const asciiCode = (upper << 4) + lower;

    if (asciiCode !== 0) {
      out = `${out}${String.fromCharCode(asciiCode)}`;
    } else {
      break;
    }
  }

  return out;
}

/**
 * Class for displaying and modifying an image
 */
export default class CanvasImage {
  /**
   * Construct the image
   * @param {Object} opts Configuration options
   * @param {String} opts.container ID of container to append image to
   * @param {String} opts.src Relative image location
   * @param {Number} opts.width Image width in pixels
   * @param {Number} opts.height Image height in pixels
   */
  constructor(opts) {
    /**
     * Store configuration options
     * @type {Object}
     */
    this._opts = opts;

    /**
     * Canvas element
     * @type {document.selector}
     */
    [ this._canvas ] = $(this._opts.container);

    this._canvas.width = this._opts.width;
    this._canvas.height = this._opts.height;

    /**
     * Context for drawing
     * @type {canvas.context}
     */
    this._ctx = this._canvas.getContext("2d");

    /**
     * Save a reference to the original image
     * @type {Promise<Image>}
     */
    this._image = this._getImage();

    this._image.then(img => this._ctx.drawImage(img, 0, 0));
  }

  /**
   * Create an image object from the source
   * @return {Promise<Image>}
   */
  _getImage() {
    const img = new Image;
    img.src = this._opts.src;

    return new Promise(resolve => { img.onload = () => resolve(img); });
  }

  /**
   * Get the image data for the source
   * @return {Promise<ImageData>}
   */
  getImageData() {
    const { width, height } = this._canvas;

    return this._ctx.getImageData(0, 0, width, height);
  }

  /**
   * Encode a string onto the image
   * @param {String} string String to encode
   */
  async encodeOntoCanvas(string = "") {
    const { data } = this.getImageData();
    const encoded = encodeData(string, data);
    const encodedData = new ImageData(
      encoded,
      this._opts.width,
      this._opts.height
    );
    await this.render(encodedData);
  }

  /**
   * Decode a string from the image
   */
  decodeFromCanvas(string = "") {
    const { data } = this.getImageData();
    return decodeData(data);
  }

  /**
   * Render the iamge
   * @param {ImageData} [imageData] Data to render
   */
  render(imageData = this.getImageData()) {
    this._ctx.putImageData(imageData, 0, 0);
  }
}
