import CanvasImage from "../components/image/image.js";

/**
 * Main application code for one view
 */
export default class App {
  /**
   * Construct the view from components
   */
  constructor() {
    /**
     * Image
     * @type {Example}
     */
    this.image = new CanvasImage({
      src : "../images/GEB.png",
      width : 1000,
      height : 1443,
      container : "#image"
    });
  }
}
