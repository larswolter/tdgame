import {
  AbstractMesh,
  Mesh,
  MeshBuilder,
  SceneLoader,
  Vector2,
  Vector3,
} from "@babylonjs/core";
import { gameContext } from "./game";

export const addUnit = async ({
  type,
  id,
  location,
  rotation,
}: {
  type: string;
  id: string;
  location?: Vector2;
  rotation?: number;
}) => {
  const { scene, shadowGenerator } = gameContext();
  let mesh: Mesh;
  if (type === "Station") {
    const loaded = await SceneLoader.ImportMeshAsync(
      null,
      "./units/",
      "station.glb",
      scene,
    );
    mesh = loaded.meshes[0] as Mesh;
    if (location) mesh.position = new Vector3(location.x, 0, location.y);
  } else if (type === "Tower") {
    mesh = MeshBuilder.CreateBox(
      id,
      { width: 0.25, depth: 0.25, height: 0.75 },
      scene,
    );
    mesh.isPickable = true;
    if (location) mesh.position = new Vector3(location.x, 0, location.y);
  } else {
    mesh = MeshBuilder.CreateSphere(id, { diameter: 0.25 }, scene);
    mesh.isPickable = false;
    if (location) mesh.position = new Vector3(location.x, 0, location.y);
  }
  mesh.rotation = new Vector3(0, rotation, 0);
  shadowGenerator.addShadowCaster(mesh);
};

export const removeUnit = ({ id }: { id: string }) => {
  const { scene, explosionSystem } = gameContext();
  const mesh = scene.getMeshByName(id);
  if (mesh) {
    const node = new AbstractMesh("boom", scene);
    node.position = mesh.position.clone();
    explosionSystem.emitter = node;
    explosionSystem.start();

    mesh.dispose();
  }
};

export const updateeUnit = ({
  id,
  location,
  rotation,
}: {
  id: string;
  location?: Vector3 | undefined;
  rotation?: number | undefined;
}) => {
  const { scene } = gameContext();
  const mesh = scene.getMeshByName(id);
  if (mesh) {
    if (location) {
      mesh.position = location;
      mesh.position.y = 0.125;
    }
    if (rotation) {
      mesh.rotation = new Vector3(0, rotation, 0);
    }
  }
};
