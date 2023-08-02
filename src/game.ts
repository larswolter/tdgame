import {
  Engine,
  Scene,
  Vector3,
  Color4,
  ShadowGenerator,
  DirectionalLight,
  PickingInfo,
  float,
  HighlightLayer,
  Color3,
  Mesh,
  Vector2,
  ParticleHelper,
  IParticleSystem,
} from "@babylonjs/core";
import { getScene, setScene } from "./state";
import { setupCameraControls } from "./controls";
import { setTerrainPick, setupTerrain } from "./terrain";
import { canvas } from "./app";
import { addTower, disposeGameAi, setupGameAi } from "./game-ai";
import { setupHud } from "./hud";
import { GameState } from "./serialization";

let shadowGenerator: ShadowGenerator;
let hoveringPick: PickingInfo | null;
let explosionSystem: IParticleSystem;

export const gameContext = () => {
  return {
    hoveringPick,
    shadowGenerator,
    scene: getScene(),
    canvas: canvas,
    explosionSystem
  };
};

export const setGameHover = (pick: PickingInfo | null) => {
  hoveringPick = pick;
};
export const gameClick = () => {
  const { hoveringPick } = gameContext();
  if (hoveringPick && hoveringPick.hit) {
    if (hoveringPick.pickedMesh?.name === "terrain") {
      const location =
        hoveringPick.pickedMesh.subMeshes[
          hoveringPick.subMeshId
        ].getBoundingInfo().boundingSphere.center;
      addTower(new Vector2(location.x, location.z));
    }
  }
  setTerrainPick(false);
};

let highlights: HighlightLayer;
let running: boolean;
export const setupGame = async ({
  engine,
  canvas,
  gameState,
}: {
  engine: Engine;
  canvas: HTMLCanvasElement;
  gameState: GameState;
}) => {
  engine.displayLoadingUI();
  const scene = new Scene(engine, {});
  scene.clearColor = new Color4(0, 0, 0, 1);
  highlights = new HighlightLayer("highlights", scene);
  const light = new DirectionalLight(
    "light1",
    new Vector3(-0.5, -1, -0.5),
    scene,
  );
  light.position = new Vector3(20, 40, 20);

  shadowGenerator = new ShadowGenerator(1024, light);
  shadowGenerator.darkness = 0.5;
  shadowGenerator.useExponentialShadowMap = true;
  shadowGenerator.usePercentageCloserFiltering = true;
  ParticleHelper.ParseFromFileAsync(
    "explosion",
    "particles/explosion.json",
    scene,
  ).then((system) => {
    explosionSystem = system;
    explosionSystem.updateSpeed = 0.5;
  });

  setupTerrain({ scene, grid: gameState.grid });
  setupCameraControls({
    scene,
    canvas,
    limits: [
      -gameState.grid[0].length / 2,
      -gameState.grid.length / 2,
      gameState.grid[0].length / 2,
      gameState.grid.length / 2,
    ],
  });
  setupHud();
  await scene.whenReadyAsync();
  engine.hideLoadingUI(); //when the scene is ready, hide loading
  getScene() && getScene().dispose();
  setScene(scene);
  scene.onDispose = () => {
    running = false;
    highlights.dispose();
    shadowGenerator.dispose();
    light.dispose();
    disposeGameAi();
  };
  setupGameAi(gameState);
  running = true;
};

export const updateGame = ({ delta }: { delta: float }) => {
  if (!running || !delta) return;
  const { hoveringPick } = gameContext();
  if (hoveringPick && hoveringPick.hit) {
    if (hoveringPick.pickedMesh?.name === "terrain") {
      highlights.removeAllMeshes();
      console.log(
        hoveringPick.pickedMesh.subMeshes[
          hoveringPick.subMeshId
        ].getBoundingInfo().boundingSphere.center,
      );
    } else if (hoveringPick.pickedMesh !== null) {
      if (!highlights.hasMesh(hoveringPick.pickedMesh))
        highlights.addMesh(hoveringPick.pickedMesh as Mesh, Color3.Blue());
    }
  } else highlights.removeAllMeshes();
};
