import {
  Scene,
  StandardMaterial,
  MultiMaterial,
  SubMesh,
  Color3,
  Mesh,
  VertexData,
  FloatArray,
  Nullable,
  Texture,
  SpriteManager,
  Sprite,
  Vector2,
  CubeTexture,
  MeshBuilder,
  int,
  float,
} from "@babylonjs/core";
//import { WaterMaterial } from "@babylonjs/materials";
import { createTerrainMaterial } from "./terrainMaterial";

type PosMap = {
  [key in string]: Vector2;
};
let terrainPositions: PosMap = {};
export let tiledTerrain: Mesh;

export const terrainLocation = (x: number, y: number): Vector2 => {
  const loc = terrainPositions[x + "-" + y];
  return loc || Vector2.Zero;
};

export const setTerrainPick = (enable: boolean) => {
  if (tiledTerrain) tiledTerrain.isPickable = enable;
};
const oddrDirDiff = [
  // even rows
  [
    [+1, 0],
    [0, -1],
    [-1, -1],
    [-1, 0],
    [-1, +1],
    [0, +1],
  ],
  // odd rows
  [
    [+1, 0],
    [+1, -1],
    [0, -1],
    [-1, 0],
    [0, +1],
    [+1, +1],
  ],
];

export const setupTerrain = async ({
  scene,
  grid,
}: {
  scene: Scene;
  grid: Array<Array<number | string>>;
}) => {
  const sameNneighbour = (source: { x: int; y: int }, dir: int) => {
    const parity = source.y % 2 === 0 ? 1 : 0;
    const diff = oddrDirDiff[parity][dir];
    if (
      source.y + diff[1] < 0 ||
      source.y + diff[1] >= grid.length ||
      source.x + diff[0] < 0 ||
      source.x + diff[0] >= grid[0].length
    )
      return true;
    return (
      grid[source.y + diff[1]][source.x + diff[0]] === grid[source.y][source.x]
    );
  };
  // Skybox
  const skybox = MeshBuilder.CreateBox("skyBox", { size: 500.0 }, scene);
  const skyboxMaterial = new StandardMaterial("skyBox", scene);
  skyboxMaterial.backFaceCulling = false;
  skyboxMaterial.reflectionTexture = new CubeTexture(
    "textures/TropicalSunnyDay/TropicalSunnyDay",
    scene,
  );
  skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
  skyboxMaterial.diffuseColor = new Color3(100, 100, 250);
  skyboxMaterial.specularColor = new Color3(200, 200, 250);
  skyboxMaterial.disableLighting = true;
  skybox.material = skyboxMaterial;
  skybox.receiveShadows = true;
  skybox.isPickable = false;

  tiledTerrain = new Mesh("terrain", scene);

  terrainPositions = {};
  const positions: FloatArray = [];
  const indices = [];
  const uvs: FloatArray = [];
  const uv2: FloatArray = [];
  let hexIndex = 0;
  let hasOffset = false;
  let tc = { x: 0, y: 0 };

  for (let h = -grid.length / 2; h < grid.length / 2; h++) {
    tc.x = grid[0].length - 1;
    for (let w = -grid[0].length / 2; w < grid[0].length / 2; w++) {
      const offset = hasOffset ? 0 : -0.5;
      const addVertex = (
        x: float,
        y: float,
        z: float,
        u: float,
        v: float,
        n: boolean,
      ) => {
        positions.push(x);
        positions.push(y);
        positions.push(z);
        uvs.push(u);
        uvs.push(v);
        uv2.push(n ? 1 : 0);
        uv2.push(n ? 1 : 0);
      };
      addVertex(
        offset + w + 1,
        0,
        h * 0.75,
        0.5,
        0,
        sameNneighbour(tc, 1) && sameNneighbour(tc, 2),
      );
      addVertex(
        offset + w + 1.25,
        0,
        h * 0.75 + 0.125,
        0.75,
        0.25,
        sameNneighbour(tc, 2),
      );
      addVertex(
        offset + w + 1.5,
        0,
        h * 0.75 + 0.25,
        1,
        0.25,
        sameNneighbour(tc, 2) && sameNneighbour(tc, 3),
      );
      addVertex(
        offset + w + 1.5,
        0,
        h * 0.75 + 0.5,
        1,
        0.5,
        sameNneighbour(tc, 3),
      );
      addVertex(
        offset + w + 1.5,
        0,
        h * 0.75 + 0.75,
        1,
        0.75,
        sameNneighbour(tc, 3) && sameNneighbour(tc, 4),
      );
      addVertex(
        offset + w + 1.25,
        0,
        h * 0.75 + 0.875,
        0.75,
        0.75,
        sameNneighbour(tc, 4),
      );
      addVertex(
        offset + w + 1,
        0,
        h * 0.75 + 1,
        0.5,
        1,
        sameNneighbour(tc, 4) && sameNneighbour(tc, 5),
      );
      addVertex(
        offset + w + 0.75,
        0,
        h * 0.75 + 0.875,
        0.25,
        0.75,
        sameNneighbour(tc, 5),
      );
      addVertex(
        offset + w + 0.5,
        0,
        h * 0.75 + 0.75,
        0,
        0.75,
        sameNneighbour(tc, 5) && sameNneighbour(tc, 0),
      );
      addVertex(
        offset + w + 0.5,
        0,
        h * 0.75 + 0.5,
        0,
        0.5,
        sameNneighbour(tc, 0),
      );
      addVertex(
        offset + w + 0.5,
        0,
        h * 0.75 + 0.25,
        0,
        0.25,
        sameNneighbour(tc, 0) && sameNneighbour(tc, 1),
      );
      addVertex(
        offset + w + 0.75,
        0,
        h * 0.75 + 0.125,
        0.25,
        0.25,
        sameNneighbour(tc, 1),
      );
      addVertex(offset + w + 1, 0, h * 0.75 + 0.375, 0.5, 0.5, true);

      for (let i = 0; i < 12; i++) {
        indices.push(hexIndex + i);
        indices.push(hexIndex + ((i + 1) % 12));
        indices.push(hexIndex + 12);
      }
      hexIndex += 13;
      tc.x -= 1;
    }
    hasOffset = !hasOffset;
    tc.y += 1;
  }

  const normals: Nullable<FloatArray> = [];
  VertexData.ComputeNormals(positions, indices, normals);

  const vertexData = new VertexData();

  vertexData.positions = positions;
  vertexData.indices = indices;
  vertexData.normals = normals;
  vertexData.uvs = uvs;
  vertexData.uvs2 = uv2;

  vertexData.applyToMesh(tiledTerrain, true);
  tiledTerrain.receiveShadows = true;
  tiledTerrain.isPickable = false;
  tiledTerrain.subMeshes = [];
  const verticesCount = tiledTerrain.getTotalVertices();

  let indexCount = 0;
  const spriteManagerTrees = new SpriteManager(
    "treesManager",
    "textures/palmtree.png",
    2000,
    { width: 512, height: 1024 },
    scene,
  );
  tc = { x: 0, y: 0 };
  hasOffset = false;
  for (let h = -grid.length / 2; h < grid.length / 2; h++) {
    tc.x = grid[0].length - 1;
    for (let w = -grid[0].length / 2; w < grid[0].length / 2; w++) {
      const texture = grid[tc.y][tc.x] || 0;
      const offset = hasOffset ? 0 : -0.5;
      terrainPositions[tc.x + "-" + tc.y] = new Vector2(
        offset + w + 1,
        h * 0.75 + 0.5,
      );

      if (texture === 1) {
        for (let i = 0; i < 20; i++) {
          const tree = new Sprite("tree", spriteManagerTrees);
          tree.position.x = offset + w + 0.6 + Math.random() * 0.8;
          tree.position.z = h * 0.75 + 0.1 + Math.random() * 0.8;
          tree.position.y = 0.05;
          tree.size = 0.2;
        }
      }

      new SubMesh(
        Number.isInteger(texture) ? Number(texture) : 0,
        0,
        verticesCount,
        indexCount,
        36,
        tiledTerrain,
      );
      indexCount += 36;
      tc.x -= 1;
    }
    hasOffset = !hasOffset;
    tc.y += 1;
  }
  //  tiledTerrain.updateVerticesData(VertexBuffer.UV2Kind,uv2);

  //Create the multi material
  //Create differents materials
  const grassMaterial = createTerrainMaterial({
    t2: "textures/grass.jpg",
    t1: "textures/ground.jpg",
    scene,
  });
  const groundMaterial = createTerrainMaterial({
    t2: "textures/ground.jpg",
    t1: "textures/ground.jpg",
    scene,
  });
  const rockMaterial = createTerrainMaterial({
    t2: "textures/rock.png",
    t1: "textures/ground.jpg",
    scene,
  });
  const waterMaterial = createTerrainMaterial({
    t2: "textures/waterbump.png",
    t1: "textures/ground.jpg",
    scene,
  });
  /*
  const waterMaterial = new WaterMaterial(
    "water",
    scene,
    new Vector2(512, 512),
  );
  waterMaterial.backFaceCulling = true;
  waterMaterial.bumpTexture = new Texture("textures/waterbump.png", scene);
  waterMaterial.windForce = -20;
  waterMaterial.waveHeight = 0;
  waterMaterial.waveCount = 1;
  waterMaterial.bumpHeight = 0.5;
  waterMaterial.windDirection = new Vector2(1, 1);
  waterMaterial.waterColor = new Color3(0, 0, 221 / 255);
  waterMaterial.colorBlendFactor = 0.4;
  waterMaterial.addToRenderList(skybox);
  //waterMaterial.addToRenderList(spriteManagerTrees);
*/
  const multimat = new MultiMaterial("multi", scene);

  multimat.subMaterials.push(groundMaterial);
  multimat.subMaterials.push(grassMaterial);
  multimat.subMaterials.push(waterMaterial);
  multimat.subMaterials.push(rockMaterial);
  tiledTerrain.material = multimat;
};
