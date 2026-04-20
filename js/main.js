// Main game bootstrap and orchestration. This wires together the data, state,
// rendering helpers, systems, and the main animation loop.

'use strict';

const MOVE_SPEED     = 5.0;
const REACH          = 2.6;
const SHOTGUN_RANGE  = 6.5;
const MAX_HP         = 250;
const TICKS_PER_HOUR = 10800;  // 3 real minutes per in-game hour
const GAS_CAN_POWER  = 35;
const VENT_MOVE_SPEED = 3.4;
const PLAYER_COLLISION_RADIUS = 0.48;

var ROOM_SOLIDS = {
  cafeteria: [
    {x:-0.2, z:-7.5, hw:3.3, hd:0.9},
    {x:-4.0, z:-3.0, hw:1.8, hd:1.0},
    {x: 0.0, z:-3.0, hw:1.8, hd:1.0},
    {x: 4.0, z:-3.0, hw:1.8, hd:1.0},
    {x:-4.0, z: 1.5, hw:1.8, hd:1.0},
    {x: 0.0, z: 1.5, hw:1.8, hd:1.0},
    {x: 4.0, z: 1.5, hw:1.8, hd:1.0},
  ],
  guard_shack: [
    {x: 0.0, z:-3.5, hw:2.1, hd:1.0},
    {x:-4.5, z:-4.5, hw:0.7, hd:1.0},
  ],
  farmhouse: [
    {x: 0.0, z:-4.5, hw:1.9, hd:1.0},
    {x: 0.0, z:-10.8, hw:1.5, hd:0.8},
    {x:-9.9, z:-4.0, hw:0.6, hd:2.2},
    {x:-5.5, z: 3.5, hw:2.0, hd:0.9},
  ],
  kitchen: [
    {x: 0.0, z:-7.5, hw:5.4, hd:0.9},
    {x: 6.6, z:-7.5, hw:1.3, hd:0.9},
    {x:-8.0, z:-6.9, hw:1.2, hd:1.0},
    {x: 0.0, z:-1.5, hw:2.1, hd:1.2},
    {x: 7.0, z: 4.3, hw:1.3, hd:1.0},
  ],
  workshop: [
    {x:-1.0, z:-7.5, hw:3.8, hd:1.0},
    {x: 9.5, z: 0.0, hw:1.0, hd:2.8},
    {x: 2.0, z: 2.0, hw:2.0, hd:1.2},
  ],
  generator_room: [
    {x: 0.0, z:-6.0, hw:1.9, hd:1.1},
    {x:-7.0, z:-8.0, hw:1.8, hd:0.9},
  ],
  arcade: [
    {x:-10.2, z:-5.0, hw:0.9, hd:1.5},
    {x:-10.2, z: 0.0, hw:0.9, hd:1.5},
    {x:-10.2, z: 5.0, hw:0.9, hd:1.5},
    {x: 10.2, z:-5.0, hw:0.9, hd:1.5},
    {x: 10.2, z: 0.0, hw:0.9, hd:1.5},
    {x: 10.2, z: 5.0, hw:0.9, hd:1.5},
    {x: 0.0,  z:-10.45, hw:8.3, hd:1.1},
    {x: 0.0,  z: 2.0,    hw:0.8, hd:0.8},
  ],
  restrooms: [
    {x: 0.0, z:10.5, hw:4.3, hd:0.9},
  ],
};

var VENT_LINKS = {
  cafeteria:     { roomX:-8.0, roomZ: 7.6, ventX:-8.0, ventZ: 8.0, label:'CAFETERIA' },
  farmhouse:     { roomX: 8.0, roomZ: 7.4, ventX:-3.2, ventZ: 8.0, label:'FARMHOUSE' },
  kitchen:       { roomX:-8.0, roomZ: 7.4, ventX: 3.2, ventZ: 8.0, label:'KITCHEN' },
  workshop:      { roomX: 8.0, roomZ: 7.2, ventX:-8.0, ventZ:-3.2, label:'WORKSHOP' },
  closet:        { roomX: 8.0, roomZ:-6.8, ventX: 8.0, ventZ: 3.2, label:'CLOSET' },
  generator_room:{ roomX:-7.4, roomZ: 7.2, ventX: 8.0, ventZ:-3.2, label:'GENERATOR' },
};

var TABLE_HIDE_SPOTS = [
  { id:'caf_table_west',   room:'cafeteria', x:-4.0, z: 1.5, exitX:-4.0, exitZ: 3.2, label:'TABLE' },
  { id:'caf_table_center', room:'cafeteria', x: 0.0, z: 1.5, exitX: 0.0, exitZ: 3.2, label:'TABLE' },
  { id:'caf_table_east',   room:'cafeteria', x: 4.0, z: 1.5, exitX: 4.0, exitZ: 3.2, label:'TABLE' },
  { id:'farm_table',       room:'farmhouse', x: 0.0, z:-4.5, exitX: 0.0, exitZ:-2.8, label:'DINING TABLE' },
  { id:'kitchen_table',    room:'kitchen',   x: 7.0, z: 4.3, exitX: 7.0, exitZ: 6.1, label:'KITCHEN TABLE' },
];

var LOCKER_HIDE_SPOTS = [
  { id:'guard_locker',    room:'guard_shack', x:-4.5, z:-4.5, y:1.0, exitX:-2.8, exitZ:-4.5, label:'LOCKER' },
  { id:'workshop_locker', room:'workshop',    x: 8.7, z: 6.4, y:1.0, exitX: 7.0, exitZ: 6.4, label:'LOCKER' },
];

var PISTOL_AMMO_ITEMS = [
  { id:'pammo_cafeteria', spot:'cafeteria',   x: 6.0, z:-5.5, y:0.90, amount:20, label:'PISTOL BULLETS' },
  { id:'pammo_farmhouse', spot:'farmhouse',   x:-3.0, z: 2.5, y:0.90, amount:20, label:'PISTOL BULLETS' },
  { id:'pammo_barn',      spot:'barn',        x:-6.0, z:-3.0, y:0.10, amount:20, label:'PISTOL BULLETS' },
  { id:'pammo_pasture',   spot:'pasture',     x:-4.0, z: 3.0, y:0.04, amount:20, label:'PISTOL BULLETS' },
  { id:'pammo_cellar',    spot:'cellar',      x: 3.5, z:-3.0, y:0.92, amount:20, label:'PISTOL BULLETS' },
  { id:'pammo_workshop',  spot:'workshop',    x: 2.0, z:-3.5, y:0.88, amount:20, label:'PISTOL BULLETS' },
  { id:'pammo_foxhole',   spot:'fox_hole',    x: 2.5, z: 2.0, y:0.04, amount:20, label:'PISTOL BULLETS' },
  { id:'pammo_arcade',    spot:'arcade',      x: 4.0, z: 2.5, y:0.04, amount:20, label:'PISTOL BULLETS' },
];

resetRuntimeState();


function addLabel(text, x, y, z, color) {
  var cv=document.createElement('canvas'); cv.width=320; cv.height=64;
  var ctx=cv.getContext('2d');
  ctx.fillStyle='rgba(0,0,0,0.7)'; ctx.fillRect(0,0,320,64);
  ctx.fillStyle=color||'#fff'; ctx.font='bold 15px Courier New';
  ctx.textAlign='center'; ctx.fillText(text,160,40);
  var sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(cv),transparent:true}));
  sp.position.set(x,y,z); sp.scale.set(2.6,.58,1); scene.add(sp);
}


function buildSegmentedWall(axis, pos, wallColor, accentColor, doors) {
  var HALF=ROOM_HALF, LEN=ROOM_HALF*2;
  var wmat=new THREE.MeshLambertMaterial({color:wallColor});
  var fmat=new THREE.MeshLambertMaterial({color:accentColor});
  var dkmat=new THREE.MeshLambertMaterial({color:0x030102});

  // Sort doors and build solid segments between them
  var sorted=[].concat(doors).sort(function(a,b){return a.center-b.center;});
  var cursor=-HALF;
  var segs=[];
  for(var i=0;i<sorted.length;i++){
    var d=sorted[i];
    var dl=d.center-d.width/2, dr=d.center+d.width/2;
    if(cursor<dl) segs.push({x1:cursor,x2:dl,type:'wall'});
    segs.push({x1:dl,x2:dr,type:'door',door:d});
    cursor=dr;
  }
  if(cursor<HALF) segs.push({x1:cursor,x2:HALF,type:'wall'});

  segs.forEach(function(seg){
    var len=seg.x2-seg.x1; if(len<0.01) return;
    var ctr=(seg.x1+seg.x2)/2;
    if(seg.type==='wall'){
      var m=new THREE.Mesh(new THREE.BoxGeometry(
        axis==='x'?len:0.14, WALL_H, axis==='x'?0.14:len), wmat);
      m.position.set(axis==='x'?ctr:pos, WALL_H/2, axis==='x'?pos:ctr);
      scene.add(m);
      // Wall trim strip at floor level
      var tr=new THREE.Mesh(new THREE.BoxGeometry(
        axis==='x'?len:0.18, 0.18, axis==='x'?0.18:len), fmat);
      tr.position.set(axis==='x'?ctr:pos, 0.09, axis==='x'?pos:ctr);
      scene.add(tr);
      // Wall trim strip at ceiling level
      var tr2=new THREE.Mesh(new THREE.BoxGeometry(
        axis==='x'?len:0.18, 0.18, axis==='x'?0.18:len), fmat);
      tr2.position.set(axis==='x'?ctr:pos, WALL_H-0.09, axis==='x'?pos:ctr);
      scene.add(tr2);
    } else {
      // Door section: lintel above + dark void + frame
      var lintelH=WALL_H-DOOR_H;
      if(lintelH>0.01){
        var lm=new THREE.Mesh(new THREE.BoxGeometry(
          axis==='x'?len:0.14, lintelH, axis==='x'?0.14:len), wmat);
        lm.position.set(axis==='x'?ctr:pos, DOOR_H+lintelH/2, axis==='x'?pos:ctr);
        scene.add(lm);
      }
      // Dark void
      var dm=new THREE.Mesh(new THREE.BoxGeometry(
        axis==='x'?(len-.06):0.10, DOOR_H-.04, axis==='x'?0.10:(len-.06)), dkmat);
      dm.position.set(axis==='x'?ctr:pos, DOOR_H/2, axis==='x'?pos:ctr);
      scene.add(dm);
      // Door frame posts
      var fw=0.16, fd=0.22;
      if(axis==='x'){
        scene.add(makeBox(fw,DOOR_H,fd,accentColor, ctr-len/2-fw/2, DOOR_H/2, pos));
        scene.add(makeBox(fw,DOOR_H,fd,accentColor, ctr+len/2+fw/2, DOOR_H/2, pos));
        scene.add(makeBox(len+fw*2,fw,fd,accentColor, ctr, DOOR_H+fw/2, pos));
      } else {
        scene.add(makeBox(fd,DOOR_H,fw,accentColor, pos, DOOR_H/2, ctr-len/2-fw/2));
        scene.add(makeBox(fd,DOOR_H,fw,accentColor, pos, DOOR_H/2, ctr+len/2+fw/2));
        scene.add(makeBox(fd,fw,len+fw*2,accentColor, pos, DOOR_H+fw/2, ctr));
      }
      // Small destination label above door
      var lx=axis==='x'?ctr:pos, lz=axis==='x'?pos:ctr;
      addLabel('> '+(ROOM_NAMES[seg.door.dest]||seg.door.dest.toUpperCase()), lx, DOOR_H+.55, lz, '#3a3030');
    }
  });
}

function buildRoomBase() {
  var rc=ROOM_COLORS[currentSpot]||{bg:0x111111,floor:0x1a1a18,wall:0x161614,ceil:0x0c0c0a,accent:0x262620};
  scene.background=new THREE.Color(rc.bg);
  scene.fog=new THREE.Fog(rc.bg, 8, 22);

  // Textured-look floor (dark base + lighter grid lines)
  var flMat=new THREE.MeshLambertMaterial({color:rc.floor});
  var fl=new THREE.Mesh(new THREE.PlaneGeometry(ROOM_HALF*2,ROOM_HALF*2),flMat);
  fl.rotation.x=-Math.PI/2; scene.add(fl);
  // Floor planks/tiles suggestion via thin strips
  for(var fi=-5;fi<=5;fi++){
    var st=new THREE.Mesh(new THREE.PlaneGeometry(.02,ROOM_HALF*2-1),
      new THREE.MeshLambertMaterial({color:new THREE.Color(rc.floor).multiplyScalar(.7).getHex()}));
    st.rotation.x=-Math.PI/2; st.position.set(fi*1.9,.002,0); scene.add(st);
  }

  // Ceiling
  var clMat=new THREE.MeshLambertMaterial({color:rc.ceil});
  var cl=new THREE.Mesh(new THREE.PlaneGeometry(ROOM_HALF*2,ROOM_HALF*2),clMat);
  cl.rotation.x=Math.PI/2; cl.position.y=WALL_H; scene.add(cl);

  var doors=ROOM_DOORS[currentSpot]||[];

  // N wall z=-ROOM_HALF
  buildSegmentedWall('x',-ROOM_HALF,rc.wall,rc.accent,doors.filter(function(d){return d.wall==='N';}));
  // S wall z=+ROOM_HALF
  buildSegmentedWall('x', ROOM_HALF,rc.wall,rc.accent,doors.filter(function(d){return d.wall==='S';}));
  // W wall x=-ROOM_HALF
  buildSegmentedWall('z',-ROOM_HALF,rc.wall,rc.accent,doors.filter(function(d){return d.wall==='W';}));
  // E wall x=+ROOM_HALF
  buildSegmentedWall('z', ROOM_HALF,rc.wall,rc.accent,doors.filter(function(d){return d.wall==='E';}));
}


function addWindow(x, y, z, ww, wh, wd, wallAxis) {
  // Outer frame
  scene.add(makeBox(wallAxis==='x'?ww+.3:wd+.06, wh+.3, wallAxis==='x'?wd+.06:ww+.3, 0x2a1e10, x, y, z));
  // Glass (dark blue-green)
  scene.add(makeBox(wallAxis==='x'?ww:wd+.02, wh, wallAxis==='x'?wd+.02:ww, 0x0a1218, x, y, z));
  // Window panes (cross dividers)
  scene.add(makeBox(wallAxis==='x'?ww+.1:0.04, .05, wallAxis==='x'?0.04:ww+.1, 0x2a1e10, x, y, z));
  scene.add(makeBox(wallAxis==='x'?0.04:0.04, wh+.1, wallAxis==='x'?0.04:0.04, 0x2a1e10, x, y, z));
  // Moonlight glow through window
  scene.add(makeBox(wallAxis==='x'?ww*.8:wd*.5, wh*.8, wallAxis==='x'?wd*.5:ww*.8, 0x161c28, x, y+.05, z));
}


function clearRoom() {
  scene.children.slice().forEach(function(c){if(!c.userData.perm) scene.remove(c);});
  enemyMeshes={};
}

function buildRoom() {
  document.getElementById('dmg-flash').style.background = 'rgba(255,0,0,0)';
  clearRoom();
  buildRoomBase();

  if(currentSpot==='cafeteria')    buildCafeteria();
  else if(currentSpot==='guard_shack')  buildGuardShack();
  else if(currentSpot==='barn')         buildBarn();
  else if(currentSpot==='farmhouse')    buildFarmhouse();
  else if(currentSpot==='tractor_shed') buildTractorShed();
  else if(currentSpot==='silo')         buildSilo();
  else if(currentSpot==='closet')       buildCloset();
  else if(currentSpot==='dog_house')    buildDogHouse();
  else if(currentSpot==='cellar')       buildCellar();
  else if(currentSpot==='pasture')      buildPasture();
  else if(currentSpot==='front_gate')   buildFrontGate();
  else if(currentSpot==='restrooms')    buildRestrooms();
  else if(currentSpot==='fox_hole')     buildFoxHole();
  else if(currentSpot==='petting_zoo')  buildPettingZoo();
  else if(currentSpot==='workshop')     buildWorkshop();
  else if(currentSpot==='kitchen')      buildKitchen();
  else if(currentSpot==='arcade')          buildArcade();
  else if(currentSpot==='cage')            buildCage();
  else if(currentSpot==='generator_room')  buildGeneratorRoom();
  else if(currentSpot==='play_place')      buildPlayPlace();
  else if(currentSpot==='vents')           buildVents();

  buildVentAccess();

  // Bone pickup
  if(currentSpot===boneSpot&&!hasBone){
    scene.add(makeBox(.70,.22,.22,0xf0f0e0,2,.11,-2.5));
    scene.add(makeSphere(.18,0xf0f0e0,2.44,.11,-2.5));
    scene.add(makeSphere(.18,0xf0f0e0,1.56,.11,-2.5));
    addLabel('F = PICK UP BONE',2,.9,-2.5,'#fc8844');
  }

  // Revive bone for dead dog (appears in workshop)
  if(currentSpot==='workshop'&&dogDead&&!hasReviveBone){
    scene.add(makeBox(.70,.22,.22,0xffe0a0,4,.11, 3.5));
    scene.add(makeSphere(.18,0xffe0a0,4.44,.11, 3.5));
    scene.add(makeSphere(.18,0xffe0a0,3.56,.11, 3.5));
    addLabel('F = GRAB REVIVE BONE',4,.9,3.5,'#ffcc44');
  }

  // Escape key pickup
  if(currentSpot===keySpot&&!hasEscapeKey&&timeExpired){
    scene.add(makeCylinder(.08,.08,.04,0xffd700,3.5,.30,-3));
    scene.add(makeBox(.3,.04,.04,0xffd700,3.6,.30,-3));
    scene.add(makeBox(.06,.12,.04,0xffd700,3.78,.26,-3));
    scene.add(makeSphere(.08,0xffee44,3.5,.38,-3));
    addLabel('F = GRAB ESCAPE KEY',3.5,1.0,-3,'#ffe44a');
  }

  // Farmer's dropped phone — appears in cellar after he's defeated
  if(currentSpot==='cellar'&&phoneDropped&&!hasPhone){
    // Phone body
    scene.add(makeBox(.14,.28,.022,0x222222, -2, .16, -3));
    scene.add(makeBox(.12,.24,.024,0x112244, -2, .16, -2.99));  // screen
    scene.add(makeBox(.04,.04,.024,0x444444, -2, .04, -2.99));  // home button
    addLabel('F = PICK UP PHONE',  -2, 1.0, -3, '#44aaff');
  }

  // Placed bear trap visual (jaw open, on floor)
  if(placedTraps[currentSpot]){
    var tp=placedTraps[currentSpot];
    scene.add(makeBox(.36,.04,.28,0x3a3a3a, tp.x,.022,tp.z));
    var tjL=makeBox(.32,.06,.06,0x555555, tp.x,.052,tp.z-.12); tjL.rotation.z=0.40; scene.add(tjL);
    var tjR=makeBox(.32,.06,.06,0x555555, tp.x,.052,tp.z+.12); tjR.rotation.z=-0.40; scene.add(tjR);
    scene.add(makeCylinder(.05,.05,.08,0x666666, tp.x,.018,tp.z,0,0,Math.PI/2));
    addLabel('\uD83D\uDC3B TRAP', tp.x,.50,tp.z,'#cc8844');
  }

  buildEnemies();
  buildDebris();
  buildFoodItems();
  buildKitchenIngredients();
  buildAmmoItems();
  buildGasCans();
  buildBatteryItems();
  buildHideSpots();
  buildDoorLeadLabels();
  updateEnemyCount();

  // Pacifist talk-down prompt
  if(bots.purple.alive && bots.purple.spot===currentSpot && bots.purple.hp<80 &&
     animatronicsKilled===0 && dogTamed && farmerPhase<3){
    var fm2=enemyMeshes['purple'];
    if(fm2) addLabel('F = TALK DOWN THE FARMER',fm2.position.x,3.2,fm2.position.z,'#aaffcc');
  }
}

function buildVentAccess(){
  var vent = VENT_LINKS[currentSpot];
  if(!vent || currentSpot==='vents') return;

  scene.add(makeBox(1.8,0.08,1.2,0x555555, vent.roomX, 0.05, vent.roomZ));
  scene.add(makeBox(1.9,0.06,1.3,0x2a2a2a, vent.roomX, 0.09, vent.roomZ));
  for(var slat=-2; slat<=2; slat++){
    scene.add(makeBox(0.22,0.02,1.0,0x888888, vent.roomX + slat*0.30, 0.12, vent.roomZ));
  }
  addLabel(crouching ? 'F = ENTER VENT' : 'CROUCH + F = ENTER VENT', vent.roomX, 1.1, vent.roomZ, '#88ddff');
}

function buildDoorLeadLabels(){
  if(currentSpot==='cafeteria') return; // cafeteria already uses large hub labels
  var doors = ROOM_DOORS[currentSpot] || [];
  doors.forEach(function(door){
    var label = ROOM_NAMES[door.dest] || door.dest.toUpperCase();
    var lx = 0, lz = 0;

    if(door.wall==='N'){
      lx = door.center;
      lz = -ROOM_HALF + 1.0;
    } else if(door.wall==='S'){
      lx = door.center;
      lz = ROOM_HALF - 1.0;
    } else if(door.wall==='W'){
      lx = -ROOM_HALF + 1.0;
      lz = door.center;
    } else {
      lx = ROOM_HALF - 1.0;
      lz = door.center;
    }

    addLabel('TO ' + label, lx, 1.7, lz, '#ffbb66');
  });
}

function buildHideSpots(){
  TABLE_HIDE_SPOTS.forEach(function(spot){
    if(spot.room!==currentSpot) return;
    addLabel(crouching ? 'F = HIDE UNDER ' + spot.label : 'CROUCH + F = HIDE', spot.x, 1.1, spot.z, '#99ffaa');
  });

  LOCKER_HIDE_SPOTS.forEach(function(spot){
    if(spot.room!==currentSpot) return;
    if(spot.id==='workshop_locker'){
      scene.add(makeBox(1.2,2.4,0.7,0x3a4654, spot.x,1.2,spot.z));
      scene.add(makeBox(0.56,2.26,0.05,0x526274, spot.x-.30,1.2,spot.z+.33));
      scene.add(makeBox(0.56,2.26,0.05,0x526274, spot.x+.30,1.2,spot.z+.33));
      scene.add(makeBox(0.06,0.10,0.04,0xd4b36a, spot.x-.18,1.2,spot.z+.36));
      scene.add(makeBox(0.06,0.10,0.04,0xd4b36a, spot.x+.18,1.2,spot.z+.36));
    }
    addLabel('F = HIDE IN ' + spot.label, spot.x, 2.0, spot.z, '#88ddff');
  });
}


function buildCafeteria(){
  // Serving counter with support legs
  scene.add(makeBox(6.0,.96,1.0,0x3a2020,-0.2,.48,-7.5));
  scene.add(makeBox(6.0,.08,1.05,0x2a1818,-0.2,1.00,-7.5));
  scene.add(makeBox(5.5,.06,.9,0x444444,-0.2,1.16,-7.5));
  scene.add(makeBox(.06,1.2,.06,0x444444,-2.9,1.26,-7.5));
  scene.add(makeBox(.06,1.2,.06,0x444444, 2.5,1.26,-7.5));
  scene.add(makeSphere(.12,0xcc3333,-1.5,1.10,-7.4));
  scene.add(makeSphere(.10,0xdd8822, 0.0,1.10,-7.4));
  scene.add(makeSphere(.08,0xaacc44, 1.5,1.10,-7.4));
  scene.add(makeCylinder(.20,.22,.18,0x888888,-2.0,1.14,-7.9));
  scene.add(makeCylinder(.16,.18,.14,0x888888, 0.5,1.14,-7.9));
  [[-3.0,-8.1],[2.4,-8.1],[-3.0,-6.9],[2.4,-6.9]].forEach(function(p){
    scene.add(makeBox(.09,.96,.09,0x2a1010,p[0],.48,p[1]));
  });

  // Tables + chairs (chairs now have 4 legs each)
  var tablePositions=[[-4,-3],[0,-3],[4,-3],[-4,1.5],[0,1.5],[4,1.5]];
  tablePositions.forEach(function(tp){
    var tx=tp[0],tz=tp[1];
    scene.add(makeBox(3.0,.06,1.4,0x2a1818,tx,.82,tz));
    scene.add(makeBox(2.95,.04,1.35,0x221010,tx,.86,tz));
    [[-1.3,-.55],[1.3,-.55],[-1.3,.55],[1.3,.55]].forEach(function(lg){
      scene.add(makeBox(.06,.82,.06,0x1e1010,tx+lg[0],.41,tz+lg[1]));
    });
    scene.add(makeBox(.8,.02,.6,0x2a2222,tx,.88,tz));
    scene.add(makeCylinder(.06,.07,.12,0x888888,tx+.25,.94,tz));
    // Tray + cup on table surface
    scene.add(makeBox(.55,.02,.40,0x444433,tx-.4,.88,tz));
    scene.add(makeCylinder(.055,.045,.14,0x336688,tx-.4,.96,tz));
    // North-side chairs facing south (backrest on north)
    [-0.8,0.8].forEach(function(cx){
      var sx=tx+cx, sz=tz-1.0;
      scene.add(makeBox(.70,.06,.70,0x1e0e0e,sx,.50,sz));
      scene.add(makeBox(.70,.66,.06,0x1a0c0c,sx,.83,sz-.36));
      [-.28,.28].forEach(function(lx){ [-.28,.28].forEach(function(lz){
        scene.add(makeBox(.05,.50,.05,0x180c0c,sx+lx,.25,sz+lz));
      });});
    });
    // South-side chairs facing north (backrest on south)
    [-0.8,0.8].forEach(function(cx){
      var sx=tx+cx, sz=tz+1.0;
      scene.add(makeBox(.70,.06,.70,0x1e0e0e,sx,.50,sz));
      scene.add(makeBox(.70,.66,.06,0x1a0c0c,sx,.83,sz+.36));
      [-.28,.28].forEach(function(lx){ [-.28,.28].forEach(function(lz){
        scene.add(makeBox(.05,.50,.05,0x180c0c,sx+lx,.25,sz+lz));
      });});
    });
  });

  // Trash bins on floor
  scene.add(makeCylinder(.22,.18,.56,0x334422,  8.2,.28, 5.8));
  scene.add(makeCylinder(.22,.18,.56,0x334422, -8.2,.28, 5.8));
  scene.add(makeSphere(.10,0x888866, 8.6,.05, 5.2));
  scene.add(makeSphere(.08,0x668866,-8.7,.04, 5.5));

  // Wall clock
  scene.add(makeCylinder(.30,.30,.04,0x888888, 0,3.80,-10.93,Math.PI/2,0,0));
  scene.add(makeBox(.022,.24,.022,0x111111, 0,3.93,-10.90));
  scene.add(makeBox(.022,.022,.20,0x111111, 0,3.80,-10.90));

  // Blood stain on floor
  var stain=new THREE.Mesh(new THREE.CircleGeometry(.55,8),new THREE.MeshLambertMaterial({color:0x1a0000}));
  stain.rotation.x=-Math.PI/2; stain.position.set(4,.003,1.5); scene.add(stain);

  // Overturned chair + debris
  var oc=makeBox(.8,.06,.8,0x1e0e0e,6.5,.06,3.8); oc.rotation.z=1.55; scene.add(oc);
  var ocb=makeBox(.8,.70,.06,0x1a0c0c,6.3,.38,3.6); ocb.rotation.z=1.55; ocb.rotation.x=.2; scene.add(ocb);
  scene.add(makeBox(.8,.018,.6,0x2a2222, 5.8,.009,4.2));
  scene.add(makeCylinder(.06,.07,.12,0x888888, 5.6,.06,4.0));

  // Overhead lights + one broken section
  scene.add(makeBox(8,.08,.3,0x888866, 0,WALL_H-.12,-5));
  scene.add(makeBox(8,.08,.3,0x888866, 0,WALL_H-.12, 2));
  scene.add(makeBox(.06,.06,12,0x888866,-3.5,WALL_H-.12,0));
  scene.add(makeBox(.06,.06,12,0x888866, 3.5,WALL_H-.12,0));
  scene.add(makeBox(3,.08,.3,0x444433,-6,WALL_H-.12,-5));

  // Wall-mounted TV (east wall, above vending machine)
  scene.add(makeBox(.10,1.1,1.8,0x111111, 9.0,3.2,3.5));
  scene.add(makeBox(.06,.96,1.64,0x001122, 9.0,3.2,3.5));
  scene.add(makeBox(.02,.4,.8,0x113366,  9.0,3.3,3.5));  // static image

  // Extra serving trays + food on counter
  scene.add(makeBox(.80,.02,.55,0x444433, -2.5,1.18,-7.5));
  scene.add(makeBox(.80,.02,.55,0x444433,  1.0,1.18,-7.5));
  scene.add(makeCylinder(.07,.06,.16,0xdd9944,-2.5,1.27,-7.5));
  scene.add(makeSphere(.10,0xcc4422, 1.3,1.24,-7.5));

  // Bulletin board
  scene.add(makeBox(.1,.9,1.4,0x6b3a1f,-10.94,2.6,4));
  scene.add(makeBox(.06,.7,1.1,0xcc9944,-10.95,2.6,4));
  scene.add(makeBox(.04,.14,.40,0xffffff,-10.93,2.8,3.8));
  scene.add(makeBox(.04,.14,.32,0xffffff,-10.93,2.5,4.2));
  addLabel('SURVIVE THE NIGHT',-9.8,2.9,4,'#cc4444');

  // Horror: smashed tray + overturned chair in corner
  var smashTray=makeBox(.65,.04,.50,0x443322,-8,.04,5); smashTray.rotation.y=.8; scene.add(smashTray);
  scene.add(makeBox(.50,.02,.35,0x333222,-8.4,.02,5.5));
  var oChair=makeBox(.70,.06,.70,0x1e0e0e,-7.5,.03,5); oChair.rotation.z=1.55; oChair.rotation.y=.3; scene.add(oChair);
  scene.add(makeBox(.05,.50,.05,0x180c0c,-7.2,.25,5.1,.2,.3,.4));
  scene.add(makeBox(.05,.50,.05,0x180c0c,-7.8,.20,4.9,.3,-.2,.5));
  // Blood trail from table toward south wall
  [[0,.002,2,.20],[0,.002,3,.25],[-.5,.002,4,.18],[-.8,.002,5,.14]].forEach(function(b){
    var bm=new THREE.Mesh(new THREE.CircleGeometry(b[3],7),new THREE.MeshLambertMaterial({color:0x160000}));
    bm.rotation.x=-Math.PI/2; bm.position.set(b[0],b[1],b[2]); scene.add(bm);
  });
  // Scratch marks on west wall
  [[-10.90,1.8,-4],[-10.90,1.4,-3.6],[-10.90,2.1,-4.3]].forEach(function(s){
    var sm=makeBox(.04,.70,.02,0x080000,s[0],s[1],s[2],.15,0,0); scene.add(sm);
  });
  // Cracked/stained ceiling tiles (flat dark patches on ceiling underside)
  [[3,WALL_H-.01,-4],[-4,WALL_H-.01,2],[-2,WALL_H-.01,-6]].forEach(function(ct){
    scene.add(makeBox(.8,.01,.6,0x0c0808,ct[0],ct[1],ct[2]));
  });

  addLabel('BARN',-5.5,DOOR_H+.7,-ROOM_HALF+.2,'#ff5533');
  addLabel('FARMHOUSE',0,DOOR_H+.7,-ROOM_HALF+.2,'#ff5533');
  addLabel('SILO',5.5,DOOR_H+.7,-ROOM_HALF+.2,'#ff5533');
  addLabel('GUARD SHACK',-ROOM_HALF+.3,DOOR_H+.7,-3.5,'#ff5533');
  addLabel('TRACTOR SHED',-ROOM_HALF+.3,DOOR_H+.7, 3.5,'#ff5533');
  addLabel('RESTROOMS', ROOM_HALF-.3,DOOR_H+.7,-3.5,'#ff5533');
  addLabel('CLOSET',    ROOM_HALF-.3,DOOR_H+.7, 3.5,'#ff5533');
  addLabel('PASTURE',-4,DOOR_H+.7,ROOM_HALF-.3,'#ff5533');
  addLabel('FRONT GATE',4,DOOR_H+.7,ROOM_HALF-.3,'#ff5533');
  addWindow(ROOM_HALF-.07,3.0,-7,0,1.0,1.6,'z');
  addWindow(ROOM_HALF-.07,3.0, 0,0,1.0,1.6,'z');
  addWindow(ROOM_HALF-.07,3.0, 7,0,1.0,1.6,'z');
}


