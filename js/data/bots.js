// Bot definitions, stage layouts, and activation schedule data.

'use strict';

const BOT_ACTIVATION_HOUR = {
  // ── All Plush leave Petting Zoo at 1 AM ────────────────────────────────────
  tfreddy: [1, true],  tbonnie:  [1, true],
  tchica:  [1, true],  ptfox:    [1, true],
  ptturkey:[1, true],  ptgoat:   [1, true],
  ptsheep: [1, true],  ptwolf:   [1, true],
  ptbunny: [1, true],
  // ── Regular animatronics leave barn stage 2 AM – 8 AM ──────────────────────
  // ── Cage animatronics all break out at 3 AM ───────────────────────────────
  frog:    [3, true],   panda:   [3, true],
  rhino:   [3, true],   horse:   [3, true],
  freddy:  [2, true],   bonnie:  [3, true],
  chica:   [4, true],   foxy:    [5, true],
  pfox:    [6, true],   sparky:  [7, true],
  endo:    [8, true],   gbear:   [8, true],
  rabbit:  [8, true],
};

const STAGE_POSITIONS = [
  [-8,-8],[-6.5,-8],[-5,-8],[-3.5,-8],[-2,-8],[-0.5,-8],
  [0.5,-8],[2,-8],[3.5,-8],[5,-8],[6.5,-8],[8,-8],
  [-7,-9.4],[-5.5,-9.4],[-4,-9.4],[-2,-9.4],[0,-9.4],
  [2,-9.4],[4,-9.4],[5.5,-9.4],[7,-9.4],
];

const STAGE_ORDER = [
  'tfreddy','tbonnie','tchica','ptfox','ptturkey','ptgoat','ptsheep','ptwolf','ptbunny',
  'freddy','bonnie','chica','foxy','pfox','sparky','endo','gbear','rabbit',
];


var bots = {
  freddy:   { spot:'barn', hp:300, maxHp:300, name:'COW',          color:0xf2f0ee, alive:true, big:true  },
  bonnie:   { spot:'barn', hp:120, maxHp:120, name:'PIG',          color:0xff88bb, alive:true },
  chica:    { spot:'barn', hp:120, maxHp:120, name:'CHICKEN',      color:0xffe050, alive:true },
  foxy:     { spot:'barn', hp:120, maxHp:120, name:'FOX',          color:0xe86020, alive:true },
  pfox:     { spot:'barn', hp:300, maxHp:300, name:'TURKEY',       color:0xcc7722, alive:true, big:true  },
  sparky:   { spot:'barn', hp:120, maxHp:120, name:'GOAT',         color:0xa0c878, alive:true },
  endo:     { spot:'barn', hp:120, maxHp:120, name:'SHEEP',        color:0xf0f0e8, alive:true },
  gbear:    { spot:'barn', hp:372, maxHp:372, name:'WOLF',         color:0x9090cc, alive:true, big:true  },
  rabbit:   { spot:'barn', hp:120, maxHp:120, name:'BUNNY',        color:0xf0ddee, alive:true },
  rat:      { spot:'vents', hp:72, maxHp:72,  name:'RAT',          color:0x777777, alive:true, small:true },
  // ── Toy / Plush versions — spawn in Petting Zoo ────────────────────────────
  tfreddy:  { spot:'petting_zoo', hp:2,   maxHp:2,   name:'PLUSH COW',    color:0xaaddff, alive:true },
  tbonnie:  { spot:'petting_zoo', hp:2,   maxHp:2,   name:'PLUSH PIG',    color:0xffbbdd, alive:true },
  tchica:   { spot:'petting_zoo', hp:2,   maxHp:2,   name:'PLUSH CHKN',   color:0xffffaa, alive:true },
  ptfox:    { spot:'petting_zoo', hp:2,   maxHp:2,   name:'PLUSH FOX',    color:0xffcc99, alive:true },
  ptturkey: { spot:'petting_zoo', hp:2,   maxHp:2,   name:'PLUSH TURKEY', color:0xffe0bb, alive:true },
  ptgoat:   { spot:'petting_zoo', hp:2,   maxHp:2,   name:'PLUSH GOAT',   color:0xcceeaa, alive:true },
  ptsheep:  { spot:'petting_zoo', hp:2,   maxHp:2,   name:'PLUSH SHEEP',  color:0xeeeeff, alive:true },
  ptwolf:   { spot:'petting_zoo', hp:2,   maxHp:2,   name:'PLUSH WOLF',   color:0xccccff, alive:true },
  ptbunny:  { spot:'petting_zoo', hp:2,   maxHp:2,   name:'PLUSH BUNNY',  color:0xffd0ee, alive:true },
  // ────────────────────────────────────────────────────────────────────────────
  // ── Cage animatronics — 3× health, 2× speed & damage ─────────────────────
  frog:     { spot:'cage', hp:360, maxHp:360, name:'FROG',  color:0x33aa44, alive:true, cage:true },
  panda:    { spot:'cage', hp:360, maxHp:360, name:'PANDA', color:0xfafafa, alive:true, cage:true },
  rhino:    { spot:'cage', hp:360, maxHp:360, name:'RHINO', color:0x7a8878, alive:true, cage:true },
  horse:    { spot:'cage', hp:360, maxHp:360, name:'HORSE', color:0x8B5520, alive:true, cage:true },
  dog:      { spot:'dog_house', hp:120, maxHp:120, name:'FARM DOG', color:0xd4a060, alive:true, tamed:false },
  purple:   { spot:'cellar',    hp:1800, maxHp:1800, name:'FARMER', color:0xffaa80, alive:true },
};
