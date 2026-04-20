// Keyboard, mouse, pointer lock, and interaction input handling.

'use strict';

function requestLock(){
  document.getElementById('canvas').requestPointerLock();
}

window.requestLock = requestLock;

document.addEventListener('pointerlockchange', function(){
  pointerLocked = (document.pointerLockElement === document.getElementById('canvas'));
  document.getElementById('lock-prompt').style.display = pointerLocked ? 'none' : 'block';
});

document.addEventListener('mousemove', function(e){
  if(!pointerLocked || !gameStarted || gameOver || win) return;
  camYaw  -= e.movementX * .0018;
  camPitch = Math.max(-.65, Math.min(.65, camPitch - e.movementY * .0018));
});

document.getElementById('canvas').addEventListener('click', function(){
  if(!gameStarted || gameOver || win){
    requestLock();
    return;
  }
  if(!pointerLocked){
    requestLock();
    return;
  }
  doSwing();
});

document.addEventListener('keydown', function(e){
  keys[e.code] = true;

  // Camera view controls (ArrowLeft/Right cycle, F closes)
  if(cameraActive){
    if(e.code === 'ArrowLeft' || e.code === 'ArrowRight'){
      e.preventDefault();
      cameraChannel = (cameraChannel + (e.code === 'ArrowRight' ? 1 : 2)) % 3;
      updateCameraView();
      return;
    }
    // Secret cheat: type ABCD while camera is open
    var _camCheatSeq = 'ABCD';
    if(!window._camCheatBuf) window._camCheatBuf = '';
    var ch = e.key.toUpperCase();
    if(_camCheatSeq.indexOf(ch) >= 0){
      window._camCheatBuf += ch;
      if(window._camCheatBuf.length > 4) window._camCheatBuf = window._camCheatBuf.slice(-4);
      if(window._camCheatBuf === 'ABCD'){
        window._camCheatBuf = '';
        if(!ownedWeapons.has('oneshot')){
          ownedWeapons.add('oneshot');
          weapon = 'oneshot';
          buildWeapon();
          showMsg('\u2605 ONE-SHOT GUN UNLOCKED! \u2605', 4000);
          updateWeaponUI();
        } else {
          showMsg('One-Shot Gun already equipped!', 1800);
        }
      }
    } else {
      window._camCheatBuf = '';
    }
  }

  if(e.code === 'KeyF'){
    e.preventDefault();
    if(e.repeat) return;
    if(cameraActive){ closeCameraView(); return; }
    doInteract();
    return;
  }

  if(e.code === 'KeyT'){
    e.preventDefault();
    if(!gameStarted||gameOver||win) return;
    if(bearTraps <= 0){ showMsg('No bear traps! Find some in the TRACTOR SHED.',2200); return; }
    if(placedTraps[currentSpot]){ showMsg('A trap is already set in this room.',1800); return; }
    bearTraps--;
    placedTraps[currentSpot] = {x: playerPos.x, z: playerPos.z};
    document.getElementById('trap-label').textContent = '\uD83D\uDC09 TRAPS: ' + bearTraps;
    showMsg('\uD83D\uDC3B Bear trap set! Big animatronics will be stunned. (T=place, ' + bearTraps + ' left)', 2400);
    buildRoom();
    return;
  }
  if(e.code === 'Space'){
    e.preventDefault();
    crouching = true;
    return;
  }
  if(e.code === 'KeyJ'){
    e.preventDefault();
    if(!gameStarted||gameOver||win||cutscenePlaying) return;
    if(currentSpot === 'vents'){
      showMsg('No room to jump in the vents.', 1500);
      return;
    }
    if(crouching){
      showMsg('Stand up before jumping.', 1500);
      return;
    }
    if(!jumping){
      jumping = true;
      jumpVelocity = 5.6;
    }
    return;
  }
  if(e.code === 'Digit0'){
    e.preventDefault();
    toggleFlashlight();
    return;
  }
  if(WEAPON_SLOT_KEYS[e.code] !== undefined){
    var w = WEAPON_SLOT_KEYS[e.code];
    if(ownedWeapons.has(w)){
      weapon = w;
      buildWeapon();
      showMsg('Weapon: ' + WEAPON_NAMES[w]);
    } else {
      showMsg("You don't have that weapon yet!");
    }
  }
});

document.addEventListener('keyup', function(e){
  keys[e.code] = false;
  if(e.code === 'Space') crouching = false;
});