function buildGuardShack(){
  // Desk with legs
  scene.add(makeBox(3.5,.08,1.4,0x6b4020, 0,.90,-3.5));
  scene.add(makeBox(3.4,.88,1.3,0x5a3a18, 0,.44,-3.5));
  [[-1.65,-.65],[1.65,-.65],[-1.65,.65],[1.65,.65]].forEach(function(p){
    scene.add(makeBox(.09,.90,.09,0x4a2a10,p[0],.45,p[1]-3.5));
  });
  // Monitor on desk — grounded on desk top (y=0.98), screen faces north toward guard
  // Stand base sits on desk surface
  scene.add(makeBox(.40,.04,.30,0x333333, 0,.98,-3.0));    // stand base on desk
  scene.add(makeBox(.08,.32,.08,0x333333, 0,1.16,-3.0));   // stand neck
  // Monitor body — bottom rests on stand top (y=1.30)
  scene.add(makeBox(1.20,.80,.10,0x222222, 0,1.70,-3.0));  // monitor body
  // Screen glow on NORTH face (toward guard at z=-5)
  scene.add(makeBox(1.06,.66,.04,0x112244, 0,1.70,-3.06)); // screen faces north
  // Keyboard + mouse on desk surface
  scene.add(makeBox(.80,.04,.34,0x444444,-.2,.98,-4.0));
  scene.add(makeSphere(.06,0x555555, .55,1.01,-4.02));
  // Second small security monitor on desk (camera feeds)
  scene.add(makeBox(.06,.34,.26,0x222222,-1.8,.98,-3.8));  // base rests on desk
  scene.add(makeBox(.70,.50,.08,0x1a1a1a,-1.8,1.41,-3.0));
  scene.add(makeBox(.62,.42,.04,0x001100,-1.8,1.41,-3.06)); // screen faces north
  [[-.22,.15],[.18,.15],[-.22,-.14],[.18,-.14]].forEach(function(s){
    scene.add(makeBox(.24,.18,.02,0x112200,-1.8+s[0],1.41+s[1],-3.09));
  });
  // Mug on desk
  scene.add(makeCylinder(.075,.085,.16,0xddccbb, .80,.98,-3.52));
  // Papers stacked
  scene.add(makeBox(.22,.30,.14,0x556688,-.60,1.06,-3.52));
  // Radio
  scene.add(makeBox(.14,.26,.08,0x222233, 1.6,1.03,-3.52));
  scene.add(makeSphere(.04,0x556655, 1.6,1.30,-3.48));

  // Chair BEHIND desk (north side, facing south toward player)
  scene.add(makeBox(.90,.08,.90,0x333344, 0,.50,-5.0));
  scene.add(makeBox(.90,.90,.08,0x333344, 0,.95,-5.45));
  [-.38,.38].forEach(function(lx){ [-.38,.38].forEach(function(lz){
    scene.add(makeBox(.05,.50,.05,0x282838,lx,.25,lz-5.0));
  });});
  scene.add(makeBox(.06,.06,.70,0x3a3a4a,-.42,.62,-5.0));
  scene.add(makeBox(.06,.06,.70,0x3a3a4a, .42,.62,-5.0));

  // ── LOCKABLE DOOR (E wall, leads to Cafeteria) ────────────────────────────
  if(guardDoorLocked){
    // Solid door panel filling the doorway void
    scene.add(makeBox(0.20, DOOR_H-0.04, DOOR_W-0.14, 0x6b3a18, ROOM_HALF-0.16, DOOR_H/2, 0));
    // Raised panel insets for detail
    scene.add(makeBox(0.22, 1.05, 1.05, 0x5a3010, ROOM_HALF-0.14, DOOR_H*0.72, 0));
    scene.add(makeBox(0.22, 0.95, 1.05, 0x5a3010, ROOM_HALF-0.14, DOOR_H*0.24, 0));
    // Brass doorknob
    scene.add(makeSphere(0.068, 0xddaa44, ROOM_HALF-0.18, DOOR_H/2, -0.55));
    addLabel('\uD83D\uDD12 F = UNLOCK DOOR', ROOM_HALF-3.0, 1.9, 0, '#ff8844');
  } else {
    addLabel('\uD83D\uDD13 F = LOCK DOOR', ROOM_HALF-3.0, 1.9, 0, '#44ff88');
  }

  // Filing cabinet
  scene.add(makeBox(.90,2.00,.60,0x444455,-4.5,1.00,-4.5));
  [.50,1.20,1.90].forEach(function(dy){
    scene.add(makeBox(.88,.06,.58,0x333344,-4.5,dy,-4.5));
    scene.add(makeBox(.30,.04,.04,0x888888,-4.5,dy,-4.2));
  });

  // Security camera on north wall
  scene.add(makeBox(.18,.12,.24,0x333333, 3.5,4.20,-10.88));
  scene.add(makeSphere(.08,0x222222, 3.5,4.18,-10.68));

  // Barred window
  scene.add(makeBox(1.4,1.2,.08,0x283040, 3.5,2.5,-10.88));
  [3.0,3.5,4.0].forEach(function(bx){
    scene.add(makeBox(.06,1.2,.12,0x445566,bx,2.5,-10.85));
  });
  addWindow(-ROOM_HALF+.07,2.5,-5,0,1.2,1.6,'z');

  // Horror: dried blood smear on east wall
  scene.add(makeBox(.04,.55,1.0,0x1a0000,ROOM_HALF-.12,1.6,2.2,.05,0,-.10));
  scene.add(makeBox(.04,.30,.50,0x140000,ROOM_HALF-.12,1.0,2.6,.08,0,.12));
  // Scratch marks on north wall (deep claw grooves)
  [[-2.0,2.5],[-1.7,2.1],[-1.4,2.8]].forEach(function(s){
    scene.add(makeBox(.02,.70,.02,0x0a0000,s[0],s[1],-ROOM_HALF+.06,.2,0,0));
  });

  // Security camera terminal label (near small monitor at x=-1.8)
  addLabel('F = SECURITY CAMERAS  [\u25c4\u25ba cycle]', -1.8, 2.0, -3.0, '#00ff66');

  // Coffee thermos on desk
  scene.add(makeCylinder(.06,.06,.24,0x334422,-.80,1.12,-4.22));
  scene.add(makeCylinder(.065,.065,.04,0x223311,-.80,1.25,-4.22));
  // Notepad + pen
  scene.add(makeBox(.22,.02,.30,0xfafaf0, 1.1,1.01,-4.22));
  scene.add(makeBox(.20,.01,.28,0x88aaff, 1.1,1.025,-4.22));
  scene.add(makeBox(.02,.01,.24,0x222222, 1.28,1.03,-4.22));
  // Flashlight on desk
  scene.add(makeCylinder(.035,.028,.22,0x333333, .80,1.01,-4.05,0,0,Math.PI/2));
  scene.add(makeSphere(.038,0xdddd88,.91,1.01,-4.05));

  // Stool with legs
  scene.add(makeCylinder(.28,.28,.65,0x5a3010, 4.5,.325,-8));
  scene.add(makeCylinder(.32,.28,.06,0x4a2a08, 4.5,.655,-8));
  [-.18,.18].forEach(function(lx){ [-.18,.18].forEach(function(lz){
    scene.add(makeBox(.04,.32,.04,0x4a2a08,4.5+lx,.16,-8+lz));
  });});

  // Posters on south wall
  scene.add(makeBox(.06,.80,1.20,0x9a7a50, 10.92,2.40, 3.0));
  scene.add(makeBox(.04,.70,1.10,0xcc3322, 10.92,2.40, 3.0));
  scene.add(makeBox(.06,.80,1.20,0x9a7a50, 10.92,2.40,-1.0));
  scene.add(makeBox(.04,.70,1.10,0x336688, 10.92,2.40,-1.0));

  // Wall clock
  scene.add(makeCylinder(.22,.22,.04,0x888888, 0,3.2,-10.93,Math.PI/2,0,0));
  scene.add(makeBox(.02,.20,.02,0x111111, 0,3.32,-10.90));
  if(weapon==='none') addLabel('F = OFFICE BAT',0,2.0,-3.8,'#ccccff');

  // Taser on desk (yellow body + prongs)
  if(!ownedWeapons.has('taser')){
    scene.add(makeBox(.08,.36,.06,0xffcc00, 1.4,.98,-4.2));
    scene.add(makeBox(.025,.08,.025,0xaaaaaa, 1.375,1.20,-4.2));
    scene.add(makeBox(.025,.08,.025,0xaaaaaa, 1.425,1.20,-4.2));
    scene.add(makeSphere(.018,0x44aaff, 1.375,1.25,-4.2));
    scene.add(makeSphere(.018,0x44aaff, 1.425,1.25,-4.2));
    addLabel('F = TASER \u26a1 [7]', 1.4,1.8,-4.2,'#ffdd44');
  }

  // Battery pack on shelf (recharge pickup)
  if(ownedWeapons.has('taser') && taserCharges < TASER_MAX_CHARGES){
    scene.add(makeBox(.18,.10,.10,0x223344, 3.0,.98,-4.0));
    scene.add(makeBox(.04,.08,.08,0x446688, 3.18,.98,-4.0));
    addLabel('F = RECHARGE (\u26a1'+taserCharges+'/'+TASER_MAX_CHARGES+')', 3.0,1.6,-4.0,'#44aaff');
  }
}


function buildBarn(){
  // Stage platform
  scene.add(makeBox(18,.28,6.5,0x6b3a18, 0,.14,-7.5));
  for(var sp=-8;sp<=8;sp+=1.5) scene.add(makeBox(.04,.01,6.5,0x5a3010,sp,.28,-7.5)); // plank lines
  scene.add(makeBox(.22,3.0,.22,0x5a2a10,-8,.28,-4.4));
  scene.add(makeBox(.22,3.0,.22,0x5a2a10, 8,.28,-4.4));
  scene.add(makeBox(17,.12,.12,0x3a2010, 0,3.26,-4.4));
  scene.add(makeBox(3.5,2.8,.12,0x880020,-6.5,1.54,-4.45));
  scene.add(makeBox(3.5,2.8,.12,0x880020, 6.5,1.54,-4.45));
  [-7.5,-6.0,-5.0,5.0,6.0,7.5].forEach(function(cx){
    scene.add(makeBox(.12,2.8,.06,0x660015,cx,1.54,-4.44)); // curtain fold strips
  });
  scene.add(makeBox(18.2,.5,.3,0x7a4a20, 0,.42,-4.35));

  // Stage lights
  for(var li=-6;li<=6;li+=3){
    scene.add(makeCone(.35,.8,0x333333,li,WALL_H-.5,-7,Math.PI,0,0));
    scene.add(makeSphere(.15,0xffee88,li,WALL_H-.9,-7));
    scene.add(makeBox(.02,1.2,.02,0x222222,li,WALL_H-.4,-7));
  }

  // Hay bales stacked (grounded)
  scene.add(makeBox(1.8,1.1,1.2,0xc8a030,-4.5,.55,-2.5));
  scene.add(makeBox(1.8,1.1,1.2,0xc8a030,-4.5,1.65,-2.5));
  scene.add(makeBox(1.4,1.1,1.2,0xb89028, 4.5,.55,-2.5));
  scene.add(makeBox(1.4,1.1,1.2,0xb89028, 4.5,1.65,-2.5));
  [[-3.5,.1],[-4.8,-.3],[-5.2,.4]].forEach(function(h){
    scene.add(makeBox(.8,.02,.06,0xaa8822,h[0],.01,-2.0+h[1]));
  });

  // Feed troughs with legs
  [-1.0,1.0].forEach(function(tx){
    scene.add(makeBox(2.0,.40,.40,0x6b3a18,tx,.22,-2));
    scene.add(makeBox(1.8,.10,.36,0x4a2808,tx,.44,-2));
    [-.90,.90].forEach(function(lx){ scene.add(makeBox(.08,.20,.08,0x5a3010,tx+lx,.10,-2)); });
  });

  // Pitchfork leaning on wall (bottom touches floor)
  var pf=makeBox(.06,3.2,.06,0x8b5c2a, 9,1.50,-6); pf.rotation.x=.18; scene.add(pf);
  scene.add(makeBox(.8,.06,.06,0x888888, 9,3.1,-6));
  scene.add(makeBox(.30,.06,.06,0x888888, 8.7,3.1,-6));

  // Prop crates stacked backstage
  scene.add(makeBox(1.2,1.0,1.0,0x7a5a30, 3,.50,-2));
  scene.add(makeBox(1.0,.80,0.9,0x6b4a20, 3.1,1.50,-2.1));
  [2.7,3.0,3.3].forEach(function(cx){ scene.add(makeBox(.02,1.0,.02,0x4a3010,cx,.50,-2.05)); });
  scene.add(makeBox(1.0,0.5,0.8,0x7a5a30,-2.5,.25,-1.5));

  // Speaker cabinet on stage left
  scene.add(makeBox(.80,1.4,.70,0x222222,-9,1.0,-4.36));
  scene.add(makeBox(.10,.10,.72,0x444444,-9,.70,-4.36));
  [[-8.75,1.4],[-8.75,0.9],[-9.25,1.4],[-9.25,0.9]].forEach(function(s){
    scene.add(makeCylinder(.10,.10,.06,0x333333,s[0],s[1],-4.32));
  });

  // Amp/control box stage right
  scene.add(makeBox(.70,.90,.50,0x1a1a22, 8,.45,-4.38));
  scene.add(makeBox(.60,.04,.44,0x333344, 8,.92,-4.38));
  [7.7,7.9,8.1,8.3].forEach(function(kx){
    scene.add(makeCylinder(.03,.03,.05,0x888888,kx,.96,-4.36));
  });
  // Power cable from amp to stage
  scene.add(makeBox(.04,.04,2.0,0x111111, 8,.04,-3.4,0,.2,0));

  // Rope hanging from beam (with noose loop)
  scene.add(makeBox(.12,.12,12,0x554433, 0,WALL_H-.05,0));
  scene.add(makeBox(.04,2.5,.04,0xaa8833,-7,3.0,-8));
  scene.add(makeSphere(.14,0xaa8833,-7,1.72,-8));

  // Lanterns on wires
  scene.add(makeBox(.04,.5,.04,0x555555, 0,WALL_H-.05,-2));
  scene.add(makeCylinder(.15,.15,.3,0xddcc44, 0,WALL_H-.5,-2));
  scene.add(makeBox(.04,.5,.04,0x555555,-5.5,WALL_H-.05,1.5));
  scene.add(makeCylinder(.15,.15,.3,0xddcc44,-5.5,WALL_H-.5,1.5));

  addWindow(-ROOM_HALF+.07,3.2,-6.5,0,1.2,1.8,'z');
  addWindow(-ROOM_HALF+.07,3.2,  0, 0,1.2,1.8,'z');
  addWindow( ROOM_HALF-.07,3.2,-6.5,0,1.2,1.8,'z');
  addWindow( ROOM_HALF-.07,3.2,  0, 0,1.2,1.8,'z');

  // Inactive animatronics on stage
  var stIdx=0;
  for(var si=0;si<STAGE_ORDER.length;si++){
    var sk=STAGE_ORDER[si];
    if(!bots[sk]||!bots[sk].alive||activatedBots.has(sk)) continue;
    if(bots[sk].spot!=='barn') continue;
    if(stIdx>=STAGE_POSITIONS.length) break;
    var sp2=STAGE_POSITIONS[stIdx++];
    var sg=new THREE.Group();
    buildChar(sg,bots[sk],bots[sk].name.indexOf('PLUSH')>=0?.58:1.0);
    sg.position.set(sp2[0],.28,sp2[1]);
    scene.add(sg);
  }
  var onStage=STAGE_ORDER.filter(function(k){
    return bots[k]&&bots[k].alive&&!activatedBots.has(k)&&bots[k].spot==='barn';
  }).length;
  if(onStage>0) addLabel('STAGE — '+onStage+' animatronics',0,1.4,-5,'#ff4444');

  // Horror: blood pools on stage from past victims
  [[2.5,.282,-6.5,.55],[-.8,.282,-7.2,.40],[5,.282,-5.8,.35]].forEach(function(b){
    var bp=new THREE.Mesh(new THREE.CircleGeometry(b[3],8),new THREE.MeshLambertMaterial({color:0x1a0000}));
    bp.rotation.x=-Math.PI/2; bp.position.set(b[0],b[1],b[2]); scene.add(bp);
  });
  // Torn fabric scraps on stage floor
  scene.add(makeBox(.60,.02,.35,0x553322,-3,.285,-6.5,0,.3,0));
  scene.add(makeBox(.40,.02,.22,0x442211, 1,.285,-7.2,0,-.2,0));
  // Deep claw scratches on north curtain area
  [[-5.5,1.2],[-5.0,1.6],[-4.5,0.9]].forEach(function(s){
    scene.add(makeBox(.02,.90,.02,0x440010,s[0],s[1],-4.5,.15,0,0));
  });
  // Overturned stand in corner
  var ts=makeBox(.22,.06,1.6,0x5a2a10,-9,.03,3); ts.rotation.y=.4; scene.add(ts);
}


function buildFarmhouse(){
  // Dining table with legs
  scene.add(makeBox(3.0,.08,1.4,0x7a4a2a, 0,.92,-4.5));
  scene.add(makeBox(2.9,.88,1.3,0x6b3a1f, 0,.44,-4.5));
  [[-1.3,-.60],[1.3,-.60],[-1.3,.60],[1.3,.60]].forEach(function(p){
    scene.add(makeBox(.08,.90,.08,0x5a3010,p[0],.45,p[1]-4.5));
  });
  // Candle + place settings on table surface (y=1.00)
  [-1.0,0,1.0].forEach(function(px){
    scene.add(makeCylinder(.14,.14,.02,0xccbbaa,px,1.00,-4.5));
    scene.add(makeCylinder(.05,.06,.10,0xaaaacc,px+.25,1.05,-4.5));
  });
  scene.add(makeCylinder(.045,.045,.20,0xeeeecc, 0,1.10,-4.5));
  scene.add(makeSphere(.04,0xff9900, 0,1.21,-4.5));

  // Chairs around dining table — all face inward toward table
  // North chair (z=-5.4): faces south toward table
  scene.add(makeBox(.85,.08,.85,0x5a3010, 0,.50,-5.4));
  scene.add(makeBox(.85,.80,.08,0x5a3010, 0,.90,-5.82)); // backrest north
  [-.36,.36].forEach(function(lx){ [-.36,.36].forEach(function(lz){
    scene.add(makeBox(.06,.50,.06,0x4a2808,lx,.25,-5.4+lz));
  });});
  // South chair (z=-3.6): faces north toward table
  scene.add(makeBox(.85,.08,.85,0x5a3010, 0,.50,-3.6));
  scene.add(makeBox(.85,.80,.08,0x5a3010, 0,.90,-3.18)); // backrest south
  [-.36,.36].forEach(function(lx){ [-.36,.36].forEach(function(lz){
    scene.add(makeBox(.06,.50,.06,0x4a2808,lx,.25,-3.6+lz));
  });});
  // West head chair (x=-2.2): faces east toward table
  scene.add(makeBox(.85,.08,.85,0x5a3010,-2.2,.50,-4.5));
  scene.add(makeBox(.08,.80,.85,0x5a3010,-2.62,.90,-4.5)); // backrest west
  [-.36,.36].forEach(function(lx){ [-.36,.36].forEach(function(lz){
    scene.add(makeBox(.06,.50,.06,0x4a2808,-2.2+lx,.25,-4.5+lz));
  });});
  // East head chair (x=2.2): faces west toward table
  scene.add(makeBox(.85,.08,.85,0x5a3010, 2.2,.50,-4.5));
  scene.add(makeBox(.08,.80,.85,0x5a3010, 2.62,.90,-4.5)); // backrest east
  [-.36,.36].forEach(function(lx){ [-.36,.36].forEach(function(lz){
    scene.add(makeBox(.06,.50,.06,0x4a2808,2.2+lx,.25,-4.5+lz));
  });});

  // Fireplace (grounded, with fire detail)
  scene.add(makeBox(2.5,2.8,.30,0x888888, 0,1.40,-10.86));
  scene.add(makeBox(2.6,.08,1.2,0x777777, 0,2.82,-10.86));  // mantle shelf
  scene.add(makeBox(2.0,1.4,.40,0x444444, 0,.70,-10.74));
  scene.add(makeBox(.5,.30,.40,0xdd3311, 0,.25,-10.70));
  scene.add(makeBox(.3,.40,.35,0xff7700,-.2,.28,-10.68));
  scene.add(makeBox(.3,.40,.35,0xff5500, .2,.28,-10.68));
  scene.add(makeSphere(.08,0xffdd00, 0,.52,-10.68));
  var ash=new THREE.Mesh(new THREE.CircleGeometry(.4,8),new THREE.MeshLambertMaterial({color:0x222222}));
  ash.rotation.x=-Math.PI/2; ash.position.set(0,.004,-10.68); scene.add(ash);
  // Fireplace tools
  scene.add(makeBox(.06,1.2,.06,0x555555, 1.4,1.0,-10.70));
  scene.add(makeBox(.06,.80,.06,0x444444, 1.4,.80,-10.56,.22,0,0));

  // Bookshelf — books properly on shelves (surface y≈0.43, 1.18, 1.93)
  scene.add(makeBox(.20,3.50,2.00,0x7a4a20,-9.90,1.75,-4));
  [0,1,2,3].forEach(function(sh){ scene.add(makeBox(.14,.06,1.85,0x6b3a1f,-9.85,.40+sh*.75,-4)); });
  var bkc=[0xff4444,0x4444ff,0x44bb44,0xffcc44,0xcc44cc,0x44cccc,0xee8833,0x55ccdd];
  [-3.5,-3.1,-2.7,-2.3].forEach(function(bz,i){ scene.add(makeBox(.12,.55,.18,bkc[i],-9.82,.705,bz)); });
  [-4.4,-3.9,-3.5,-3.0,-2.5].forEach(function(bz,i){ scene.add(makeBox(.12,.55,.18,bkc[i%8],-9.82,1.455,bz)); });
  [-4.2,-3.6,-3.0].forEach(function(bz,i){ scene.add(makeBox(.12,.55,.18,bkc[i+2],-9.82,2.205,bz)); });

  // Axe on table
  scene.add(makeBox(.06,.80,.06,0x7a4a20, 1.0,1.34,-4.4));
  scene.add(makeBox(.38,.26,.05,0xa8a8b8, 1.08,1.78,-4.4,0,0,.25));
  if(weapon!=='axe') addLabel('F = AXE',1.0,2.2,-4.3,'#ccccff');

  // Couch (south area)
  scene.add(makeBox(3.5,.50,1.2,0x6a4444,-5.5,.25,3.5));
  scene.add(makeBox(3.5,.80,.30,0x5a3434,-5.5,.70,4.14));
  scene.add(makeBox(.30,.80,.90,0x5a3434,-7.24,.70,3.65));
  scene.add(makeBox(.30,.80,.90,0x5a3434,-3.76,.70,3.65));

  // Framed photos on east wall
  [[-8, 2.8, -7],[-8, 2.8, -5],[-8, 2.8, -3]].forEach(function(p){
    scene.add(makeBox(.06,.58,.48,0x5a3010,p[0],p[1],p[2]));
    scene.add(makeBox(.04,.44,.34,0x998877,p[0],p[1],p[2]));
  });
  // Tall side lamp in corner
  scene.add(makeBox(.06,1.4,.06,0x555555, 8.5,.70,6.5));
  scene.add(makeSphere(.04,0x555555, 8.5,1.42,6.5));
  scene.add(makeCone(.38,.6,0xddcc88, 8.5,1.62,6.5,Math.PI,0,0));
  scene.add(makeSphere(.08,0xffee88, 8.5,1.52,6.5));
  // Small side table for lamp
  scene.add(makeCylinder(.30,.30,.60,0x7a4a20, 8.5,.30,6.5));
  scene.add(makeCylinder(.35,.35,.04,0x6b3a1f, 8.5,.63,6.5));
  // Floor rug (bigger, more decorative)
  scene.add(makeBox(5,.01,3.5,0x8844aa, 0,.005,-4.5));
  scene.add(makeBox(4.4,.011,2.9,0x6633aa, 0,.005,-4.5));
  scene.add(makeBox(3.8,.012,2.3,0x8844aa, 0,.005,-4.5));

  addWindow(ROOM_HALF-.07,2.2,-7,0,1.0,1.4,'z');
  addWindow(ROOM_HALF-.07,2.2, 0, 0,1.0,1.4,'z');
  addWindow(-ROOM_HALF+.07,2.2,-7,0,1.0,1.4,'z');
  for(var si2=0;si2<5;si2++){
    scene.add(makeBox(2.0,.12,1.0,0x5a3010,-8.8,.06+si2*.22,-1.5+si2*.65));
    scene.add(makeBox(.08,.22+si2*.22,.08,0x4a2808,-7.9,.05+si2*.11,-1.0+si2*.32));
  }
  addLabel('CELLAR STAIRS',-9.5,1.2,-1,'#aa4444');
}


function buildTractorShed(){
  // Tractor body (grounded — rear wheels center y=.70, radius=.70, so bottom touches floor)
  scene.add(makeBox(1.8,1.5,3.0,0x2a6a1e, 0,.75,-5));
  scene.add(makeBox(1.4,1.2,1.2,0x3a7a2e, 0,1.35,-4.0));
  scene.add(makeBox(1.0,.08,1.0,0x222222, 0,1.96,-4.0));
  scene.add(makeCylinder(.70,.70,.42,0x222222,-1.1,.70,-4.0,0,0,Math.PI/2));
  scene.add(makeCylinder(.70,.70,.42,0x222222, 1.1,.70,-4.0,0,0,Math.PI/2));
  scene.add(makeCylinder(.56,.56,.14,0x555555,-1.1,.70,-4.0,0,0,Math.PI/2)); // hub caps
  scene.add(makeCylinder(.56,.56,.14,0x555555, 1.1,.70,-4.0,0,0,Math.PI/2));
  scene.add(makeCylinder(.50,.50,.38,0x222222,-1.0,.50,-6.3,0,0,Math.PI/2));
  scene.add(makeCylinder(.50,.50,.38,0x222222, 1.0,.50,-6.3,0,0,Math.PI/2));
  var ep=makeBox(.06,.8,.06,0x555555,.5,1.80,-4.85); ep.rotation.z=.12; scene.add(ep);
  scene.add(makeCylinder(.055,.08,.10,0x444444,.5,2.22,-4.80));

  // Workbench with body (no floating top)
  scene.add(makeBox(4.5,.08,1.00,0x8b5c2a,-5.5,.94,-5));
  scene.add(makeBox(4.4,.88,.95,0x7a4a20,-5.5,.44,-5));
  // Toolbox on bench
  scene.add(makeBox(.50,.24,.30,0xcc3311,-4.5,1.02,-4.8));
  scene.add(makeBox(.50,.04,.30,0xdd4422,-4.5,1.14,-4.8));

  // Pegboard + hanging tools
  scene.add(makeBox(4.5,2.20,.04,0xaaaaaa,-5.5,2.06,-10.90));
  scene.add(makeBox(.06,1.5,.06,0x888888,-7,2.50,-10.90,.2,0,0));
  scene.add(makeBox(.5,.10,.06,0x888888,-7,3.20,-10.88));
  scene.add(makeBox(.06,1.5,.06,0x8b5c2a,-6,2.50,-10.90,.2,0,0));
  scene.add(makeBox(.8,.06,.06,0x888888,-6,3.20,-10.88));
  scene.add(makeBox(.06,1.2,.06,0x666666,-4.5,2.50,-10.90));

  // Wood bat leaning on wall
  scene.add(makeBox(.09,1.0,.09,0xa06030,2,1.5,-3.5,0,0,.3));
  if(weapon!=='bat'&&weapon!=='axe') addLabel('F = WOOD BAT',2,2.3,-3.4,'#ccccff');

  // Oil drum (grounded: h=.90, center y=.45)
  scene.add(makeCylinder(.35,.35,.90,0x223344, 5.5,.45,-7));
  scene.add(makeCylinder(.36,.36,.04,0x334455, 5.5,.92,-7));
  // Oil stain on floor
  var oil=new THREE.Mesh(new THREE.CircleGeometry(.55,8),new THREE.MeshLambertMaterial({color:0x0a0a12}));
  oil.rotation.x=-Math.PI/2; oil.position.set(5.5,.002,-7); scene.add(oil);
  var oil2=new THREE.Mesh(new THREE.CircleGeometry(.28,6),new THREE.MeshLambertMaterial({color:0x060810}));
  oil2.rotation.x=-Math.PI/2; oil2.position.set(4.2,.002,-5.8); scene.add(oil2);

  // Spare tire stack (3 tires, all grounded by stacking)
  scene.add(makeCylinder(.45,.45,.30,0x222222,7.5,.15,-8,0,0,Math.PI/2));
  scene.add(makeCylinder(.45,.45,.30,0x222222,7.5,.47,-8,0,0,Math.PI/2));
  scene.add(makeCylinder(.45,.45,.30,0x222222,7.5,.79,-8,0,0,Math.PI/2));

  // Bear trap stack on workbench (far end, x=-7.0, z=-5.0)
  // Base plate
  scene.add(makeBox(.30,.04,.24,0x444444,-7.0,1.04,-5.0));
  // Left jaw
  var jL=makeBox(.28,.06,.06,0x555555,-7.0,1.08,-5.09); jL.rotation.z=0.35; scene.add(jL);
  // Right jaw
  var jR=makeBox(.28,.06,.06,0x555555,-7.0,1.08,-4.91); jR.rotation.z=-0.35; scene.add(jR);
  // Spring coil (cylinder lying flat)
  scene.add(makeCylinder(.06,.06,.10,0x666666,-7.0,1.02,-5.0,0,0,Math.PI/2));
  // Chain link to bench
  scene.add(makeBox(.02,.06,.18,0x888888,-6.84,1.00,-5.0));
  // Label
  if(bearTraps < 3){
    addLabel('F = BEAR TRAPS  (refill to 3)', -7.0, 1.7, -5.0, '#cc8844');
  } else {
    addLabel('BEAR TRAPS (T = place in room)', -7.0, 1.7, -5.0, '#888844');
  }

  addWindow(ROOM_HALF-.07,2.2,-6,0,1.2,1.6,'z');
}


