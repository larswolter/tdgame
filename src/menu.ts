import { Engine, Scene, Vector3, Color4, FreeCamera } from "@babylonjs/core";
import { getScene, setScene } from "./state";
import { AdvancedDynamicTexture, Button, StackPanel } from "@babylonjs/gui";
import { setupGame } from "./game";
import { GameState } from "./serialization";

import level1 from "../public/missions/level1.json";
import { setupCredits } from "./credits";

export const setupMenu = async ({
  engine,
  canvas,
}: {
  engine: Engine;
  canvas: HTMLCanvasElement;
}) => {
  engine.displayLoadingUI();
  const scene = new Scene(engine, {});
  scene.clearColor = new Color4(0, 0, 0, 1);
  const camera = new FreeCamera("camera1", new Vector3(0, 0, 0), scene);
  camera.setTarget(Vector3.Zero());
  const saveGame = localStorage.getItem("saveGame");

  //--GUI--
  const guiMenu = AdvancedDynamicTexture.CreateFullscreenUI("UI");
  const buttons = {
    "New Game": () => {
      setupGame({ engine, canvas, gameState: level1 as GameState });
    },
    Load: saveGame
      ? () => {
          setupGame({
            engine,
            canvas,
            gameState: JSON.parse(saveGame) as GameState,
          });
        }
      : undefined,
    Credits: () => {
      setupCredits({ engine, canvas });
    },
  };
  const panel = new StackPanel();
  panel.isVertical = true;
  guiMenu.addControl(panel);
  Object.entries(buttons).forEach(([btn, action]) => {
    if (action) {
      const button = Button.CreateSimpleButton(btn, btn);
      button.onPointerUpObservable.add(action);
      button.width = 0.2;
      button.paddingBottom = "5px";
      button.height = "40px";
      button.disabledColor = "#aaaaaaff";
      button.disabledColorItem = "#aaaaaaff";
      button.color = "white";
      panel.addControl(button);
    }
  });
  await scene.whenReadyAsync();
  engine.hideLoadingUI(); //when the scene is ready, hide loading
  getScene() && getScene().dispose();
  setScene(scene);
};
