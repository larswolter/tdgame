import { Scene } from "@babylonjs/core";

let currentScene : Scene;

export const setScene = (newScene: Scene) => {
  currentScene = newScene;
};

export const getScene = (): Scene => {
  return currentScene;
};