function buildSilo(){
  // Grain pile (grounded: bottom platform at y≈0)
  scene.add(makeCylinder(4.5,4.5,.30,0x8b6340, 0,.15,-5));
  scene.add(makeCylinder(3.5,3.5,.40,0xc8a028, 0,.35,-5));
  scene.add(makeCylinder(2.0,3.5,1.5,0xb89018, 0,1.05,-5));
  // Scattered grain on floor
  [[1.5,-4.5],[2.5,-5.5],[-1.0,-3.8],[-2.5,-5.0],[.5,-6.2]].forEach(function(p){
    scene.add(makeSphere(.08,0xc8a028,p[0],.55,p[1]));
  });

  // Grain sacks on floor (grounded: h=.40, center y=.20)
  scene.add(makeBox(.60,.40,.40,0xaa8844,-5.5,.20,-3));
  scene.add(makeBox(.60,.40,.40,0x998833,-5.5,.20,-2));
  scene.add(makeBox(.60,.40,.40,0xaa8844,-6.2,.60,-2.5)); // stacked on top

  // Shotgun resting on grain pile
  scene.add(makeBox(.08,.10,.75,0x333333,0,1.82,-3.8,0,.3,0));
  scene.add(makeBox(.10,.12,.35,0x444444,0,1.82,-3.55,0,.3,0));
  scene.add(makeBox(.12,.12,.18,0x6b3a18,0,1.82,-3.72,0,.3,0));
  if(!ownedWeapons.has('shotgun')) addLabel('F = SHOTGUN *',0,2.4,-3.5,'#ff8844');

  // Ladder: rails touch floor (h=4.2, center y=2.1, bottom y=0)
  scene.add(makeBox(.06,4.20,.06,0x888888, 7.7,2.10,-9));
  scene.add(makeBox(.06,4.20,.06,0x888888, 8.3,2.10,-9));
  for(var rl=0;rl<9;rl++) scene.add(makeBox(.62,.06,.06,0x888888,8,.12+rl*.50,-9));

  // Ventilation pipe (grounded base)
  scene.add(makeBox(.24,.24,.24,0x555555,-9.5,.12,-8));
  scene.add(makeCylinder(.12,.12,3.5,0x666666,-9.5,1.87,-8));
  scene.add(makeBox(.24,.24,.24,0x555555,-9.5,3.62,-8));

  // High window
  scene.add(makeBox(.08,1.2,1.2,0x0a1218,ROOM_HALF-.06,3.0,-7));
  // Dust motes near window
  [[9.8,3.5,-6.5],[9.7,3.2,-6.8],[9.6,3.8,-7.2]].forEach(function(d){
    scene.add(makeSphere(.03,0xddcc88,d[0],d[1],d[2]));
  });

  // Bio-Vats — organic material tubes labeled with animatronic names
  var vatDefs = [
    { name:'WOLF',    x:-5.5, fluidColor:0x0a2a10, glowColor:0x00ff55 },
    { name:'PFOX',    x:-1.5, fluidColor:0x1e1a06, glowColor:0xbbdd00 },
    { name:'CHICKEN', x: 2.5, fluidColor:0x0a1e22, glowColor:0x00ccaa },
  ];
  vatDefs.forEach(function(v){
    var vx = v.x, vz = -9.2;
    scene.add(makeCylinder(.30,.30,.10,0x223333, vx,.05,vz));              // base plate
    scene.add(makeCylinder(.22,.22,2.6,0x1c2a30, vx,1.35,vz));            // outer shell
    scene.add(makeCylinder(.15,.15,2.4,v.fluidColor, vx,1.35,vz));        // fluid
    scene.add(makeCylinder(.24,.24,.10,0x2a3a40, vx,2.68,vz));            // top cap
    scene.add(makeCylinder(.06,.06,.22,0x334444, vx,2.83,vz));            // valve stem
    scene.add(makeSphere(.06,v.glowColor, vx+.18,2.56,vz+.18));           // status light
    scene.add(makeBox(.06,.06,1.85,0x334444, vx,1.8,-10.12));             // pipe to wall
    var gl = new THREE.PointLight(v.glowColor, 0.35, 4.5);
    gl.position.set(vx, 1.2, vz); scene.add(gl);
    addLabel(v.name, vx, 3.1, vz, '#00dd66');
  });
}


function buildCloset(){
  // Shelf unit — side panels + 3 boards
  scene.add(makeBox(.08,3.2,.90,0x6b4a2a, 2.3,1.6,-9));
  scene.add(makeBox(.08,3.2,.90,0x6b4a2a,-2.3,1.6,-9));
  for(var sh=0;sh<3;sh++){
    var sy=.50+sh*1.0;
    scene.add(makeBox(4.5,.06,.90,0x6b4a2a, 0,sy,-9));
    // Boxes sitting ON the shelf (surface at sy+.03)
    scene.add(makeBox(.70,.58,.68,0x886644,-1.5,sy+.32,-9.1));
    scene.add(makeBox(.88,.48,.66,0x667744,  .5,sy+.27,-9.1));
    scene.add(makeBox(.60,.66,.56,0x774466, 1.8,sy+.36,-9.1));
  }

  // Hanging clothes rod (back-right corner)
  scene.add(makeBox(.06,.06,4.5,0x8b6633, 7.5,2.80,-7,0,0,Math.PI/2));
  [5.5,6.2,6.9,7.6,8.3].forEach(function(hx){
    scene.add(makeBox(.04,.06,.40,0x888888,hx,2.80,-7));
    scene.add(makeBox(.40,.60,.06,0x556677,hx,2.50,-7.05));
  });

  // String light along ceiling
  scene.add(makeBox(.02,.02,10,0x666644, 0,4.35,-5));
  [-4,-2,0,2,4].forEach(function(lx){
    scene.add(makeSphere(.06,0xffee88,lx,4.30,-5));
    scene.add(makeBox(.02,.30,.02,0x666644,lx,4.16,-5));
  });

  // Mop bucket + mop (moved from cafeteria)
  scene.add(makeCylinder(.22,.28,.38,0xaaaa33, 5.5,.19,-4.0));
  scene.add(makeBox(.04,.04,.38,0xaaaaaa,  5.5,.38,-4.0));
  scene.add(makeBox(.04,1.8,.04,0x888866,  5.4,1.28,-4.2,.18,0,0));
  scene.add(makeBox(.30,.12,.04,0xbbbbaa,  5.4,2.22,-4.2));

  // Floor clutter (all grounded)
  scene.add(makeSphere(.22,0xbbbbaa, 4.5,.22,-5));
  scene.add(makeCylinder(.22,.28,.45,0x446688,-4.0,.22,-4.5));
  scene.add(makeBox(.44,.40,.44,0x557744,-7.0,.20,-8));
  // Crowbar leaning on wall
  scene.add(makeBox(.06,1.2,.06,0x777777, 3.5,1.4,-4.5,0,0,.2));
  scene.add(makeBox(.24,.06,.06,0x777777, 3.6,2.0,-4.5));
  if(!ownedWeapons.has('crowbar')) addLabel('F = CROWBAR',3.5,2.3,-4.2,'#ccccff');

  addWindow(ROOM_HALF-.07,3.0,-7,0,.8,1.2,'z');
}


var CASTLE_X1=-5, CASTLE_X2=5, CASTLE_Z1=-9, CASTLE_Z2=-3;
function playerInCastle(){
  return playerPos.x>CASTLE_X1&&playerPos.x<CASTLE_X2&&
         playerPos.z>CASTLE_Z1&&playerPos.z<CASTLE_Z2;
}

function buildPlayPlace(){
  // Lighting
  var ppLight = new THREE.PointLight(0x9933ff, 0.8, 24); ppLight.position.set(0,3.8,0); scene.add(ppLight);
  var ppLight2= new THREE.PointLight(0xff33cc, 0.5, 14); ppLight2.position.set(6,2.0,5); scene.add(ppLight2);
  var castleLight = new THREE.PointLight(0xffddaa, 0.6, 12); castleLight.position.set(0,1.8,-6); scene.add(castleLight);

  // ── Ball pit (south-east corner, x 3..9, z 2..9) ───────────────────────────
  var pitW=6, pitD=7;
  // Pit walls (4 sides, low)
  scene.add(makeBox(pitW+0.3, 0.70, 0.18, 0x882244,  6,  0.35,  2.09)); // north wall
  scene.add(makeBox(pitW+0.3, 0.70, 0.18, 0x882244,  6,  0.35,  9.09)); // south wall (at room edge)
  scene.add(makeBox(0.18, 0.70, pitD, 0xaa2255,  3.09, 0.35,  5.5));    // west wall
  scene.add(makeBox(0.18, 0.70, pitD, 0xaa2255,  9.09, 0.35,  5.5));    // east wall
  // Pit floor (dark)
  scene.add(makeBox(pitW, 0.06, pitD, 0x330022, 6, 0.03, 5.5));
  // Balls — dense and colourful
  var ballCols=[0xff2222,0x2299ff,0xffdd00,0x22cc55,0xff55cc,0xffffff,0xff8800,0x8833ff];
  for(var bi=0;bi<55;bi++){
    var bx=3.3+Math.random()*5.4, bz=2.3+Math.random()*6.4;
    var br=0.16+Math.random()*0.16;
    scene.add(makeSphere(br, ballCols[bi%ballCols.length], bx, 0.10+br+Math.random()*0.28, bz));
  }
  // Diving board / jump platform over pit
  scene.add(makeBox(0.20, 1.60, 0.20, 0xcc6600,  3.3, 0.80, 2.5));  // post
  scene.add(makeBox(1.20, 0.10, 0.50, 0xee8800,  3.3, 1.65, 2.5));  // plank
  addLabel('BALL PIT', 6, 1.5, 5.5, '#ff88cc');

  // ── Slide (south-west corner) ──────────────────────────────────────────────
  scene.add(makeBox(0.20, 2.60, 0.20, 0xdd4400, -7.5, 1.3, 7));    // post L
  scene.add(makeBox(0.20, 2.60, 0.20, 0xdd4400, -6.5, 1.3, 7));    // post R
  scene.add(makeBox(1.20, 0.12, 0.20, 0xee5500, -7.0, 2.6, 7));    // platform top
  scene.add(makeBox(1.20, 0.10, 3.80, 0xff6600, -7.0, 1.8, 4.8, -0.50,0,0)); // ramp
  scene.add(makeBox(1.20, 0.18, 0.18, 0xdd4400, -7.0, 0.09, 3.1)); // landing
  // Slide rails
  scene.add(makeBox(0.06, 0.06, 3.80, 0xcc3300, -7.6, 1.85, 4.8, -0.50,0,0));
  scene.add(makeBox(0.06, 0.06, 3.80, 0xcc3300, -6.4, 1.85, 4.8, -0.50,0,0));
  // Ladder rungs up the back
  [0.5,1.0,1.5,2.0].forEach(function(h){
    scene.add(makeBox(1.0, 0.06, 0.06, 0xaa3300, -7.0, h, 7.18));
  });

  // ── CASTLE (north half, x -5..5, z -9..-3) ────────────────────────────────
  var cW=10, cD=6, cX=0, cZ=-6;        // centre
  var cWH=2.6;                          // castle wall height
  var cWC=0x8877aa, cBat=0x9988bb;

  // Outer walls (4 sides, leaving gap for door on south face)
  // North wall (solid)
  scene.add(makeBox(cW, cWH, 0.36, cWC,  cX,       cWH/2, -9.18));
  // East wall
  scene.add(makeBox(0.36, cWH, cD,  cWC,  5.18,    cWH/2, cZ));
  // West wall
  scene.add(makeBox(0.36, cWH, cD,  cWC, -5.18,    cWH/2, cZ));
  // South wall — two halves with LOW doorway (0.95 tall) in the centre
  scene.add(makeBox(3.60, cWH, 0.36, cWC, -3.2,    cWH/2, -3.18)); // left of door
  scene.add(makeBox(3.60, cWH, 0.36, cWC,  3.2,    cWH/2, -3.18)); // right of door
  // Door lintel (low — only 0.95 gap, must crouch)
  scene.add(makeBox(3.0, cWH-0.95, 0.36, cWC,  0, cWH/2+0.95/2+0.02, -3.18));

  // Battlements (merlons) on top of each wall
  [-4,-2,0,2,4].forEach(function(ox){
    scene.add(makeBox(0.55, 0.45, 0.42, cBat, cX+ox, cWH+0.22, -9.18)); // north
    scene.add(makeBox(0.55, 0.45, 0.42, cBat, cX+ox, cWH+0.22, -3.18)); // south
  });
  [-5,-4,-3].forEach(function(oz){
    scene.add(makeBox(0.42, 0.45, 0.55, cBat,  5.18, cWH+0.22, oz));
    scene.add(makeBox(0.42, 0.45, 0.55, cBat, -5.18, cWH+0.22, oz));
  });

  // Four corner towers (slightly taller)
  [[-5,-9],[5,-9],[-5,-3],[5,-3]].forEach(function(tc){
    scene.add(makeBox(1.4, cWH+0.8, 1.4, 0x9988cc, tc[0], (cWH+0.8)/2, tc[1]));
    // Tower top cone hat
    scene.add(makeCone(0.85, 1.1, 0x6644aa, tc[0], cWH+0.8, tc[1]));
    // Arrow-slit window
    scene.add(makeBox(0.06, 0.60, 0.10, 0x221133, tc[0], cWH*0.55, tc[1]+0.72*(tc[1]>-6?1:-1)));
  });

  // Castle floor (slightly lighter)
  scene.add(makeBox(cW-0.36, 0.06, cD-0.36, 0x554466, cX, 0.03, cZ));

  // Throne / seat inside castle
  scene.add(makeBox(0.80, 0.50, 0.60, 0x6633aa,  0, 0.25, -8.0)); // seat
  scene.add(makeBox(0.80, 1.00, 0.14, 0x7744bb,  0, 1.0,  -8.3)); // back
  scene.add(makeBox(0.14, 0.70, 0.60, 0x6633aa,  0.47, 0.72, -8.0)); // arm
  scene.add(makeBox(0.14, 0.70, 0.60, 0x6633aa, -0.47, 0.72, -8.0));

  // Low crouch-entry reminder label just outside the door
  addLabel('CROUCH [Space] to enter castle', 0, 1.8, -2.4, '#ddaaff');

  // ── Lore notes ─────────────────────────────────────────────────────────────
  // Note on the floor near ball pit
  scene.add(makeBox(0.30, 0.01, 0.22, 0xeeeedd, 5.5, 0.72, 2.5));
  addLabel('F = READ NOTE', 5.5, 1.2, 2.5, '#ffeeaa');
  // Scratched message inside castle on north wall
  scene.add(makeBox(0.60, 0.30, 0.04, 0x332244, 0, 1.0, -9.14));
  addLabel('F = SCRATCHED WALL', 0, 1.8, -8.6, '#cc88ff');

  // General reminder
  addLabel('HOLD [Space] TO CROUCH', 0, 3.2, 0, '#ff88ff');
}


function buildGeneratorRoom(){
  // Emergency light on ceiling (pulsing red, always on)
  var eLight=new THREE.PointLight(0xff1100, power<=0?1.8:0.6, 14);
  eLight.position.set(0,4.2,0); scene.add(eLight);

  // Generator body — large diesel unit
  scene.add(makeBox(3.2,1.10,1.60,0x334433, 0,.55,-6));     // main block
  scene.add(makeBox(3.0,.08,1.50,0x445544, 0,1.12,-6));     // top plate
  scene.add(makeBox(2.6,.90,1.40,0x2a3a2a, 0,.50,-6));      // recess face
  // Control panel
  scene.add(makeBox(1.4,.70,.08,0x223322, 0,.76,-5.16));    // panel face
  scene.add(makeBox(.10,.10,.10,0x33aa33,-0.35,.90,-5.10)); // green run light
  scene.add(makeBox(.10,.10,.10,0xaa2222, 0.35,.90,-5.10)); // red fault light
  [[-.50,.60],[-.20,.60],[.10,.60],[.50,.55]].forEach(function(g){
    scene.add(makeCylinder(.05,.05,.04,0x888866,g[0],g[1],-5.09,Math.PI/2,0,0));
  });
  // Fuel gauge strip
  scene.add(makeBox(.08,.50,.04,0x111111, .60,.68,-5.10));
  var gaugeH=Math.max(0.02, (power/100)*0.46);
  scene.add(makeBox(.06,gaugeH,.02,power<25?0xff3300:0x00cc44, .60,.44+gaugeH/2,-5.10));
  addLabel('POWER: '+Math.floor(power)+'%', .60,1.28,-5.15, power<25?'#ff4400':'#44ff88');

  // Exhaust pipes (go up to ceiling)
  scene.add(makeCylinder(.12,.12,3.8,0x555544,-1.2,2.0,-6.6));
  scene.add(makeCylinder(.12,.12,3.8,0x555544, 1.2,2.0,-6.6));
  scene.add(makeBox(.28,.06,.28,0x666655,-1.2,4.02,-6.6));   // cap
  scene.add(makeBox(.28,.06,.28,0x666655, 1.2,4.02,-6.6));

  // Fuel intake port (right side, where gas can goes)
  scene.add(makeBox(.08,.60,.60,0x223322, 1.72,.70,-6));    // intake housing
  scene.add(makeCylinder(.14,.14,.10,0x444433, 1.80,.70,-6,0,0,Math.PI/2)); // cap ring
  scene.add(makeCylinder(.10,.10,.14,0x333322, 1.88,.70,-6,0,0,Math.PI/2)); // neck
  if(gasCansHeld>0){
    addLabel('F = REFUEL GENERATOR  (+'+GAS_CAN_POWER+'%)', 1.72, 1.5, -6, '#ff8844');
  } else if(power<=5){
    addLabel('NEED GAS CANS — search the farm', 1.72, 1.5, -6, '#ff4400');
  } else {
    addLabel('FUEL PORT', 1.72, 1.4, -6, '#446644');
  }

  // Pipes along walls
  scene.add(makeCylinder(.08,.08,18,0x445544, 0,.60,ROOM_HALF-.12,0,0,Math.PI/2));
  scene.add(makeCylinder(.08,.08,10,0x445544,-ROOM_HALF+.12,2.5,0,Math.PI/2,0,0));
  // Rust stains on floor
  var rs=new THREE.Mesh(new THREE.CircleGeometry(.60,8),new THREE.MeshLambertMaterial({color:0x1a0800}));
  rs.rotation.x=-Math.PI/2; rs.position.set(-1.5,.004,-4); scene.add(rs);
  var rs2=new THREE.Mesh(new THREE.CircleGeometry(.35,6),new THREE.MeshLambertMaterial({color:0x0e0400}));
  rs2.rotation.x=-Math.PI/2; rs2.position.set(3,.004,-7); scene.add(rs2);

  // Workbench with tools
  scene.add(makeBox(3.0,.08,.90,0x5a3a18,-7,.94,-8));
  scene.add(makeBox(3.0,.88,.85,0x4a2a10,-7,.44,-8));
  [[-8.4,-.42],[-5.6,-.42],[-8.4,.42],[-5.6,.42]].forEach(function(l){
    scene.add(makeBox(.08,.88,.08,0x3a1a08,l[0],.44,l[1]-8));
  });
  // Oil can on bench
  scene.add(makeCylinder(.09,.09,.24,0x222222,-7.2,1.02,-7.7));
  scene.add(makeBox(.04,.04,.10,0x444444,-7.2,1.16,-7.62,.5,0,0));
  // Wrench on bench
  scene.add(makeBox(.06,.06,.60,0x888888,-6.6,1.02,-7.8,0,0,.1));
  scene.add(makeBox(.14,.06,.06,0x888888,-6.84,1.06,-7.8));

  // Warning stripes on north wall (near door)
  for(var wsi=0;wsi<6;wsi++){
    scene.add(makeBox(.04,1.2,1.0,wsi%2===0?0xffaa00:0x111111, -2.5+wsi*1.0,.60,-10.88));
  }
  addLabel('\u26a0 HIGH VOLTAGE', 0,2.2,-10.7,'#ffaa00');
}

function buildVents(){
  for(var vx=-8;vx<=8;vx+=4){
    scene.add(makeBox(0.10,1.6,20,0x444444, vx, 0.8, 0));
  }
  for(var vz=-8;vz<=8;vz+=4){
    scene.add(makeBox(20,1.6,0.10,0x444444, 0, 0.8, vz));
  }

  scene.add(makeBox(20,0.18,20,0x0a0a0a, 0, 0.09, 0));
  scene.add(makeBox(20,0.18,20,0x202020, 0, 1.62, 0));
  scene.add(makeBox(4.2,0.28,1.1,0x2b2b2b, 0, 0.22, 0));
  addLabel('VENTS — ONLY THE RAT CAN FOLLOW', 0, 1.35, 0, '#ff9999');

  Object.keys(VENT_LINKS).forEach(function(roomKey){
    var vent = VENT_LINKS[roomKey];
    scene.add(makeBox(1.4,0.10,1.0,0x666666, vent.ventX, 0.10, vent.ventZ));
    for(var slat=-1;slat<=1;slat++){
      scene.add(makeBox(0.20,0.02,0.86,0x999999, vent.ventX + slat*0.28, 0.16, vent.ventZ));
    }
    addLabel('F = EXIT TO ' + vent.label, vent.ventX, 1.0, vent.ventZ, '#88ddff');
  });
}


function buildDogHouse(){
  // House structure
  scene.add(makeBox(3.5,2.8,3.5,0x7a4a20, 0,1.40,-5.5));
  scene.add(makeBox(4.0,.50,4.0,0x5a3010, 0,2.85,-5.5));
  var rl=makeBox(2.2,.10,4.05,0x5a3010,-1.0,3.15,-5.5); rl.rotation.z= .5; scene.add(rl);
  var rr=makeBox(2.2,.10,4.05,0x5a3010, 1.0,3.15,-5.5); rr.rotation.z=-.5; scene.add(rr);
  // Roof shingle strips
  for(var rs=0;rs<5;rs++){
    scene.add(makeBox(2.2,.04,1.0,0x4a2808,-1.0,2.90+rs*.12,-5.5-rs*.22));
    scene.add(makeBox(2.2,.04,1.0,0x4a2808, 1.0,2.90+rs*.12,-5.5-rs*.22));
  }
  scene.add(makeBox(1.4,1.8,.10,0x1a0a04, 0,.90,-3.72)); // door opening
  // Name plaque
  scene.add(makeBox(.08,.26,1.2,0xcc9944,-.04,2.04,-3.70));

  // Dog bed (grounded: base h=.12, center y=.06)
  scene.add(makeBox(2.0,.12,1.4,0x885533, 0,.06,-6.0));
  scene.add(makeBox(2.0,.20,.10,0x774422, 0,.22,-6.8)); // back bolster
  scene.add(makeBox(.10,.20,1.2,0x774422,-1.0,.22,-6.0));
  scene.add(makeBox(.10,.20,1.2,0x774422, 1.0,.22,-6.0));
  scene.add(makeBox(1.8,.10,1.2,0x999977, 0,.14,-6.0)); // mat

  // Bowls (grounded: rim h=.10, center y=.05)
  scene.add(makeCylinder(.30,.36,.10,0x888888,-1.5,.05,-2.5));
  scene.add(makeCylinder(.24,.26,.08,0x444433,-1.5,.04,-2.5)); // food fill
  scene.add(makeCylinder(.30,.36,.10,0x6688aa, 1.5,.05,-2.5));
  var wf=new THREE.Mesh(new THREE.CircleGeometry(.22,8),new THREE.MeshLambertMaterial({color:0x224488}));
  wf.rotation.x=-Math.PI/2; wf.position.set(1.5,.10,-2.5); scene.add(wf);

  // Bones + chew toys on floor
  scene.add(makeBox(.14,.06,.06,0xf0f0e0, 2.5,.03,-3,0, .5,.3));
  scene.add(makeBox(.14,.06,.06,0xf0f0e0,-2.0,.03,-2.8,0,-.8,.5));
  scene.add(makeSphere(.12,0xcc4422, 3.5,.12,-2.0)); // red ball
  scene.add(makeBox(.24,.12,.24,0x226622,-3.0,.06,-4.0));

  // Paw prints leading from door to bed
  [[1.5,.01,-1.5],[2.0,.01,-2.0],[2.4,.01,-1.8],[2.8,.01,-2.3]].forEach(function(p){
    scene.add(makeSphere(.06,0x4a2a08,p[0],p[1],p[2]));
  });
  if(dogDead){
    scene.add(makeBox(.70,.32,.56,0xd4a060,0,.16,-3,.4,0,1.55));
    scene.add(makeSphere(.36,0xd4a060,0,.22,-3.6));
    scene.add(makeSphere(.18,0xffffff,.22,.32,-3.34));
    scene.add(makeSphere(.10,0x111111,.22,.32,-3.28));
    scene.add(makeBox(.22,.42,.22,0xd4a060,-.55,.12,-3,0,0,1.2));
    scene.add(makeBox(.22,.42,.22,0xd4a060, .55,.12,-3,0,0,-1.2));
    var dogScorch=new THREE.Mesh(new THREE.CircleGeometry(.45,8),new THREE.MeshLambertMaterial({color:0x110811}));
    dogScorch.rotation.x=-Math.PI/2; dogScorch.position.set(0,.002,-3.2); scene.add(dogScorch);
    if(hasReviveBone) addLabel('F = REVIVE DOG',0,1.8,-3,'#ffcc44');
    else addLabel('DOG DESTROYED — get REVIVE BONE from WORKSHOP',0,1.8,-3,'#ff8844');
  }
  if(!dogTamed) addLabel('Find BONE to tame dog  F=interact',0,3.6,-5.5,'#4fc8aa');
}


function buildCellar(){
  // Stone pillars with banding
  [[-3.5,-5],[3.5,-5],[-3.5,-1],[3.5,-1]].forEach(function(p){
    scene.add(makeBox(.52,4.5,.52,0x2a1a1a,p[0],2.25,p[1]));
    [.5,2.25,4.0].forEach(function(py){
      scene.add(makeBox(.62,.10,.62,0x3a2a2a,p[0],py,p[1]));
    });
  });
  scene.add(makeBox(7.5,.14,.50,0x2a1a1a, 0,4.4,-5)); // arched beam
  scene.add(makeBox(7.5,.14,.50,0x2a1a1a, 0,4.4,-1));

  // Chains + manacles
  for(var ci=0;ci<4;ci++){
    scene.add(makeBox(.05,1.5,.05,0x555555,(ci-1.5)*1.8,3.5,-4,0,0,.1));
    scene.add(makeSphere(.08,0x666666,(ci-1.5)*1.8,2.7,-4));
    scene.add(makeCylinder(.09,.09,.12,0x888888,(ci-1.5)*1.8,2.6,-4));
  }

  // Barrels (grounded: h=.90 → center y=.45) with band rings
  [[-5,-4],[-5,-2.5],[5,-4],[5,-2.0]].forEach(function(p){
    scene.add(makeCylinder(.40,.42,.90,0x5a3a18,p[0],.45,p[1]));
    scene.add(makeBox(.88,.06,.88,0x4a2a10,p[0],.92,p[1]));
    [.20,.68].forEach(function(rh){
      scene.add(makeCylinder(.43,.43,.06,0x444422,p[0],rh,p[1])); // band ring
    });
  });

  // Shelf unit with jars
  scene.add(makeBox(.12,3.0,2.2,0x3a2a1a,-10.0,1.5,-5));
  [.50,1.40,2.30].forEach(function(sy){
    scene.add(makeBox(.08,.06,2.0,0x2a1a1a,-9.95,sy,-5));
    [-4.8,-4.2,-3.6,-3.0,-5.4].forEach(function(jz,ji){
      var jc=[0x229922,0x883300,0x996633,0x554400,0x228888][ji];
      scene.add(makeCylinder(.09,.09,.22,jc,-9.90,sy+.14,jz));
      scene.add(makeCylinder(.10,.10,.03,0x555555,-9.90,sy+.26,jz));
    });
  });

  // Crates (grounded: h=1.0 → center y=.50)
  scene.add(makeBox(1.0,1.0,1.0,0x5a3010,-6.0,.50,-6));
  scene.add(makeBox(1.0,1.0,1.0,0x5a3010, 6.0,.50,-6));
  scene.add(makeBox(1.0,.50,1.0,0x5a3010,-6.0,1.25,-6)); // half-crate stacked
  [-.48,0,.48].forEach(function(cl){
    scene.add(makeBox(.02,1.0,.02,0x3a2008,-6.0+cl,.50,-6));
  });

  // Ritual markings + candles with wax drips on floor
  scene.add(makeBox(4,.02,4,0x1a0808, 0,.01,-3));
  scene.add(makeBox(2,.015,2,0x440000, 0,.015,-3));
  [-2.5,0,2.5].forEach(function(cx){
    scene.add(makeCylinder(.06,.06,.22,0xeeeecc,cx,.05,-4));
    scene.add(makeBox(.01,.12,.01,0xff8800,cx,.24,-4));
    scene.add(makeSphere(.04,0xffaa00,cx,.32,-4));
    var wax=new THREE.Mesh(new THREE.CircleGeometry(.08,6),new THREE.MeshLambertMaterial({color:0xddddaa}));
    wax.rotation.x=-Math.PI/2; wax.position.set(cx,.002,-4); scene.add(wax);
  });

  // Wall torch brackets with flame
  [[-10.88,2.0,-3],[10.88,2.0,-3],[0,2.0,-10.88]].forEach(function(t){
    scene.add(makeBox(.20,.06,.06,0x555555,t[0],t[1],t[2]));
    scene.add(makeCylinder(.055,.065,.14,0x6b3a18,t[0],t[1]+.12,t[2]));
    scene.add(makeBox(.01,.18,.01,0xff7700,t[0],t[1]+.26,t[2]));
    scene.add(makeSphere(.06,0xffaa00,t[0],t[1]+.34,t[2]));
  });

  // Broken wooden chair on floor
  var bc=makeBox(.70,.06,.70,0x5a3010, 5,.03,1); bc.rotation.z=1.5; scene.add(bc);
  scene.add(makeBox(.06,.50,.06,0x5a3010, 5.3,.25,0.8,.3,0,0));
  scene.add(makeBox(.06,.50,.06,0x5a3010, 4.7,.25,1.2,.6,0,0));

  // Cobweb strings in corners
  [[-10.5,4.4,-10.5],[ 10.5,4.4,-10.5],[-10.5,4.4,10.5]].forEach(function(c){
    scene.add(makeBox(.02,.02,1.6,0x888888,c[0],c[1],c[2],.1,0,.2));
    scene.add(makeBox(.02,.02,1.0,0x888888,c[0],c[1]-.2,c[2],-.1,0,-.15));
  });

  // Old iron gate blocking a side passage
  scene.add(makeBox(.08,2.8,.08,0x333333,-7,1.4,-8));
  scene.add(makeBox(.08,2.8,.08,0x333333,-5,1.4,-8));
  [-6.5,-5.9,-5.3].forEach(function(bx){
    scene.add(makeBox(.04,2.6,.04,0x333333,bx,1.4,-8));
  });
  scene.add(makeBox(.08,.12,2.2,0x444444,-6,2.84,-8));

  // Damp floor stain near walls
  var damp=new THREE.Mesh(new THREE.CircleGeometry(.7,8),new THREE.MeshLambertMaterial({color:0x0a0808}));
  damp.rotation.x=-Math.PI/2; damp.position.set(-10.2,.002,-6); scene.add(damp);
  addWindow(-ROOM_HALF+.07,1.8,-6,0,.6,1.0,'z');

  // Horror: large blood pools across cellar floor
  [[0,.002,0,.90],[3,.002,-5,.65],[-.8,.002,4,.50],[-4,.002,2,.45]].forEach(function(b){
    var bp=new THREE.Mesh(new THREE.CircleGeometry(b[3],9),new THREE.MeshLambertMaterial({color:0x1a0003}));
    bp.rotation.x=-Math.PI/2; bp.position.set(b[0],b[1],b[2]); scene.add(bp);
  });
  // Bloody handprints smeared down south wall
  [[-2.0,1.8],[-.6,1.4],[.8,2.0],[2.0,1.6]].forEach(function(h){
    scene.add(makeBox(.18,.22,.04,0x1e0004,h[0],h[1],ROOM_HALF-.08,.1,0,-.1));
    scene.add(makeBox(.12,.08,.04,0x1e0004,h[0]+.18,h[1]-.12,ROOM_HALF-.08,.3,0,.2));
  });
  // Claw gouges down west pillar — deep marks
  [3.0,2.4,1.8,1.2].forEach(function(py){
    scene.add(makeBox(.03,.50,.03,0x0e0002,-3.5,py,-5,.12,0,0));
  });
  // Additional hanging chains in corners
  [[-8,4.4,-9],[ 8,4.4,-9]].forEach(function(c){
    scene.add(makeBox(.04,2.0,.04,0x555555,c[0],c[1]-1.0,c[2]));
    scene.add(makeSphere(.10,0x666666,c[0],c[1]-2.1,c[2]));
    scene.add(makeCylinder(.12,.12,.08,0x888888,c[0],c[1]-2.2,c[2]));
  });
  // Warning scratched in wall: "HELP" (thin lines)
  [0,.28,.56].forEach(function(ox){
    scene.add(makeBox(.02,.60,.02,0x2a0000,8.5+ox,1.4,ROOM_HALF-.08));
  });
  scene.add(makeBox(.62,.02,.02,0x2a0000,8.65,1.8,ROOM_HALF-.08));
  scene.add(makeBox(.62,.02,.02,0x2a0000,8.65,1.1,ROOM_HALF-.08));
}


