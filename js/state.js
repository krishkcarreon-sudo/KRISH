// Shared mutable runtime state used across the game systems.

'use strict';

var scene, camera, renderer, clock;
var gameStarted, gameOver, win;
var playerHp;
var power;
var weapon;
var ownedWeapons;
var flashlightOn;
var hasBone;
var hasEscapeKey;
var keySpot;
var dogTamed;
var farmerPhase;
var timeTicks;
var currentHour;
var isAM;
var policeTimer;
var timeExpired;
var swinging;
var msgTimeout;
var stageTimeout;
var weaponMesh;
var flashlightMesh;
var spotLight;
var currentSpot;
var boneSpot;
var activatedBots;
var collectedFood;
var camYaw, camPitch;
var keys;
var pointerLocked;
var playerPos;
var roomDebrisData;
var enemyMeshes;
var guardDoorLocked;
var reviveParticles;
var hasPhone;
var phoneDropped;
var cutscenePlaying;
var dogDead;
var hasReviveBone;
var shotgunAmmo;
var pistolAmmo;
var taserCharges;
var kitchenIngredients;
var cookedMeals;
var collectedIngredients;
var collectedAmmo;
var lastDamageSource;
var cameraActive;
var cameraChannel;
var cameraViewTimer;
var animatronicsKilled;
var respawnTimers;
var bearTraps;
var placedTraps;
var gasCansHeld;
var collectedGasCans;
var activeGasCanIds;
var flickerTimer;
var flickerState;
var ambLight;
var roomLight;
var paranoiaTimer;
var walkBobT;
var roomEntryShown;
var crouching;
var jumpVelocity;
var jumpOffset;
var jumping;

function resetRuntimeState(){
  gameStarted = false;
  gameOver = false;
  win = false;
  playerHp = MAX_HP;
  power = 100;
  weapon = 'none';
  ownedWeapons = new Set(['none']);
  flashlightOn = false;
  hasBone = false;
  hasEscapeKey = false;
  keySpot = 'farmhouse';
  dogTamed = false;
  farmerPhase = 1;
  timeTicks = 0;
  currentHour = 9;
  isAM = false;  // starts 9 PM
  policeTimer = 0;
  timeExpired = false;
  swinging = false;
  msgTimeout = null;
  stageTimeout = null;
  weaponMesh = null;
  flashlightMesh = null;
  spotLight = null;
  currentSpot = 'cafeteria';
  boneSpot = null;
  activatedBots = new Set();   // bots that have left the stage
  collectedFood = new Set();   // consumed food items
  camYaw = 0;
  camPitch = 0;
  keys = {};
  pointerLocked = false;
  playerPos = new THREE.Vector3(0, 1.6, 6);
  roomDebrisData = {};
  enemyMeshes = {};
  guardDoorLocked = false;  // guard shack door blocks animatronics when true
  reviveParticles = [];     // [{mesh, vx,vy,vz, life, maxLife}] floating spark effect
  hasPhone = false;         // farmer's dropped phone
  phoneDropped = false;     // phone on ground in cellar
  cutscenePlaying = false;  // cutscene lock
  dogDead = false;          // dog was destroyed by animatronics
  hasReviveBone = false;    // picked up revive bone from workshop
  shotgunAmmo = 0;
  pistolAmmo  = 0;
  taserCharges = 0;
  kitchenIngredients = [];
  cookedMeals = 0;
  collectedIngredients = new Set();
  collectedAmmo = new Set();
  lastDamageSource = null;
  cameraActive = false;
  cameraChannel = 0;
  cameraViewTimer = 0;
  animatronicsKilled = 0;
  respawnTimers = {};
  bearTraps = 0;
  placedTraps = {};
  gasCansHeld = 0;
  collectedGasCans = new Set();
  activeGasCanIds = new Set();
  flickerTimer = 0;
  flickerState = 1.0;
  ambLight = null;
  roomLight = null;
  paranoiaTimer = 22 + Math.random() * 18;
  walkBobT = 0;
  roomEntryShown = new Set();
  crouching = false;
  jumpVelocity = 0;
  jumpOffset = 0;
  jumping = false;
}
