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
} from "@babylonjs/core";

type PosMap = {
  [key in string]: Vector2;
};
let terrainPositions: PosMap = {};
let tiledTerrain: Mesh;

export const terrainLocation = (x: number, y: number): Vector2 => {
  const loc = terrainPositions[x + "-" + y];
  return loc || Vector2.Zero;
};

export const setTerrainPick = (enable: boolean) => {
  if (tiledTerrain) tiledTerrain.isPickable = enable;
};

export const setupTerrain = async ({
  scene,
  grid,
}: {
  scene: Scene;
  grid: Array<Array<number | string>>;
}) => {
  tiledTerrain = new Mesh("terrain", scene);
  terrainPositions = {};
  const positions: FloatArray = [];
  const indices = [];
  const uvs = [];
  let hexIndex = 0;
  let hasOffset = false;
  for (let h = -grid.length / 2; h < grid.length / 2; h++) {
    for (let w = -grid[0].length / 2; w < grid[0].length / 2; w++) {
      const offset = hasOffset ? 0 : -0.5;
      positions.push(offset + w + 1);
      positions.push(0);
      positions.push(h * 0.75);
      positions.push(offset + w + 1.5);
      positions.push(0);
      positions.push(h * 0.75 + 0.25);
      positions.push(offset + w + 1.5);
      positions.push(0);
      positions.push(h * 0.75 + 0.75);
      positions.push(offset + w + 1);
      positions.push(0);
      positions.push(h * 0.75 + 1);
      positions.push(offset + w + 0.5);
      positions.push(0);
      positions.push(h * 0.75 + 0.75);
      positions.push(offset + w + 0.5);
      positions.push(0);
      positions.push(h * 0.75 + 0.25);

      uvs.push(0.5);
      uvs.push(0);
      uvs.push(1);
      uvs.push(0.25);
      uvs.push(1);
      uvs.push(0.75);
      uvs.push(0.5);
      uvs.push(1);
      uvs.push(0);
      uvs.push(0.75);
      uvs.push(0);
      uvs.push(0.25);

      indices.push(hexIndex + 0);
      indices.push(hexIndex + 1);
      indices.push(hexIndex + 2);
      indices.push(hexIndex + 3);
      indices.push(hexIndex + 4);
      indices.push(hexIndex + 5);
      indices.push(hexIndex + 0);
      indices.push(hexIndex + 2);
      indices.push(hexIndex + 5);
      indices.push(hexIndex + 5);
      indices.push(hexIndex + 2);
      indices.push(hexIndex + 3);

      hexIndex += 6;
    }
    hasOffset = !hasOffset;
  }

  const normals: Nullable<FloatArray> = [];
  VertexData.ComputeNormals(positions, indices, normals);

  const vertexData = new VertexData();

  vertexData.positions = positions;
  vertexData.indices = indices;
  vertexData.normals = normals;
  vertexData.uvs = uvs;

  vertexData.applyToMesh(tiledTerrain);
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
  const tileCoord = { x: 0, y: 0 };
  hasOffset = false;
  for (let h = -grid.length / 2; h < grid.length / 2; h++) {
    tileCoord.x = grid[0].length - 1;
    for (let w = -grid[0].length / 2; w < grid[0].length / 2; w++) {
      const texture = grid[tileCoord.y][tileCoord.x] || 0;
      const offset = hasOffset ? 0 : -0.5;
      terrainPositions[tileCoord.x + "-" + tileCoord.y] = new Vector2(
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
        12,
        tiledTerrain,
      );
      indexCount += 12;
      tileCoord.x -= 1;
    }
    hasOffset = !hasOffset;
    tileCoord.y += 1;
  }

  //Create the multi material
  //Create differents materials
  const grassMaterial = new StandardMaterial("grass");
  grassMaterial.diffuseTexture = new Texture("textures/grass.jpg");
  grassMaterial.diffuseColor = new Color3(0.2, 0.5, 0.2);
  const groundMaterial = new StandardMaterial("ground");
  groundMaterial.diffuseTexture = new Texture("textures/ground.jpg");
  groundMaterial.diffuseColor = new Color3(0.5, 0.5, 0.5);
  const rockMaterial = new StandardMaterial("rock");
  rockMaterial.diffuseTexture = new Texture("textures/rock.png");
  rockMaterial.diffuseColor = new Color3(0.5, 0.5, 0.5);
  const waterMaterial = new StandardMaterial("water");
  //waterMaterial.diffuseTexture = new Texture("textures/water.png");
  waterMaterial.diffuseColor = new Color3(0.2, 0.2, 0.75);

  const multimat = new MultiMaterial("multi", scene);

  multimat.subMaterials.push(groundMaterial);
  multimat.subMaterials.push(grassMaterial);
  multimat.subMaterials.push(waterMaterial);
  multimat.subMaterials.push(rockMaterial);
  tiledTerrain.material = multimat;
};