function buildPasture(){
  // Fence posts + 2 rails (grounded: post h=1.4 → center y=.70)
  for(var fi=-4;fi<=4;fi++){
    scene.add(makeBox(.12,1.4,.12,0x7a5a30,fi*1.8,.70,-8));
    if(fi<4){
      scene.add(makeBox(1.8,.10,.10,0x7a5a30,fi*1.8+.9,1.10,-8));
      scene.add(makeBox(1.8,.10,.10,0x7a5a30,fi*1.8+.9,.50,-8));
    }
  }
  // Side fence segments
  for(var fz=-4;fz<=4;fz+=2){
    scene.add(makeBox(.12,1.4,.12,0x7a5a30,-9.5,.70,fz));
    scene.add(makeBox(.12,1.4,.12,0x7a5a30, 9.5,.70,fz));
  }

  // Dead tree (grounded: trunk h=3.5 → center y=1.75, bottom y=0)
  scene.add(makeBox(.30,3.5,.30,0x3a2a1a,-5,1.75,-7));
  scene.add(makeBox(1.8,.18,.18,0x3a2a1a,-4.1,3.30,-7,0,0,.4));
  scene.add(makeBox(1.2,.14,.14,0x3a2a1a,-5.6,3.00,-7,0,0,-.5));
  scene.add(makeBox(.8,.12,.12,0x3a2a1a,-4.5,2.40,-7,0,0,.7));
  scene.add(makeBox(.5,.10,.10,0x3a2a1a,-4.0,2.80,-7.3,0,.4,.3));
  // Fallen branch
  scene.add(makeBox(1.4,.06,.06,0x3a2a1a,-6,.03,-6,.1,.8,0));

  // Rocks (sphere center y = sphere radius, so they sit on floor)
  scene.add(makeSphere(.28,0x666666, 3,.28,-6));
  scene.add(makeSphere(.20,0x777777, 4.5,.20,-4));
  scene.add(makeSphere(.35,0x555555,-3,.35,-5));
  scene.add(makeSphere(.16,0x666666,-3.5,.16,-6));

  // Well (grounded: cylinder h=.60 → center y=.30)
  scene.add(makeCylinder(.50,.50,.60,0x888888, 5,.30,-4));
  scene.add(makeCylinder(.55,.55,.06,0x999999, 5,.64,-4));
  scene.add(makeBox(.06,1.2,.06,0x7a5a30, 5,1.20,-3.7));
  scene.add(makeBox(.06,1.2,.06,0x7a5a30, 5,1.20,-4.3));
  scene.add(makeBox(.06,.12,.70,0x7a5a30, 5,1.80,-4));
  scene.add(makeBox(.02,.60,.02,0x888866, 5,1.50,-4));  // rope
  scene.add(makeCylinder(.14,.18,.22,0x7a4a20,5,.88,-4)); // bucket
  var wd=new THREE.Mesh(new THREE.CircleGeometry(.44,10),new THREE.MeshLambertMaterial({color:0x0a1422}));
  wd.rotation.x=-Math.PI/2; wd.position.set(5,.58,-4); scene.add(wd);

  // Scarecrow GROUNDED (stake h=1.8 → center y=0.9 → bottom y=0)
  scene.add(makeBox(.08,1.8,.08,0x7a4a20, 7,.90,-6));        // stake
  scene.add(makeBox(1.6,.08,.08,0x7a4a20, 7,2.10,-6));       // crossbar at shoulders
  scene.add(makeBox(.60,1.10,.50,0x884400, 7,1.60,-6));       // shirt body (top=2.15)
  scene.add(makeSphere(.20,0xddcc88, 7,2.35,-6));             // head sitting on body top
  scene.add(makeBox(.24,.08,.04,0xcc8800, 7,2.59,-5.82));     // hat brim
  scene.add(makeBox(.18,.24,.04,0x884400, 7,2.75,-5.84));     // hat top
  var sc1=makeBox(.06,.50,.30,0x886633,-6.2,1.90,-6); sc1.rotation.z= .2; scene.add(sc1);
  var sc2=makeBox(.06,.50,.30,0x886633, 8.2,1.90,-6); sc2.rotation.z=-.2; scene.add(sc2);

  // Mud patches on floor
  var mud1=new THREE.Mesh(new THREE.CircleGeometry(.8,8),new THREE.MeshLambertMaterial({color:0x1a1008}));
  mud1.rotation.x=-Math.PI/2; mud1.position.set(-2,.002,2); scene.add(mud1);
  var mud2=new THREE.Mesh(new THREE.CircleGeometry(.5,6),new THREE.MeshLambertMaterial({color:0x141008}));
  mud2.rotation.x=-Math.PI/2; mud2.position.set(6,.002,1); scene.add(mud2);

  addLabel('Watch for BARN activations!',0,3.8,-9,'#442222');
}


function buildFrontGate(){
  // Gate stone pillars
  scene.add(makeBox(1.0,5.5,1.0,0x888888,-4,2.75,-5));
  scene.add(makeBox(1.0,5.5,1.0,0x888888, 4,2.75,-5));
  scene.add(makeBox(1.3,.4,1.3,0x999999,-4,5.70,-5));
  scene.add(makeBox(1.3,.4,1.3,0x999999, 4,5.70,-5));
  scene.add(makeBox(8.5,.3,.3,0x777777, 0,5.50,-5));

  // Stone path (grounded: h=.06 → center y=.03)
  for(var pi=-2;pi<=2;pi++){
    scene.add(makeBox(1.4,.06,1.4,0x888880,pi*1.5,.03,pi*.5));
    scene.add(makeBox(.004,.001,1.4,0x666666,pi*1.5,.065,pi*.5,0,.3,0)); // crack line
  }
  // Path continues toward player
  for(var pi2=3;pi2<=6;pi2++) scene.add(makeBox(1.4,.04,1.4,0x777770,pi2*.6-2.0,.02,pi2*1.0));

  // Lamp posts (grounded: h=4.0 → center y=2.0, bottom y=0)
  [-2,2].forEach(function(lx){
    scene.add(makeBox(.15,4.0,.15,0x555555,lx,2.0,-5));
    scene.add(makeBox(.60,.15,.15,0x555555,lx,4.05,-5));
    scene.add(makeCylinder(.14,.14,.3,0xddcc44,lx+.26*Math.sign(lx),4.0,-5,0,0,Math.PI/2));
  });

  // Guard booth (grounded)
  scene.add(makeBox(1.8,2.4,1.8,0x888888,-8.5,1.2,-5));
  scene.add(makeBox(1.8,.08,1.8,0x777777,-8.5,2.42,-5));
  scene.add(makeBox(1.0,1.2,.08,0x223344,-8.5,1.6,-4.08));
  scene.add(makeBox(.6,.06,.8,0x666655,-8.5,2.42,-5)); // desk inside

  // Gate iron bars (locked or open)
  var canEscape=(hasEscapeKey||allDead());
  if(!canEscape){
    for(var gi=-3;gi<=3;gi++) scene.add(makeBox(.12,4.2,.12,0x444444,gi*1.1,2.1,-5));
    scene.add(makeBox(8.2,.14,.14,0x444444, 0,4.2,-5));
    scene.add(makeBox(8.2,.14,.14,0x444444, 0,1.1,-5));
    scene.add(makeBox(8.2,.14,.14,0x444444, 0,2.6,-5));
    for(var gk=-3;gk<=3;gk++) scene.add(makeCone(.08,.3,0x444444,gk*1.1,4.47,-5));
    // Padlock
    scene.add(makeBox(.24,.30,.14,0x886600, 0,1.80,-5.08));
    scene.add(makeBox(.06,.22,.04,0xaa8800, 0,2.04,-5.08));
    if(timeExpired) addLabel('FIND THE ESCAPE KEY to unlock!',0,4.8,-4.8,'#ffe44a');
    else addLabel('Defeat all OR find key at dawn',0,4.8,-4.8,'#ff4444');
  } else {
    scene.add(makeBox(.12,4.2,7.5,0x444444,-7.5,2.1,-5,0,Math.PI/2,0));
    scene.add(makeBox(8.2,.14,.14,0x444444, 0,4.2,-5));
    scene.add(makeBox(8.2,.14,.14,0x444444, 0,1.1,-5));
    addLabel('GATE OPEN  F = ESCAPE THE FARM!',0,4.6,-4.5,'#44ff88');
  }
  // Flanking walls
  for(var fw2=0;fw2<3;fw2++){
    scene.add(makeBox(.2,4.5,3.0,0x888888,-(7+fw2*3),2.25,-5));
    scene.add(makeBox(.2,4.5,3.0,0x888888, (7+fw2*3),2.25,-5));
  }
}


function buildCage(){
  var BAR = 0x3a2818;   // rusty iron bars
  var LOCK = 0x888833;  // brass padlock

  function addPen(cx, cz, botKey, botName, botColor){
    var W=2.6, D=2.2, H=3.6, hw=W/2, hd=D/2;

    // Corner posts
    scene.add(makeBox(.10,H,.10,BAR,cx-hw,H/2,cz-hd));
    scene.add(makeBox(.10,H,.10,BAR,cx+hw,H/2,cz-hd));
    scene.add(makeBox(.10,H,.10,BAR,cx-hw,H/2,cz+hd));
    scene.add(makeBox(.10,H,.10,BAR,cx+hw,H/2,cz+hd));
    // Top rails
    scene.add(makeBox(W,.06,.06,BAR,cx,H,cz-hd));
    scene.add(makeBox(W,.06,.06,BAR,cx,H,cz+hd));
    scene.add(makeBox(.06,.06,D,BAR,cx-hw,H,cz));
    scene.add(makeBox(.06,.06,D,BAR,cx+hw,H,cz));
    // Bottom rails
    scene.add(makeBox(W,.06,.06,BAR,cx,.04,cz-hd));
    scene.add(makeBox(W,.06,.06,BAR,cx,.04,cz+hd));
    scene.add(makeBox(.06,.06,D,BAR,cx-hw,.04,cz));
    scene.add(makeBox(.06,.06,D,BAR,cx+hw,.04,cz));
    // Mid rails
    scene.add(makeBox(W,.06,.06,BAR,cx,H/2,cz-hd));
    scene.add(makeBox(W,.06,.06,BAR,cx,H/2,cz+hd));
    scene.add(makeBox(.06,.06,D,BAR,cx-hw,H/2,cz));
    scene.add(makeBox(.06,.06,D,BAR,cx+hw,H/2,cz));
    // Vertical bars — front & back faces
    [-1.0,-.5,0,.5,1.0].forEach(function(dx){
      scene.add(makeBox(.05,H,.05,BAR,cx+dx,H/2,cz-hd));
      scene.add(makeBox(.05,H,.05,BAR,cx+dx,H/2,cz+hd));
    });
    // Vertical bars — side faces
    [-.7,0,.7].forEach(function(dz){
      scene.add(makeBox(.05,H,.05,BAR,cx-hw,H/2,cz+dz));
      scene.add(makeBox(.05,H,.05,BAR,cx+hw,H/2,cz+dz));
    });
    // Chain + padlock on front left post
    scene.add(makeBox(.04,.38,.04,0x666644,cx-hw+.08,H/2+.18,cz-hd-.02,.28,0,0));
    scene.add(makeBox(.18,.12,.07,LOCK,cx-hw+.08,H/2-.08,cz-hd-.04));
    scene.add(makeCylinder(.04,.04,.06,0x666644,cx-hw+.08,H/2-.02,cz-hd-.04));

    // Hay pile on floor inside cage
    scene.add(makeBox(1.6,.12,1.2,0x8B6914,cx,.06,cz));
    scene.add(makeSphere(.18,0x9a7820,cx-.4,.18,cz-.2));
    scene.add(makeSphere(.14,0x9a7820,cx+.3,.16,cz+.1));

    // Only render the animatronic if it hasn't escaped yet
    var botData=bots[botKey];
    if(botData&&botData.alive&&!activatedBots.has(botKey)){
      var g=new THREE.Group();
      buildChar(g,{name:botName,color:botColor},0.78);
      g.position.set(cx,.28,cz);
      scene.add(g);
      addLabel(botName,cx,H+0.4,cz,'#cc3311');
    } else if(botData&&!botData.alive){
      // Dead — show collapsed endo heap on the floor
      scene.add(makeBox(.80,.20,.60,0x555566,cx,.10,cz));
      scene.add(makeSphere(.28,0x444455,cx,.38,cz));
    } else if(activatedBots.has(botKey)){
      // Escaped — broken cage door hangs open, hay scattered
      addLabel('ESCAPED',cx,H+0.4,cz,'#ff2200');
    }
  }

  // Four pens — northwest, northeast, southwest, southeast
  addPen(-5.5, -6.5, 'frog',  'FROG',  0x33aa44);
  addPen( 5.0, -6.5, 'panda', 'PANDA', 0xfafafa);
  addPen(-5.5,  5.5, 'rhino', 'RHINO', 0x7a8878);
  addPen( 5.0,  5.5, 'horse', 'HORSE', 0x8B5520);

  // Overhead cage lamps (chain + bulb above each pen)
  [[-5.5,-6.5],[5.0,-6.5],[-5.5,5.5],[5.0,5.5]].forEach(function(p){
    scene.add(makeBox(.04,1.0,.04,0x555544,p[0],WALL_H-.5,p[1]));
    scene.add(makeSphere(.14,0xffee88,p[0],WALL_H-1.2,p[1]));
  });

  // Dirt / straw floor grid
  for(var fx=-9;fx<=9;fx+=3){ for(var fz=-9;fz<=9;fz+=3){
    scene.add(makeBox(.004,.001,3,0x2a1a08,fx,.002,fz));
    scene.add(makeBox(3,.001,.004,0x2a1a08,fx,.001,fz));
  }}
  // Scattered straw patches
  [[-3,-3],[3,1],[-1,3],[2,-5]].forEach(function(p){
    scene.add(makeBox(1.4,.004,0.8,0x7a5a10,p[0],.003,p[1]));
  });

  // Pistol on a crate near the south wall
  scene.add(makeBox(.70,.42,.50,0x4a3820, 0,.21, 8.5));   // crate
  scene.add(makeBox(.66,.04,.46,0x3a2c18, 0,.44, 8.5));   // crate lid
  if(!ownedWeapons.has('pistol')){
    scene.add(makeBox(.48,.06,.12,0x2a2a2a, 0,.50, 8.5, 0,.15,0));  // barrel
    scene.add(makeBox(.18,.14,.11,0x3a2a1e, -.12,.47, 8.5, 0,.15,0)); // grip
    addLabel('F = PISTOL\uD83D\uDD2B [9]', 0, 1.3, 8.5, '#ffdd88');
  }
}


function buildArcade(){
  var CABINET_DARK = 0x111122;
  var CABINET_MID  = 0x1a1a33;
  var NEON_PURPLE  = 0x8800ff;
  var NEON_CYAN    = 0x00ccff;
  var NEON_PINK    = 0xff0066;
  var SCREEN_GLOW  = 0x0a2a4a;

  // ── Arcade cabinets along west wall ────────────────────────────────────────
  [-7,-3.5,0,3.5].forEach(function(z){
    // Cabinet body
    scene.add(makeBox(1.4,3.2,0.9,CABINET_DARK,-ROOM_HALF+0.55,1.6,z));
    // Screen bezel
    scene.add(makeBox(0.06,1.10,0.82,0x222233,-ROOM_HALF+0.55,2.6,z));
    // Screen glow
    scene.add(makeBox(0.05,0.95,0.70,SCREEN_GLOW,-ROOM_HALF+0.54,2.6,z));
    // Marquee light strip (top)
    scene.add(makeBox(0.07,0.18,0.88,NEON_PURPLE,-ROOM_HALF+0.55,3.29,z));
    // Control panel slope
    scene.add(makeBox(0.55,0.08,0.88,0x181828,-ROOM_HALF+0.29,1.74,z,0,0,-0.42));
    // Joystick
    scene.add(makeCylinder(.04,.04,.28,0x333344,-ROOM_HALF+0.18,1.82,z-.18));
    scene.add(makeSphere(.07,0xcc2244,-ROOM_HALF+0.18,1.97,z-.18));
    // Buttons row
    [-.10,.06,.22].forEach(function(dz){
      var cols=[0xff2222,0x22ff44,0x2244ff];
      scene.add(makeCylinder(.04,.04,.04,cols[Math.round((dz+.10)/.16)],-ROOM_HALF+0.14,1.86,z+dz));
    });
    // Coin slot
    scene.add(makeBox(0.04,0.04,0.18,0x444455,-ROOM_HALF+0.08,1.55,z));
  });

  // ── Arcade cabinets along east wall ────────────────────────────────────────
  [-6,-1.5,3].forEach(function(z){
    scene.add(makeBox(1.4,3.2,0.9,CABINET_MID,ROOM_HALF-0.55,1.6,z));
    scene.add(makeBox(0.06,1.10,0.82,0x222233,ROOM_HALF-0.55,2.6,z));
    scene.add(makeBox(0.05,0.95,0.70,0x0a3a2a,ROOM_HALF-0.54,2.6,z));   // green screen
    scene.add(makeBox(0.07,0.18,0.88,NEON_CYAN,ROOM_HALF-0.55,3.29,z));  // cyan marquee
    scene.add(makeBox(0.55,0.08,0.88,0x181828,ROOM_HALF-0.29,1.74,z,0,0,0.42));
    scene.add(makeCylinder(.04,.04,.28,0x333344,ROOM_HALF-0.18,1.82,z+.18));
    scene.add(makeSphere(.07,0x2244cc,ROOM_HALF-0.18,1.97,z+.18));
    [-.10,.06,.22].forEach(function(dz){
      scene.add(makeCylinder(.04,.04,.04,0xffaa00,ROOM_HALF-0.14,1.86,z+dz));
    });
    scene.add(makeBox(0.04,0.04,0.18,0x444455,ROOM_HALF-0.08,1.55,z));
  });

  // ── Prize counter along north wall ─────────────────────────────────────────
  scene.add(makeBox(16.0,1.10,1.0,0x1a1a2e,0,0.55,-ROOM_HALF+0.55));  // base
  scene.add(makeBox(16.0,0.06,1.0,0x224466,0,1.12,-ROOM_HALF+0.55));  // glass top
  // Prize items inside case
  [-5,-2,1,4].forEach(function(x){
    scene.add(makeCylinder(.18,.18,.32,0xffcc00,x,0.70,-ROOM_HALF+0.5)); // trophy
    scene.add(makeCylinder(.10,.10,.24,0xddaa00,x,0.98,-ROOM_HALF+0.5));
    scene.add(makeSphere(.14,0xffdd22,x,1.14,-ROOM_HALF+0.5));
  });
  // Ticket dispenser on counter
  scene.add(makeBox(0.40,0.52,0.30,0xcc2233,6,1.38,-ROOM_HALF+0.52));
  scene.add(makeBox(0.06,0.06,0.28,0xffcccc,6,1.12,-ROOM_HALF+0.52));

  // ── Central token machine ───────────────────────────────────────────────────
  scene.add(makeBox(0.90,2.20,0.90,0x222233,0,1.10,2));
  scene.add(makeBox(0.06,0.80,0.82,0x1a1a3a,0,2.10,2));   // screen
  scene.add(makeBox(0.05,0.68,0.70,SCREEN_GLOW,0,2.10,2));
  scene.add(makeBox(0.07,0.14,0.88,NEON_PINK,0,2.52,2));   // top light
  // Token slot
  scene.add(makeBox(0.04,0.12,0.06,0x334455,0,1.60,1.55));

  // ── Neon sign on south wall ─────────────────────────────────────────────────
  // "ARCADE" bar
  scene.add(makeBox(0.06,0.26,5.0,NEON_PINK,0,3.80,ROOM_HALF-0.08));
  scene.add(makeBox(0.06,0.26,5.0,NEON_PURPLE,0,3.48,ROOM_HALF-0.08));
  // Vertical end caps
  scene.add(makeBox(0.06,0.58,0.10,NEON_CYAN,-2.5,3.64,ROOM_HALF-0.08));
  scene.add(makeBox(0.06,0.58,0.10,NEON_CYAN, 2.5,3.64,ROOM_HALF-0.08));

  // ── Floor ──────────────────────────────────────────────────────────────────
  // Checkerboard-style grid lines
  for(var fx=-9;fx<=9;fx+=2){ for(var fz=-9;fz<=9;fz+=2){
    scene.add(makeBox(.004,.001,2,0x1a1a2e,fx,.002,fz));
    scene.add(makeBox(2,.001,.004,0x1a1a2e,fx,.001,fz));
  }}
  // Neon accent strip down center of floor
  scene.add(makeBox(.08,.002,22,NEON_PURPLE,0,.001,0));
  scene.add(makeBox(22,.002,.08,NEON_PURPLE,0,.001,0));

  addLabel('INSERT COIN',0,3.20,ROOM_HALF-0.1,'#ff0066');
}


function buildRestrooms(){
  var STALL_COL = 0x3a4d5c;  // dark slate-blue partition
  var CHROME    = 0x8ca0b0;  // chrome trim
  var PORCELAIN = 0xdde2ec;  // porcelain white

  // ── Stall partitions ──────────────────────────────────────────────────────
  // 3 stalls against north wall; centers x=-4.5,-1.5,1.5 | dividers at x=-6,-3,0,3
  var SF=-8.0, SB=-10.7, SM=(SF+SB)/2; // front, back, mid-z of stall depth

  // Side divider panels (float 0.28 off floor)
  [-6,-3,0,3].forEach(function(x){
    scene.add(makeBox(0.08,2.10,2.7,STALL_COL,x,1.33,SM));   // panel
    scene.add(makeBox(0.06,0.06,2.7,CHROME,x,2.40,SM));       // top rail
    scene.add(makeBox(0.06,0.06,2.7,CHROME,x,0.28,SM));       // foot rail
    // Mounting bolt heads (cosmetic detail)
    [-0.9,0,0.9].forEach(function(dz){
      scene.add(makeCylinder(.025,.025,.04,CHROME,x,1.33,SM+dz));
    });
  });

  // Back rails tying dividers to north wall per stall
  [-4.5,-1.5,1.5].forEach(function(cx){
    scene.add(makeBox(3.0,0.06,0.06,CHROME,cx,2.40,SB));
    scene.add(makeBox(3.0,0.06,0.06,CHROME,cx,0.28,SB));
  });

  // Stall doors — hinged at left, slightly ajar
  [-4.5,-1.5,1.5].forEach(function(cx){
    var door=makeBox(1.02,2.05,0.05,STALL_COL,cx,1.33,SF);
    door.rotation.y=0.16;
    scene.add(door);
    scene.add(makeBox(0.04,0.04,0.18,CHROME,cx+0.42,1.33,SF-0.07)); // pull bar
    scene.add(makeBox(0.03,0.10,0.03,CHROME,cx-0.42,1.33,SF+0.04)); // latch
  });

  // Toilets — moved back to z=-9.8 against back of stall
  [-4.5,-1.5,1.5].forEach(function(sx){
    scene.add(makeCylinder(.24,.28,.36,PORCELAIN,sx,.18,-9.8));  // bowl base
    scene.add(makeCylinder(.26,.24,.06,0xeef0f8,sx,.38,-9.8));   // seat ring
    scene.add(makeBox(.52,.05,.46,PORCELAIN,sx,.42,-9.65));       // seat lid
    scene.add(makeBox(.50,.28,.16,PORCELAIN,sx,.56,-10.10));      // tank
    scene.add(makeBox(.50,.04,.16,0xeef0f8,sx,.72,-10.10));       // tank lid
    scene.add(makeCylinder(.04,.04,.03,CHROME,sx,.76,-10.02));    // flush button
    // T.P. holder on stall wall
    scene.add(makeBox(.04,.18,.04,CHROME,sx+1.38,.84,-8.4));
    scene.add(makeCylinder(.10,.10,.14,0xeeeedd,sx+1.38,.84,-8.4,0,0,Math.PI/2));
  });

  // ── Sinks + mirrors on south wall ─────────────────────────────────────────
  var SW=ROOM_HALF-0.28; // sink center z (against south wall, z≈+10.72)

  // Vanity cabinet spanning south wall
  scene.add(makeBox(8.2,0.06,0.55,0x8899aa,0,0.96,SW));       // countertop
  scene.add(makeBox(8.1,0.94,0.52,0x5e6e7c,0,0.47,SW));       // cabinet body
  scene.add(makeBox(8.1,0.10,0.08,0x445566,0,0.05,SW+0.22));  // toe kick

  // Two sinks at x=-2.8 and x=+2.8
  [-2.8,2.8].forEach(function(sx){
    scene.add(makeCylinder(.24,.28,.18,PORCELAIN,sx,.92,SW));    // basin bowl
    scene.add(makeCylinder(.04,.04,.10,CHROME,sx,.83,SW));       // drain
    // Faucet neck + spout arm
    scene.add(makeBox(.04,.28,.04,CHROME,sx,1.10,SW-0.07));
    scene.add(makeBox(.24,.03,.04,CHROME,sx,1.24,SW-0.07));
    scene.add(makeSphere(.04,0x7a9090,sx,1.24,SW-0.17));         // spout tip
    // Hot / cold handles
    scene.add(makeCylinder(.03,.03,.10,CHROME,sx-.16,1.14,SW-0.07,0,0,Math.PI/2));
    scene.add(makeCylinder(.03,.03,.10,CHROME,sx+.16,1.14,SW-0.07,0,0,Math.PI/2));
    // Soap dispenser
    scene.add(makeBox(.09,.22,.09,0x3a5a6a,sx+.38,1.08,SW-0.09));
    scene.add(makeCylinder(.02,.02,.06,0x2a4a5a,sx+.38,.96,SW-0.09));

    // Mirror flush-mounted on south wall above each sink
    scene.add(makeBox(.05,1.24,0.92,0x2a3a4a,sx,2.42,ROOM_HALF-.03));  // frame
    scene.add(makeBox(.04,1.10,0.78,0x0e1e2e,sx,2.42,ROOM_HALF-.025)); // glass depth
    scene.add(makeBox(.03,1.02,0.70,0x1c3458,sx,2.42,ROOM_HALF-.02));  // reflect tint
    // Corner accent pieces on frame
    [[0.58,0.43],[0.58,-0.43],[-0.58,0.43],[-0.58,-0.43]].forEach(function(c){
      scene.add(makeBox(.06,.06,.06,CHROME,sx,2.42+c[0],ROOM_HALF-.03));
    });
  });

  // Shelf rail between the two mirrors
  scene.add(makeBox(8.2,0.05,0.18,0x8899aa,0,1.56,ROOM_HALF-.03));

  // ── Extras ────────────────────────────────────────────────────────────────
  // Paper towel dispenser on east wall
  scene.add(makeBox(.14,.40,.30,0x778899,ROOM_HALF-.10,1.92,-3.5));
  scene.add(makeBox(.10,.06,.24,0xfafafa,ROOM_HALF-.10,1.71,-3.5));

  // Floor tile grid
  for(var tx=-9;tx<=9;tx+=2){ for(var tz=-8;tz<=8;tz+=2){
    scene.add(makeBox(.004,.001,2,0x3d3d4d,tx,.002,tz));
    scene.add(makeBox(2,.001,.004,0x3d3d4d,tx,.001,tz));
  }}
  // Cracked tile
  scene.add(makeBox(.004,.001,1.4,0x181818,-2,.003,-5));
  scene.add(makeBox(.004,.001,1.0,0x181818,-1.5,.003,-4.5,0,.4,0));

  addWindow(ROOM_HALF-.07,2.8,-7,0,.8,1.2,'z');
  addLabel('...',ROOM_HALF-.5,2.4,3,'#334455');
}


