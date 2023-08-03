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
let prevRadius = 10;
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
    Math.PI / 2,
    1,
    10,
    new Vector3(0, 0, 0),
    scene,
  );
  camera.zoomToMouseLocation = false;
  camera.lowerRadiusLimit = 3;
  //  camera.upperAlphaLimit = Math.PI/2;
  //  camera.lowerAlphaLimit = Math.PI/2;
  camera.upperBetaLimit = 1;
  camera.upperRadiusLimit = 10;
  camera.keysLeft = [81];
  camera.keysRight = [69];
  camera.keysUp = [82];
  camera.keysDown = [70];
  camera.wheelPrecision = 0.01;

  camera.attachControl(canvas, true);
  camera.setTarget(Vector3.Zero());
  scene.beforeRender = () => {
    let ratio = 1;
    if (prevRadius != camera.radius) {
      ratio = prevRadius / camera.radius;
      prevRadius = camera.radius;

      camera.panningSensibility *= ratio;
      camera.wheelPrecision *= ratio;
      console.log(camera.wheelPrecision);
    }
  };
  scene.actionManager = new ActionManager(scene);

  scene.actionManager.registerAction(
    new ExecuteCodeAction(
      {
        trigger: ActionManager.OnKeyDownTrigger,
        parameter: "v",
      },
      function () {
        camera.setTarget(Vector3.Zero());
        camera.beta = 0;
        camera.alpha = Math.PI / 2;
        camera.radius = 10;
      },
    ),
  );

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
