import {
  Engine,
  Scene,
  UniversalCamera,
  MeshBuilder,
  PBRMetallicRoughnessMaterial,
  CubeTexture,
  SceneLoader,
  Vector3,
  Color4,
} from 'babylonjs';

// Constants
const CAMERA_DISTANCE = 15;
const CHARACTER_POSITION_SMOOOTHING = 0.002;

// CSS
import './css/index.scss';

// Game
const canvas = <HTMLCanvasElement>document.getElementById('canvas');
const engine = new Engine(
  canvas,
  true
);

// Game - Scene
let scene = new Scene(engine);
scene.clearColor = new Color4(0, 0, 0, 0);

var environmentTexture = CubeTexture.CreateFromPrefilteredData(
  'static/media/textures/environment.dds',
  scene
);
scene.environmentTexture = environmentTexture;

//scene.debugLayer.show({ overlay: true });

// Game - Scene - Camera
let camera = new UniversalCamera(
  'camera',
  new Vector3(0, 0, -CAMERA_DISTANCE),
  scene
);
camera.lockedTarget = new Vector3(0, 0, 0);

// Game - Scene - Character
let characterMaterial = new PBRMetallicRoughnessMaterial(
  'characterMaterial',
  scene
);
characterMaterial.environmentTexture = environmentTexture;

let character = null;
/*
let character = MeshBuilder.CreateSphere(
  'sphere',
  {
    diameter: 2,
  },
  scene
);
character.material = characterMaterial;
*/

let characterFinalPosition = new Vector3();

SceneLoader.LoadAssetContainer('/static/media/models/', 'bot.glb', scene, function (container) {
  console.log(container)
  let botMesh = container.scene.meshes[0];

  scene.addMesh(botMesh);

  botMesh.position = characterFinalPosition;
});

// Game - Render loop
engine.runRenderLoop(() => {
  // Character movement
  if (character) {
    character.position = Vector3.Lerp(
      character.position,
      characterFinalPosition,
      engine.getDeltaTime() * CHARACTER_POSITION_SMOOOTHING
    );
  }

  // Render
  scene.render();
});

// Game - Events
window.addEventListener('resize', () => {
  engine.resize();
});

window.addEventListener('mousemove', (e) => {
  const pickResult = scene.pick(e.clientX, e.clientY);
  characterFinalPosition = new Vector3(
    pickResult.ray.origin.x + pickResult.ray.direction.x * CAMERA_DISTANCE,
    pickResult.ray.origin.y + pickResult.ray.direction.y * CAMERA_DISTANCE,
    pickResult.ray.origin.z + pickResult.ray.direction.z * CAMERA_DISTANCE
  );
});
