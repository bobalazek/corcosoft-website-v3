import {
  Engine,
  Scene,
  UniversalCamera,
  HemisphericLight,
  MeshBuilder,
  Matrix,
  Vector3,
  Color4,
} from 'babylonjs';

// Constants
const CAMERA_DISTANCE = 15;

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

let camera = new UniversalCamera(
  'camera',
  new Vector3(0, 0, -CAMERA_DISTANCE),
  scene
);
camera.lockedTarget = new Vector3(0, 0, 0);

let light = new HemisphericLight(
  'light',
  new Vector3(0, 1, 0),
  scene
);

let character = MeshBuilder.CreateSphere(
  'sphere',
  {
    diameter: 2,
  },
  scene
);

character.metadata = {
  finalPosition: new Vector3(),
};

// Game - Render loop
engine.runRenderLoop(() => {
  // Character movement
  character.position = Vector3.Lerp(
    character.position,
    character.metadata.finalPosition,
    engine.getDeltaTime() * 0.005
  );

  // Render
  scene.render();
});

// Game - Events
window.addEventListener('resize', () => {
  engine.resize();
});

window.addEventListener('mousemove', (e) => {
  const pickResult = scene.pick(e.clientX, e.clientY);
  character.metadata.finalPosition = new Vector3(
    pickResult.ray.origin.x + pickResult.ray.direction.x * CAMERA_DISTANCE,
    pickResult.ray.origin.y + pickResult.ray.direction.y * CAMERA_DISTANCE,
    pickResult.ray.origin.z + pickResult.ray.direction.z * CAMERA_DISTANCE
  );
});
