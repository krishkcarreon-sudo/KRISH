// Character and geometry builder helpers for the game world.

'use strict';

function makeBox(w, h, d, col, x, y, z, rx, ry, rz) {
  var m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), new THREE.MeshLambertMaterial({color:col}));
  m.position.set(x||0, y||0, z||0);
  if(rx) m.rotation.x=rx; if(ry) m.rotation.y=ry; if(rz) m.rotation.z=rz;
  return m;
}

function makeSphere(r, col, x, y, z) {
  var m = new THREE.Mesh(new THREE.SphereGeometry(r,10,8), new THREE.MeshLambertMaterial({color:col}));
  m.position.set(x||0, y||0, z||0);
  return m;
}

function makeCylinder(rt, rb, h, col, x, y, z, rx, ry, rz) {
  var m = new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,10), new THREE.MeshLambertMaterial({color:col}));
  m.position.set(x||0, y||0, z||0);
  if(rx) m.rotation.x=rx; if(ry) m.rotation.y=ry; if(rz) m.rotation.z=rz;
  return m;
}

function makeCone(r, h, col, x, y, z, rx, ry, rz) {
  var m = new THREE.Mesh(new THREE.ConeGeometry(r,h,7), new THREE.MeshLambertMaterial({color:col}));
  m.position.set(x||0, y||0, z||0);
  if(rx) m.rotation.x=rx; if(ry) m.rotation.y=ry; if(rz) m.rotation.z=rz;
  return m;
}

function addEndoParts(g, s){
  var M  = 0xb0b0b8;  // silver metal
  var MD = 0x707078;  // dark metal
  // Chest cavity crack + three exposed ribs visible through torn torso
  g.add(makeBox(.26*s,.54*s,.04*s, 0x0d0d0d,       0, 1.34*s, .34*s));   // dark void
  g.add(makeBox(.36*s,.04*s,.07*s, M,               0, 1.58*s, .34*s));   // rib top
  g.add(makeBox(.32*s,.04*s,.07*s, M,               0, 1.34*s, .34*s));   // rib mid
  g.add(makeBox(.28*s,.04*s,.07*s, M,               0, 1.10*s, .34*s));   // rib low
  // Exposed neck servo ring
  g.add(makeCylinder(.11*s,.11*s,.06*s, MD, 0, 1.90*s, .04*s));
  // Shoulder ball-joints peeking out from costume
  g.add(makeSphere(.10*s, MD, -.72*s, 1.86*s, .04*s));
  g.add(makeSphere(.10*s, MD,  .72*s, 1.86*s, .04*s));
  // Exposed elbow rods (replaces soft elbows with visible metal joint)
  g.add(makeCylinder(.06*s,.06*s,.28*s, M, -.64*s, 1.33*s, .04*s, Math.PI/2, 0, 0));
  g.add(makeCylinder(.06*s,.06*s,.28*s, M,  .64*s, 1.33*s, .04*s, Math.PI/2, 0, 0));
  // Wrist endoskeleton stumps
  g.add(makeSphere(.10*s, MD, -.68*s, .88*s, .04*s));
  g.add(makeSphere(.10*s, MD,  .68*s, .88*s, .04*s));
  // Exposed knee joints (horizontal cylinders through leg)
  g.add(makeCylinder(.08*s,.08*s,.32*s, M, -.24*s, .63*s, .10*s, Math.PI/2, 0, 0));
  g.add(makeCylinder(.08*s,.08*s,.32*s, M,  .24*s, .63*s, .10*s, Math.PI/2, 0, 0));
}

