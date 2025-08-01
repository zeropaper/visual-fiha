import Display from "./Display";

function initializeDisplay() {
  if (Display.checkSupport()) {
    const display = new Display({
      id: window.location.hash.slice(1),
    });

    window.addEventListener("resize", () => {
      display.resize();
    });

    window.addEventListener("beforeunload", () => {
      display.post("unregister");
    });

    // when double clicking on the window its body goes fullscreen
    window.addEventListener("dblclick", () => {
      if (document.body.requestFullscreen) {
        document.body.requestFullscreen();
      }
    });
  } else {
    document.body.innerHTML =
      '<div style="color: red">Unsupported browser, please use Google Chrome.</div>';
  }
}

// Ensure DOM is fully loaded before initializing
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeDisplay);
} else {
  // DOM is already loaded
  initializeDisplay();
}
