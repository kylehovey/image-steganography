import App from "./app.js";

$(() => {
  // Create the application
  window.app = new App();

  // Listeners
  $("#decode").on("click", () => {
    $("#message").text(app.image.decodeFromCanvas());
  });
});