function buildChar(group, bot, s) {
  var col  = bot.color;
  var dark = new THREE.Color(col).multiplyScalar(.50).getHex();
  var mid  = new THREE.Color(col).multiplyScalar(.78).getHex();

  // ── FEET — wide rounded pads ──────────────────────────────────────────
  group.add(makeBox(.32*s,.10*s,.40*s, dark, -.24*s, .05*s,  .05*s));   // 0  footL
  group.add(makeBox(.32*s,.10*s,.40*s, dark,  .24*s, .05*s,  .05*s));   // 1  footR
  // ── LEGS — short, plump ───────────────────────────────────────────────
  group.add(makeBox(.28*s,.52*s,.28*s, dark, -.24*s, .36*s, 0));        // 2  legL
  group.add(makeBox(.28*s,.52*s,.28*s, dark,  .24*s, .36*s, 0));        // 3  legR
  // ── HIPS ──────────────────────────────────────────────────────────────
  group.add(makeBox(.72*s,.22*s,.54*s, dark, 0, .68*s, 0));             // 4  hips
  // ── TORSO — wide, barrel-chested mascot belly ─────────────────────────
  group.add(makeBox(.88*s,1.00*s,.64*s, col, 0, 1.34*s, 0));            // 5  torso
  // ── NECK ──────────────────────────────────────────────────────────────
  group.add(makeBox(.30*s,.22*s,.30*s, col, 0, 1.98*s, 0));             // 6  neck
  // ── HEAD — big round sphere (mascot-proportioned) ─────────────────────
  group.add(makeSphere(.54*s, col, 0, 2.64*s, 0));                      // 7  head
  // ── EYES — large glassy doll eyes (unsettling stare) ─────────────────
  group.add(makeSphere(.20*s, 0xffffff, -.24*s, 2.78*s, .50*s));        // 8  eyeWhiteL
  group.add(makeSphere(.20*s, 0xffffff,  .24*s, 2.78*s, .50*s));        // 9  eyeWhiteR
  group.add(makeSphere(.12*s, 0x111111, -.24*s, 2.78*s, .60*s));        // 10 pupilL
  group.add(makeSphere(.12*s, 0x111111,  .24*s, 2.78*s, .60*s));        // 11 pupilR
  group.add(makeSphere(.05*s, 0xffffff, -.20*s, 2.83*s, .64*s));        // 12 glintL (glassy highlight)
  group.add(makeSphere(.05*s, 0xffffff,  .20*s, 2.83*s, .64*s));        // 13 glintR
  // ── ARMS — stubby with big round mitts ───────────────────────────────
  group.add(makeBox(.24*s,.60*s,.24*s, mid, -.64*s, 1.64*s, 0));        // 14 armL
  group.add(makeBox(.24*s,.60*s,.24*s, mid,  .64*s, 1.64*s, 0));        // 15 armR
  group.add(makeSphere(.13*s, dark, -.64*s, 1.33*s, 0));                // 16 elbowL
  group.add(makeSphere(.13*s, dark,  .64*s, 1.33*s, 0));                // 17 elbowR
  group.add(makeBox(.20*s,.46*s,.20*s, dark, -.66*s, 1.08*s, 0));       // 18 foreL
  group.add(makeBox(.20*s,.46*s,.20*s, dark,  .66*s, 1.08*s, 0));       // 19 foreR
  group.add(makeSphere(.15*s, dark, -.66*s, .83*s, 0));                 // 20 wristL
  group.add(makeSphere(.15*s, dark,  .66*s, .83*s, 0));                 // 21 wristR
  group.add(makeSphere(.22*s, dark, -.66*s, .66*s, 0));                 // 22 handL (big cartoon mitt)
  group.add(makeSphere(.22*s, dark,  .66*s, .66*s, 0));                 // 23 handR
  // ── STITCHED SMILE — permanent grin (the unsettling part) ────────────
  group.add(makeBox(.38*s,.04*s,.04*s, dark,  0, 2.42*s, .56*s));       // 24 smileBar
  group.add(makeBox(.04*s,.12*s,.04*s, dark, -.19*s, 2.40*s, .56*s));   // 25 smileCurlL
  group.add(makeBox(.04*s,.12*s,.04*s, dark,  .19*s, 2.40*s, .56*s));   // 26 smileCurlR

  // ── FARMER costume ────────────────────────────────────────────────────
  if(bot.name==='FARMER'){
    group.add(makeBox(.90*s,1.02*s,.66*s,0x2244aa,0,1.34*s,.01*s));
    group.add(makeBox(.13*s,.66*s,.08*s,0x2244aa,-.24*s,2.00*s,.30*s));
    group.add(makeBox(.13*s,.66*s,.08*s,0x2244aa, .24*s,2.00*s,.30*s));
    if(farmerPhase===1){
      group.add(makeBox(.80*s,.38*s,.80*s,0xdcc850,0,3.28*s,0));
      group.add(makeBox(1.42*s,.08*s,1.42*s,0xdcc850,0,3.10*s,0));
      group.add(makeBox(.82*s,.12*s,.82*s,0x884400,0,3.12*s,0));
    } else if(farmerPhase===2){
      group.add(makeBox(.80*s,.22*s,.80*s,0xff2222,0,3.28*s,0));
      group.add(makeCone(.13*s,.34*s,0xff4444,0,3.56*s,0));
      group.add(makeCone(.10*s,.26*s,0xff3333,-.32*s,3.48*s,0));
      group.add(makeCone(.10*s,.26*s,0xff3333, .32*s,3.48*s,0));
    } else if(farmerPhase===3){
      // ── PHASE 3 — HYBRID: half-human, half-animatronic rebuild ──────────
      // Left side — torn overalls remnant (human half)
      group.add(makeBox(.46*s,1.02*s,.66*s,0x2244aa,-.22*s,1.34*s,.01*s));
      group.add(makeBox(.13*s,.66*s,.08*s,0x2244aa,-.24*s,2.00*s,.30*s));
      // Right side — salvaged animatronic chest plate bolted on
      group.add(makeBox(.50*s,1.14*s,.72*s,0x1e1e2c,.24*s,1.34*s,.01*s));
      [[.08,1.74],[.08,.94],[.42,1.74],[.42,.94]].forEach(function(b){
        group.add(makeSphere(.06*s,0x888899,b[0]*s,b[1]*s,.40*s));       // bolt heads
      });
      // Right arm — full animatronic replacement (overlays organic arm)
      group.add(makeBox(.30*s,.66*s,.30*s,0x9090a0,.64*s,1.64*s,0));    // metal upper arm
      group.add(makeSphere(.15*s,0x707080,.64*s,1.33*s,0));             // shoulder joint
      group.add(makeBox(.26*s,.52*s,.26*s,0x6a6a7a,.66*s,1.08*s,0));   // metal forearm
      group.add(makeSphere(.13*s,0x606070,.66*s,.83*s,0));              // wrist joint
      group.add(makeBox(.34*s,.16*s,.30*s,0x505060,.66*s,.72*s,.06*s)); // claw palm
      [-.12,0,.12].forEach(function(dx){                                 // claw fingers
        var f=makeBox(.05*s,.32*s,.05*s,0x888899,(dx+.66)*s,.52*s,.16*s);
        f.rotation.x=-.32; group.add(f);
      });
      // Right leg — metal peg-leg (overlays organic leg)
      group.add(makeBox(.32*s,.56*s,.32*s,0x9090a0,.24*s,.36*s,0));
      group.add(makeBox(.32*s,.16*s,.44*s,0x505060,.24*s,.05*s,.06*s)); // metal foot
      // Exposed half-skull (right side of head)
      group.add(makeSphere(.40*s,0x8a8a9a,.26*s,2.64*s,0));
      group.add(makeSphere(.13*s,0xff8800,.26*s,2.78*s,.50*s));         // glowing eye R
      group.add(makeSphere(.08*s,0xffcc00,.26*s,2.80*s,.58*s));         // eye core
      // Exposed neck servos and tubes
      group.add(makeCylinder(.07*s,.07*s,.26*s,0x9090a0,.14*s,1.96*s,.06*s));
      group.add(makeCylinder(.04*s,.04*s,.22*s,0x606070,-.06*s,1.94*s,.10*s));
      // Salvaged spine segments bolted down the back
      [1.16,1.46,1.76,2.06].forEach(function(y){
        group.add(makeBox(.12*s,.20*s,.48*s,0x3a3a4a,.26*s,y*s,-.30*s));
        group.add(makeSphere(.06*s,0x888899,.26*s,(y+.10)*s,-.28*s));   // bolt
      });
    }
  }
  addAnimalFeatures(group, bot.name, col, s, dark, mid);
}