function buildFoxHole(){
  // Central earthen mound
  scene.add(makeBox(2.0,1.5,2.0,0x4a3020, 0,.75,-5.5));
  scene.add(makeCylinder(1.4,2.0,.60,0x4a3020, 0,1.58,-5.5));
  // Tunnel hole (dark opening)
  scene.add(makeCylinder(.60,.60,.20,0x0a0604, 0,.60,-4.6,Math.PI/2,0,0));

  // Earth clumps (grounded: sphere center y = radius)
  [[3.0,.30,-2.5],[4.5,.20,-4],[-2.0,.25,-3],[-4.5,.28,-5],[.5,.18,-7],
   [-3.5,.22,-6.5],[5.0,.26,-6],[2.5,.20,-7]].forEach(function(c){
    scene.add(makeSphere(c[1],0x4a3020,c[0],c[1],c[2]));
  });

  // Roots from walls
  scene.add(makeBox(.06,.06,2.8,0x3a2010,-9.5,1.2,-5,0,0,.25));
  scene.add(makeBox(.04,.04,2.0,0x3a2010,-9.5,.8,-3,0,0,-.15));
  scene.add(makeBox(.06,.06,2.5,0x3a2010, 9.5,1.4,-4,0,0,-.20));
  // Ceiling roots hanging down
  scene.add(makeBox(.04,3.0,.04,0x3a2010,-3,3.0,-7,.2,0,.1));
  scene.add(makeBox(.04,2.5,.04,0x3a2010, 2,2.8,-8,.15,0,-.2));

  // Bones and scraps on floor (grounded)
  scene.add(makeBox(.3,.06,.06,0xf0f0e0, 3,.03,-3,.1, .4,0));
  scene.add(makeBox(.3,.06,.06,0xf0f0e0,-2,.03,-4,.1,1.2,0));
  scene.add(makeSphere(.06,0xf0f0e0, 4.0,.06,-4.5));
  scene.add(makeSphere(.06,0xf0f0e0,-3.5,.06,-6.5));
  // Fur tufts on ground
  scene.add(makeSphere(.08,0xaa8833, 1.5,.08,-2.5));
  scene.add(makeSphere(.06,0xbb9944,-2.0,.06,-5.0));

  // Low-ceiling boulders for atmosphere
  scene.add(makeSphere(.5,0x3a2010,-4,1.4,-8));
  scene.add(makeSphere(.4,0x4a3020, 4,1.2,-7));
  scene.add(makeSphere(.35,0x3a2010, 0,1.6,-9));

  addLabel('Damp earth and old bones...',0,3.8,-9,'#442222');
}


function buildPettingZoo(){
  // Fence posts + 2 rails (grounded)
  for(var pi2=-4;pi2<=4;pi2++){
    scene.add(makeBox(.10,1.3,.10,0x7a5a30,pi2*1.8,.65,-8));
    if(pi2<4){
      scene.add(makeBox(1.8,.08,.08,0x7a5a30,pi2*1.8+.9,1.10,-8));
      scene.add(makeBox(1.8,.08,.08,0x7a5a30,pi2*1.8+.9,.50,-8));
    }
  }
  // Gate frame
  scene.add(makeBox(1.5,1.5,.10,0x5a3a18, 0,.75,-6.5));
  scene.add(makeBox(.10,.30,1.5,0x664422, 0,1.66,-6.5)); // sign above gate

  // Hay piles on floor (grounded: box h touches floor)
  scene.add(makeBox(1.4,.14,1.0,0xc8a028,-3.5,.07,-6.5));
  scene.add(makeBox(1.2,.14,1.0,0xc8a028, 3.5,.07,-6.5));
  [[-3.2,.01,-5.8],[-4.0,.01,-6.8],[3.8,.01,-6.0],[2.9,.01,-7.0]].forEach(function(h){
    scene.add(makeBox(.9,.02,.06,0xaa8822,h[0],h[1],h[2]));
  });

  // Feed trough with legs (grounded)
  scene.add(makeBox(2.0,.36,.40,0x7a4a20,-5.5,.22,-7));
  scene.add(makeBox(1.8,.06,.36,0x5a3010,-5.5,.42,-7));
  [-.90,.90].forEach(function(lx){
    scene.add(makeBox(.08,.22,.08,0x6a3808,-5.5+lx,.11,-7));
  });
  scene.add(makeCylinder(.28,.28,.28,0xccaa66,-5.5,.50,-7));
  scene.add(makeSphere(.10,0xddbb88,-5.5,.65,-7));

  // Animal decor (two fake animals on floor, grounded)
  scene.add(makeSphere(.40,0xddcc88,-3,.40,-4));
  scene.add(makeBox(.60,.40,.30,0xddcc88,-3,.50,-4.2));
  scene.add(makeSphere(.40,0xddcc88, 3,.40,-4));
  scene.add(makeBox(.60,.40,.30,0xddcc88, 3,.50,-4.2));

  // Water trough
  scene.add(makeBox(1.6,.28,.36,0x888888, 5.5,.14,-4));
  var wt2=new THREE.Mesh(new THREE.PlaneGeometry(1.4,.30),new THREE.MeshLambertMaterial({color:0x224466}));
  wt2.rotation.x=-Math.PI/2; wt2.position.set(5.5,.28,-4); scene.add(wt2);

  // Signs on fence posts
  scene.add(makeBox(.06,.30,.50,0x886644,-7.2,.80,-8));
  scene.add(makeBox(.06,.30,.50,0x886644, 7.2,.80,-8));

  addLabel('PETTING ZOO — they used to be friendly',0,3.6,-9,'#446644');
  addWindow(ROOM_HALF-.07,2.5,-7,0,1.0,1.4,'z');

  // Inactive plush standing around the petting zoo (until 1 AM)
  var PLUSH_KEYS=['tfreddy','tbonnie','tchica','ptfox','ptturkey','ptgoat','ptsheep','ptwolf','ptbunny'];
  var PLUSH_POSITIONS=[[-6,-6],[-3,-6],[0,-5.5],[3,-6],[6,-6],[-5,-3.5],[5,-3.5],[-2,-3],[2,-3]];
  var plushIdx=0;
  for(var pi3=0;pi3<PLUSH_KEYS.length;pi3++){
    var pk=PLUSH_KEYS[pi3];
    if(!bots[pk]||!bots[pk].alive||activatedBots.has(pk)) continue;
    if(plushIdx>=PLUSH_POSITIONS.length) break;
    var pp=PLUSH_POSITIONS[plushIdx++];
    var psg=new THREE.Group();
    buildChar(psg,bots[pk],.58);
    psg.position.set(pp[0],0,pp[1]);
    // Face toward the room
    psg.rotation.y=Math.atan2(-pp[0],-pp[1]-3);
    scene.add(psg);
  }
  var plushOnGround=PLUSH_KEYS.filter(function(k){
    return bots[k]&&bots[k].alive&&!activatedBots.has(k);
  }).length;
  if(plushOnGround>0) addLabel('⚠ '+plushOnGround+' plush active at 1 AM',0,1.2,-5.5,'#ff9944');
}


function buildWorkshop(){
  // ── Overhead strip lights (flickering purple/white) ─────────────────────────
  scene.add(makeBox(10,.08,.28,0x554466, 0,WALL_H-.10,-4));
  scene.add(makeBox(10,.08,.28,0x333344, 0,WALL_H-.10, 4));
  scene.add(makeBox(3,.08,.28,0x221133,-6.5,WALL_H-.10, 0)); // broken section

  // ── Main workbenches ────────────────────────────────────────────────────────
  // Bench A (north side)
  scene.add(makeBox(7.0,.09,1.5,0x1e1028,-1,.92,-7.5));
  scene.add(makeBox(6.9,.06,1.44,0x2a1840,-1,.98,-7.5));
  [[-4,-.7],[-4,.7],[2,-.7],[2,.7]].forEach(function(l){
    scene.add(makeBox(.08,.92,.08,0x1a1030,-1+l[0],.46,-7.5+l[1]));
  });
  // Bench B (east side)
  scene.add(makeBox(1.5,.09,5.0,0x1e1028,9.5,.92, 0));
  scene.add(makeBox(1.44,.06,4.9,0x2a1840,9.5,.98, 0));
  [[-1,2],[1,2],[-1,-2],[1,-2]].forEach(function(l){
    scene.add(makeBox(.08,.92,.08,0x1a1030,9.5+l[0],.46,l[1]));
  });

  // ── Animatronic heads on Bench A ────────────────────────────────────────────
  // Hollow COW head (in progress, missing eye)
  scene.add(makeSphere(.44,0xf2f0ee,-4,1.42,-7.5));
  scene.add(makeSphere(.18,0xffffff,-4.22,1.56,-7.10)); // one eyewhite
  scene.add(makeSphere(.11,0x111111,-4.22,1.56,-7.04));
  // open wire side
  scene.add(makeBox(.06,.28,.06,0x888888,-3.5,1.28,-7.5));
  scene.add(makeBox(.06,.28,.06,0x888888,-3.6,1.18,-7.5));

  // PIG head — dark cutaway showing internals
  scene.add(makeSphere(.40,0xff88bb,-1,1.42,-7.5));
  scene.add(makeSphere(.26,0x332233,-1,1.42,-7.3)); // open front cavity
  scene.add(makeBox(.22,.10,.22,0x555555,-1,1.30,-7.46)); // servo block inside
  scene.add(makeSphere(.08,0xee4444,-1.1,1.44,-7.38)); // red LED inside
  scene.add(makeSphere(.08,0xee4444,-0.9,1.44,-7.38));

  // CHICKEN head (complete, eyeless sockets)
  scene.add(makeSphere(.38,0xffe050, 2,1.42,-7.5));
  scene.add(makeSphere(.16,0x0a0008, 1.82,1.54,-7.14)); // empty socket L
  scene.add(makeSphere(.16,0x0a0008, 2.18,1.54,-7.14)); // empty socket R
  scene.add(makeCone(.07,.18,0xff8800, 2,1.52,-7.1,Math.PI/2,0,0)); // beak

  // ── Robot arms hanging from ceiling hooks ──────────────────────────────────
  var armColors=[0xf2f0ee,0xff88bb,0xffe050,0xe86020,0x9090cc];
  var hangPositions=[[-7,WALL_H-.3,-5],[-4,WALL_H-.3,-3],[-1,WALL_H-.3,-4],[2,WALL_H-.3,-3],[5,WALL_H-.3,-5]];
  hangPositions.forEach(function(hp,i){
    var col=armColors[i%armColors.length];
    // Hook
    scene.add(makeBox(.06,.18,.06,0x888888,hp[0],hp[1]-.04,hp[2]));
    // Chain links
    scene.add(makeBox(.04,.28,.04,0x666666,hp[0],hp[1]-.25,hp[2]));
    // Upper arm
    scene.add(makeBox(.22,.55,.22,col,hp[0],hp[1]-.72,hp[2]));
    // Elbow joint
    scene.add(makeSphere(.13,new THREE.Color(col).multiplyScalar(.55).getHex(),hp[0],hp[1]-.99,hp[2]));
    // Forearm (dangling at an angle)
    var fa=makeBox(.18,.50,.18,new THREE.Color(col).multiplyScalar(.78).getHex(),hp[0],hp[1]-1.32,hp[2]);
    fa.rotation.z=.32*(i%2===0?1:-1); scene.add(fa);
    // Hand/mitt
    scene.add(makeSphere(.20,new THREE.Color(col).multiplyScalar(.55).getHex(),hp[0],hp[1]-1.62,hp[2]+.06));
  });

  // ── Torso frames on stands ─────────────────────────────────────────────────
  // Stand A — FOX torso, half-plated
  scene.add(makeCylinder(.10,.14,.90,0x333333,-7,.45, 2));     // stand pole
  scene.add(makeBox(.40,.12,.40,0x2a2233,-7,.94, 2));           // platform
  scene.add(makeBox(.82,.90,.60,0xe86020,-7,1.45, 2));          // torso shell
  scene.add(makeBox(.60,.84,.38,0x222222,-7,1.45, 2));           // open front
  scene.add(makeBox(.32,.18,.18,0x445566,-7,1.56, 1.85));       // chest servo
  scene.add(makeBox(.30,.06,.38,0x334455,-7,1.32, 1.86));       // wiring slab
  [-.12,.12].forEach(function(ox){
    scene.add(makeBox(.04,.44,.04,0x66aaff,-7+ox,1.20, 1.88)); // blue wire
    scene.add(makeBox(.04,.44,.04,0xaa4444,-7+ox+.04,1.18, 1.88)); // red wire
  });

  // Stand B — WOLF torso (nearly complete)
  scene.add(makeCylinder(.10,.14,.90,0x333333, 6,.45, 2));
  scene.add(makeBox(.40,.12,.40,0x2a2233, 6,.94, 2));
  scene.add(makeBox(.88,1.00,.64,0x9090cc, 6,1.50, 2));
  scene.add(makeBox(.12,.60,.08,0x2244aa, 6,1.94,2.3));  // chest strap
  // Eyes already installed — glowing
  scene.add(makeSphere(.14,0xff2222, 5.76,1.84,2.35));
  scene.add(makeSphere(.14,0xff2222, 6.24,1.84,2.35));
  scene.add(makeSphere(.06,0xff8888, 5.76,1.84,2.42));  // glow core L
  scene.add(makeSphere(.06,0xff8888, 6.24,1.84,2.42));  // glow core R

  // ── Leg pairs on floor ─────────────────────────────────────────────────────
  [[-5.5,4],[-3.5,6],[7.5,-4],[8.5,-6]].forEach(function(p,i){
    var lc=[0xf2f0ee,0xffe050,0x9090cc,0xff88bb][i];
    scene.add(makeBox(.28,.52,.28,lc,p[0],.26,p[1]));
    scene.add(makeBox(.28,.52,.28,lc,p[0]+.55,.26,p[1]));
    scene.add(makeBox(.32,.10,.40,new THREE.Color(lc).multiplyScalar(.55).getHex(),p[0],.05,p[1]));
    scene.add(makeBox(.32,.10,.40,new THREE.Color(lc).multiplyScalar(.55).getHex(),p[0]+.55,.05,p[1]));
  });

  // ── Blueprint panels on north wall ─────────────────────────────────────────
  // Blueprint A — full body schematic (cow)
  scene.add(makeBox(.06,2.0,1.6,0x0d1a3a,-10.92,2.2,-6));    // board
  scene.add(makeBox(.04,1.8,1.4,0x0a2244,-10.92,2.2,-6));    // paper
  // Schematic lines (white/cyan)
  scene.add(makeBox(.02,.80,.04,0x44aaff,-10.90,2.10,-6));   // body line V
  scene.add(makeBox(.02,.04,.70,0x44aaff,-10.90,2.50,-6));   // shoulder line H
  scene.add(makeBox(.02,.04,.40,0x44aaff,-10.90,1.80,-6));   // hip line H
  scene.add(makeSphere(.12,0x44aaff,-10.90,2.78,-6));        // head circle
  scene.add(makeBox(.02,.40,.04,0x44aaff,-10.90,2.20,-6.30)); // leg L
  scene.add(makeBox(.02,.40,.04,0x44aaff,-10.90,2.20,-5.70)); // leg R
  addLabel('UNIT-01 BODY PLAN',-9.0,3.40,-6,'#44aaff');

  // Blueprint B — endoskeleton
  scene.add(makeBox(.06,2.0,1.6,0x1a1a0a,-10.92,2.2, 1));
  scene.add(makeBox(.04,1.8,1.4,0x222210,-10.92,2.2, 1));
  scene.add(makeBox(.02,.90,.04,0xffcc44,-10.90,2.1,1));
  scene.add(makeBox(.02,.04,.60,0xffcc44,-10.90,2.55,1));
  scene.add(makeBox(.02,.04,.36,0xffcc44,-10.90,1.80,1));
  scene.add(makeSphere(.10,0xffcc44,-10.90,2.80,1));
  addLabel('ENDOSKELETON FRAME',-9.0,3.40,1,'#ffcc44');

  // Blueprint C — head wiring diagram
  scene.add(makeBox(.06,1.5,1.4,0x0a1a0a,-10.92,2.0, 7));
  scene.add(makeBox(.04,1.3,1.2,0x0e2010,-10.92,2.0, 7));
  scene.add(makeSphere(.32,0x44ff88,-10.90,2.35,7));          // head circle
  scene.add(makeBox(.02,.04,.30,0x44ff88,-10.90,2.0,7));      // neck line
  scene.add(makeBox(.02,.04,.20,0xff4444,-10.90,2.48,6.82));  // eye circuit L
  scene.add(makeBox(.02,.04,.20,0xff4444,-10.90,2.48,7.18));  // eye circuit R
  addLabel('OPTICAL / AUDIO WIRING',-9.0,3.10,7,'#44ff88');

  // ── Tool wall (east side, above bench B) ────────────────────────────────────
  // Tool rack board
  scene.add(makeBox(.08,2.2,4.0,0x1a1020,10.92,2.1,0));
  // Wrenches (flat boxes at angles)
  var toolAngles=[-.5,-.15,.25,.55,-.35,.10];
  var toolColors=[0x777777,0x888866,0x6677aa,0x777777,0x556644,0x886633];
  [-1.8,-1.0,-.2,.6,1.4,2.2].forEach(function(tz,i){
    var tw=makeBox(.06,.04,.52,toolColors[i],10.88,2.6+i*.08,tz);
    tw.rotation.z=toolAngles[i]; scene.add(tw);
    scene.add(makeBox(.08,.08,.06,toolColors[i],10.88,2.6+i*.08,tz+.28));
  });
  // Drill on hook
  scene.add(makeBox(.08,.18,.42,0x334455,10.88,1.8, 1.8));
  scene.add(makeBox(.18,.12,.12,0x445566,10.88,1.72,1.58));
  scene.add(makeCylinder(.03,.02,.18,0x888888,10.88,1.80,1.44,Math.PI/2,0,0));

  // ── Parts bins on floor ────────────────────────────────────────────────────
  var binColors=[0xf2f0ee,0xff88bb,0xffe050,0xe86020];
  [[-8,7],[-6,7],[-4,7],[-2,7]].forEach(function(p,i){
    // Bin crate
    scene.add(makeBox(.90,.60,.90,0x1a1030,p[0],.30,p[1]));
    scene.add(makeBox(.88,.06,.88,0x252040,p[0],.62,p[1]));
    // Parts sticking out
    scene.add(makeSphere(.22,binColors[i],p[0],.74,p[1]));
    scene.add(makeBox(.18,.38,.18,binColors[i],p[0]+.15,.82,p[1]-.1));
  });

  // ── Oil/fluid stains on floor ───────────────────────────────────────────────
  [[0,0],[-3,-2],[4,3],[7,-3],[-7,4]].forEach(function(s, i){
    var st=new THREE.Mesh(new THREE.CircleGeometry(.4+Math.random()*.3,8),
      new THREE.MeshLambertMaterial({color:i%2===0?0x080010:0x100008}));
    st.rotation.x=-Math.PI/2; st.position.set(s[0],.002,s[1]); scene.add(st);
  });

  // ── Power cables on floor ──────────────────────────────────────────────────
  [[-5,5,-3,0],[-3,0,5,-4],[2,8,-1,2]].forEach(function(c){
    scene.add(makeBox(.06,.04,Math.sqrt(Math.pow(c[2]-c[0],2)+Math.pow(c[3]-c[1],2)),
      0x222222,(c[0]+c[2])/2,.02,(c[1]+c[3])/2,
      0,Math.atan2(c[2]-c[0],c[3]-c[1]),0));
  });

  // ── Central endoskeleton on table (disturbing centerpiece) ─────────────────
  // Table
  scene.add(makeBox(3.5,.09,1.8,0x1e1028,2,.92,2));
  scene.add(makeBox(3.4,.06,1.72,0x2a1840,2,.98,2));
  [[-1.6,-.8],[-1.6,.8],[1.6,-.8],[1.6,.8]].forEach(function(l){
    scene.add(makeBox(.08,.92,.08,0x1a1030,2+l[0],.46,2+l[1]));
  });
  // Endoskeleton "body" lying on table
  scene.add(makeBox(.54,.80,.42,0x445566, 2,1.48,2));       // torso
  scene.add(makeSphere(.36,0x334455, 2,2.02,2));             // head
  scene.add(makeSphere(.10,0xff3333, 1.83,2.10,2.22));       // eye L (lit)
  scene.add(makeSphere(.10,0xff3333, 2.17,2.10,2.22));       // eye R (lit)
  scene.add(makeSphere(.05,0xff8888, 1.83,2.10,2.28));
  scene.add(makeSphere(.05,0xff8888, 2.17,2.10,2.28));
  scene.add(makeBox(.18,.52,.18,0x3a4a55, 1.28,1.30,2));    // arm L (extended)
  scene.add(makeBox(.18,.52,.18,0x3a4a55, 2.72,1.30,2));    // arm R
  scene.add(makeBox(.22,.50,.22,0x334455, 1.72,0.80,2));    // leg L
  scene.add(makeBox(.22,.50,.22,0x334455, 2.28,0.80,2));    // leg R
  // Wiring harness visible
  scene.add(makeBox(.04,.60,.04,0xff4444, 2,.78,1.88));
  scene.add(makeBox(.04,.60,.04,0x4444ff, 2.06,.78,1.88));
  addLabel('⚠ ENDO-FRAME ACTIVE',2,2.8,2,'#ff3333');

  // ── Lore labels ─────────────────────────────────────────────────────────────
  addLabel('WORKSHOP — WHERE THEY ARE BORN',0,4.2,-9,'#9944cc');
  addLabel('DO NOT TOUCH THE ENDOSKELETON',2,2.6,4,'#cc4444');
  addLabel('PARTS: CLASSIFIED',8,3.8,0,'#446688');
  addWindow(-ROOM_HALF+.07,2.8,-6,0,1.0,1.4,'z');
  addWindow(-ROOM_HALF+.07,2.8, 4,0,1.0,1.4,'z');
}


function buildKitchen(){
  scene.add(makeBox(10.2,.92,1.2,0x5c4330,0,.46,-7.5));
  scene.add(makeBox(10.1,.08,1.28,0xd9d0c7,0,.96,-7.5));
  [-4.8,-2.4,0,2.4,4.8].forEach(function(cx){
    scene.add(makeBox(.08,.92,1.0,0x463224,cx,.46,-7.5));
  });

  for(var tx=-8;tx<=8;tx+=1.6){
    for(var ty=0;ty<4;ty++){
      scene.add(makeBox(1.5,.32,.04,0xb9c7d2,tx,1.25+ty*.34,-10.85));
    }
  }

  scene.add(makeBox(3.4,.08,.5,0x704f34,-6.0,2.8,-9.7));
  scene.add(makeBox(3.0,.08,.5,0x704f34, 5.7,2.7,-9.7));
  [-7.1,-6.4,-5.7,-5.0,-4.3].forEach(function(px, i){
    scene.add(makeCylinder(.10,.10,.30,[0xcc5533,0x88bb44,0xddaa33,0x8844aa,0x44aacc][i],px,3.02,-9.72));
  });
  [4.7,5.5,6.3].forEach(function(px, i){
    scene.add(makeCylinder(.12,.12,.34,[0xaa3333,0xccaa55,0x66aa44][i],px,2.92,-9.72));
  });

  scene.add(makeBox(2.2,.92,1.2,0x444444,6.6,.46,-7.5));
  scene.add(makeBox(2.05,.08,1.05,0x181818,6.6,.96,-7.5));
  [[6.1,-7.9],[7.1,-7.9],[6.1,-7.1],[7.1,-7.1]].forEach(function(b){
    scene.add(makeCylinder(.18,.18,.04,0x111111,b[0],1.01,b[1]));
  });
  scene.add(makeBox(1.5,.18,1.0,0x666666,6.6,2.65,-8.5));
  scene.add(makeBox(1.1,1.0,.65,0x555555,6.6,2.1,-9.2));
  addLabel('F = COOK AT STOVE',6.6,2.1,-6.2,'#ffcc88');

  scene.add(makeBox(1.8,3.5,1.7,0xd7e0ea,-8.0,1.75,-6.9));
  scene.add(makeBox(.08,3.2,1.5,0xb8c4cf,-8.0,1.75,-6.9));
  scene.add(makeBox(.25,.06,.30,0x556677,-7.15,2.45,-6.2));
  scene.add(makeBox(.25,.06,.30,0x556677,-7.15,1.15,-6.2));
  scene.add(makeBox(.18,.18,.02,0xff6666,-7.09,2.90,-6.05));
  scene.add(makeBox(.16,.16,.02,0x66aaff,-7.09,2.65,-6.05));

  scene.add(makeBox(3.6,.92,1.8,0x6c5038,0,.46,-1.5));
  scene.add(makeBox(3.7,.10,1.9,0xd8cec0,0,.98,-1.5));
  [[-1.5,-.7],[-1.5,.7],[1.5,-.7],[1.5,.7]].forEach(function(l){
    scene.add(makeBox(.10,.92,.10,0x4f3927,l[0],.46,-1.5+l[1]));
  });
  scene.add(makeBox(1.0,.08,.60,0xa8794f,.4,1.04,-1.4));
  if(!ownedWeapons.has('knife')){
    var knife=makeBox(.62,.04,.08,0xc8d2da,-.35,1.07,-1.35);
    knife.rotation.y=.3; scene.add(knife);
    scene.add(makeBox(.16,.05,.10,0x553322,-.62,1.07,-1.25)); // handle
    addLabel('F = KITCHEN KNIFE [8]',-.35,1.8,-1.35,'#ccccff');
  }

  scene.add(makeCylinder(.34,.34,.28,0x6e7680,-3.6,1.10,-7.7));
  scene.add(makeCylinder(.28,.28,.22,0x555d66,-2.4,1.08,-7.4));
  scene.add(makeBox(.40,.04,.08,0x444444,-3.15,1.12,-7.7));
  scene.add(makeBox(.36,.04,.08,0x444444,-1.98,1.10,-7.4));
  scene.add(makeCylinder(.22,.22,.03,0x777777,2.9,1.02,-7.4));
  scene.add(makeBox(.42,.03,.07,0x444444,3.28,1.02,-7.4));

  scene.add(makeBox(2.0,.20,1.0,0x8d949b,-2.6,1.02,-7.5));
  scene.add(makeBox(.85,.14,.58,0x48525c,-3.0,.96,-7.5));
  scene.add(makeBox(.85,.14,.58,0x48525c,-2.1,.96,-7.5));
  scene.add(makeCylinder(.04,.04,.44,0x777777,-2.55,1.25,-7.1,Math.PI/2,0,0));

  scene.add(makeBox(2.1,.08,2.1,0x7a5840,7.0,.82,4.3));
  scene.add(makeBox(.16,.82,.16,0x5b402c,7.0,.41,4.3));
  // North-side chairs (z=3.1, north of table at z=4.3): face south toward table
  [5.7,8.3].forEach(function(cx){
    scene.add(makeBox(.70,.06,.70,0x4e3626,cx,.48,3.1));
    scene.add(makeBox(.70,.70,.06,0x4a3022,cx,.85,3.1-.32)); // backrest north
    [-.26,.26].forEach(function(lx){ [-.26,.26].forEach(function(lz){
      scene.add(makeBox(.05,.48,.05,0x3a2718,cx+lx,.24,3.1+lz));
    });});
  });
  // South-side chairs (z=5.5, south of table at z=4.3): face north toward table
  [5.7,8.3].forEach(function(cx){
    scene.add(makeBox(.70,.06,.70,0x4e3626,cx,.48,5.5));
    scene.add(makeBox(.70,.70,.06,0x4a3022,cx,.85,5.5+.32)); // backrest south
    [-.26,.26].forEach(function(lx){ [-.26,.26].forEach(function(lz){
      scene.add(makeBox(.05,.48,.05,0x3a2718,cx+lx,.24,5.5+lz));
    });});
  });

  // Hanging pot rack above counter
  scene.add(makeBox(6,.06,.06,0x555555, 0,3.8,-7.5));
  scene.add(makeBox(.06,.06,1.0,0x555555,-2.4,3.8,-7.5));
  scene.add(makeBox(.06,.06,1.0,0x555555, 2.4,3.8,-7.5));
  [-2.5,-0.8,0.9,2.6].forEach(function(hx){
    scene.add(makeBox(.03,.28,.03,0x888888,hx,3.66,-7.5));
    scene.add(makeCylinder(.16,.20,.24,0x888888,hx,3.40,-7.5));
    scene.add(makeCylinder(.18,.18,.04,0x777777,hx,3.52,-7.5));
  });

  // Recipe book open on counter
  scene.add(makeBox(.40,.04,.50,0xcc9944, 2.2,1.00,-7.5));
  scene.add(makeBox(.18,.05,.46,0xfafaf0, 2.1,1.04,-7.5));
  scene.add(makeBox(.18,.05,.46,0xfafaf0, 2.29,1.04,-7.5));
  scene.add(makeBox(.36,.01,.44,0x888866, 2.2,1.06,-7.5));

  // Herb pots on windowsill
  [9.2,9.6,10.0].forEach(function(hx){
    scene.add(makeCylinder(.06,.08,.12,0x885533,hx,2.60,-8.06));
    scene.add(makeCylinder(.05,.05,.04,0x553311,hx,2.72,-8.06));
    scene.add(makeSphere(.08,0x44aa33,hx,2.78,-8.06));
  });

  // Kitchen towel hanging on oven handle
  scene.add(makeBox(.06,.38,.22,0xcc4444, 6.0,2.62,-7.5));

  // Handwritten note on counter near stove
  scene.add(makeBox(.32,.01,.26,0xf0e8d0, 5.0,.99,-7.3, 0,.15,0));        // paper
  scene.add(makeBox(.22,.003,.02,0x887766, 5.0,1.0,-7.36, 0,.15,0));      // text line
  scene.add(makeBox(.22,.003,.02,0x887766, 5.0,1.0,-7.3,  0,.15,0));
  scene.add(makeBox(.22,.003,.02,0x887766, 5.0,1.0,-7.24, 0,.15,0));
  scene.add(makeBox(.16,.003,.02,0x887766, 4.96,1.0,-7.18,0,.15,0));
  addLabel('F = READ NOTE', 5.0, 1.9, -7.3, '#ffdd88');

  addLabel('KITCHEN — gather ingredients and cook your own meal',0,4.0,-9,'#ffd28a');
  addWindow(ROOM_HALF-.07,2.4,-5.5,0,1.0,1.4,'z');
  addWindow(ROOM_HALF-.07,2.4, 3.5,0,1.0,1.4,'z');
}



