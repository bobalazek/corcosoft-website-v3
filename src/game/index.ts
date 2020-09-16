import {
  Engine,
  Scene,
  AbstractMesh,
  UniversalCamera,
  CubeTexture,
  SceneLoader,
  Animation,
  Matrix,
  Quaternion,
  Vector3,
  Color4,
} from 'babylonjs';
import 'babylonjs-loaders';

// Constants
const CAMERA_DISTANCE = 25;
const CHARACTER_POSITION_SMOOOTHING = 0.002;
const CHARACTER_ROTATION_SMOOOTHING = 0.002;

// CSS
import './css/index.scss';

/********** Game **********/
const canvas = <HTMLCanvasElement>document.getElementById('canvas');
const engine = new Engine(
  canvas,
  true
);

/********** Game - Scene **********/
let scene = new Scene(engine);
scene.clearColor = new Color4(0, 0, 0, 0);

let environmentTexture = CubeTexture.CreateFromPrefilteredData(
  'static/media/textures/environment.dds',
  scene
);
scene.environmentTexture = environmentTexture;

// Game - Scene - Debug
//scene.debugLayer.show({ overlay: true });

// Game - Scene - Camera
let camera = new UniversalCamera(
  'camera',
  new Vector3(0, 0, -CAMERA_DISTANCE),
  scene
);
camera.lockedTarget = new Vector3(0, 0, 0);

// Game - Scene - Character
let character: AbstractMesh = null;
let characterFinalPosition = new Vector3();
let characterFinalRotationQuaternion = new Quaternion();

prepareCharacter();

/********** Game - Render loop **********/
engine.runRenderLoop(() => {
  if (character) {
    calculateCharacterRotation();

    character.position = Vector3.Lerp(
      character.position,
      characterFinalPosition,
      engine.getDeltaTime() * CHARACTER_POSITION_SMOOOTHING
    );
    character.rotationQuaternion = Quaternion.Slerp(
      character.rotationQuaternion,
      characterFinalRotationQuaternion,
      engine.getDeltaTime() * CHARACTER_ROTATION_SMOOOTHING
    );
  }

  // Render
  scene.render();
});

/********** Game - Events **********/
window.addEventListener('resize', () => {
  engine.resize();
});

window.addEventListener('mousemove', (e) => {
  calculateCharacterPosition(e.clientX, e.clientY);
});

/********** Game - Functions **********/
function prepareCharacter() {
  SceneLoader.LoadAssetContainer('/static/media/models/', 'bot.glb', scene, function (container) {
    container.addAllToScene();

    character = scene.getMeshByID('__root__');
    character.id = character.name = 'CorcobotWrapper';
    character.position = new Vector3(0, 10, 0);

    Animation.CreateAndStartAnimation(
      'CorcobotWrapperScale',
      character,
      'scaling',
      60,
      300,
      Vector3.Zero(),
      Vector3.One(),
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );
  });
}

function calculateCharacterPosition(screenX, screenY) {
  const pickResult = scene.pick(screenX, screenY);
  characterFinalPosition = new Vector3(
    pickResult.ray.origin.x + pickResult.ray.direction.x * CAMERA_DISTANCE,
    pickResult.ray.origin.y + pickResult.ray.direction.y * CAMERA_DISTANCE,
    pickResult.ray.origin.z + pickResult.ray.direction.z * CAMERA_DISTANCE
  );
}

// https://stackoverflow.com/a/51170230/4642875
function calculateCharacterRotation() {
  const from = character.position;
  const to = characterFinalPosition;

  const distance = Vector3.DistanceSquared(to, from);
  const direction: Vector3 = to.subtract(from).normalize();

  let rotationAxis: Vector3 = (Vector3.Forward()).cross(direction).normalize();
  if (rotationAxis.lengthSquared() === 0) {
    rotationAxis = Vector3.Up();
  }

  const dot: number = Vector3.Dot(Vector3.Forward(), direction);
  const angle = Math.acos(dot);

  characterFinalRotationQuaternion = Quaternion.RotationAxis(rotationAxis, angle);

  // TODO: smoother transition - crossmultiply?
  if (distance < 2) {
    characterFinalRotationQuaternion = Quaternion.FromEulerAngles(0, Math.PI, 0);
  }
}
