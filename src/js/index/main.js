import App from "./app.js";

/**
 * Draw an image on the page
 * @param {Image} image Image to draw
 */
function draw(image) {
  const canvas = document.getElementById("image");
  const ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0);
  console.log(ctx.getImageData(0, 0, canvas.width, canvas.height));
}

$(() => {
  // Create the application
  window.app = new App();

  // Create an image
  //const img = new Image;
  //img.src = "../images/GEB.png";
  //window.img = img;

  //img.onload = () => draw(img);
});