function buildFoodItems(){
  FOOD_ITEMS.forEach(function(item){
    if(item.spot!==currentSpot||collectedFood.has(item.id)) return;
    var x=item.x, z=item.z, b=item.y;  // b = base/surface height

    switch(item.type){

      case 'drink': {
        var cc=item.cupColor||0xee2222;
        var ccD=new THREE.Color(cc).multiplyScalar(.60).getHex();
        scene.add(makeCylinder(.076,.055,.22,cc,        x, b+.110, z));   // cup (wider at top)
        scene.add(makeCylinder(.082,.082,.026,0x777777, x, b+.234, z));   // lid
        scene.add(makeCylinder(.082,.082,.010,ccD,      x, b+.250, z));   // lid ring
        // Brand stripe on cup
        scene.add(makeBox(.005,.14,.14,ccD, x+.055, b+.110, z));
        // Straw
        var straw=makeCylinder(.014,.014,.32,0xfafafa, x+.042, b+.340, z);
        straw.rotation.z=.16; scene.add(straw);
        scene.add(makeSphere(.018,0xffffff, x+.042+Math.sin(.16)*.16, b+.502, z));
        break; }

      case 'pizza': {
        // Cardboard tray/plate
        scene.add(makeBox(.26,.018,.22,0xd4b896, x, b+.009, z));
        // Crust base (golden)
        scene.add(makeBox(.22,.045,.18,0xcc8833,   x,    b+.040, z));
        // Far-edge crust ridge
        scene.add(makeBox(.22,.072,.04,0xdd9944,   x,    b+.062, z-.10));
        // Sauce layer
        scene.add(makeBox(.18,.030,.14,0xee4400,   x-.01,b+.078, z-.01));
        // Melted cheese
        scene.add(makeBox(.17,.020,.13,0xffcc44,   x-.01,b+.097, z-.01));
        // Pepperoni discs
        [[-0.05,-0.04],[0.04,0.03],[0.00,0.05],[-0.02,-0.02],[0.05,-0.03]].forEach(function(pd){
          scene.add(makeCylinder(.032,.032,.014,0xcc2211, x+pd[0], b+.115, z+pd[1]));
        });
        // Basil-ish green spots
        scene.add(makeSphere(.018,0x44aa22, x-.03, b+.117, z+.04));
        scene.add(makeSphere(.018,0x44aa22, x+.04, b+.117, z-.03));
        break; }

      case 'burger': {
        scene.add(makeCylinder(.115,.120,.058,0xcc8822,  x, b+.029, z));   // bottom bun
        scene.add(makeCylinder(.100,.100,.042,0x3a0e00,  x, b+.079, z));   // patty
        scene.add(makeBox(.26,.014,.26,0x55bb22,         x, b+.102, z));   // lettuce (square)
        scene.add(makeBox(.240,.018,.24,0xffcc44,        x, b+.118, z));   // cheese
        scene.add(makeCylinder(.092,.092,.024,0xdd2211,  x, b+.132, z));   // tomato
        // Top bun (flattened sphere via scaleY)
        var topBun=new THREE.Mesh(new THREE.SphereGeometry(.124,10,8),
          new THREE.MeshLambertMaterial({color:0xcc8822}));
        topBun.scale.y=.80; topBun.position.set(x,b+.226,z); scene.add(topBun);
        // Sesame seeds
        [[-0.04,0.04],[0.06,0.00],[0.00,-0.06],[-0.06,-0.02],[0.04,-0.05],[0.00,0.06]].forEach(function(sd){
          scene.add(makeSphere(.013,0xffeedd, x+sd[0], b+.302, z+sd[1]));
        });
        break; }

      case 'fries': {
        // Red fast-food carton (tapers wider at top)
        scene.add(makeCylinder(.090,.074,.135,0xcc2211, x, b+.068, z));
        // White stripe logo area
        scene.add(makeBox(.145,.036,.005,0xffffff, x, b+.100, z+.076));
        // Golden arch hint (two tiny arches = two half-cylinders — approximate with spheres)
        scene.add(makeSphere(.018,0xffcc00, x-.022, b+.104, z+.078));
        scene.add(makeSphere(.018,0xffcc00, x+.022, b+.104, z+.078));
        // Fries sticking out the top
        var fDef=[
          {ox:-.042,oz: .018,h:.22},{ox:-.018,oz:-.022,h:.26},
          {ox:  0,  oz: .010,h:.20},{ox: .018,oz:-.010,h:.24},
          {ox: .040,oz: .018,h:.21},{ox:-.030,oz: .000,h:.28},
          {ox: .030,oz:-.020,h:.19}
        ];
        fDef.forEach(function(fd){
          scene.add(makeBox(.023,fd.h,.023,0xffcc22, x+fd.ox, b+.135+fd.h/2, z+fd.oz));
        });
        break; }
    }

    // Floating pickup label above item
    addLabel('F = '+item.label+'  +'+item.heal+' HP', x, b+1.05, z, '#88ff44');
  });
}

function buildKitchenIngredients(){
  KITCHEN_INGREDIENTS.forEach(function(item){
    if(item.spot!==currentSpot||collectedIngredients.has(item.id)) return;
    if(item.shape==='carrot'){
      var carrot = makeCylinder(.05,.02,.34,item.color,item.x,item.y+.12,item.z,0,0,Math.PI/2);
      carrot.rotation.z = .4;
      scene.add(carrot);
      scene.add(makeSphere(.03,0x55aa33,item.x-.18,item.y+.14,item.z));
    } else if(item.shape==='potato'){
      var potato = new THREE.Mesh(
        new THREE.SphereGeometry(.12,10,8),
        new THREE.MeshLambertMaterial({color:item.color})
      );
      potato.scale.set(1.2,.9,1.0);
      potato.position.set(item.x,item.y+.12,item.z);
      scene.add(potato);
    } else if(item.shape==='egg'){
      var egg = new THREE.Mesh(
        new THREE.SphereGeometry(.12,10,8),
        new THREE.MeshLambertMaterial({color:item.color})
      );
      egg.scale.set(.85,1.15,.85);
      egg.position.set(item.x,item.y+.12,item.z);
      scene.add(egg);
    } else if(item.shape==='corn'){
      scene.add(makeCylinder(.08,.08,.34,item.color,item.x,item.y+.14,item.z,0,0,Math.PI/2));
      scene.add(makeBox(.08,.14,.24,0x4f9c3a,item.x-.18,item.y+.12,item.z));
      scene.add(makeBox(.08,.14,.24,0x4f9c3a,item.x+.18,item.y+.12,item.z));
    } else if(item.shape==='onion'){
      var onion = new THREE.Mesh(
        new THREE.SphereGeometry(.13,10,8),
        new THREE.MeshLambertMaterial({color:item.color})
      );
      onion.scale.set(1.0,.95,1.0);
      onion.position.set(item.x,item.y+.13,item.z);
      scene.add(onion);
      scene.add(makeCylinder(.012,.012,.12,0x9fce7a,item.x,item.y+.25,item.z));
    }
    addLabel('F = TAKE '+item.label,item.x,item.y+.8,item.z,'#aaff88');
  });
}

function buildAmmoItems(){
  AMMO_ITEMS.forEach(function(item){
    if(item.spot!==currentSpot||collectedAmmo.has(item.id)) return;
    scene.add(makeBox(.38,.18,.24,0x9f2f1f,item.x,item.y,item.z));
    scene.add(makeBox(.34,.02,.20,0xd8c18c,item.x,item.y+.10,item.z));
    [-.09,0,.09].forEach(function(off){
      scene.add(makeCylinder(.028,.028,.14,0xcc3333,item.x+off,item.y+.17,item.z,0,0,Math.PI/2));
      scene.add(makeCylinder(.030,.030,.03,0xd4b36a,item.x+off,item.y+.17,item.z+.05,0,0,Math.PI/2));
    });
    addLabel('F = SHELLS  +'+item.amount,item.x,item.y+.82,item.z,'#ffcc66');
  });
  PISTOL_AMMO_ITEMS.forEach(function(item){
    if(item.spot!==currentSpot||collectedAmmo.has(item.id)) return;
    scene.add(makeBox(.22,.10,.14,0x2a2a2a,item.x,item.y,item.z));    // box
    scene.add(makeBox(.20,.02,.12,0xd4b36a,item.x,item.y+.06,item.z)); // top
    [-.06,.06].forEach(function(ox){
      scene.add(makeCylinder(.018,.018,.08,0xbbaa88,item.x+ox,item.y+.09,item.z,0,0,Math.PI/2));
    });
    addLabel('F = BULLETS +'+item.amount,item.x,item.y+.72,item.z,'#ffeeaa');
  });
}

function buildGasCans(){
  GAS_CAN_ITEMS.forEach(function(item){
    if(item.spot!==currentSpot) return;
    if(!activeGasCanIds.has(item.id) || collectedGasCans.has(item.id)) return;
    scene.add(makeBox(.28,.46,.22,0xcc2200,item.x,item.y,item.z));
    scene.add(makeBox(.32,.06,.26,0xdd3311,item.x,item.y+.26,item.z));
    scene.add(makeBox(.08,.24,.08,0xcc2200,item.x,item.y+.39,item.z));
    scene.add(makeBox(.14,.06,.12,0xaaaaaa,item.x,item.y+.51,item.z));
    scene.add(makeBox(.04,.14,.04,0x888888,item.x+.15,item.y+.53,item.z));
    scene.add(makeBox(.20,.02,.14,0xff6644,item.x,item.y-.21,item.z));
    addLabel('F = GAS CAN  +'+GAS_CAN_POWER+'% POWER', item.x, item.y+1.1, item.z, '#ff8844');
  });
}

function buildBatteryItems(){
  BATTERY_ITEMS.forEach(function(item){
    if(item.spot!==currentSpot) return;
    if(!activeBatteryIds.has(item.id) || collectedBatteryIds.has(item.id)) return;
    scene.add(makeBox(.28,.34,.18,0x2255cc,item.x,item.y,item.z));
    scene.add(makeBox(.24,.06,.14,0x88bbff,item.x,item.y+.20,item.z));
    scene.add(makeBox(.10,.05,.06,0xd4b36a,item.x-0.06,item.y+.24,item.z));
    scene.add(makeBox(.10,.05,.06,0xd4b36a,item.x+0.06,item.y+.24,item.z));
    scene.add(makeBox(.30,.02,.20,0x112244,item.x,item.y-.17,item.z));
    addLabel('F = BATTERIES  FULL POWER', item.x, item.y+.82, item.z, '#88bbff');
  });
}


function buildEnemies(){
  for(var key in bots){
    var bot=bots[key];
    var isDog=(bot.name==='FARM DOG');
    // Only activated bots roam (not stage bots)
    if(!activatedBots.has(key)&&bot.name!=='FARMER'&&!isDog&&bot.name!=='RAT') continue;
    var inRoom=isDog?(dogTamed||bot.spot===currentSpot):(bot.spot===currentSpot);
    if(!inRoom||!bot.alive) continue;
    var scale=bot.name==='RAT' ? 0.34 : (bot.name.indexOf('PLUSH')>=0?.58:bot.name==='FARMER'?1.22:1.0);
    if(bot.big) scale*=1.35;  // big animatronics are physically larger
    if(isDog&&dogTamed) scale=.72;
    var group=new THREE.Group();
    buildChar(group,bot,scale);
    var xPos=bot.name==='RAT' ? 0 : (isDog&&dogTamed?1.4:(Math.random()-.5)*6);
    var zPos=bot.name==='RAT' ? -5.8 : (isDog&&dogTamed?-1.8:(-3-Math.random()*5));
    group.position.set(xPos,0,zPos);
    group.userData.botKey=key;

    // ── Animation setup ──────────────────────────────────────────────────────
    // NEW buildChar child order:
    //  0=footL  1=footR  2=legL   3=legR   4=hips   5=torso  6=neck   7=head
    //  8=eyeWL  9=eyeWR 10=pupL  11=pupR  12=glntL 13=glntR
    // 14=armL  15=armR  16=elbL  17=elbR  18=foreL 19=foreR
    // 20=wriL  21=wriR  22=hndL  23=hndR  24=smlBr 25=smlCL 26=smlCR
    var c=group.children;
    if(c.length>=24){
      group.userData.limbs={
        armL:[c[14],c[16],c[18],c[20],c[22]],  // all left arm parts
        armR:[c[15],c[17],c[19],c[21],c[23]],  // all right arm parts
        legL:[c[2],c[0]],
        legR:[c[3],c[1]],
        head:c[7]
      };
      group.userData.limbBase={
        armLz:c[14].position.z, armRz:c[15].position.z,
        armLBaseY:[c[14].position.y,c[16].position.y,c[18].position.y,c[20].position.y,c[22].position.y],
        armRBaseY:[c[15].position.y,c[17].position.y,c[19].position.y,c[21].position.y,c[23].position.y],
        armLBaseX:[c[14].position.x,c[16].position.x,c[18].position.x,c[20].position.x,c[22].position.x],
        armRBaseX:[c[15].position.x,c[17].position.x,c[19].position.x,c[21].position.x,c[23].position.x],
        legLz:c[2].position.z, legRz:c[3].position.z,
        legLBaseY:[c[2].position.y,c[0].position.y],
        legRBaseY:[c[3].position.y,c[1].position.y],
        headY:c[7].position.y, headZ:c[7].position.z
      };
    } else if(c.length>=14){
      group.userData.limbs={
        armL:[c[12]], armR:[c[13]],
        legL:[c[2]],  legR:[c[3]],
        head:c[7]
      };
      group.userData.limbBase={
        armLz:c[12].position.z, armRz:c[13].position.z,
        armLBaseY:[c[12].position.y], armRBaseY:[c[13].position.y],
        armLBaseX:[c[12].position.x], armRBaseX:[c[13].position.x],
        legLz:c[2].position.z, legRz:c[3].position.z,
        legLBaseY:[c[2].position.y], legRBaseY:[c[3].position.y],
        headY:c[7].position.y, headZ:c[7].position.z
      };
    }
    group.userData.walkPhase  = Math.random()*Math.PI*2;
    group.userData.attackPulse= 0;
    group.userData.animScale  = scale;
    group.userData.isDog      = isDog;
    // ─────────────────────────────────────────────────────────────────────────

    scene.add(group); enemyMeshes[key]=group;
  }
}

function spawnDebris(bot,position){
  if(!roomDebrisData[currentSpot]) roomDebrisData[currentSpot]=[];
  var parts=roomDebrisData[currentSpot];
  var col=bot.color,dark=new THREE.Color(col).multiplyScalar(.55).getHex();
  var ox=position.x,oz=position.z,rand=function(){return Math.random()-.5;};
  parts.push({type:'arm', x:ox+rand()*2.5,z:oz+rand()*2.5,col:col, ry:Math.random()*Math.PI*2,rx:.8});
  parts.push({type:'leg', x:ox+rand()*2.5,z:oz+rand()*1.5,col:dark,ry:Math.random()*Math.PI*2,rx:.6});
  parts.push({type:'head',x:ox+rand()*1.5,z:oz+rand()*1.5,col:col});
  parts.push({type:'oil', x:ox+rand()*.6, z:oz+rand()*.6});
}

function buildDebris(){
  var parts=roomDebrisData[currentSpot]||[];
  parts.forEach(function(item){
    if(item.type==='arm')  scene.add(makeBox(.18,.55,.18,item.col,item.x,.14,item.z,item.rx,item.ry,.8));
    else if(item.type==='leg') scene.add(makeBox(.22,.60,.22,item.col,item.x,.14,item.z,item.rx,item.ry,0));
    else if(item.type==='head') scene.add(makeSphere(.28,item.col,item.x,.20,item.z));
    else if(item.type==='oil'){
      var pd=new THREE.Mesh(new THREE.CircleGeometry(.55+Math.random()*.35,10),new THREE.MeshLambertMaterial({color:0x080808}));
      pd.rotation.x=-Math.PI/2; pd.position.set(item.x,.01,item.z); scene.add(pd);
    }
  });
}


function buildWeapon(){
  if(weaponMesh){camera.remove(weaponMesh);weaponMesh=null;}
  if(weapon==='none'){updateWeaponUI();return;}
  var g=new THREE.Group();
  if(weapon==='office_bat'){
    g.add(makeBox(.06,.56,.06,0x666677,0,0,0));
    g.add(makeBox(.09,.32,.09,0x4a4a58,0,.43,0));
    g.add(makeBox(.07,.14,.07,0x9999aa,0,-.30,0));
    g.add(makeBox(.04,.10,.18,0x3b3b46,0,.18,.06));
  } else if(weapon==='bat'){
    g.add(makeBox(.05,.34,.05,0x7a4c22,0,-.16,0));
    g.add(makeBox(.07,.34,.07,0x8b5c2a,0,.10,0));
    g.add(makeBox(.11,.38,.11,0xa86732,0,.42,0));
    [-.03,0,.03].forEach(function(off){
      g.add(makeBox(.005,.78,.005,0x6f431f,off,.08,0));
    });
  } else if(weapon==='crowbar'){
    g.add(makeBox(.05,.62,.05,0x777777,0,0,0));
    g.add(makeBox(.22,.05,.05,0x777777,.09,.31,0));
    g.add(makeBox(.16,.05,.05,0x777777,-.07,-.29,0));
    g.add(makeBox(.08,.05,.05,0x777777,-.14,-.24,0,0,0,.5));
    g.add(makeBox(.08,.05,.05,0x777777,-.14,-.34,0,0,0,-.5));
  } else if(weapon==='axe'){
    g.add(makeBox(.05,.66,.05,0x623714,0,0,0));
    g.add(makeBox(.06,.16,.06,0x70441c,0,-.25,0));
    g.add(makeBox(.40,.30,.05,0xa8a8b8,.11,.35,0,0,0,.12));
    g.add(makeBox(.10,.18,.05,0xc8c8d2,-.08,.38,0,0,0,-.15));
    g.add(makeBox(.14,.04,.03,0x8f8f99,.18,.28,0));
  } else if(weapon==='knife'){
    // Blade
    g.add(makeBox(.03,.50,.06,0xd8e0e8, 0,.18,0));
    g.add(makeBox(.02,.20,.04,0xc0c8d0, 0,.45,.01,0,0,.18)); // tip taper
    // Edge bevel
    g.add(makeBox(.01,.48,.02,0xeef0f8, .016,.18,-.032));
    // Handle
    g.add(makeBox(.04,.24,.08,0x553322, 0,-.14,0));
    // Rivets on handle
    g.add(makeSphere(.014,0x888888, .022,-.06,-.042));
    g.add(makeSphere(.014,0x888888, .022,-.18,-.042));
    // Guard
    g.add(makeBox(.07,.03,.10,0x888888, 0,.00,0));
  } else if(weapon==='taser'){
    // Body
    g.add(makeBox(.08,.44,.06,0xffcc00, 0,0,0));
    // Grip
    g.add(makeBox(.07,.22,.05,0x333300, 0,-.28,0));
    // Trigger guard
    g.add(makeBox(.04,.14,.03,0x222200, .05,-.16,0));
    // Prongs (two small metal tips at top)
    g.add(makeBox(.025,.10,.025,0xaaaaaa,-.025,.26,0));
    g.add(makeBox(.025,.10,.025,0xaaaaaa, .025,.26,0));
    // Electrode glow tips
    g.add(makeSphere(.018,0x44aaff,-.025,.32,0));
    g.add(makeSphere(.018,0x44aaff, .025,.32,0));
    // Charge indicator light
    g.add(makeSphere(.022,0x00ff88, .045,.05,-.035));
  } else if(weapon==='shotgun'){
    g.add(makeBox(.11,.10,.68,0x5f3518,0,-.02,.04)); // stock / pump line
    g.add(makeBox(.14,.18,.34,0x444444,0,.01,-.18)); // receiver
    g.add(makeBox(.08,.08,.58,0x2b2b2b,.04,.06,-.50)); // barrel 1
    g.add(makeBox(.08,.08,.58,0x2b2b2b,-.04,.06,-.50)); // barrel 2
    g.add(makeBox(.11,.11,.22,0x5a3016,0,-.04,-.38)); // pump grip
    [-.03,0,.03].forEach(function(ridge){
      g.add(makeBox(.01,.12,.18,0x3d2312,ridge,-.04,-.38));
    });
    g.add(makeBox(.07,.26,.09,0x5a3010,0,-.15,-.06)); // trigger grip
    g.add(makeBox(.08,.03,.12,0x666666,.04,.01,-.10)); // ejection port
    g.add(makeCylinder(.030,.030,.16,0x202020,0,-.12,-.08,Math.PI/2,0,0)); // trigger guard
    g.add(makeBox(.03,.03,.05,0xcc4422,.06,.09,-.14)); // safety
  } else if(weapon==='pistol'){
    // Slide / upper receiver
    g.add(makeBox(.07,.14,.52,0x2a2a2a, 0,.08,-.10));
    // Lower receiver + grip
    g.add(makeBox(.065,.22,.34,0x1e1e1e, 0,-.04,-.04));
    // Grip (angled down-back)
    g.add(makeBox(.06,.30,.12,0x2e2416, 0,-.22,.10,-.22,0,0));
    // Barrel extension (sticks forward)
    g.add(makeBox(.055,.055,.20,0x333333, 0,.08,-.34));
    // Muzzle ring
    g.add(makeCylinder(.034,.034,.03,0x444444, 0,.08,-.46, Math.PI/2,0,0));
    // Trigger guard
    g.add(makeBox(.04,.10,.04,0x1a1a1a, 0,-.08,-.10));
    // Trigger
    g.add(makeBox(.018,.10,.025,0x333333, 0,-.10,-.06, .3,0,0));
    // Front sight
    g.add(makeBox(.018,.055,.018,0x555555, 0,.16,-.40));
    // Rear sight notch
    g.add(makeBox(.07,.04,.02,0x555555, 0,.16,.02));
    g.add(makeBox(.022,.04,.022,0x1a1a1a,-.028,.16,.02));
    g.add(makeBox(.022,.04,.022,0x1a1a1a, .028,.16,.02));
    // Magazine base
    g.add(makeBox(.055,.06,.10,0x222222, 0,-.34,.10));
  } else if(weapon==='oneshot'){
    // Long golden barrel
    g.add(makeCylinder(.04,.04,.90,0xffd700, 0,.08,-.30, Math.PI/2,0,0));
    // Receiver (chunky box)
    g.add(makeBox(.12,.16,.28,0xffaa00, 0,.04,-.02));
    // Grip
    g.add(makeBox(.09,.28,.10,0xcc8800, 0,-.18,.08,-.18,0,0));
    // Trigger guard
    g.add(makeCylinder(.022,.022,.14,0xffcc33, 0,-.08,-.04, Math.PI/2,0,0));
    // Trigger
    g.add(makeBox(.016,.10,.020,0xffdd55, 0,-.10,-.02, .3,0,0));
    // Star glow on muzzle
    g.add(makeSphere(.052,0xffff00, 0,.08,-.76));
    g.add(makeSphere(.034,0xffffff, 0,.08,-.76));
  }
  g.position.set(.3,-.36,-.52); camera.add(g); weaponMesh=g;
  updateWeaponUI();
}


var PARANOIA_MSGS = [
  'You hear something scraping against the wall...',
  'The temperature drops suddenly.',
  'You hear breathing that isn\'t yours.',
  'A door slammed shut... somewhere nearby.',
  'The lights flickered. You didn\'t do that.',
  'Something dripped on the floor beside you.',
  'You hear distant mechanical whirring.',
  'The scratch marks on this wall look... fresh.',
  'You swear something just moved in the corner.',
  'Something is watching you from the dark.',
  'A low grinding echoes through the vents.',
  'You smell something rotting very close by.',
  'There\'s a wet footprint on the floor. Not yours.',
  'You hear a child\'s laughter, far away.',
];

var ROOM_ENTRY_MSGS = {
  cellar:         'The door groans shut behind you...',
  fox_hole:       'The walls close in. The air is wrong in here.',
  cage:           'The smell of rust and old blood fills your lungs.',
  generator_room: 'The darkness here feels... occupied.',
  play_place:     'The tunnels are too low to walk through. Something giggles in the dark.',
  barn:           'Something shifts in the shadows above the stage.',
  workshop:       'Dark stains on the floor. You try not to look.',
  closet:         'Something moved between the hanging clothes.',
  silo:           'Something is growing in here. The smell is organic. Wrong.',
  vents:          'Metal groans around you. Something tiny skitters in the dark.',
};

function showShadowInDoorway(doorDef){
  var sx, sz, ry;
  if(doorDef.wall==='N'){ sx=doorDef.center; sz=-ROOM_HALF+0.55; ry=0; }
  else if(doorDef.wall==='S'){ sx=doorDef.center; sz= ROOM_HALF-0.55; ry=Math.PI; }
  else if(doorDef.wall==='W'){ sx=-ROOM_HALF+0.55; sz=doorDef.center; ry=-Math.PI/2; }
  else { sx=ROOM_HALF-0.55; sz=doorDef.center; ry=Math.PI/2; }

  var sg=new THREE.Group();
  sg.add(makeBox(0.50,1.30,0.30,0x030303, sx,0.65,sz)); // torso
  sg.add(makeSphere(0.22,0x030303, sx,1.48,sz));          // head
  sg.add(makeBox(0.18,0.90,0.18,0x030303, sx-0.36,0.65,sz)); // arm L
  sg.add(makeBox(0.18,0.90,0.18,0x030303, sx+0.36,0.65,sz)); // arm R
  sg.add(makeBox(0.20,0.80,0.20,0x030303, sx-0.16,-0.40,sz)); // leg L
  sg.add(makeBox(0.20,0.80,0.20,0x030303, sx+0.16,-0.40,sz)); // leg R
  sg.rotation.y=ry;
  scene.add(sg);
  setTimeout(function(){ scene.remove(sg); }, 240+Math.floor(Math.random()*160));
}

function triggerParanoia(){
  paranoiaTimer = 20 + Math.random() * 38;
  // Only during gameplay and not when already dead
  if(gameOver||win||!gameStarted) return;

  var roll = Math.random();
  // Shadow: only if at least one activated bot is in an adjacent room
  var doors = ROOM_DOORS[currentSpot]||[];
  var haunted = doors.filter(function(d){
    for(var bk in bots){
      if(bots[bk].alive && activatedBots.has(bk) && bots[bk].spot===d.dest) return true;
    }
    return false;
  });

  if(roll < 0.30 && haunted.length){
    // Shadow figure glimpse
    var td = haunted[Math.floor(Math.random()*haunted.length)];
    showShadowInDoorway(td);
    showMsg('...', 600);
    // Paranoia flash
    var pf=document.getElementById('paranoia-flash');
    if(pf){ pf.classList.remove('active'); void pf.offsetWidth; pf.classList.add('active'); }
  } else if(roll < 0.60){
    // Flash + message
    var pf2=document.getElementById('paranoia-flash');
    if(pf2){ pf2.classList.remove('active'); void pf2.offsetWidth; pf2.classList.add('active'); }
    showMsg(PARANOIA_MSGS[Math.floor(Math.random()*PARANOIA_MSGS.length)], 3200);
  } else {
    // Just message
    showMsg(PARANOIA_MSGS[Math.floor(Math.random()*PARANOIA_MSGS.length)], 3200);
  }
}


var CAM_CHANNELS = ['barn', 'pasture', 'front_gate'];
var CAM_LABELS   = ['CAM 1: BARN', 'CAM 2: PASTURE', 'CAM 3: FRONT GATE'];

function updateCameraView(){
  // Update tabs
  for(var ci=0; ci<3; ci++){
    var tab=document.getElementById('cvt'+ci);
    if(tab) tab.className='cv-tab'+(ci===cameraChannel?' active':'');
  }
  var spot = CAM_CHANNELS[cameraChannel];
  document.getElementById('cv-room-name').textContent = (ROOM_NAMES[spot]||spot).toUpperCase();
  document.getElementById('cv-pwr-val').textContent = Math.floor(power);

  // Detect bots in this room
  var detected = [];
  for(var bk in bots){
    var b = bots[bk];
    if(!b.alive || b.spot !== spot || !activatedBots.has(bk)) continue;
    var em2 = enemyMeshes[bk];
    var zone = em2 ? (em2.position.x < -3.5 ? 'LEFT' : (em2.position.x > 3.5 ? 'RIGHT' : 'CENTER')) : 'CENTER';
    detected.push({name: b.name, zone: zone, hp: Math.max(0,Math.floor(b.hp))});
  }
  var list = document.getElementById('cv-entity-list');
  if(detected.length === 0){
    list.innerHTML = '<span class="cv-clear">-- CLEAR --</span>';
  } else {
    list.innerHTML = detected.map(function(d){
      return '<div class="cv-entity"><span class="cv-dot">\u25cf</span> '+d.name+
        ' <span class="cv-zone">['+d.zone+']</span>'+
        ' <span class="cv-hp">HP:'+d.hp+'</span></div>';
    }).join('');
  }
}

function openCameraView(){
  cameraActive = true;
  document.getElementById('camera-view').classList.add('active');
  updateCameraView();
}

function closeCameraView(){
  cameraActive = false;
  document.getElementById('camera-view').classList.remove('active');
}


function buildFlashlightModel(){
  if(flashlightMesh){camera.remove(flashlightMesh);flashlightMesh=null;}
  var g=new THREE.Group();
  g.add(makeCylinder(.04,.05,.32,0x444444,0,0,0,Math.PI/2,0,0));
  g.add(makeCylinder(.055,.04,.06,0x666666,.19,0,0,Math.PI/2,0,0));
  g.add(makeCylinder(.04,.04,.06,0x888866,-.19,0,0,Math.PI/2,0,0));
  g.position.set(-.3,-.32,-.44); camera.add(g); flashlightMesh=g;
}

function toggleFlashlight(){
  flashlightOn=!flashlightOn;
  if(spotLight) spotLight.visible=flashlightOn;
  document.getElementById('fl-vignette').className=flashlightOn?'on':'';
  var ws0=document.getElementById('ws0');
  ws0.className='weapon-slot flash-slot owned'+(flashlightOn?' fl-on':'');
  ws0.textContent=flashlightOn?'0:&#128294;ON':'0:&#128294;';
  if(flashlightOn) buildFlashlightModel();
  else { if(flashlightMesh){camera.remove(flashlightMesh);flashlightMesh=null;} }
}

function updateWeaponUI(){
  var weaponName = WEAPON_NAMES[weapon] || 'Fists';
  var damage = WEAPON_DAMAGE[weapon] || 1;
  var extra = weapon === 'shotgun' ? ' | Ammo ' + shotgunAmmo
            : weapon === 'pistol' ? ' | Bullets ' + pistolAmmo
            : weapon === 'taser'  ? ' | Charges ' + taserCharges + '/' + TASER_MAX_CHARGES
            : ' | DMG ' + damage;
  document.getElementById('weapon-label').textContent='Weapon: '+weaponName+extra;
  updateResourceHUD();
  ['none','office_bat','bat','crowbar','axe','shotgun','taser','knife','pistol'].forEach(function(w,i){
    var el=document.getElementById('ws'+(i+1));
    if(!el) return;
    el.className='weapon-slot'+(ownedWeapons.has(w)?' owned':'')+(weapon===w?' active':'');
    var text = (i + 1) + ':' + (WEAPON_NAMES[w] || 'Fists');
    if(w === 'none') text = '1:Fists';
    if(w === 'shotgun') text += ' [' + shotgunAmmo + ']';
    if(w === 'taser') text += ' [' + taserCharges + ']';
    if(w === 'pistol') text += ' [' + pistolAmmo + ']';
    el.textContent = text;
  });
}


function getDoorAt(wall, pos){
  var doors=ROOM_DOORS[currentSpot]||[];
  for(var i=0;i<doors.length;i++){
    var d=doors[i];
    if(d.wall===wall&&Math.abs(pos-d.center)<d.width/2) return d;
  }
  return null;
}

