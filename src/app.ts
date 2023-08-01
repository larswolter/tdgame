import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { Engine } from "@babylonjs/core";
import { getScene } from "./state";
import { setupMenu } from "./menu";
import { updateGameAi } from "./game-ai";
import { updateShots } from "./shots";
import { updateGame } from "./game";

// create the canvas html element and attach it to the webpage
export const canvas = document.createElement("canvas");
canvas.style.width = "100vw";
canvas.style.height = "100vh";
canvas.id = "gameCanvas";
document.body.appendChild(canvas);

// initialize babylon scene and engine
const engine = new Engine(canvas, true,{ stencil: true });
setupMenu({ engine, canvas });
// hide/show the Inspector
window.addEventListener("keydown", (ev) => {
  // Shift+Ctrl+Alt+I
  if (ev.key === "i") {
    if (getScene().debugLayer.isVisible()) {
      getScene().debugLayer.hide();
    } else {
      getScene().debugLayer.show();
    }
  }
  if (ev.key === "x") {
    setupMenu({ engine, canvas });
  }
});

// run the main render loop
let lastTime = 0;
const gameLoop = () => {
  requestAnimationFrame(gameLoop);
  const curTime = performance.now();
  const delta = lastTime ? (curTime - lastTime) * 0.001 : 0.02;
  lastTime = curTime;
  updateGameAi({ delta });
  updateGame({ delta });
  updateShots({ delta });
  const scene = getScene();
  if (scene) scene.render();
};

//resize if the screen is resized/rotated
window.addEventListener("resize", () => {
  engine.resize();
});
gameLoop();
