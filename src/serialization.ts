import { Vector2 } from "@babylonjs/core";
import { Unit } from "./game-ai";
import { Shot } from "./shots";

export interface SerializedUnit {
  id: string;
  type: string;
  location?: Array<number>;
  hp: number;
  speed: number;
  range?: number;
  damage?: number;
  reloading?: number;
}

export interface SerializedEnemyUnit extends SerializedUnit {
  pos: number;
  path: Array<Array<number>>;
}

export interface GameState {
  grid: Array<Array<number>>;
  enemyPath: Array<Array<number>>;
  units: Array<SerializedUnit>;
  enemies?: Array<SerializedEnemyUnit>;
  shots?: Array<SerializedShot>;
}
export type SerializedShot = {
  type: number;
  location: Array<number>;
  target: Array<number>;
  life: number;
  initialLife: number;
};

export const serializeUnit = (unit: Unit): SerializedUnit => {
  return {
    ...unit,
    location: [unit.location.x, unit.location.y],
  };
};

export const deserializeUnit = (unit: SerializedUnit): Unit => {
  return {
    ...unit,
    range: unit.range || 0,
    damage: unit.damage || 0,
    reloading: unit.reloading || 0,
    location: unit.location
      ? new Vector2(unit.location[0], unit.location[1])
      : Vector2.Zero(),
  };
};
export const deserializeShot = (shot: SerializedShot): Shot => {
  return {
    ...shot,
    location: shot.location
      ? new Vector2(shot.location[0], shot.location[1])
      : Vector2.Zero(),
    target: shot.target
      ? new Vector2(shot.target[0], shot.target[1])
      : Vector2.Zero(),
    onHit() {},
  };
};