function clampPlayerWithDoors(){
  if(doorTransitionCooldown > 0) return false;
  var WALL_STOP=9.2, WALL_TRANSIT=ROOM_HALF+.8;
  // X boundaries
  if(playerPos.x<-WALL_STOP){
    var wd=getDoorAt('W',playerPos.z);
    if(wd){if(playerPos.x<-WALL_TRANSIT){navigate(wd.dest,'W');return true;}}
    else playerPos.x=-WALL_STOP;
  }
  if(playerPos.x>WALL_STOP){
    var ed=getDoorAt('E',playerPos.z);
    if(ed){if(playerPos.x>WALL_TRANSIT){navigate(ed.dest,'E');return true;}}
    else playerPos.x=WALL_STOP;
  }
  // Z boundaries
  if(playerPos.z<-WALL_STOP){
    var nd=getDoorAt('N',playerPos.x);
    if(nd){if(playerPos.z<-WALL_TRANSIT){navigate(nd.dest,'N');return true;}}
    else playerPos.z=-WALL_STOP;
  }
  if(playerPos.z>WALL_STOP){
    var sd=getDoorAt('S',playerPos.x);
    if(sd){if(playerPos.z>WALL_TRANSIT){navigate(sd.dest,'S');return true;}}
    else playerPos.z=WALL_STOP;
  }
  return false;
}

function overlapsSolidRect(px, pz, solid){
  return Math.abs(px - solid.x) < (solid.hw + PLAYER_COLLISION_RADIUS) &&
         Math.abs(pz - solid.z) < (solid.hd + PLAYER_COLLISION_RADIUS);
}

function isPlayerHidden(){
  return !!hiddenType;
}

function clearHideState(exitMsg){
  if(!hiddenType || !hiddenAnchor) return;
  var anchor = hiddenAnchor;
  hiddenType = null;
  hiddenSpotId = null;
  hiddenAnchor = null;
  if(anchor.exitX !== undefined && anchor.exitZ !== undefined){
    playerPos.x = anchor.exitX;
    playerPos.z = anchor.exitZ;
  }
  if(exitMsg) showMsg(exitMsg, 1800);
}

function findNearbyTableHideSpot(){
  for(var i=0;i<TABLE_HIDE_SPOTS.length;i++){
    var spot = TABLE_HIDE_SPOTS[i];
    if(spot.room!==currentSpot) continue;
    var dx = spot.x-playerPos.x, dz = spot.z-playerPos.z;
    if(Math.sqrt(dx*dx+dz*dz) < 2.3) return spot;
  }
  return null;
}

function findNearbyLockerHideSpot(){
  for(var i=0;i<LOCKER_HIDE_SPOTS.length;i++){
    var spot = LOCKER_HIDE_SPOTS[i];
    if(spot.room!==currentSpot) continue;
    var dx = spot.x-playerPos.x, dz = spot.z-playerPos.z;
    if(Math.sqrt(dx*dx+dz*dz) < 2.4) return spot;
  }
  return null;
}

function enterHideSpot(type, spot){
  hiddenType = type;
  hiddenSpotId = spot.id;
  hiddenAnchor = spot;
  crouching = (type==='table');
  playerPos.x = spot.x;
  playerPos.z = spot.z;
  jumpOffset = 0;
  jumpVelocity = 0;
  jumping = false;
  showMsg(type==='table' ? 'You hide under the table.' : 'You slip into the locker and hold still.', 2200);
}

function clampPlayerAgainstRoomSolids(prevX, prevZ){
  if(hiddenType) return;
  var solids = ROOM_SOLIDS[currentSpot] || [];
  if(!solids.length) return;

  for(var pass=0; pass<3; pass++){
    var moved = false;
    for(var i=0;i<solids.length;i++){
      var solid = solids[i];
      if(!overlapsSolidRect(playerPos.x, playerPos.z, solid)) continue;

      var minX = solid.x - (solid.hw + PLAYER_COLLISION_RADIUS);
      var maxX = solid.x + (solid.hw + PLAYER_COLLISION_RADIUS);
      var minZ = solid.z - (solid.hd + PLAYER_COLLISION_RADIUS);
      var maxZ = solid.z + (solid.hd + PLAYER_COLLISION_RADIUS);

      // If the previous spot was safe, prefer sliding back toward it.
      if(prevX !== undefined && prevZ !== undefined && !overlapsSolidRect(prevX, prevZ, solid)){
        var canKeepX = !overlapsSolidRect(playerPos.x, prevZ, solid);
        var canKeepZ = !overlapsSolidRect(prevX, playerPos.z, solid);
        if(canKeepX && !canKeepZ){
          playerPos.z = prevZ;
          moved = true;
          continue;
        }
        if(!canKeepX && canKeepZ){
          playerPos.x = prevX;
          moved = true;
          continue;
        }
      }

      // If we're still inside, push to the nearest outer edge.
      var pushLeft  = Math.abs(playerPos.x - minX);
      var pushRight = Math.abs(maxX - playerPos.x);
      var pushUp    = Math.abs(playerPos.z - minZ);
      var pushDown  = Math.abs(maxZ - playerPos.z);
      var smallest = Math.min(pushLeft, pushRight, pushUp, pushDown);

      if(smallest === pushLeft)      playerPos.x = minX - 0.02;
      else if(smallest === pushRight) playerPos.x = maxX + 0.02;
      else if(smallest === pushUp)    playerPos.z = minZ - 0.02;
      else                            playerPos.z = maxZ + 0.02;
      moved = true;
    }

    if(!moved) break;
  }
}

function getDoorPromptText(){
  var NEAR=2.5; // distance from wall to show prompt
  var checks=[
    {wall:'W',pos:playerPos.z,coord:playerPos.x,axis:'x',sign:-1},
    {wall:'E',pos:playerPos.z,coord:playerPos.x,axis:'x',sign: 1},
    {wall:'N',pos:playerPos.x,coord:playerPos.z,axis:'z',sign:-1},
    {wall:'S',pos:playerPos.x,coord:playerPos.z,axis:'z',sign: 1},
  ];
  for(var i=0;i<checks.length;i++){
    var c=checks[i];
    var wallCoord=c.sign*ROOM_HALF;
    if(Math.abs(c.coord-wallCoord)<NEAR){
      var d=getDoorAt(c.wall,c.pos);
      if(d) return 'Walk to enter: '+(ROOM_NAMES[d.dest]||d.dest.toUpperCase());
    }
  }
  return null;
}

function navigate(room, fromWall){
  if(gameOver||win) return;
  hiddenType = null;
  hiddenSpotId = null;
  hiddenAnchor = null;
  var prevSpot=currentSpot;
  currentSpot=room;

  // Find matching entry door in new room
  var OPP={N:'S',S:'N',W:'E',E:'W'};
  var entryWall=fromWall?OPP[fromWall]:'S';
  var entryDoors=(ROOM_DOORS[room]||[]).filter(function(d){return d.wall===entryWall;});
  var matchDoor=entryDoors.filter(function(d){return d.dest===prevSpot;})[0]||entryDoors[0];
  var entryCenter=matchDoor?matchDoor.center:0;

  var offset=3.8;
  var ep={x:0,z:0};
  if(entryWall==='N'){ep.z=-(ROOM_HALF-offset);ep.x=entryCenter;}
  else if(entryWall==='S'){ep.z= (ROOM_HALF-offset);ep.x=entryCenter;}
  else if(entryWall==='W'){ep.x=-(ROOM_HALF-offset);ep.z=entryCenter;}
  else {ep.x=(ROOM_HALF-offset);ep.z=entryCenter;}

  playerPos.set(ep.x,1.6,ep.z);
  camera.position.copy(playerPos);
  doorTransitionCooldown = 0.28;

  // Face inward
  if(entryWall==='N')      camYaw=Math.PI;
  else if(entryWall==='S') camYaw=0;
  else if(entryWall==='W') camYaw=-Math.PI/2;
  else                     camYaw= Math.PI/2;
  camPitch=0;

  buildRoom();
  document.getElementById('room-name').textContent=ROOM_NAMES[room]||room.toUpperCase();
  if(room==='cellar'&&bots.purple.spot!=='cellar') bots.purple.spot='cellar';
  if(room==='front_gate'&&(hasEscapeKey||allDead())) showMsg('Press F to ESCAPE THE FARM!',3000);
  // Dog follows player room-to-room
  if(dogTamed&&bots.dog.alive) bots.dog.spot=room;
  // First-visit atmospheric message
  if(!roomEntryShown.has(room) && ROOM_ENTRY_MSGS[room]){
    roomEntryShown.add(room);
    (function(msg){ setTimeout(function(){ showMsg(msg, 3800); }, 400); })(ROOM_ENTRY_MSGS[room]);
  }
}

function setRoomByVent(room, x, z, yaw){
  if(gameOver||win) return;
  hiddenType = null;
  hiddenSpotId = null;
  hiddenAnchor = null;
  currentSpot = room;
  playerPos.set(x, crouching ? 0.85 : 1.6, z);
  camera.position.copy(playerPos);
  doorTransitionCooldown = 0.18;
  camYaw = yaw || 0;
  camPitch = 0;
  buildRoom();
  document.getElementById('room-name').textContent = ROOM_NAMES[room] || room.toUpperCase();
  if(room==='front_gate' && (hasEscapeKey || allDead())) showMsg('Press F to ESCAPE THE FARM!',3000);
  if(room!=='vents' && dogTamed && bots.dog.alive) bots.dog.spot = room;
  if(!roomEntryShown.has(room) && ROOM_ENTRY_MSGS[room]){
    roomEntryShown.add(room);
    (function(msg){ setTimeout(function(){ showMsg(msg, 3800); }, 400); })(ROOM_ENTRY_MSGS[room]);
  }
}

function tryVentTravel(){
  if(currentSpot==='vents'){
    for(var roomKey in VENT_LINKS){
      var ventExit = VENT_LINKS[roomKey];
      var vdx = ventExit.ventX - playerPos.x;
      var vdz = ventExit.ventZ - playerPos.z;
      if(Math.sqrt(vdx*vdx + vdz*vdz) < 2.2){
        setRoomByVent(roomKey, ventExit.roomX, ventExit.roomZ - 1.5, Math.PI);
        showMsg('You slip out of the vent into the ' + ventExit.label + '.', 2200);
        return true;
      }
    }
    return false;
  }

  var vent = VENT_LINKS[currentSpot];
  if(!vent) return false;

  var dx = vent.roomX - playerPos.x;
  var dz = vent.roomZ - playerPos.z;
  if(Math.sqrt(dx*dx + dz*dz) >= 2.4) return false;
  if(!crouching){
    showMsg('Crouch first to crawl into the vent.', 1800);
    return true;
  }

  setRoomByVent('vents', vent.ventX, vent.ventZ - 1.2, 0);
  showMsg('You crawl into the vents. Most animatronics cannot follow...', 2600);
  return true;
}


function triggerFarmerPhase3(){
  farmerPhase = 3;
  bots.purple.alive = true;
  bots.purple.hp    = 900;
  bots.purple.maxHp = 900;
  bots.purple.spot  = 'cellar';
  // Drop phone again so player can pick it up after Phase 3 is beaten
  hasPhone     = false;
  phoneDropped = false;
  showMsg('\u26a0 THE FARMER RISES! He is REBUILDING HIMSELF!', 5000);
  setTimeout(function(){
    showMsg('PHASE 3 \u2014 THE HYBRID AWAKENS! He is faster, stronger, and nearly unkillable!', 5000);
  }, 2800);
}


function doInteract(){
  if(!gameStarted||gameOver||win||cutscenePlaying) return;

  if(hiddenType){
    clearHideState(hiddenType==='table' ? 'You crawl out from under the table.' : 'You quietly step out of the locker.');
    return;
  }

  var nearbyLocker = findNearbyLockerHideSpot();
  if(nearbyLocker){
    enterHideSpot('locker', nearbyLocker);
    return;
  }

  var nearbyTable = findNearbyTableHideSpot();
  if(nearbyTable){
    if(!crouching){
      showMsg('Crouch first to hide under the table.', 1800);
      return;
    }
    enterHideSpot('table', nearbyTable);
    return;
  }

  if(tryVentTravel()) return;

  // Farmer's dropped phone
  if(currentSpot==='cellar'&&phoneDropped&&!hasPhone){
    var pdx=-2-playerPos.x, pdz=-3-playerPos.z;
    if(Math.sqrt(pdx*pdx+pdz*pdz)<2.6){
      hasPhone=true;
      phoneDropped=false;
      if(farmerPhase===2){
        // Phase 3 trigger — Farmer rebuilds himself from fallen animatronic parts
        triggerFarmerPhase3();
      } else {
        // Phase 3 already beaten — real ending
        showMsg('You picked up the Farmer\'s phone...',2000);
        setTimeout(function(){ showPoliceCutscene(); }, 1800);
      }
      buildRoom(); return;
    }
  }

  // Pacifist talk-down: approach low-HP farmer without having killed any animatronics
  if(bots.purple.alive && bots.purple.spot===currentSpot && bots.purple.hp<80 &&
     animatronicsKilled===0 && dogTamed && farmerPhase<3){
    var fm=enemyMeshes['purple'];
    if(fm){
      var ftdx=fm.position.x-playerPos.x, ftdz=fm.position.z-playerPos.z;
      if(Math.sqrt(ftdx*ftdx+ftdz*ftdz)<2.8){
        showPacifistEnding(); return;
      }
    }
  }

  // Escape gate
  if(currentSpot==='front_gate'&&(hasEscapeKey||allDead())){triggerWin();return;}

  // Bone pickup
  if(currentSpot===boneSpot&&!hasBone){
    hasBone=true;
    document.getElementById('bone-label').style.display='block';
    showMsg('Picked up the BONE!'); buildRoom(); return;
  }

  // Escape key pickup
  if(currentSpot===keySpot&&!hasEscapeKey&&timeExpired){
    hasEscapeKey=true;
    document.getElementById('key-label').style.display='block';
    showMsg('You found the ESCAPE KEY! Head to the FRONT GATE!',4000);
    buildRoom(); return;
  }

  // Dog interaction
  if(currentSpot==='dog_house'&&bots.dog.alive){
    if(!dogTamed&&hasBone){
      dogTamed=true; bots.dog.tamed=true; hasBone=false;
      document.getElementById('bone-label').style.display='none';
      document.getElementById('dog-label').style.display='block';
      showMsg('Dog tamed! Fights by your side!',3500); buildRoom();
    } else if(!dogTamed){
      showMsg('Dog wags tail... find a BONE first!',2500);
    }
    return;
  }

  // Revive dead dog (in dog_house, need revive bone)
  if(currentSpot==='dog_house'&&dogDead){
    if(hasReviveBone){
      var rdx=0-playerPos.x, rdz=-3-playerPos.z;
      if(Math.sqrt(rdx*rdx+rdz*rdz)<3.5){
        dogDead=false; hasReviveBone=false;
        dogTamed=true; bots.dog.alive=true; bots.dog.tamed=true;
        bots.dog.hp=bots.dog.maxHp; bots.dog.spot=currentSpot;
        document.getElementById('dog-label').style.display='block';
        showMsg('🦴 Dog REVIVED! Back in action!',3500);
        buildRoom(); return;
      }
    } else {
      showMsg('Your dog is destroyed! Find a REVIVE BONE in the WORKSHOP!',3500); return;
    }
  }

  // Revive bone pickup (workshop)
  if(currentSpot==='workshop'&&dogDead&&!hasReviveBone){
    var rbdx=4-playerPos.x, rbdz=3.5-playerPos.z;
    if(Math.sqrt(rbdx*rbdx+rbdz*rbdz)<2.6){
      hasReviveBone=true;
      showMsg('🦴 REVIVE BONE picked up! Go to the DOG HOUSE!',3500);
      buildRoom(); return;
    }
  }

  // Kitchen cooking
  if(currentSpot==='kitchen'){
    var stoveDx=6.6-playerPos.x, stoveDz=-7.5-playerPos.z;
    if(Math.sqrt(stoveDx*stoveDx+stoveDz*stoveDz)<2.8){
      if(kitchenIngredients.length>=2){
        var usedA=kitchenIngredients.shift();
        var usedB=kitchenIngredients.shift();
        var beforeMealHp=playerHp;
        cookedMeals++;
        playerHp=Math.min(MAX_HP, playerHp+400);
        updateResourceHUD();
        showMsg('Cooked a meal with '+usedA+' + '+usedB+'! +' + Math.floor(playerHp-beforeMealHp) + ' HP', 3200);
      } else {
        showMsg('Find 2 ingredients first, then cook at the stove.', 2400);
      }
      return;
    }
  }

  // Kitchen note
  if(currentSpot==='kitchen'){
    var noteDx=5.0-playerPos.x, noteDz=-7.3-playerPos.z;
    if(Math.sqrt(noteDx*noteDx+noteDz*noteDz)<2.4){
      showMsg('"The meat isn\'t for us. The machines need the iron to keep their gears from seizing."', 6000);
      return;
    }
  }

  // Play place notes
  if(currentSpot==='play_place'){
    var pp1dx=5.5-playerPos.x, pp1dz=4.5-playerPos.z;
    if(Math.sqrt(pp1dx*pp1dx+pp1dz*pp1dz)<2.4){
      showMsg('"FIELD TRIP — 14 children. RETURNED — 0. The Farmer said they loved it here. He let them stay." — torn permission slip', 7000);
      return;
    }
    var pp2dx=0-playerPos.x, pp2dz=-8.6-playerPos.z;
    if(Math.sqrt(pp2dx*pp2dx+pp2dz*pp2dz)<2.4){
      showMsg('[scratched into the castle wall] "...we can hear them at night. They still laugh. They never stop laughing."', 6500);
      return;
    }
  }

  // Security camera terminal (near small monitor at x=-1.8, z=-3.0)
  if(currentSpot==='guard_shack'){
    var cdx=-1.8-playerPos.x, cdz=-3.0-playerPos.z;
    if(Math.sqrt(cdx*cdx+cdz*cdz)<3.5){
      if(cameraActive){ closeCameraView(); return; }
      openCameraView(); return;
    }
  }

  // Guard shack door lock/unlock (near east wall)
  if(currentSpot==='guard_shack' && playerPos.x > 7.5){
    guardDoorLocked = !guardDoorLocked;
    showMsg(guardDoorLocked
      ? '\uD83D\uDD12 Door LOCKED — animatronics blocked!'
      : '\uD83D\uDD13 Door unlocked.', 2800);
    buildRoom(); return;
  }

  // Ingredient pickups
  for(var ki=0;ki<KITCHEN_INGREDIENTS.length;ki++){
    var ingredient=KITCHEN_INGREDIENTS[ki];
    if(ingredient.spot!==currentSpot||collectedIngredients.has(ingredient.id)) continue;
    var idx=ingredient.x-playerPos.x, idz=ingredient.z-playerPos.z;
    if(Math.sqrt(idx*idx+idz*idz)<2.2){
      collectedIngredients.add(ingredient.id);
      respawnTimers[ingredient.id] = Date.now() + 45000;
      kitchenIngredients.push(ingredient.label);
      updateResourceHUD();
      showMsg('Picked up '+ingredient.label+'! ('+kitchenIngredients.length+'/5 ingredients)', 2200);
      buildRoom(); return;
    }
  }

  // Shotgun shell pickups
  for(var ai=0;ai<AMMO_ITEMS.length;ai++){
    var ammo=AMMO_ITEMS[ai];
    if(ammo.spot!==currentSpot||collectedAmmo.has(ammo.id)) continue;
    var adx=ammo.x-playerPos.x, adz=ammo.z-playerPos.z;
    if(Math.sqrt(adx*adx+adz*adz)<2.4){
      collectedAmmo.add(ammo.id);
      respawnTimers[ammo.id] = Date.now() + 45000;
      shotgunAmmo+=ammo.amount;
      updateWeaponUI();
      showMsg('Picked up '+ammo.amount+' shotgun shells!', 2200);
      buildRoom(); return;
    }
  }

  // Pistol bullet pickups
  for(var pi=0;pi<PISTOL_AMMO_ITEMS.length;pi++){
    var pammo=PISTOL_AMMO_ITEMS[pi];
    if(pammo.spot!==currentSpot||collectedAmmo.has(pammo.id)) continue;
    var pdx2=pammo.x-playerPos.x, pdz2=pammo.z-playerPos.z;
    if(Math.sqrt(pdx2*pdx2+pdz2*pdz2)<2.4){
      collectedAmmo.add(pammo.id);
      respawnTimers[pammo.id] = Date.now() + 45000;
      pistolAmmo+=pammo.amount;
      updateWeaponUI();
      showMsg('Picked up '+pammo.amount+' pistol bullets!', 2200);
      buildRoom(); return;
    }
  }

  // Pistol pickup (cage room, on crate at 0, y, 8.5)
  if(currentSpot==='cage'&&!ownedWeapons.has('pistol')){
    var pgdx=0-playerPos.x, pgdz=8.5-playerPos.z;
    if(Math.sqrt(pgdx*pgdx+pgdz*pgdz)<2.4){
      ownedWeapons.add('pistol');
      weapon='pistol';
      buildWeapon();
      showMsg('Pistol\uD83D\uDD2B picked up! [9]  Find bullets around the farm.', 3000);
      buildRoom(); return;
    }
  }

  // Food pickups
  for(var fi=0;fi<FOOD_ITEMS.length;fi++){
    var food=FOOD_ITEMS[fi];
    if(food.spot!==currentSpot||collectedFood.has(food.id)) continue;
    var fdx=food.x-playerPos.x, fdz=food.z-playerPos.z;
    if(Math.sqrt(fdx*fdx+fdz*fdz)<2.6){
      collectedFood.add(food.id);
      var preHp=playerHp;
      playerHp=Math.min(MAX_HP,playerHp+food.heal);
      var gained=Math.floor(playerHp-preHp);
      showMsg(food.label+' consumed! +'+gained+' HP \u2665',2800);
      buildRoom(); return;
    }
  }

  // Gas can pickup
  for(var gi=0;gi<GAS_CAN_ITEMS.length;gi++){
    var gasCan=GAS_CAN_ITEMS[gi];
    if(gasCan.spot!==currentSpot) continue;
    if(!activeGasCanIds.has(gasCan.id) || collectedGasCans.has(gasCan.id)) continue;
    var gcdx=gasCan.x-playerPos.x, gcdz=gasCan.z-playerPos.z;
    if(Math.sqrt(gcdx*gcdx+gcdz*gcdz)<2.8){
      collectedGasCans.add(gasCan.id);
      gasCansHeld++;
      showMsg('\u26fd Gas can collected! Bring it to the GENERATOR ROOM. Cans held: '+gasCansHeld, 3200);
      buildRoom(); return;
    }
  }

  // Battery pickup
  for(var bi=0;bi<BATTERY_ITEMS.length;bi++){
    var battery=BATTERY_ITEMS[bi];
    if(battery.spot!==currentSpot) continue;
    if(!activeBatteryIds.has(battery.id) || collectedBatteryIds.has(battery.id)) continue;
    var bdx=battery.x-playerPos.x, bdz=battery.z-playerPos.z;
    if(Math.sqrt(bdx*bdx+bdz*bdz)<2.6){
      collectedBatteryIds.add(battery.id);
      power=100;
      if(ambLight && roomLight){
        ambLight.intensity=0.28;
        roomLight.intensity=1.6;
      }
      document.body.classList.remove('power-dead');
      document.getElementById('power-warning').style.display='none';
      showMsg('🔋 Batteries found! Flashlight power restored to 100%!', 3200);
      updateResourceHUD();
      buildRoom(); return;
    }
  }

  // Generator refuel (generator room, fuel intake port at x=1.72, z=-6)
  if(currentSpot==='generator_room' && gasCansHeld>0){
    var grdx=1.72-playerPos.x, grdz=-6.0-playerPos.z;
    if(Math.sqrt(grdx*grdx+grdz*grdz)<3.0){
      gasCansHeld--;
      power=Math.min(100, power+GAS_CAN_POWER);
      ambLight.intensity=0.28; roomLight.intensity=1.6;
      document.body.classList.remove('power-dead');
      document.getElementById('power-warning').style.display='none';
      showMsg('\u26a1 GENERATOR REFUELED! Power is now '+Math.floor(power)+'%. Cans left: '+gasCansHeld, 3500);
      buildRoom(); return;
    }
  }

  // Bear trap pickup (tractor shed, workbench far end)
  if(currentSpot==='tractor_shed' && bearTraps < 3){
    var btdx=-7.0-playerPos.x, btdz=-5.0-playerPos.z;
    if(Math.sqrt(btdx*btdx+btdz*btdz)<2.8){
      var got=3-bearTraps; bearTraps=3;
      document.getElementById('trap-label').style.display='block';
      document.getElementById('trap-label').textContent='\uD83D\uDC09 TRAPS: '+bearTraps;
      showMsg('Picked up '+got+' bear trap'+(got>1?'s':'')+'. Press T to place in a room.',3000);
      buildRoom(); return;
    }
  }

  // Weapon pickups (click/F when in room)
  // Battery recharge for taser
  if(currentSpot==='guard_shack'&&ownedWeapons.has('taser')&&taserCharges<TASER_MAX_CHARGES){
    taserCharges=TASER_MAX_CHARGES;
    showMsg('⚡ Taser fully recharged! ('+taserCharges+' charges)',2500);
    buildRoom(); return;
  }

  var wPickups=[
    {spot:'guard_shack', key:'office_bat', msg:'Office Bat! [2]'},
    {spot:'guard_shack', key:'taser',      msg:'TASER ⚡ [7] — stuns animatronics!',duration:3000},
    {spot:'tractor_shed',key:'bat',        msg:'Wood Bat! [3]'},
    {spot:'farmhouse',   key:'axe',        msg:'Axe! [5]'},
    {spot:'closet',      key:'crowbar',    msg:'Crowbar! [4]'},
    {spot:'silo',        key:'shotgun',    msg:'SHOTGUN! [6] *',duration:3000},
    {spot:'kitchen',     key:'knife',      msg:'Kitchen Knife! [8]'},
    {spot:'cage',        key:'pistol',     msg:'PISTOL\uD83D\uDD2B found! [9]  Find bullets around the farm.',duration:3000},
  ];
  for(var i=0;i<wPickups.length;i++){
    var p=wPickups[i];
    if(currentSpot===p.spot&&!ownedWeapons.has(p.key)){
      ownedWeapons.add(p.key); weapon=p.key;
      if(p.key==='taser') taserCharges=TASER_MAX_CHARGES;
      buildWeapon(); showMsg('Picked up '+p.msg,p.duration); return;
    }
  }

  doSwing();
}


function spawnReviveEffect(x, z) {
  var sparkColors = [0xffee44, 0xff8844, 0x44ffee, 0xee44ff, 0xffffff, 0x88ff44];
  // 14 small sparks burst outward
  for(var i=0; i<14; i++){
    var c=sparkColors[Math.floor(Math.random()*sparkColors.length)];
    var r=0.04+Math.random()*.07;
    var m=makeSphere(r, c, x+(Math.random()-.5)*.6, .4+Math.random()*.6, z+(Math.random()-.5)*.6);
    m.userData.perm=true; // survive clearRoom during buildRoom delay
    scene.add(m);
    reviveParticles.push({
      mesh:m,
      vx:(Math.random()-.5)*2.8,
      vy:1.2+Math.random()*2.0,
      vz:(Math.random()-.5)*2.8,
      life:1.0,
      maxLife:.6+Math.random()*.8
    });
  }
  // Central energy glow
  var glow=makeSphere(.40, 0xffff88, x, 1.0, z);
  glow.userData.perm=true;
  scene.add(glow);
  reviveParticles.push({mesh:glow, vx:0, vy:.4, vz:0, life:1.0, maxLife:.55, isGlow:true});
  // Ring of coloured orbs at ground level
  for(var j=0; j<8; j++){
    var ang=j*Math.PI/4;
    var om=makeSphere(.07, sparkColors[j%sparkColors.length],
      x+Math.cos(ang)*.55, .08, z+Math.sin(ang)*.55);
    om.userData.perm=true;
    scene.add(om);
    reviveParticles.push({
      mesh:om,
      vx:Math.cos(ang)*1.4,
      vy:.6+Math.random()*.6,
      vz:Math.sin(ang)*1.4,
      life:1.0, maxLife:.7+Math.random()*.4
    });
  }
}


function allDead(){
  for(var key in bots){
    var b=bots[key];
    if(b.alive&&b.name!=='FARMER'&&b.name!=='FARM DOG') return false;
  }
  return !bots.purple.alive;
}


function init(){
  scene=new THREE.Scene();
  camera=new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight,.1,100);
  camera.userData.perm=true;
  camera.position.copy(playerPos);

  renderer=new THREE.WebGLRenderer({canvas:document.getElementById('canvas'),antialias:true});
  renderer.setSize(window.innerWidth,window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
  renderer.shadowMap.enabled=false;

  clock=new THREE.Clock();

  window.addEventListener('resize',function(){
    camera.aspect=window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth,window.innerHeight);
  });

  // Permanent lights (saved to state so game loop can modulate them)
  ambLight=new THREE.AmbientLight(0xffffff,.28); ambLight.userData.perm=true; scene.add(ambLight);
  roomLight=new THREE.PointLight(0xff7744,1.6,28); roomLight.userData.perm=true;
  roomLight.position.set(0,3,0); scene.add(roomLight);

  // Flashlight spotlight (camera-attached)
  spotLight=new THREE.SpotLight(0xfff8e0,2.0,22,Math.PI/7,.5,1.5);
  spotLight.userData.perm=true; spotLight.visible=false;
  camera.add(spotLight);
  var spTarget=new THREE.Object3D(); spTarget.position.set(0,0,-5);
  camera.add(spTarget); spotLight.target=spTarget;

  scene.add(camera);

  boneSpot=['barn','pasture','tractor_shed','silo','closet','restrooms'][Math.floor(Math.random()*6)];
  keySpot=['farmhouse','cellar','silo','closet'][Math.floor(Math.random()*4)];
  var gasPool=GAS_CAN_ITEMS.slice();
  for(var gp=gasPool.length-1;gp>0;gp--){
    var swapIndex=Math.floor(Math.random()*(gp+1));
    var temp=gasPool[gp];
    gasPool[gp]=gasPool[swapIndex];
    gasPool[swapIndex]=temp;
  }
  gasPool.slice(0,4).forEach(function(item){ activeGasCanIds.add(item.id); });
  var batteryPool=BATTERY_ITEMS.slice();
  for(var bp=batteryPool.length-1;bp>0;bp--){
    var batterySwapIndex=Math.floor(Math.random()*(bp+1));
    var batteryTemp=batteryPool[bp];
    batteryPool[bp]=batteryPool[batterySwapIndex];
    batteryPool[batterySwapIndex]=batteryTemp;
  }
  batteryPool.slice(0,4).forEach(function(item){ activeBatteryIds.add(item.id); });

  buildRoom();
  buildWeapon();
  document.getElementById('room-name').textContent=ROOM_NAMES[currentSpot];
  updateResourceHUD();
  updateEnemyCount();
  animate();
}

init();


