import {
  Engine,
  Scene,
  AbstractMesh,
  UniversalCamera,
  CubeTexture,
  SceneLoader,
  Animation,
  Axis,
  Space,
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
  //'static/media/textures/environment.dds',
  'https://assets.babylonjs.com/environments/studio.env',
  scene
);
scene.environmentTexture = environmentTexture;

// Game - Scene - Debug
// scene.debugLayer.show({ overlay: true });

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
let characterLastFinalPositionChange = (new Date()).getTime();

characterPrepare();

/********** Game - Render loop **********/
engine.runRenderLoop(() => {
  if (character) {
    const deltaTime = engine.getDeltaTime();

    characterTick(deltaTime);

    character.position = Vector3.Lerp(
      character.position,
      characterFinalPosition,
      deltaTime * CHARACTER_POSITION_SMOOOTHING
    );
    character.rotationQuaternion = Quaternion.Slerp(
      character.rotationQuaternion,
      characterFinalRotationQuaternion,
      deltaTime * CHARACTER_ROTATION_SMOOOTHING
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
  characterCalculatePosition(e.clientX, e.clientY);
});

setInterval(() => {
  const now = (new Date()).getTime();
  if (now - characterLastFinalPositionChange > 3000) {
    characterMoveToRandomPosition();
  }
}, 1000);

/********** Game - Functions **********/
function characterPrepare() {
  SceneLoader.LoadAssetContainer('/static/media/models/', 'bot.glb', scene, function (container) {
    container.addAllToScene();

    character = scene.getMeshByID('__root__');
    character.id = character.name = 'CorcobotWrapper';
    character.position = new Vector3(0, 10, 0);

    const characterFaceShieldMaterial = scene.getMaterialByID('Face_Shield');
    characterFaceShieldMaterial.transparencyMode = 2;
    characterFaceShieldMaterial.alpha = 0;

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

function characterTick(deltaTime: number) {
  const now = (new Date()).getTime();

  // Rotation
  // https://stackoverflow.com/a/51170230/4642875
  const from: Vector3 = character.position;
  const to: Vector3 = characterFinalPosition;
  const distance: number = Vector3.DistanceSquared(to, from);
  const direction: Vector3 = to.subtract(from).normalize();

  let rotationAxis: Vector3 = (Vector3.Forward()).cross(direction).normalize();
  if (rotationAxis.lengthSquared() === 0) {
    rotationAxis = Vector3.Up();
  }

  const dot: number = Vector3.Dot(Vector3.Forward(), direction);
  const angle: number = Math.acos(dot);

  characterFinalRotationQuaternion = Quaternion.RotationAxis(rotationAxis, angle);

  if (distance < 3) {
    characterFinalRotationQuaternion = Quaternion.FromEulerAngles(0, Math.PI, 0);
  }

  // Levitation
  const characterInner = scene.getTransformNodeByID('Character');
  if (characterInner) {
    characterInner.position.y = Math.sin(now * 0.002) * 0.2;
  }

  // Propeller
  const properllerMesh = scene.getTransformNodeByID('PropellerBone');
  if (properllerMesh) {
    properllerMesh.rotate(Axis.Y, (0.01 * distance) + 0.1);
  }
}

function characterMoveToRandomPosition() {
  characterCalculatePosition(
    window.innerWidth * Math.random() * 0.8,
    window.innerHeight * Math.random() * 0.8
  );
}

function characterCalculatePosition(screenX, screenY) {
  const pickResult = scene.pick(screenX, screenY);
  characterFinalPosition = new Vector3(
    pickResult.ray.origin.x + pickResult.ray.direction.x * CAMERA_DISTANCE,
    pickResult.ray.origin.y + pickResult.ray.direction.y * CAMERA_DISTANCE,
    pickResult.ray.origin.z + pickResult.ray.direction.z * CAMERA_DISTANCE
  );
  characterLastFinalPositionChange = (new Date()).getTime();
}
