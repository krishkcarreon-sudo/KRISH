// Static item, ingredient, and ammo placement data.

'use strict';

const FOOD_ITEMS = [
  // ── cafeteria ─────────────────────────────────────────────────────────────
  { id:'caf_soda',    spot:'cafeteria',    x:-3.8, z:-2.8, y:0.88, heal:150, label:'SODA',   type:'drink',  cupColor:0xee2222 },
  { id:'caf_pizza',   spot:'cafeteria',    x: 0.5, z:-2.8, y:0.88, heal:230, label:'PIZZA',  type:'pizza'  },
  { id:'caf_burger',  spot:'cafeteria',    x: 4.2, z:-2.8, y:0.88, heal:280, label:'BURGER', type:'burger' },
  { id:'caf_fries',   spot:'cafeteria',    x:-3.8, z: 1.8, y:0.88, heal:160, label:'FRIES',  type:'fries'  },
  // ── scattered rooms ────────────────────────────────────────────────────────
  { id:'shk_soda',    spot:'guard_shack',  x: 2.0, z: 1.0, y:0.88, heal:150, label:'SODA',   type:'drink',  cupColor:0x2244ee },
  { id:'frm_burger',  spot:'farmhouse',    x: 2.5, z: 2.0, y:0.88, heal:280, label:'BURGER', type:'burger' },
  { id:'shd_fries',   spot:'tractor_shed', x:-2.0, z:-2.5, y:0.92, heal:160, label:'FRIES',  type:'fries'  },
  { id:'sil_pizza',   spot:'silo',         x: 1.0, z: 2.0, y:0.88, heal:230, label:'PIZZA',  type:'pizza'  },
  { id:'pas_soda',    spot:'pasture',      x: 3.0, z:-2.0, y:0.04, heal:150, label:'SODA',   type:'drink',  cupColor:0x22bb44 },
  { id:'ptz_fries',   spot:'petting_zoo',  x: 2.0, z:-3.0, y:0.04, heal:160, label:'FRIES',  type:'fries'  },
  { id:'rst_pizza',   spot:'restrooms',    x:-3.0, z:-2.5, y:0.04, heal:230, label:'PIZZA',  type:'pizza'  },
  { id:'cls_burger',  spot:'closet',       x: 1.0, z: 2.0, y:0.88, heal:280, label:'BURGER', type:'burger' },
  { id:'wsh_soda',    spot:'workshop',     x:-3.0, z: 2.0, y:0.88, heal:150, label:'SODA',   type:'drink',  cupColor:0x993399 },
];

const KITCHEN_INGREDIENTS = [
  { id:'kit_carrot', spot:'kitchen', x:-4.8, z:-7.0, y:0.98, label:'CARROT', color:0xff7a1a, shape:'carrot' },
  { id:'kit_potato', spot:'kitchen', x:-2.8, z:-7.2, y:0.98, label:'POTATO', color:0xa67c52, shape:'potato' },
  { id:'kit_egg',    spot:'kitchen', x:-0.8, z:-6.8, y:1.00, label:'EGG',    color:0xf6f0da, shape:'egg'    },
  { id:'kit_corn',   spot:'kitchen', x: 1.5, z:-7.1, y:0.98, label:'CORN',   color:0xffd84a, shape:'corn'   },
  { id:'kit_onion',  spot:'kitchen', x: 4.0, z:-6.9, y:0.98, label:'ONION',  color:0xd9c2ff, shape:'onion'  },
];


const AMMO_ITEMS = [
  { id:'ammo_silo',      spot:'silo',         x:-5.6, z:-3.0, y:0.26, amount:10, label:'SHOTGUN SHELLS' },
  { id:'ammo_shed',      spot:'tractor_shed', x:-5.1, z:-4.9, y:1.08, amount:10, label:'SHOTGUN SHELLS' },
  { id:'ammo_workshop',  spot:'workshop',     x: 8.8, z: 1.9, y:1.08, amount:10, label:'SHOTGUN SHELLS' },
  { id:'ammo_barn',      spot:'barn',         x: 6.2, z:-6.5, y:0.10, amount:10, label:'SHOTGUN SHELLS' },
  { id:'ammo_cellar',    spot:'cellar',       x:-5.0, z:-2.6, y:0.92, amount:10, label:'SHOTGUN SHELLS' },
  { id:'ammo_pasture',   spot:'pasture',      x: 6.6, z:-5.8, y:0.10, amount:10, label:'SHOTGUN SHELLS' },
  { id:'ammo_restroom',  spot:'restrooms',    x:-7.4, z:-4.0, y:0.92, amount:10, label:'SHOTGUN SHELLS' },
  { id:'ammo_kitchen',   spot:'kitchen',      x: 7.2, z:-6.8, y:1.02, amount:10, label:'SHOTGUN SHELLS' },
];

const GAS_CAN_ITEMS = [
  { id:'gas_silo',      spot:'silo',         x:-8.8, z:-5.0, y:0.23, label:'GAS CAN' },
  { id:'gas_shed',      spot:'tractor_shed', x: 6.0, z:-7.2, y:0.22, label:'GAS CAN' },
  { id:'gas_barn',      spot:'barn',         x:-7.8, z:-6.5, y:0.08, label:'GAS CAN' },
  { id:'gas_pasture',   spot:'pasture',      x: 7.2, z: 4.8, y:0.06, label:'GAS CAN' },
  { id:'gas_farmhouse', spot:'farmhouse',    x: 6.8, z: 2.8, y:0.22, label:'GAS CAN' },
  { id:'gas_workshop',  spot:'workshop',     x:-7.8, z: 6.5, y:0.22, label:'GAS CAN' },
];