function animate(){
  requestAnimationFrame(animate);

  if(!gameStarted||gameOver||win||cutscenePlaying){
    if(!cutscenePlaying&&policeTimer>0){policeTimer++;renderer.render(scene,camera);if(policeTimer>180)triggerWin();}
    else renderer.render(scene,camera);
    return;
  }

  var dt=clock.getDelta();
  if(dt>0.1) dt=0.1; // cap to prevent tunneling
  if(doorTransitionCooldown > 0) doorTransitionCooldown = Math.max(0, doorTransitionCooldown - dt);

  // ── CAMERA LOOK ────────────────────────────────────────────────────────────
  camera.rotation.order='YXZ';
  camera.rotation.y=camYaw;
  camera.rotation.x=camPitch;

  // ── KEYBOARD LOOK (A/D turn, Arrow Up/Down pitch) ──────────────────────────
  var turnSpeed=1.6*dt;
  var pitchSpeed=1.2*dt;
  if(keys['KeyA']||keys['ArrowLeft'])  camYaw+=turnSpeed;
  if(keys['KeyD']||keys['ArrowRight']) camYaw-=turnSpeed;
  if(keys['ArrowUp'])   camPitch=Math.max(-.65,Math.min(.65,camPitch+pitchSpeed));
  if(keys['ArrowDown']) camPitch=Math.max(-.65,Math.min(.65,camPitch-pitchSpeed));

  // ── MOVEMENT (WASD + Q/E strafe) ───────────────────────────────────────────
  var baseSpeed = currentSpot==='vents' ? VENT_MOVE_SPEED : MOVE_SPEED;
  var speed=(crouching ? baseSpeed*0.45 : baseSpeed)*dt;
  var forward=new THREE.Vector3(-Math.sin(camYaw),0,-Math.cos(camYaw));
  var right  =new THREE.Vector3( Math.cos(camYaw),0,-Math.sin(camYaw));
  var isMoving=keys['KeyW']||keys['KeyS']||keys['KeyQ']||keys['KeyE'];
  if(hiddenType) isMoving = false;
  var prevX = playerPos.x;
  var prevZ = playerPos.z;
  // Castle interior requires crouching
  if(currentSpot==='play_place'&&playerInCastle()&&!crouching&&isMoving){
    showMsg('CROUCH [Space] — the castle is too low to stand in!',1200);
    isMoving=false;
  } else if(currentSpot==='vents'&&!crouching&&isMoving){
    showMsg('CROUCH [Space] — the vents are too tight to stand in!',1200);
    isMoving=false;
  } else {
    if(keys['KeyW']) playerPos.addScaledVector(forward, speed);
    if(keys['KeyS']) playerPos.addScaledVector(forward,-speed);
    if(keys['KeyQ']) playerPos.addScaledVector(right,  -speed);
    if(keys['KeyE']) playerPos.addScaledVector(right,   speed);
  }
  clampPlayerAgainstRoomSolids(prevX, prevZ);
  var groundY = crouching ? 0.85 : 1.6;
  if(hiddenType && hiddenAnchor){
    playerPos.x = hiddenAnchor.x;
    playerPos.z = hiddenAnchor.z;
  }
  if(crouching && jumping){
    jumping = false;
    jumpVelocity = 0;
    jumpOffset = 0;
  }
  if(hiddenType==='table' && !crouching){
    clearHideState('You crawl out from under the table.');
  }
  if(jumping){
    jumpOffset += jumpVelocity * dt;
    jumpVelocity -= 11.5 * dt;
    if(jumpOffset <= 0){
      jumpOffset = 0;
      jumpVelocity = 0;
      jumping = false;
    }
  }
  playerPos.y = groundY + jumpOffset;

  // ── DOOR TRANSITIONS ───────────────────────────────────────────────────────
  if(clampPlayerWithDoors()) return; // navigated — new frame
  camera.position.copy(playerPos);

  // ── WALK BOB + LOW-HP BREATHING ────────────────────────────────────────────
  if(isMoving) walkBobT += dt * 5.8;
  else         walkBobT  = 0;
  camera.position.y += Math.sin(walkBobT) * 0.052;
  camera.rotation.z  = isMoving ? Math.sin(walkBobT * 0.5) * 0.016 : 0;
  // Breathing: subtle pitch oscillation when critically hurt
  if(playerHp < 35 && playerHp > 0){
    var breathStr = (1 - playerHp / 35) * 0.018;
    camera.rotation.x += Math.sin(Date.now() * 0.0026) * breathStr;
  }

  // ── DOOR PROMPT ────────────────────────────────────────────────────────────
  var dp=getDoorPromptText();
  var dpEl=document.getElementById('door-prompt');
  if(dp){dpEl.textContent=dp;dpEl.className='door-prompt show';}
  else dpEl.className='door-prompt';

  // ── IN-GAME CLOCK ──────────────────────────────────────────────────────────
  timeTicks++;
  if(timeTicks>=TICKS_PER_HOUR){
    timeTicks=0; currentHour++;
    if(currentHour===12) isAM=!isAM;
    if(currentHour===13) currentHour=1;

    // Animatronic activation check
    for(var bk in BOT_ACTIVATION_HOUR){
      if(activatedBots.has(bk)||!bots[bk]||!bots[bk].alive) continue;
      var sched=BOT_ACTIVATION_HOUR[bk];
      if(currentHour===sched[0]&&isAM===sched[1]){
        activatedBots.add(bk);
        // Keep plush in petting_zoo; only barn-based bots stay in barn
        if(bots[bk].spot==='barn') bots[bk].spot='barn'; // already barn, stays barn
        var origin=bots[bk].spot==='petting_zoo'?'Petting Zoo':(bots[bk].spot==='cage'?'the CAGE':'stage');
        showStageAlert('⚠ '+bots[bk].name+' has ESCAPED '+origin+'!');
        if(currentSpot==='barn'||currentSpot==='petting_zoo'||currentSpot==='cage') buildRoom();
      }
    }

    // Dawn: time expires at 10 AM
    if(currentHour===10&&isAM){
      timeExpired=true;
      showMsg('DAWN ARRIVES! Find the ESCAPE KEY or defeat the Farmer!',6000);
      if(currentSpot==='front_gate') buildRoom(); // update gate label
    }
  }
  document.getElementById('time-disp').textContent=currentHour+(isAM?' AM':' PM');

  // ── POWER (flashlight + cameras) ───────────────────────────────────────────
  var drain=0.002+(flashlightOn?0.008:0)+(cameraActive?0.016:0);
  power=Math.max(0,power-drain);
  if(power<=0&&flashlightOn){power=0;toggleFlashlight();showMsg('Flashlight battery dead!',3000);}
  if(power<=0&&cameraActive){closeCameraView();showMsg('\u26a0 Power out! Cameras offline!',2800);}
  document.getElementById('pwr-num').textContent=Math.floor(power);
  document.getElementById('pwr-fill').style.width=power+'%';
  document.getElementById('pwr-fill').style.background=power<20?'#e44':'#ee4';

  // ── CAMERA VIEW UPDATE ──────────────────────────────────────────────────────
  if(cameraActive){
    cameraViewTimer+=dt;
    if(cameraViewTimer>=0.5){ cameraViewTimer=0; updateCameraView(); }
  }

  // ── ROOM LIGHT FLICKER / BLACKOUT ───────────────────────────────────────────
  if(ambLight && roomLight){
    if(power<=0){
      ambLight.intensity  = 0.02;  // faint emergency glow — not pitch black
      roomLight.intensity = 0.0;
      document.body.classList.add('power-dead');
      document.getElementById('power-warning').style.display='block';
    } else {
      document.body.classList.remove('power-dead');
      document.getElementById('power-warning').style.display='none';
      if(power<25){
        // Flicker: random interval — snap between bright and black
        flickerTimer-=dt;
        if(flickerTimer<=0){
          flickerTimer=0.04+Math.random()*0.20;
          flickerState=Math.random()<0.40 ? 0.0 : 0.10+Math.random()*0.90;
        }
        ambLight.intensity  = 0.28*flickerState;
        roomLight.intensity = 1.60*flickerState;
      } else {
        // Normal: smoothly restore to full after a refuel
        ambLight.intensity  += (0.28 - ambLight.intensity ) * Math.min(1, dt*4);
        roomLight.intensity += (1.60 - roomLight.intensity) * Math.min(1, dt*4);
      }
    }
  }

  // ── PARANOIA EVENTS ────────────────────────────────────────────────────────
  paranoiaTimer -= dt;
  if(paranoiaTimer <= 0) triggerParanoia();

  // ── HEARTBEAT VIGNETTE (low HP) ────────────────────────────────────────────
  var hb = document.getElementById('heartbeat');
  if(hb){
    if(playerHp <= 0 || playerHp >= 35)      hb.className='';
    else if(playerHp < 18)                   hb.className='fast';
    else                                     hb.className='slow';
  }

  // ── ITEM RESPAWN ───────────────────────────────────────────────────────────
  var nowMs = Date.now(), needRebuild = false;
  for(var rtid in respawnTimers){
    if(nowMs >= respawnTimers[rtid]){
      var wasInRoom = false;
      if(collectedAmmo.has(rtid)){
        collectedAmmo.delete(rtid);
        var allItems = AMMO_ITEMS.concat(PISTOL_AMMO_ITEMS);
        for(var ri=0;ri<allItems.length;ri++){
          if(allItems[ri].id===rtid && allItems[ri].spot===currentSpot){ wasInRoom=true; break; }
        }
      } else if(collectedIngredients.has(rtid)){
        collectedIngredients.delete(rtid);
        for(var ri2=0;ri2<KITCHEN_INGREDIENTS.length;ri2++){
          if(KITCHEN_INGREDIENTS[ri2].id===rtid && KITCHEN_INGREDIENTS[ri2].spot===currentSpot){ wasInRoom=true; break; }
        }
      }
      delete respawnTimers[rtid];
      if(wasInRoom) needRebuild = true;
    }
  }
  if(needRebuild) buildRoom();

  // ── BOT ROAMING — step one room at a time, no teleporting ─────────────────
  var playerHiddenNow = isPlayerHidden();
  for(var rk in bots){
    var rb=bots[rk];
    if(!rb.alive||rb.name==='FARMER'||rb.name==='FARM DOG') continue;
    if(!activatedBots.has(rk)) continue;

    // Init per-bot timer with a staggered start so they don't all move at once
    if(rb.moveTimer===undefined) rb.moveTimer=Math.random()*6;
    rb.moveTimer-=dt;
    if(rb.moveTimer>0) continue;

    var isPlush=rb.name.indexOf('PLUSH')>=0;
    // Plush move fast (creepy scurry), regular bots move every 4-8 s
    rb.moveTimer=isPlush?(1.2+Math.random()*2.0):(rb.cage?(1.75+Math.random()*2.5):(3.5+Math.random()*5.0));

    // Determine next room
    var nextRoom=rb.spot;
    var isStalker=(rb.name==='WOLF'||rb.name==='FOX');
    var stalkerPath=findRoomPath(rb.spot,currentSpot);

    if(playerHiddenNow){
      var hiddenAdj = (ROOM_ADJACENCY[rb.spot]||[]).filter(function(r){ return r!==currentSpot; });
      if(hiddenAdj.length) nextRoom = hiddenAdj[Math.floor(Math.random()*hiddenAdj.length)];
      else nextRoom = rb.spot;
    } else if(isStalker){
      if(stalkerPath.length===2){
        // ── Adjacent to player — stalk/lurk behaviour ───────────────────
        // 15% chance to finally strike; otherwise drift or hold position
        if(Math.random()<0.15){
          nextRoom=currentSpot;
          showStageAlert('\u26a0 '+rb.name+' STRIKES from the shadows!');
        } else {
          var lurkAdj=(ROOM_ADJACENCY[rb.spot]||[]).filter(function(r){return r!==currentSpot;});
          nextRoom=(lurkAdj.length&&Math.random()<0.35)
            ?lurkAdj[Math.floor(Math.random()*lurkAdj.length)]
            :rb.spot;
          if(Math.random()<0.25) showMsg('You hear something pacing just outside...', 2000);
        }
      } else {
        // ── Not adjacent yet — close the distance normally ──────────────
        if(Math.random()<0.70&&stalkerPath.length>1) nextRoom=stalkerPath[1];
        else {
          var sAdj=ROOM_ADJACENCY[rb.spot]||[];
          if(sAdj.length) nextRoom=sAdj[Math.floor(Math.random()*sAdj.length)];
        }
      }
    } else {
      if(Math.random()<0.70){
        if(stalkerPath.length>1) nextRoom=stalkerPath[1];
      } else {
        var moveAdj=ROOM_ADJACENCY[rb.spot]||[];
        if(moveAdj.length) nextRoom=moveAdj[Math.floor(Math.random()*moveAdj.length)];
      }
    }
    // Play place only allows dog and plush bots
    var isPlushBot=rb.name.indexOf('PLUSH')>=0;
    var isDogBot=rb.name==='FARM DOG';
    if(nextRoom==='play_place'&&!isPlushBot&&!isDogBot) nextRoom=rb.spot;
    // Locked guard shack door blocks animatronics from entering
    if(!(nextRoom==='guard_shack'&&guardDoorLocked)){
      rb.spot=nextRoom;
      // Bear trap: springs on BIG or CAGE bots entering a trapped room
      if(placedTraps[rb.spot] && (rb.big || rb.cage)){
        delete placedTraps[rb.spot];
        rb.stunTimer = (rb.stunTimer||0) + 8.0;
        showMsg('\uD83D\uDC3B TRAP SPRUNG! '+rb.name+' stunned for 8s!', 3200);
        if(rb.spot===currentSpot) buildRoom(); // remove trap visual
      }
    }
  }

  // ── ANIMATRONIC REVIVAL MECHANIC ───────────────────────────────────────────
  // Collect dead bots that were once activated (eligible for rebuild)
  var deadActivated=[];
  for(var dvk in bots){
    var dvb=bots[dvk];
    if(!dvb.alive&&activatedBots.has(dvk)&&dvb.name!=='FARMER'&&dvb.name!=='FARM DOG')
      deadActivated.push(dvk);
  }
  if(deadActivated.length>0){
    for(var rvk in bots){
      var rvb=bots[rvk];
      if(!rvb.alive||!activatedBots.has(rvk)) continue;
      if(rvb.name==='FARMER'||rvb.name==='FARM DOG') continue;
      // Lazy-init staggered cooldown so not all bots attempt at the same moment
      if(rvb.reviveTimer===undefined) rvb.reviveTimer=12+Math.random()*14;
      rvb.reviveTimer-=dt;
      if(rvb.reviveTimer>0) continue;
      rvb.reviveTimer=20+Math.random()*14; // next attempt window 20-34 s
      // 35% chance per tick to actually rebuild someone
      if(Math.random()<0.35){
        var rvPick=deadActivated[Math.floor(Math.random()*deadActivated.length)];
        var rvTarget=bots[rvPick];
        rvTarget.alive=true;
        rvTarget.hp=rvTarget.maxHp;
        rvTarget.spot=rvb.spot;              // appears in rebuilder's room
        rvTarget.moveTimer=4+Math.random()*4; // brief pause before roaming
        rvTarget.reviveTimer=18+Math.random()*10; // own rebuild cooldown reset
        deadActivated.splice(deadActivated.indexOf(rvPick),1);
        showMsg('\u26a0 '+rvb.name+' REBUILT '+rvTarget.name+'!  Get ready!',3800);
        showStageAlert('\u26a0 '+rvTarget.name+' HAS BEEN REVIVED!');
        updateEnemyCount();
        if(rvTarget.spot===currentSpot){
          // Spawn sparks at rebuilder's position then refresh room after effect plays
          var rvMesh=enemyMeshes[rvk];
          var efx=rvMesh?rvMesh.position.x:(Math.random()-.5)*4;
          var efz=rvMesh?rvMesh.position.z:(Math.random()-.5)*4;
          spawnReviveEffect(efx, efz);
          // Slight delay lets the effect be visible before the room rebuilds
          (function(tgt){
            setTimeout(function(){ if(tgt.spot===currentSpot&&!gameOver&&!win) buildRoom(); }, 750);
          })(rvTarget);
        }
      }
    }
  }
  // ────────────────────────────────────────────────────────────────────────────

  // ── ENEMY AI ───────────────────────────────────────────────────────────────
  var T=Date.now()*.001;
  var playerHidden = isPlayerHidden();
  for(var ek in enemyMeshes){
    var em=enemyMeshes[ek],ebot=bots[ek];
    if(!ebot||!ebot.alive||ebot.name==='FARM DOG') continue;
    if(playerHidden) continue;
    var ex=camera.position.x-em.position.x,ez=camera.position.z-em.position.z;
    var dist=Math.sqrt(ex*ex+ez*ez);
    // Stun: freeze movement and flash blue
    if(ebot.stunTimer>0){
      ebot.stunTimer-=dt;
      em.traverse(function(c){ if(c.isMesh&&c.material){ c.material.emissive=new THREE.Color(0x0044aa); c.material.emissiveIntensity=0.6+0.4*Math.sin(Date.now()*.02); } });
      continue;
    } else if(ebot.stunTimer<=0&&ebot.stunTimer!==undefined){
      em.traverse(function(c){ if(c.isMesh&&c.material){ c.material.emissive=new THREE.Color(0x000000); c.material.emissiveIntensity=0; } });
      ebot.stunTimer=undefined;
    }
    var isSprinter=(ebot.name==='CHICKEN'||ebot.name==='BUNNY');
    var hasSight=(dist<7.0);  // within room line-of-sight range
    // Sprinters dash at 3× normal speed when they have sight of the player
    if(isSprinter&&hasSight&&!ebot.dashing){
      ebot.dashing=true;
      showMsg(ebot.name+' is DASHING!',900);
    } else if(isSprinter&&!hasSight){ ebot.dashing=false; }
    var ms=ebot.name==='FARMER'?(farmerPhase===3?2.2:(farmerPhase===2?1.7:.95)):
           (ebot.name==='RAT'?1.9:(ebot.name.indexOf('PLUSH')>=0?.3:(ebot.cage?1.2:(isSprinter&&hasSight?1.8:(ebot.big?1.5:.6)))));
    if(dist>1.6){em.position.x+=(ex/dist)*ms*dt;em.position.z+=(ez/dist)*ms*dt;}
    em.rotation.y=Math.atan2(ex,ez);

    // ── WALKING & ATTACKING ANIMATIONS ───────────────────────────────────
    var lm=em.userData.limbs, lb=em.userData.limbBase;
    var as=em.userData.animScale||1.0;
    if(lm&&lb){
      // Frequency scales with movement speed — faster bot = snappier gait
      var aFreq=3.5+ms*1.4;
      var wt=T*aFreq+(em.userData.walkPhase||0);

      if(dist>1.8){
        // ── WALK: full limb-swinging gait with foot lift ──────────────────
        em.userData.attackPulse=0;
        var legSin=Math.sin(wt);
        var legAmp=0.38*as, footLift=0.13*as, armAmp=0.32*as;

        // Legs swing fore/aft; leading foot lifts off the floor mid-stride
        lm.legL.forEach(function(p,i){
          p.position.z=lb.legLz+legSin*legAmp;
          if(i===1&&lb.legLBaseY)
            p.position.y=lb.legLBaseY[1]+Math.max(0,legSin)*footLift;
        });
        lm.legR.forEach(function(p,i){
          p.position.z=lb.legRz-legSin*legAmp;
          if(i===1&&lb.legRBaseY)
            p.position.y=lb.legRBaseY[1]+Math.max(0,-legSin)*footLift;
        });

        // Arms counter-swing to legs; distal parts trail slightly (natural lag)
        var armCos=Math.cos(wt);
        lm.armL.forEach(function(p,i){
          p.position.z=lb.armLz+armCos*armAmp*(1-i*0.05);
          p.position.y=lb.armLBaseY[i];
          if(lb.armLBaseX) p.position.x=lb.armLBaseX[i];
        });
        lm.armR.forEach(function(p,i){
          p.position.z=lb.armRz-armCos*armAmp*(1-i*0.05);
          p.position.y=lb.armRBaseY[i];
          if(lb.armRBaseX) p.position.x=lb.armRBaseX[i];
        });

        // Head nods with stride rhythm; slight fore/aft rock
        lm.head.position.y=lb.headY+Math.abs(Math.sin(wt*2))*0.05*as;
        lm.head.position.z=(lb.headZ||0)+Math.sin(wt*2)*0.04*as;

        // Whole body rises and falls once per step pair
        em.position.y=Math.abs(Math.sin(wt*2))*0.08;

      } else {
        // ── STRIKE: alternating arm strikes with whip & lunge ────────────
        em.userData.attackPulse=(em.userData.attackPulse||0)+dt*9;
        var ap=em.userData.attackPulse;
        // sp drives alternation: +1 = left arm striking, -1 = right arm striking
        var sp=Math.sin(ap);
        var leftStrike =Math.max(0, sp);   // left lunges forward on positive half
        var rightStrike=Math.max(0,-sp);   // right lunges forward on negative half
        var leftWindup =rightStrike;       // left recoils while right strikes
        var rightWindup=leftStrike;        // right recoils while left strikes

        // Whip effect: forearm/hand overshoot on strike, elbow bends on wind-up
        lm.armL.forEach(function(p,i){
          p.position.z=lb.armLz
            +leftStrike *0.52*as*(1+i*0.06)  // hand reaches furthest on strike
            -leftWindup *0.22*as*(1-i*0.10); // hand stays forward as elbow bends back
          p.position.y=lb.armLBaseY[i]
            +leftWindup *0.46*as*(1-i*0.08)  // whole arm raises during wind-up
            -leftStrike *0.12*as;             // drives slightly down on slash
          if(lb.armLBaseX) p.position.x=lb.armLBaseX[i];
        });
        lm.armR.forEach(function(p,i){
          p.position.z=lb.armRz
            -rightStrike*0.52*as*(1+i*0.06)
            +rightWindup*0.22*as*(1-i*0.10);
          p.position.y=lb.armRBaseY[i]
            +rightWindup*0.46*as*(1-i*0.08)
            -rightStrike*0.12*as;
          if(lb.armRBaseX) p.position.x=lb.armRBaseX[i];
        });

        // Legs shift weight side to side — planted but not rigid
        lm.legL.forEach(function(p){p.position.z=lb.legLz+Math.sin(ap*0.35)*0.10*as;});
        lm.legR.forEach(function(p){p.position.z=lb.legRz-Math.sin(ap*0.35)*0.10*as;});

        // Head snaps forward at peak of each strike
        lm.head.position.y=lb.headY+Math.abs(sp)*0.06*as;
        lm.head.position.z=(lb.headZ||0)+Math.max(0,Math.abs(sp)-0.4)*0.20*as;

        // Whole body pulses forward on each strike impact
        em.position.y=Math.abs(sp)*0.12;
      }
    } else {
      em.position.y=(Math.sin(T*2+em.position.x)*.5+.5)*.06;
    }
    // ─────────────────────────────────────────────────────────────────────

    if(dist<1.8){
      var dmg=ebot.name==='FARMER'?(farmerPhase===3?4.0:(farmerPhase===2?2.5:1.0)):
              (ebot.name==='RAT'?0.35:(ebot.name.indexOf('PLUSH')>=0?.22:(ebot.cage?.90:(ebot.big?1.12:.45))));
      playerHp-=dmg; flashDamage(); lastDamageSource=ebot.name;
    }

    // ── Big animatronics can also destroy the dog ─────────────────────────────
    if(dogTamed&&bots.dog.alive&&enemyMeshes['dog']){
      var dogMesh2=enemyMeshes['dog'];
      var ddx2=dogMesh2.position.x-em.position.x, ddz2=dogMesh2.position.z-em.position.z;
      var dogDist=Math.sqrt(ddx2*ddx2+ddz2*ddz2);
      if(dogDist<2.2){
        var dogDmg=(ebot.cage?1.6:(ebot.big?2.0:0.8))*dt;
        bots.dog.hp-=dogDmg;
        if(bots.dog.hp<=0){
          destroyDog(dogMesh2, 'Your dog was DESTROYED! Find a REVIVE BONE in the WORKSHOP!');
        }
      }
    }
    // ─────────────────────────────────────────────────────────────────────────
  }  // end for(var ek in enemyMeshes)

  // ── DOG ATTACKS ────────────────────────────────────────────────────────────
  if(dogTamed&&bots.dog.alive){
    var dogFightTarget=null;
    for(var dk in bots){
      if(dk==='dog') continue;
      var dbt=bots[dk]; if(!dbt.alive) continue;
      if(dbt.spot===currentSpot||dbt.name==='FARMER'){
        dogFightTarget=dk;
        dbt.hp-=dt*1.6;
        if(dbt.hp<=0){var dm=enemyMeshes[dk];if(dm)killBot(dk,dm,dbt);}
        break;
      }
    }

    // ── DOG ATTACK ANIMATION ──────────────────────────────────────────────
    var dogMesh=enemyMeshes['dog'];
    if(dogMesh){
      var dlm=dogMesh.userData.limbs, dlb=dogMesh.userData.limbBase;
      var das=dogMesh.userData.animScale||0.72;
      if(dogFightTarget&&enemyMeshes[dogFightTarget]){
        // INCREMENT attack timer
        dogMesh.userData.dogAtk=(dogMesh.userData.dogAtk||0)+dt*9;
        var da=dogMesh.userData.dogAtk;
        var tgt=enemyMeshes[dogFightTarget];
        // Face the enemy
        var tex=tgt.position.x-dogMesh.position.x;
        var tez=tgt.position.z-dogMesh.position.z;
        dogMesh.rotation.y=Math.atan2(tex,tez);
        // Lunge toward target on each bite cycle
        var lungeAmt=Math.max(0,Math.sin(da*1.4))*0.30;
        var tLen=Math.sqrt(tex*tex+tez*tez)||1;
        dogMesh.position.x+=tex/tLen*lungeAmt*dt*4;
        dogMesh.position.z+=tez/tLen*lungeAmt*dt*4;
        // Body pitch: snap forward on bite
        dogMesh.rotation.x=Math.sin(da*1.4)*0.30;
        // Aggressive bounce
        dogMesh.position.y=Math.abs(Math.sin(da*1.6))*0.20;
        // Limb animation – move ALL parts of each limb array together
        if(dlm&&dlb){
          var dls=Math.sin(da*2.4)*0.28*das;
          if(dlm.legL) dlm.legL.forEach(function(p){p.position.z=dlb.legLz+dls;});
          if(dlm.legR) dlm.legR.forEach(function(p){p.position.z=dlb.legRz-dls;});
          var daLdz=Math.sin(da*1.2)*0.28*das,     daLdy=Math.abs(Math.sin(da*1.4))*0.32*das;
          var daRdz=-Math.sin(da*1.2+0.6)*0.28*das, daRdy=Math.abs(Math.sin(da*1.4+1.1))*0.32*das;
          if(dlm.armL) dlm.armL.forEach(function(p,i){
            p.position.z=dlb.armLz+daLdz;
            p.position.y=dlb.armLBaseY[i]+daLdy;
          });
          if(dlm.armR) dlm.armR.forEach(function(p,i){
            p.position.z=dlb.armRz+daRdz;
            p.position.y=dlb.armRBaseY[i]+daRdy;
          });
          if(dlm.head) dlm.head.position.y=dlb.headY+Math.sin(da*1.8)*0.12*das;
        }
      } else {
        // Not fighting — follow the player ───────────────────────────────
        dogMesh.userData.dogAtk=0;
        dogMesh.rotation.x=0;

        // Target: 1.8 units behind the player, slightly to the right
        var followAng=camYaw+Math.PI;
        var ftx=playerPos.x+Math.sin(followAng)*1.8+Math.sin(camYaw+Math.PI/2)*0.6;
        var ftz=playerPos.z+Math.cos(followAng)*1.8;
        ftx=Math.max(-9,Math.min(9,ftx));
        ftz=Math.max(-9,Math.min(9,ftz));

        var fdx=ftx-dogMesh.position.x, fdz=ftz-dogMesh.position.z;
        var fdist=Math.sqrt(fdx*fdx+fdz*fdz);
        var isMoving=fdist>0.5;
        if(isMoving){
          var fspd=Math.min(3.8*dt,fdist);
          dogMesh.position.x+=fdx/fdist*fspd;
          dogMesh.position.z+=fdz/fdist*fspd;
          dogMesh.rotation.y=Math.atan2(fdx,fdz);
        }

        // Walk or idle animation
        if(dlm&&dlb){
          var dwt=T*(isMoving?4.0:1.5)+(dogMesh.userData.walkPhase||0);
          var dWalkSw=Math.sin(dwt)*(isMoving?0.22:0.06)*das;
          if(dlm.legL) dlm.legL.forEach(function(p){p.position.z=dlb.legLz+dWalkSw;});
          if(dlm.legR) dlm.legR.forEach(function(p){p.position.z=dlb.legRz-dWalkSw;});
          if(dlm.armL) dlm.armL.forEach(function(p,i){
            p.position.z=dlb.armLz+Math.cos(dwt)*(isMoving?0.18:0.05)*das;
            p.position.y=dlb.armLBaseY[i];
          });
          if(dlm.armR) dlm.armR.forEach(function(p,i){
            p.position.z=dlb.armRz-Math.cos(dwt)*(isMoving?0.18:0.05)*das;
            p.position.y=dlb.armRBaseY[i];
          });
          if(dlm.head) dlm.head.position.y=dlb.headY+Math.abs(Math.sin(dwt*2))*0.04*das;
          dogMesh.position.y=isMoving?Math.abs(Math.sin(dwt*2))*0.05:0;
        }
      }
    }
    // ─────────────────────────────────────────────────────────────────────────
  }


  // ── BOSS BAR ───────────────────────────────────────────────────────────────
  if(bots.purple.alive && bots.purple.spot===currentSpot){
    document.getElementById('boss-bar').style.display='block';
    document.getElementById('boss-name').textContent=farmerPhase===3?'PHASE 3 \u2014 THE HYBRID':(farmerPhase===2?'FARMER PHASE 2':'THE FARMER');
    document.getElementById('boss-fill').style.width=((bots.purple.hp/bots.purple.maxHp)*100)+'%';
  } else {
    document.getElementById('boss-bar').style.display='none';
  }

  // ── PLAYER HP ──────────────────────────────────────────────────────────────
  if(playerHp<=0){triggerGameOver(lastDamageSource);return;}
  document.getElementById('hp-num').textContent=Math.max(0,Math.floor(playerHp));
  document.getElementById('hp-fill').style.width=Math.max(0,(playerHp/MAX_HP)*100)+'%';
  updateResourceHUD();

  // ── REVIVE PARTICLE UPDATE ─────────────────────────────────────────────────
  for(var pi=reviveParticles.length-1; pi>=0; pi--){
    var rp=reviveParticles[pi];
    rp.life-=dt/rp.maxLife;
    rp.mesh.position.x+=rp.vx*dt;
    rp.mesh.position.y+=rp.vy*dt;
    rp.mesh.position.z+=rp.vz*dt;
    rp.vy-=4.0*dt; // gravity
    var sc=Math.max(0.01, rp.isGlow ? rp.life*1.8 : rp.life);
    rp.mesh.scale.setScalar(sc);
    if(rp.life<=0){ scene.remove(rp.mesh); reviveParticles.splice(pi,1); }
  }
  // ───────────────────────────────────────────────────────────────────────────

  renderer.render(scene,camera);
}
