// Combat actions, hit detection, damage, and enemy death handling.

'use strict';

function doSwing(){
  if(swinging) return;
  swinging = true;

  if(weapon === 'shotgun' && shotgunAmmo <= 0){
    if(weaponMesh){
      weaponMesh.rotation.z = .18;
      setTimeout(function(){
        if(weaponMesh) weaponMesh.rotation.z = 0;
        swinging = false;
      }, 220);
    } else {
      swinging = false;
    }
    showMsg('*CLICK* No shells loaded!', 1800);
    updateWeaponUI();
    return;
  }

  if(weapon === 'pistol' && pistolAmmo <= 0){
    if(weaponMesh){
      weaponMesh.rotation.z = .12;
      setTimeout(function(){
        if(weaponMesh) weaponMesh.rotation.z = 0;
        swinging = false;
      }, 180);
    } else {
      swinging = false;
    }
    showMsg('*CLICK* No bullets! Find ammo around the farm.', 1800);
    updateWeaponUI();
    return;
  }

  if(weapon === 'taser' && taserCharges <= 0){
    if(weaponMesh){
      weaponMesh.rotation.z = .12;
      setTimeout(function(){
        if(weaponMesh) weaponMesh.rotation.z = 0;
        swinging = false;
      }, 180);
    } else {
      swinging = false;
    }
    showMsg('⚡ Taser depleted! Find batteries in the guard shack.', 2200);
    updateWeaponUI();
    return;
  }

  if(weaponMesh){
    if(weapon === 'pistol'){
      pistolAmmo--;
      weaponMesh.rotation.z = .22;
      flashDamage('rgba(255,230,80,0.45)');
      setTimeout(function(){
        if(weaponMesh) weaponMesh.rotation.z = 0;
        swinging = false;
      }, 200);
    } else if(weapon === 'shotgun'){
      shotgunAmmo--;
      weaponMesh.rotation.z = .4;
      flashDamage('rgba(255,255,150,0.55)');
      setTimeout(function(){
        if(weaponMesh) weaponMesh.rotation.z = 0;
        swinging = false;
      }, 320);
    } else if(weapon === 'taser'){
      taserCharges--;
      weaponMesh.rotation.x = -0.5;
      flashDamage('rgba(180,220,255,0.60)');
      setTimeout(function(){
        if(weaponMesh) weaponMesh.rotation.x = 0;
        swinging = false;
      }, 350);
    } else {
      weaponMesh.rotation.x = -Math.PI / 3;
      setTimeout(function(){
        if(weaponMesh) weaponMesh.rotation.x = 0;
        swinging = false;
      }, 280);
    }
  } else {
    swinging = false;
  }

  var range = (weapon === 'shotgun') ? SHOTGUN_RANGE : (weapon === 'pistol') ? PISTOL_RANGE : REACH;
  var hitAny = false;
  updateWeaponUI();
  for(var key in enemyMeshes){
    var mesh = enemyMeshes[key], bot = bots[key];
    if(!bot || !bot.alive) continue;
    var dx = mesh.position.x - camera.position.x, dz = mesh.position.z - camera.position.z;
    if(Math.sqrt(dx * dx + dz * dz) < range){
      var dmg = WEAPON_DAMAGE[weapon] || 1;
      if(bot.name === 'FARM DOG'){
        if(weapon !== 'shotgun') break;
        continue;
      }
      if(weapon === 'taser'){
        bot.stunTimer = (bot.stunTimer || 0) + TASER_STUN_TIME;
        hitAny = true;
        showMsg('⚡ ' + bot.name + ' STUNNED for ' + TASER_STUN_TIME + 's! Charges: ' + taserCharges, 2200);
        updateWeaponUI();
        break;
      }
      bot.hp -= dmg;
      hitAny = true;
      if(bot.hp <= 0) killBot(key, mesh, bot);
      else showMsg('Hit ' + bot.name + '! HP:' + Math.max(0, Math.floor(bot.hp)));
      if(weapon !== 'shotgun') break;
    }
  }
  if(weapon === 'shotgun' && !hitAny) showMsg('*BOOM* (missed)');
}

function destroyDog(mesh, message){
  if(!bots.dog.alive && dogDead) return;
  bots.dog.alive = false;
  bots.dog.hp = 0;
  bots.dog.tamed = false;
  dogTamed = false;
  dogDead = true;
  document.getElementById('dog-label').style.display = 'none';
  if(mesh){
    spawnDebris(bots.dog, mesh.position);
    scene.remove(mesh);
    delete enemyMeshes.dog;
  }
  showMsg(message || 'Your dog was destroyed! Find a REVIVE BONE in the WORKSHOP!', 4200);
  buildRoom();
}

function killBot(key, mesh, bot){
  bot.alive = false;
  spawnDebris(bot, mesh.position);
  scene.remove(mesh);
  delete enemyMeshes[key];
  var isPlush = bot.name.indexOf('PLUSH') >= 0;
  if(bot.name !== 'FARMER' && bot.name !== 'FARM DOG') animatronicsKilled++;
  showMsg(bot.name + ' defeated!' + (isPlush || bot.name === 'FARMER' ? '' : ' (others may rebuild it...)'), 2400);
  if(bot.name === 'FARMER'){
    if(farmerPhase === 1){
      bot.hp = 600;
      bot.alive = true;
      farmerPhase = 2;
      bot.spot = currentSpot;
      showMsg('PHASE 2 \u2014 THE FARMER ENRAGES!', 3500);
      buildRoom();
    } else if(farmerPhase === 2){
      phoneDropped = true;
      bots.purple.spot = 'cellar';
      showMsg('THE FARMER FALLS! He dragged himself to the CELLAR...', 4000);
      buildRoom();
    } else {
      // Phase 3 truly defeated
      policeTimer = 1;
      phoneDropped = true;
      showMsg('THE HYBRID IS DESTROYED! Grab his phone and RUN!', 4500);
      buildRoom();
    }
  }
  // Re-render debris
  var parts = roomDebrisData[currentSpot] || [];
  parts.slice(-4).forEach(function(item){
    if(item.type === 'arm') scene.add(makeBox(.18, .55, .18, item.col, item.x, .14, item.z, item.rx, item.ry, .8));
    else if(item.type === 'leg') scene.add(makeBox(.22, .60, .22, item.col, item.x, .14, item.z, item.rx, item.ry, 0));
    else if(item.type === 'head') scene.add(makeSphere(.28, item.col, item.x, .20, item.z));
    else if(item.type === 'oil'){
      var pd = new THREE.Mesh(
        new THREE.CircleGeometry(.55 + Math.random() * .3, 10),
        new THREE.MeshLambertMaterial({color:0x080808})
      );
      pd.rotation.x = -Math.PI / 2;
      pd.position.set(item.x, .01, item.z);
      scene.add(pd);
    }
  });
  updateEnemyCount();
}
