import App from "./app.js";
import CanvasImage from "../components/canvasImage/canvasImage.js";

$(() => {
  // Create the application
  window.app = new App();

  // Listeners
  $("#decode").on("click", () => {
    if (app.image !== null) {
      $("#message-output").text(app.image.decodeFromCanvas());
    }
  });

  $("#encode").on("click", e => {
    if (app.image !== null) {
      app.image.encodeOntoCanvas($("#message-input").val());
    }
  });

  $("#image-upload").on("change", e => {
    if ("files" in e.target) {
      const reader = new FileReader;
      const [ file ] = e.target.files;
      reader.readAsDataURL(file);

      reader.onload = e => {
        const img = new Image;
        img.src = e.target.result;
        img.onload = () => {
          app.image = new CanvasImage({
            src : e.target.result,
            width : img.width,
            height : img.height,
            container : "#image"
          });
        };
      };

    }
  });
});
