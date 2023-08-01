import {
  Sprite,
  SpriteManager,
  Vector2,
  Vector3,
  float,
  int,
} from "@babylonjs/core";
import { gameContext } from "./game";
import { getLineXYatPercent } from "./helpers";
import { GameState, deserializeShot } from "./serialization";

export type Shot = {
  sprite?: Sprite;
  type: int;
  location: Vector2;
  target: Vector2;
  life: float;
  initialLife: float;
  onHit: VoidFunction;
};
let manager: SpriteManager;
let shots: Array<Shot> = [];

export const setupShots = (gameState: GameState) => {
  const { scene } = gameContext();
  manager = new SpriteManager("shots", "textures/shots.png", 100, 64, scene);
  if (gameState.shots)
    gameState.shots.forEach((s) => {
      const shot = deserializeShot(s);
      addShot(shot);
    });
};
export const disposeShots = () => {
  shots = shots.filter((s) => {
    s.sprite && s.sprite.dispose();
    return false;
  });
  manager.dispose();
};

const addShot = (s: Shot) => {
  s.sprite = new Sprite("shot", manager);
  s.sprite.cellIndex = s.type;
  s.sprite.position = new Vector3(s.location.x, 0.2, s.location.y);
  s.sprite.size = 0.1;
  shots.push(s);
};

export const createShot = ({
  location,
  target,
  life,
  type,
  onHit,
}: {
  location: Vector2;
  target: Vector2;
  type: int;
  life: float;
  onHit: VoidFunction;
}) => {
  addShot({ type, location, target, life, initialLife: life, onHit });
};

export const updateShots = ({ delta }: { delta: float }) => {
  shots.forEach((shot) => {
    const location = getLineXYatPercent(
      shot.location,
      shot.target,
      1 - shot.life / shot.initialLife,
    );
    if (shot.sprite)
      shot.sprite.position = new Vector3(location.x, 0.2, location.y);
    shot.life -= delta;
  });
  shots = shots.filter((s) => {
    if (s.life > 0) return true;
    s.onHit();
    s.sprite && s.sprite.dispose();
    return false;
  });
};