function addAnimalFeatures(g, name, col, s, dark, mid) {
  switch(name) {

    case 'COW':
      // Big round pink muzzle
      g.add(makeSphere(.26*s, 0xffbbcc, 0, 2.52*s, .52*s));
      g.add(makeSphere(.07*s, 0xcc8899, -.10*s, 2.52*s, .65*s));  // nostrilL
      g.add(makeSphere(.07*s, 0xcc8899,  .10*s, 2.52*s, .65*s));  // nostrilR
      // Small rounded horn nubs
      g.add(makeBox(.08*s,.24*s,.08*s, 0xeeeedd, -.30*s, 3.14*s, .02*s, -.22, 0, -.20));
      g.add(makeBox(.08*s,.24*s,.08*s, 0xeeeedd,  .30*s, 3.14*s, .02*s, -.22, 0,  .20));
      // Round ears with pink inner
      g.add(makeSphere(.20*s, col,      -.60*s, 2.76*s, .02*s));
      g.add(makeSphere(.20*s, col,       .60*s, 2.76*s, .02*s));
      g.add(makeSphere(.12*s, 0xffbbcc, -.60*s, 2.76*s, .08*s));
      g.add(makeSphere(.12*s, 0xffbbcc,  .60*s, 2.76*s, .08*s));
      break;

    case 'PIG':
      // Big round snout
      g.add(makeSphere(.26*s, 0xffaac0, 0, 2.52*s, .54*s));
      g.add(makeSphere(.07*s, 0xcc6688, -.09*s, 2.52*s, .68*s));
      g.add(makeSphere(.07*s, 0xcc6688,  .09*s, 2.52*s, .68*s));
      // Floppy ears
      g.add(makeBox(.24*s,.30*s,.07*s, col, -.56*s, 2.80*s, .04*s, .16, 0,  .28));
      g.add(makeBox(.24*s,.30*s,.07*s, col,  .56*s, 2.80*s, .04*s, .16, 0, -.28));
      g.add(makeBox(.16*s,.22*s,.05*s, 0xffbbcc, -.55*s, 2.78*s, .07*s, .16, 0,  .28));
      g.add(makeBox(.16*s,.22*s,.05*s, 0xffbbcc,  .55*s, 2.78*s, .07*s, .16, 0, -.28));
      // Curly tail
      g.add(makeSphere(.12*s, col,  .06*s, .92*s, -.44*s));
      g.add(makeSphere(.08*s, dark, .12*s, .78*s, -.54*s));
      break;

    case 'CHICKEN':
      // Three-bump comb
      g.add(makeSphere(.12*s, 0xdd2222, -.14*s, 3.22*s, .12*s));
      g.add(makeSphere(.14*s, 0xee2222,   0,    3.28*s, .10*s));
      g.add(makeSphere(.12*s, 0xdd2222,  .14*s, 3.22*s, .12*s));
      // Wattle under chin
      g.add(makeSphere(.10*s, 0xcc1111, 0, 2.42*s, .50*s));
      // Orange beak
      g.add(makeCone(.07*s,.18*s, 0xff8800, 0, 2.62*s, .62*s, Math.PI/2, 0, 0));
      // Wing patches on torso sides
      g.add(makeBox(.16*s,.50*s,.38*s, 0xffdd44, -.68*s, 1.42*s, .06*s, 0, 0,  .10));
      g.add(makeBox(.16*s,.50*s,.38*s, 0xffdd44,  .68*s, 1.42*s, .06*s, 0, 0, -.10));
      break;

    case 'FOX':
      // Pointed ears with inner colour
      g.add(makeCone(.13*s,.32*s, col,       -.30*s, 3.22*s, .04*s, 0, 0, -.22));
      g.add(makeCone(.13*s,.32*s, col,        .30*s, 3.22*s, .04*s, 0, 0,  .22));
      g.add(makeCone(.08*s,.24*s, 0xffccaa,  -.30*s, 3.22*s, .06*s, 0, 0, -.22));
      g.add(makeCone(.08*s,.24*s, 0xffccaa,   .30*s, 3.22*s, .06*s, 0, 0,  .22));
      // White muzzle
      g.add(makeSphere(.22*s, 0xffffff, 0, 2.52*s, .50*s));
      g.add(makeSphere(.08*s, 0x111111, 0, 2.64*s, .62*s));  // nose
      // Fluffy tail with white tip
      var fxTail=makeBox(.24*s,.56*s,.24*s, col, .10*s, .72*s, -.46*s);
      fxTail.rotation.x=.50; g.add(fxTail);
      g.add(makeSphere(.18*s, 0xffffff, .10*s, .44*s, -.68*s));
      break;

    case 'TURKEY':
      // Fan tail — 5 feathers, alternating colours
      [-0.48,-0.24,0,0.24,0.48].forEach(function(fx,i){
        var ff=makeBox(.13*s,.64*s,.10*s, i%2===0?0xdd6620:0xff9922, fx*s, .90*s, -.52*s);
        ff.rotation.x=-.52; ff.rotation.z=fx*0.55; g.add(ff);
      });
      // Wing stubs
      g.add(makeBox(.38*s,.18*s,.14*s, dark, -.76*s, 1.60*s, .06*s, 0, 0,  .20));
      g.add(makeBox(.38*s,.18*s,.14*s, dark,  .76*s, 1.60*s, .06*s, 0, 0, -.20));
      // Beak
      g.add(makeCone(.08*s,.22*s, 0xffcc00, 0, 2.62*s, .60*s, Math.PI/2, 0, 0));
      // Red wattle
      g.add(makeSphere(.13*s, 0xdd1111, 0, 2.44*s, .50*s));
      g.add(makeSphere(.08*s, 0xcc2222, .04*s, 2.70*s, .52*s));  // snood
      break;

    case 'GOAT':
      // Curving swept horns
      g.add(makeCone(.07*s,.30*s, dark, -.24*s, 3.18*s, .02*s, -.30, 0, -.22));
      g.add(makeCone(.07*s,.30*s, dark,  .24*s, 3.18*s, .02*s, -.30, 0,  .22));
      // Rectangular muzzle
      g.add(makeBox(.26*s,.16*s,.20*s, mid, 0, 2.52*s, .52*s));
      g.add(makeSphere(.05*s, dark, -.09*s, 2.52*s, .62*s));
      g.add(makeSphere(.05*s, dark,  .09*s, 2.52*s, .62*s));
      // Chin beard
      g.add(makeBox(.08*s,.28*s,.08*s, dark, 0, 2.30*s, .38*s));
      g.add(makeSphere(.08*s, dark, 0, 2.16*s, .36*s));
      // Flat ears angled out
      g.add(makeBox(.24*s,.10*s,.12*s, mid, -.60*s, 2.88*s, .04*s, 0, 0,  .26));
      g.add(makeBox(.24*s,.10*s,.12*s, mid,  .60*s, 2.88*s, .04*s, 0, 0, -.26));
      break;

    case 'WOLF':
      // Pointed ears with pink inner
      g.add(makeCone(.13*s,.34*s, dark,      -.28*s, 3.20*s, .04*s, 0, 0, -.22));
      g.add(makeCone(.13*s,.34*s, dark,       .28*s, 3.20*s, .04*s, 0, 0,  .22));
      g.add(makeCone(.08*s,.24*s, 0xffaacc,  -.28*s, 3.20*s, .06*s, 0, 0, -.22));
      g.add(makeCone(.08*s,.24*s, 0xffaacc,   .28*s, 3.20*s, .06*s, 0, 0,  .22));
      // Snout
      g.add(makeBox(.30*s,.22*s,.24*s, mid, 0, 2.52*s, .50*s));
      g.add(makeSphere(.08*s, 0x111111, 0, 2.64*s, .62*s));
      // Bushy tail
      var wfTail=makeBox(.18*s,.54*s,.18*s, dark, -.08*s, .72*s, -.46*s);
      wfTail.rotation.x=.56; g.add(wfTail);
      g.add(makeSphere(.14*s, 0xffffff, -.06*s, .44*s, -.66*s));
      break;

    case 'RAT':
      g.add(makeCone(.08*s,.22*s, dark, -.18*s, 3.02*s, .08*s, 0, 0, -.14));
      g.add(makeCone(.08*s,.22*s, dark,  .18*s, 3.02*s, .08*s, 0, 0,  .14));
      g.add(makeBox(.24*s,.14*s,.26*s, mid, 0, 2.48*s, .50*s));
      g.add(makeSphere(.06*s, 0x111111, 0, 2.56*s, .66*s));
      g.add(makeSphere(.05*s, 0xff8888, -.08*s, 2.48*s, .62*s));
      g.add(makeSphere(.05*s, 0xff8888,  .08*s, 2.48*s, .62*s));
      var ratTail = makeBox(.08*s,.58*s,.08*s, 0xcc99aa, .06*s, .76*s, -.58*s);
      ratTail.rotation.x = 1.0;
      g.add(ratTail);
      break;

    case 'BUNNY':
      // Long tall ears
      g.add(makeBox(.15*s,.68*s,.11*s, col,       -.24*s, 3.44*s, .04*s));
      g.add(makeBox(.15*s,.68*s,.11*s, col,        .24*s, 3.44*s, .04*s));
      g.add(makeBox(.08*s,.54*s,.06*s, 0xffbbcc,  -.24*s, 3.44*s, .08*s));  // inner L
      g.add(makeBox(.08*s,.54*s,.06*s, 0xffbbcc,   .24*s, 3.44*s, .08*s));  // inner R
      // Pink button nose
      g.add(makeSphere(.07*s, 0xff8899, 0, 2.64*s, .60*s));
      // Fluffy cotton tail
      g.add(makeSphere(.18*s, 0xffffff, 0, .72*s, -.40*s));
      g.add(makeSphere(.12*s, 0xffffff, .06*s, .60*s, -.50*s));
      break;

    case 'SHEEP':
      // ── Dense wool coverage — body ────────────────────────────────────────
      g.add(makeSphere(.36*s, 0xf8f8f5,  .34*s, 1.72*s,  .28*s));  // side R front
      g.add(makeSphere(.36*s, 0xf8f8f5, -.34*s, 1.72*s,  .28*s));  // side L front
      g.add(makeSphere(.34*s, 0xf8f8f5,  .30*s, 1.72*s, -.26*s));  // side R back
      g.add(makeSphere(.34*s, 0xf8f8f5, -.30*s, 1.72*s, -.26*s));  // side L back
      g.add(makeSphere(.32*s, 0xf8f8f5,   0,    2.10*s,  .32*s));  // chest puff
      g.add(makeSphere(.30*s, 0xf8f8f5,   0,    1.82*s, -.30*s));  // back puff
      g.add(makeSphere(.26*s, 0xf8f8f5,   0,    1.40*s,  .20*s));  // belly puff
      // ── Wool cap on head ──────────────────────────────────────────────────
      g.add(makeSphere(.28*s, 0xf8f8f5,   0,    2.88*s,  .14*s));  // crown centre
      g.add(makeSphere(.22*s, 0xf8f8f5, -.30*s, 2.84*s,  .10*s));  // crown L
      g.add(makeSphere(.22*s, 0xf8f8f5,  .30*s, 2.84*s,  .10*s));  // crown R
      g.add(makeSphere(.18*s, 0xf8f8f5,   0,    2.76*s, -.12*s));  // back of head
      // ── Neck ruff ─────────────────────────────────────────────────────────
      g.add(makeSphere(.22*s, 0xf8f8f5, -.22*s, 2.20*s,  .18*s));
      g.add(makeSphere(.22*s, 0xf8f8f5,  .22*s, 2.20*s,  .18*s));
      g.add(makeSphere(.20*s, 0xf8f8f5,   0,    2.22*s,  .22*s));
      // ── Leg fluff cuffs ───────────────────────────────────────────────────
      g.add(makeSphere(.16*s, 0xf8f8f5, -.24*s,  .68*s, .12*s));
      g.add(makeSphere(.16*s, 0xf8f8f5,  .24*s,  .68*s, .12*s));
      // ── Small muzzle ──────────────────────────────────────────────────────
      g.add(makeBox(.20*s,.14*s,.16*s, 0xffccaa, 0, 2.52*s, .50*s));
      g.add(makeSphere(.05*s, 0xcc8866, -.07*s, 2.52*s, .60*s));
      g.add(makeSphere(.05*s, 0xcc8866,  .07*s, 2.52*s, .60*s));
      // ── Curled nub horns ──────────────────────────────────────────────────
      g.add(makeSphere(.10*s, 0xccaa88, -.26*s, 3.06*s, .08*s));
      g.add(makeSphere(.10*s, 0xccaa88,  .26*s, 3.06*s, .08*s));
      break;

    case 'PLUSH COW':
      g.add(makeSphere(.22*s, 0xffbbcc, 0, 2.50*s, .48*s));
      g.add(makeBox(.08*s,.20*s,.08*s, 0xeeeedd, -.22*s, 3.10*s, 0, 0, 0, -.44));
      g.add(makeBox(.08*s,.20*s,.08*s, 0xeeeedd,  .22*s, 3.10*s, 0, 0, 0,  .44));
      break;

    case 'PLUSH PIG':
      g.add(makeSphere(.20*s, 0xffaac0, 0, 2.50*s, .48*s));
      g.add(makeSphere(.06*s, 0xcc5566, -.07*s, 2.50*s, .62*s));
      g.add(makeSphere(.06*s, 0xcc5566,  .07*s, 2.50*s, .62*s));
      break;

    case 'PLUSH CHKN':
      g.add(makeSphere(.12*s, 0xdd2222, 0, 3.16*s, .10*s));
      g.add(makeCone(.06*s,.14*s, 0xff8800, 0, 2.60*s, .58*s, Math.PI/2, 0, 0));
      break;

    case 'PLUSH FOX':
      // Small pointed ears with pink inner
      g.add(makeCone(.10*s,.22*s, col,       -.24*s, 3.12*s, .04*s, 0, 0, -.18));
      g.add(makeCone(.10*s,.22*s, col,        .24*s, 3.12*s, .04*s, 0, 0,  .18));
      g.add(makeCone(.06*s,.16*s, 0xffccaa,  -.24*s, 3.12*s, .06*s, 0, 0, -.18));
      g.add(makeCone(.06*s,.16*s, 0xffccaa,   .24*s, 3.12*s, .06*s, 0, 0,  .18));
      // Tiny white muzzle spot
      g.add(makeSphere(.10*s, 0xffffff, 0, 2.52*s, .48*s));
      g.add(makeSphere(.04*s, 0x111111, 0, 2.62*s, .58*s)); // nose
      break;

    case 'PLUSH TURKEY':
      // Compact fan tail — 3 feathers
      [-0.20,0,0.20].forEach(function(fx){
        var ff=makeBox(.08*s,.32*s,.06*s, fx===0?0xff9922:0xdd6620, fx*s, .78*s, -.38*s);
        ff.rotation.x=-.50; ff.rotation.z=fx*0.60; g.add(ff);
      });
      // Tiny beak + wattle
      g.add(makeCone(.04*s,.10*s, 0xff8800, 0, 2.60*s, .56*s, Math.PI/2, 0, 0));
      g.add(makeSphere(.06*s, 0xdd1111, 0, 2.44*s, .48*s));
      break;

    case 'PLUSH GOAT':
      // Tiny round horns
      g.add(makeSphere(.07*s, 0xccaa88, -.18*s, 3.04*s, .06*s));
      g.add(makeSphere(.07*s, 0xccaa88,  .18*s, 3.04*s, .06*s));
      // Stubby muzzle
      g.add(makeBox(.16*s,.10*s,.14*s, 0xffccaa, 0, 2.52*s, .50*s));
      g.add(makeSphere(.04*s, dark, -.06*s, 2.52*s, .58*s));
      g.add(makeSphere(.04*s, dark,  .06*s, 2.52*s, .58*s));
      // Tiny chin tuft
      g.add(makeSphere(.06*s, dark, 0, 2.30*s, .38*s));
      break;

    case 'PLUSH SHEEP':
      // ── Dense fluffy wool cap — crown ────────────────────────────────────
      g.add(makeSphere(.26*s, 0xf8f8f5,   0,    2.78*s, .10*s));  // crown top
      g.add(makeSphere(.20*s, 0xf8f8f5, -.26*s, 2.72*s, .08*s));  // crown L
      g.add(makeSphere(.20*s, 0xf8f8f5,  .26*s, 2.72*s, .08*s));  // crown R
      g.add(makeSphere(.17*s, 0xf8f8f5,   0,    2.64*s,-.14*s));  // back head
      g.add(makeSphere(.15*s, 0xf8f8f5, -.36*s, 2.64*s, .04*s));  // side puff L
      g.add(makeSphere(.15*s, 0xf8f8f5,  .36*s, 2.64*s, .04*s));  // side puff R
      // ── Neck ruff ─────────────────────────────────────────────────────────
      g.add(makeSphere(.20*s, 0xf8f8f5, -.20*s, 2.18*s, .16*s));
      g.add(makeSphere(.20*s, 0xf8f8f5,  .20*s, 2.18*s, .16*s));
      g.add(makeSphere(.18*s, 0xf8f8f5,   0,    2.20*s, .20*s));
      // ── Dense body wool — front, sides, back ─────────────────────────────
      g.add(makeSphere(.28*s, 0xf8f8f5,  .36*s, 1.72*s,  .26*s));  // R front
      g.add(makeSphere(.28*s, 0xf8f8f5, -.36*s, 1.72*s,  .26*s));  // L front
      g.add(makeSphere(.26*s, 0xf8f8f5,  .32*s, 1.72*s, -.22*s));  // R back
      g.add(makeSphere(.26*s, 0xf8f8f5, -.32*s, 1.72*s, -.22*s));  // L back
      g.add(makeSphere(.30*s, 0xf8f8f5,   0,    2.04*s,  .28*s));  // chest puff
      g.add(makeSphere(.26*s, 0xf8f8f5,   0,    1.82*s, -.26*s));  // back puff
      g.add(makeSphere(.22*s, 0xf8f8f5,   0,    1.40*s,  .18*s));  // belly
      g.add(makeSphere(.18*s, 0xf8f8f5,  .52*s, 1.56*s,  .06*s));  // far R
      g.add(makeSphere(.18*s, 0xf8f8f5, -.52*s, 1.56*s,  .06*s));  // far L
      // ── Leg fluff cuffs ───────────────────────────────────────────────────
      g.add(makeSphere(.16*s, 0xf8f8f5, -.26*s, .70*s, .10*s));
      g.add(makeSphere(.16*s, 0xf8f8f5,  .26*s, .70*s, .10*s));
      g.add(makeSphere(.12*s, 0xf8f8f5, -.26*s, .50*s, .08*s));
      g.add(makeSphere(.12*s, 0xf8f8f5,  .26*s, .50*s, .08*s));
      // ── Arm wool puffs ────────────────────────────────────────────────────
      g.add(makeSphere(.14*s, 0xf8f8f5, -.64*s, 1.68*s,  .04*s));
      g.add(makeSphere(.14*s, 0xf8f8f5,  .64*s, 1.68*s,  .04*s));
      // ── Tiny nose + nub horns ─────────────────────────────────────────────
      g.add(makeSphere(.05*s, 0xcc8866, 0, 2.52*s, .56*s));
      g.add(makeSphere(.08*s, 0xccaa88, -.22*s, 2.94*s, .06*s));
      g.add(makeSphere(.08*s, 0xccaa88,  .22*s, 2.94*s, .06*s));
      break;

    case 'PLUSH WOLF':
      // Pointed ears with pink inner
      g.add(makeCone(.10*s,.24*s, col,       -.24*s, 3.10*s, .04*s, 0, 0, -.18));
      g.add(makeCone(.10*s,.24*s, col,        .24*s, 3.10*s, .04*s, 0, 0,  .18));
      g.add(makeCone(.06*s,.18*s, 0xffaacc,  -.24*s, 3.10*s, .06*s, 0, 0, -.18));
      g.add(makeCone(.06*s,.18*s, 0xffaacc,   .24*s, 3.10*s, .06*s, 0, 0,  .18));
      // Snout + black nose
      g.add(makeBox(.16*s,.12*s,.14*s, mid, 0, 2.52*s, .50*s));
      g.add(makeSphere(.05*s, 0x111111, 0, 2.62*s, .58*s));
      break;

    case 'PLUSH BUNNY':
      // Iconic tall floppy ears
      g.add(makeBox(.12*s,.52*s,.09*s, col,       -.20*s, 3.34*s, .04*s));
      g.add(makeBox(.12*s,.52*s,.09*s, col,        .20*s, 3.34*s, .04*s));
      g.add(makeBox(.07*s,.40*s,.06*s, 0xffbbcc,  -.20*s, 3.34*s, .08*s)); // inner L
      g.add(makeBox(.07*s,.40*s,.06*s, 0xffbbcc,   .20*s, 3.34*s, .08*s)); // inner R
      // Pink button nose + cotton tail
      g.add(makeSphere(.06*s, 0xff8899, 0, 2.62*s, .58*s));
      g.add(makeSphere(.12*s, 0xffffff, 0, .74*s, -.38*s));
      break;

    case 'FROG':
      // Wide flat muzzle
      g.add(makeBox(.42*s,.14*s,.16*s, 0x55cc55, 0, 2.50*s, .50*s));
      g.add(makeSphere(.05*s, 0x224422, -.08*s, 2.57*s, .64*s));  // nostrilL
      g.add(makeSphere(.05*s, 0x224422,  .08*s, 2.57*s, .64*s));  // nostrilR
      // Tympanic membranes (flat discs on sides of head)
      g.add(makeCylinder(.16*s,.16*s,.03*s, 0x44bb44, -.58*s, 2.70*s, .02*s, 0, 0, Math.PI/2));
      g.add(makeCylinder(.16*s,.16*s,.03*s, 0x44bb44,  .58*s, 2.70*s, .02*s, 0, 0, Math.PI/2));
      // Extended smile corners
      g.add(makeBox(.12*s,.04*s,.04*s, dark, -.30*s, 2.38*s, .54*s, 0, 0, -.24));
      g.add(makeBox(.12*s,.04*s,.04*s, dark,  .30*s, 2.38*s, .54*s, 0, 0,  .24));
      // Lighter belly patch
      g.add(makeBox(.70*s,.80*s,.06*s, 0x88dd88, 0, 1.34*s, .34*s));
      addEndoParts(g, s);
      break;

    case 'PANDA':
      // Black eye patches behind the default white eyes
      g.add(makeSphere(.28*s, 0x111111, -.26*s, 2.78*s, .44*s));
      g.add(makeSphere(.28*s, 0x111111,  .26*s, 2.78*s, .44*s));
      // Black rounded ears
      g.add(makeSphere(.22*s, 0x111111, -.46*s, 3.06*s, .04*s));
      g.add(makeSphere(.22*s, 0x111111,  .46*s, 3.06*s, .04*s));
      // Small round black nose
      g.add(makeSphere(.09*s, 0x111111, 0, 2.54*s, .60*s));
      // Black shoulder/arm patches
      g.add(makeBox(.34*s,.64*s,.30*s, 0x111111, -.56*s, 1.60*s, 0));
      g.add(makeBox(.34*s,.64*s,.30*s, 0x111111,  .56*s, 1.60*s, 0));
      // Black lower hips/legs
      g.add(makeBox(.80*s,.28*s,.60*s, 0x111111, 0, .68*s, 0));
      addEndoParts(g, s);
      break;

    case 'RHINO':
      // Main horn on nose
      g.add(makeCone(.08*s,.52*s, 0xaaaaaa, 0, 2.70*s, .74*s, Math.PI/2, 0, 0));
      // Smaller second horn behind first
      g.add(makeCone(.05*s,.28*s, 0x999999, 0, 2.74*s, .58*s, Math.PI/2, 0, 0));
      // Wide thick muzzle
      g.add(makeBox(.38*s,.18*s,.20*s, mid, 0, 2.50*s, .52*s));
      g.add(makeSphere(.06*s, dark, -.12*s, 2.50*s, .64*s));  // nostrilL
      g.add(makeSphere(.06*s, dark,  .12*s, 2.50*s, .64*s));  // nostrilR
      // Small rounded ears with pink inner
      g.add(makeSphere(.12*s, mid, -.46*s, 3.02*s, .04*s));
      g.add(makeSphere(.12*s, mid,  .46*s, 3.02*s, .04*s));
      g.add(makeSphere(.07*s, 0xffccaa, -.46*s, 3.02*s, .10*s));
      g.add(makeSphere(.07*s, 0xffccaa,  .46*s, 3.02*s, .10*s));
      // Extra thick neck bulk
      g.add(makeBox(.96*s,.30*s,.70*s, dark, 0, 1.90*s, 0));
      addEndoParts(g, s);
      break;

    case 'HORSE':
      // Long rectangular muzzle
      g.add(makeBox(.34*s,.22*s,.38*s, mid, 0, 2.48*s, .58*s));
      g.add(makeBox(.28*s,.10*s,.10*s, 0xffccaa, 0, 2.42*s, .76*s));  // muzzle tip
      g.add(makeSphere(.08*s, dark, -.10*s, 2.42*s, .78*s));  // nostrilL
      g.add(makeSphere(.08*s, dark,  .10*s, 2.42*s, .78*s));  // nostrilR
      // Tall pointed ears with inner colour
      g.add(makeBox(.10*s,.30*s,.08*s, col,      -.28*s, 3.30*s, .04*s));
      g.add(makeBox(.10*s,.30*s,.08*s, col,       .28*s, 3.30*s, .04*s));
      g.add(makeBox(.06*s,.22*s,.04*s, 0xffccaa, -.28*s, 3.30*s, .08*s));
      g.add(makeBox(.06*s,.22*s,.04*s, 0xffccaa,  .28*s, 3.30*s, .08*s));
      // Mane along neck (cascade of dark slabs)
      [2.22,2.06,1.90,1.74].forEach(function(my){
        g.add(makeBox(.14*s,.18*s,.36*s, dark, 0, my*s, -.24*s));
      });
      g.add(makeBox(.16*s,.16*s,.26*s, dark, 0, 3.00*s, -.10*s));  // head crest
      // Tail
      var htail=makeBox(.16*s,.50*s,.16*s, dark, .10*s, .70*s, -.44*s);
      htail.rotation.x=.46; g.add(htail);
      g.add(makeSphere(.12*s, dark, .10*s, .42*s, -.62*s));
      addEndoParts(g, s);
      break;

    case 'FARM DOG':
      // Floppy ears
      g.add(makeBox(.20*s,.36*s,.10*s, dark, -.54*s, 2.68*s, .04*s, .18, 0,  .40));
      g.add(makeBox(.20*s,.36*s,.10*s, dark,  .54*s, 2.68*s, .04*s, .18, 0, -.40));
      g.add(makeBox(.13*s,.28*s,.06*s, 0xf0c090, -.53*s, 2.66*s, .07*s, .18, 0,  .40));
      g.add(makeBox(.13*s,.28*s,.06*s, 0xf0c090,  .53*s, 2.66*s, .07*s, .18, 0, -.40));
      // Snout / muzzle
      g.add(makeBox(.28*s,.20*s,.20*s, mid, 0, 2.52*s, .52*s));
      g.add(makeSphere(.08*s, 0x222222, 0, 2.64*s, .62*s));
      // Wagging tail
      var dgTail=makeBox(.12*s,.46*s,.12*s, dark, .14*s, .78*s, -.44*s);
      dgTail.rotation.x=-.62; g.add(dgTail);
      break;
  }
}
