// HUD feedback, overlay helpers, and simple UI messaging.

'use strict';

function updateEnemyCount(){
  var count = 0;
  for(var key in bots) if(bots[key].alive && bots[key].name !== 'FARM DOG') count++;
  document.getElementById('enemy-count').textContent = count > 0 ? 'Enemies: ' + count : 'All defeated!';
}

function updateResourceHUD(){
  var ammoEl = document.getElementById('ammo-label');
  var gasCanEl = document.getElementById('gascans-label');
  var ingredientEl = document.getElementById('ingredients-label');
  if(ammoEl) ammoEl.textContent = 'Ammo: ' + shotgunAmmo;
  if(gasCanEl) gasCanEl.textContent = 'Gas Cans: ' + gasCansHeld;
  if(ingredientEl) ingredientEl.textContent = 'Ingredients: ' + kitchenIngredients.length;
}

function showMsg(text, duration){
  var el = document.getElementById('msg');
  el.textContent = text;
  el.style.opacity = '1';
  clearTimeout(msgTimeout);
  msgTimeout = setTimeout(function(){ el.style.opacity = '0'; }, duration || 2200);
}

function showStageAlert(text){
  var el = document.getElementById('stage-alert');
  el.textContent = text;
  el.style.opacity = '1';
  clearTimeout(stageTimeout);
  stageTimeout = setTimeout(function(){ el.style.opacity = '0'; }, 4000);
}

function flashDamage(color){
  var el = document.getElementById('dmg-flash');
  el.style.background = color || 'rgba(255,0,0,0.38)';
  setTimeout(function(){ el.style.background = 'rgba(255,0,0,0)'; }, 130);
  // Screen shake
  var cv = document.getElementById('canvas');
  cv.classList.remove('shake');
  void cv.offsetWidth; // force reflow to restart animation
  cv.classList.add('shake');
  setTimeout(function(){ cv.classList.remove('shake'); }, 380);
}

function startGame(){
  document.getElementById('overlay').style.display = 'none';
  gameStarted = true;
  updateResourceHUD();
  requestLock();
}

window.startGame = startGame;
