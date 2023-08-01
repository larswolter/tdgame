import {
  Scene,
  Vector3,
  ArcRotateCamera,
  ExecuteCodeAction,
  ActionManager,
  PointerEventTypes,
  float,
} from "@babylonjs/core";
import { gameClick, setGameHover } from "./game";

export const setupCameraControls = ({
  scene,
  canvas,
  limits,
}: {
  scene: Scene;
  canvas: HTMLCanvasElement;
  limits: Array<float>;
}) => {
  const camera = new ArcRotateCamera(
    "cameraGame",
    1.5,
    1,
    10,
    new Vector3(0, 0, 0),
    scene,
  );

  camera.lowerRadiusLimit = 5;
  camera.upperBetaLimit = 1;
  camera.upperRadiusLimit = 50;
  camera.keysLeft = [81];
  camera.keysRight = [69];
  camera.keysUp = [82];
  camera.keysDown = [70];

  camera.attachControl(canvas, true);
  camera.setTarget(Vector3.Zero());
  scene.actionManager = new ActionManager(scene);

  scene.actionManager.registerAction(
    new ExecuteCodeAction(
      {
        trigger: ActionManager.OnKeyDownTrigger,
        parameter: "w",
      },
      function () {
        if (camera.target.z <= limits[1]) return;
        const up = camera.upVector.clone();
        const view = camera.getForwardRay(1).direction;
        const side = up.cross(view);
        const forward = side.cross(up);
        forward.y = 0;
        forward.normalize();

        camera.target.addInPlace(forward.scale(0.75));
      },
    ),
  );
  scene.actionManager.registerAction(
    new ExecuteCodeAction(
      {
        trigger: ActionManager.OnKeyDownTrigger,
        parameter: "s",
      },
      function () {
        if (camera.target.z >= limits[3]) return;
        const up = camera.upVector.clone();
        const view = camera.getForwardRay(1).direction;
        const side = up.cross(view);
        const forward = side.cross(up);
        forward.y = 0;
        forward.normalize();
        camera.target.addInPlace(forward.scale(-0.75));
      },
    ),
  );
  scene.actionManager.registerAction(
    new ExecuteCodeAction(
      {
        trigger: ActionManager.OnKeyDownTrigger,
        parameter: "a",
      },
      function () {
        if (camera.target.x >= limits[2]) return;
        const up = camera.upVector.clone();
        const view = camera.getForwardRay(1).direction;
        const side = up.cross(view);
        side.y = 0;
        side.normalize();
        camera.target.addInPlace(side.scale(-1));
      },
    ),
  );
  scene.actionManager.registerAction(
    new ExecuteCodeAction(
      {
        trigger: ActionManager.OnKeyDownTrigger,
        parameter: "d",
      },
      function () {
        if (camera.target.x <= limits[0]) return;
        const up = camera.upVector.clone();
        const view = camera.getForwardRay(1).direction;
        const side = up.cross(view);
        side.y = 0;
        side.normalize();
        camera.target.addInPlace(side);
      },
    ),
  );
  scene.onPointerObservable.add((pointerInfo) => {
    switch (pointerInfo.type) {
    case PointerEventTypes.POINTERMOVE: {
      const pick = scene.pick(
        scene.pointerX,
        scene.pointerY,
        undefined,
        true,
      );
      if (pick.hit) {
        setGameHover(pick);
      } else setGameHover(null);

      break;
    }
    case PointerEventTypes.POINTERTAP:
      gameClick();
      break;
    }
  });
};
