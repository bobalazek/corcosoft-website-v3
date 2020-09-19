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
  Quaternion,
  Vector3,
  Color4,
} from 'babylonjs';
import 'babylonjs-loaders';

// Asset imports
import botModel from './assets/models/bot.glb';
import environmentTexture from './assets/textures/environment.env';

// Constants
const ENABLE_DEBUG = false;
const CAMERA_DISTANCE = 25;
const CHARACTER_POSITION_SMOOOTHING = 0.3;
const CHARACTER_ROTATION_SMOOOTHING = 0.3;
const CHARACTER_RANDOM_POSITION_MOVE_INTERVAL = 5000;

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

let environmentCubeTexture = CubeTexture.CreateFromPrefilteredData(
  environmentTexture,
  scene
);
scene.environmentTexture = environmentCubeTexture;

// Game - Scene - Debug
if (ENABLE_DEBUG) {
  scene.debugLayer.show({ overlay: true });
}

// Game - Scene - Camera
let camera = new UniversalCamera(
  'camera',
  new Vector3(0, 0, -CAMERA_DISTANCE),
  scene
);
camera.lockedTarget = new Vector3(0, 0, 0);

// Game - Scene - Character
let character: AbstractMesh = null;
let characterLastPositionChange = (new Date()).getTime();

characterPrepare();

/********** Game - Render loop **********/
engine.runRenderLoop(() => {
  if (character) {
    characterTick(engine.getDeltaTime());
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
  if (now - characterLastPositionChange > CHARACTER_RANDOM_POSITION_MOVE_INTERVAL) {
    characterMoveToRandomPosition();
  }
}, 1000);

/********** Game - Functions **********/
function characterPrepare() {
  const importResult = SceneLoader.ImportMesh(
    '',
    '',
    botModel,
    scene,
    function() {
      character = scene.getMeshByID('__root__');
      character.id = character.name = 'CorcobotWrapper';
      character.position = new Vector3(0, 10, 0);
      character.metadata = {
        positionFinal: new Vector3(),
        rotationQuaternionFinal: new Vector3(),
      };

      // Face shield material fix
      const characterFaceShieldMaterial = scene.getMaterialByID('Face_Shield');
      characterFaceShieldMaterial.transparencyMode = 2;
      characterFaceShieldMaterial.alpha = 0;

      // Fix, so bones can be moved manually
      scene.getBoneByID('PropellerBone').linkTransformNode(null);
      scene.getBoneByID('ArmBone.L').linkTransformNode(null);
      scene.getBoneByID('ArmBone.R').linkTransformNode(null);

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
    }
  );
}

function characterTick(deltaTime: number) {
  const now = (new Date()).getTime();

  /********** Calculations **********/
  // Rotation
  // https://stackoverflow.com/a/51170230/4642875
  const from: Vector3 = character.position;
  const to: Vector3 = character.metadata.positionFinal;
  const distance: number = Vector3.DistanceSquared(to, from);
  const direction: Vector3 = to.subtract(from).normalize();

  let rotationAxis: Vector3 = (Vector3.Forward()).cross(direction).normalize();
  if (rotationAxis.lengthSquared() === 0) {
    rotationAxis = Vector3.Up();
  }

  const dot: number = Vector3.Dot(Vector3.Forward(), direction);
  const angle: number = Math.acos(dot);

  let rotationQuaternionFinal: Quaternion = Quaternion.RotationAxis(rotationAxis, angle);

  // Smoother transition for the final, "look towards us" position
  if (distance < 10) {
    rotationQuaternionFinal = Quaternion.Slerp(
      rotationQuaternionFinal,
      Quaternion.FromEulerAngles(0, Math.PI, 0),
      1 - (distance / 10)
    );
  }

  character.metadata.rotationQuaternionFinal = rotationQuaternionFinal;

  /********** Movement & rotation **********/
  // Character - levitation
  const characterInner = scene.getTransformNodeByID('Character');
  characterInner.position.y = Math.sin(now * 0.002) * 0.3;

  // Character - propeller spinning
  const properllerBone = scene.getBoneByID('PropellerBone');
  properllerBone.rotate(Axis.Y, (0.01 * distance) + 0.1);

  // Character - arm rotation
  // TODO: move arm towards the direction it flies

  // Character - position
  character.position = Vector3.Lerp(
    character.position,
    character.metadata.positionFinal,
    (1 / deltaTime) * CHARACTER_POSITION_SMOOOTHING
  );

  // Character - rotation
  character.rotationQuaternion = Quaternion.Slerp(
    character.rotationQuaternion,
    character.metadata.rotationQuaternionFinal,
    (1 / deltaTime) * CHARACTER_ROTATION_SMOOOTHING
  );
}

function characterMoveToRandomPosition() {
  characterCalculatePosition(
    window.innerWidth * Math.random() * 0.8,
    window.innerHeight * Math.random() * 0.8
  );
}

function characterCalculatePosition(screenX, screenY) {
  if (!character) {
    return;
  }

  const pickResult = scene.pick(screenX, screenY);
  character.metadata.positionFinal = new Vector3(
    pickResult.ray.origin.x + pickResult.ray.direction.x * CAMERA_DISTANCE,
    pickResult.ray.origin.y + pickResult.ray.direction.y * CAMERA_DISTANCE,
    pickResult.ray.origin.z + pickResult.ray.direction.z * CAMERA_DISTANCE
  );
  characterLastPositionChange = (new Date()).getTime();
}
