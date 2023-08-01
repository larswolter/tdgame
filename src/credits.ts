import { Engine, Scene, Vector3, Color4, FreeCamera } from "@babylonjs/core";
import { getScene, setScene } from "./state";
import {
  AdvancedDynamicTexture,
  Button,
  StackPanel,
  TextBlock,
} from "@babylonjs/gui";
import { setupMenu } from "./menu";

export const setupCredits = async ({
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

  //--GUI--
  const guiMenu = AdvancedDynamicTexture.CreateFullscreenUI("UI");
  const panel = new StackPanel();
  panel.isVertical = true;
  const texts = [
    "Developed by Lars Wolter",
    "with the help of many",
    "Open Source Developers",
    "in the community"," "," "
  ];
  texts.forEach((t) => {
    const tc = new TextBlock(t, t);
    tc.color = "white";
    tc.height = "40px";
    panel.addControl(tc);
  });
  let button = Button.CreateSimpleButton("github", "More on Github");
  button.onPointerUpObservable.add(() => {
    window.open('https://github.com/larswolter/tdgame/','_blank');
  });
  button.width = 0.2;
  button.paddingBottom = "25px";
  button.height = "60px";
  button.color = "white";
  panel.addControl(button);
  
  button = Button.CreateSimpleButton("Back ", "Back");
  button.onPointerUpObservable.add(() => {
    setupMenu({ canvas, engine });
  });
  button.width = 0.2;
  button.paddingBottom = "5px";
  button.height = "40px";
  button.color = "white";
  panel.addControl(button);


  guiMenu.addControl(panel);
  await scene.whenReadyAsync();
  engine.hideLoadingUI(); //when the scene is ready, hide loading
  getScene() && getScene().dispose();
  setScene(scene);
};
