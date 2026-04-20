// Weapon names, key bindings, and combat tuning data.

'use strict';

const WEAPON_SLOT_KEYS = {
  Digit1: 'none', Digit2: 'office_bat', Digit3: 'bat',
  Digit4: 'crowbar', Digit5: 'axe', Digit6: 'shotgun', Digit7: 'taser', Digit8: 'knife',
  Digit9: 'pistol',
};

const WEAPON_NAMES = {
  none:'Fists', office_bat:'Office Bat', bat:'Wood Bat',
  crowbar:'Crowbar', axe:'Axe', shotgun:'Shotgun★', taser:'Taser⚡', knife:'Kitchen Knife',
  pistol:'Pistol🔫', oneshot:'★ONE-SHOT GUN★',
};

const WEAPON_DAMAGE = { none:1, office_bat:6, bat:8, crowbar:12, axe:16, shotgun:45, taser:4, knife:14, pistol:28, oneshot:99999 };

const PISTOL_RANGE = 9.0;

const TASER_MAX_CHARGES = 5;
const TASER_STUN_TIME   = 5.0;  // seconds stunned
