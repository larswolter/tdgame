import { Vector2, Vector3, float, int } from "@babylonjs/core";
import { addUnit, removeUnit, updateeUnit } from "./units";
import { terrainLocation } from "./terrain";
import { updateHud } from "./hud";
import { getLineXYatPercent } from "./helpers";
import { createShot, disposeShots, setupShots } from "./shots";
import { GameState, deserializeUnit, serializeUnit } from "./serialization";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Random = require("@reactioncommerce/random");

const stationId = Random.id();

export interface Unit {
  id: string;
  type: string;
  location: Vector2;
  hp: int;
  speed: float;
  range: float;
  damage: float;
  reloading: float;
}

export interface EnemyUnit extends Unit {
  pos: float;
  path: Array<Vector2>;
}

const units: { [key in string]: Unit } = {};
const enemies: { [key in string]: EnemyUnit } = {};
const grid: Array<Array<number>> = [];
let enemyPath: Array<Array<float>> = [];

let running = false;

const createEnemy = () => {
  if (!running) return;
  if (Math.random() < 0.2) {
    const enemy: EnemyUnit = {
      location: Vector2.Zero(),
      id: Random.id(),
      type: "enemy",
      hp: 3,
      pos: 0,
      damage: 0,
      range: 0,
      reloading: 0,
      speed: Math.random() * 0.1 + 1,
      path: enemyPath.map((tile) =>
        terrainLocation(tile[0], tile[1]).add(Vector2.Random(-0.25, 0.25)),
      ),
    };

    enemies[enemy.id] = enemy;
    addUnit(enemy);
  }
  setTimeout(createEnemy, 500);
};

export const addTower = (loc: Vector2) => {
  const unit = {
    id: Random.id(),
    type: "Tower",
    damage: 0.1,
    range: 1,
    reloading: 0,
    location: loc,
    hp: 10,
    speed: 0,
  };
  units[unit.id] = unit;
  addUnit(unit);
};
let saveInterval: unknown;
export const setupGameAi = (gameState: GameState) => {
  gameState.grid.forEach((row: Array<number>) => grid.push(row));
  gameState.units.forEach((u) => {
    units[u.id] = deserializeUnit(u);
    addUnit(units[u.id]);
  });
  if (gameState.enemies)
    gameState.enemies.forEach((e) => {
      enemies[e.id] = deserializeUnit(e) as EnemyUnit;
      addUnit(enemies[e.id]);
    });
  enemyPath = gameState.enemyPath;
  setupShots(gameState);
  running = true;
  updateHud({ hp: String(units['Station'].hp) });
  createEnemy();
  saveInterval = setInterval(()=>{
    const gameState = {
      grid,
      enemyPath,
      units: Object.values(units).map(u=>serializeUnit(u)),
      enemies: Object.values(enemies).map(e=>serializeUnit(e)),
    }
    window.localStorage.setItem('saveGame',JSON.stringify(gameState));
  },10000);
};

export const disposeGameAi = () => {
  if(saveInterval) clearInterval(saveInterval as number);
  running = false;
  removeUnit({ id: stationId });
  Object.keys(enemies).forEach((id) => {
    removeUnit({ id });
    delete enemies[id];
  });
  Object.keys(units).forEach((id) => {
    removeUnit({ id });
    delete units[id];
  });
  disposeShots();
};

export const updateGameAi = ({ delta = 0.02 }: { delta: number }) => {
  if (!running) return;

  // handle enemy units
  let loadedUnits = Object.keys(units).filter(
    (uid) => units[uid].reloading === 0,
  );
  Object.keys(enemies).forEach((id) => {
    const enemy = enemies[id];
    try {
      const p = enemy.pos * (enemy.path.length - 1);
      const loc = getLineXYatPercent(
        enemy.path[Math.floor(p)],
        enemy.path[Math.floor(p) + 1],
        p - Math.floor(p),
      );
      const location = new Vector3(loc.x, 0, loc.y);
      updateeUnit({
        id,
        location,
      });
      enemy.pos += delta * (0.02 * enemy.speed);
      loadedUnits = loadedUnits.filter((uid) => {
        const dist = loc.subtract(units[uid].location).length();
        if (units[uid].range && dist < units[uid].range) {
          units[uid].reloading = 0.2;
          setTimeout(() => {
            if (enemies[id]) {
              enemies[id].hp -= units[uid].damage;
            }
          }, dist * 250);
          createShot({
            life: dist * 0.5,
            location: units[uid].location,
            target: loc,
            type: 0,
            onHit() {
              if(enemies[id]) enemies[id].hp -= units[uid].damage;
            }
          });
          return false;
        }
        return true;
      });
      if (enemy.pos >= 1) {
        removeUnit({ id });
        delete enemies[id];
        units['Station'].hp -= 1;
        updateHud({ hp: String(units['Station'].hp) });
      } else if (enemy.hp <= 0) {
        removeUnit({ id });
        delete enemies[id];
      }
    } catch (err) {
      console.log({
        err,
        enemy,
      });
      removeUnit({ id });
      delete enemies[id];
    }
  });

  // handle friendly units
  for (const uid in units) {
    if (units[uid].reloading) {
      units[uid].reloading = Math.max(0, units[uid].reloading - delta);
    }
  }
};
