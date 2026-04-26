// Room constants, names, colors, doors, and pathfinding data.

'use strict';

const WALL_H    = 4.5;
const ROOM_HALF = 11;
const DOOR_W    = 3.0;
const DOOR_H    = 3.2;

const ROOM_NAMES = {
  cafeteria:'CAFETERIA', guard_shack:'GUARD SHACK', barn:'BARN',
  pasture:'PASTURE', farmhouse:'FARMHOUSE', tractor_shed:'TRACTOR SHED',
  silo:'SILO', front_gate:'FRONT GATE', fox_hole:'FOX HOLE',
  petting_zoo:'PETTING ZOO', restrooms:'RESTROOMS', closet:'STORAGE CLOSET',
  dog_house:'DOG HOUSE', cellar:'CELLAR', workshop:'WORKSHOP', kitchen:'KITCHEN',
  arcade:'ARCADE',
  cage:'CAGE',
  generator_room:'GENERATOR ROOM',
  play_place:'PLAY PLACE',
  vents:'VENTS',
};

const ROOM_COLORS = {
  cafeteria:    { bg:0x12090e, floor:0x2e1e22, wall:0x1e1218, ceil:0x0a0608, accent:0x4a2030 },
  guard_shack:  { bg:0x0d0a06, floor:0x2a1c10, wall:0x1e1408, ceil:0x0c0804, accent:0x3a2810 },
  barn:         { bg:0x0c0714, floor:0x1e1008, wall:0x180c1c, ceil:0x080414, accent:0x3a1a2a },
  pasture:      { bg:0x060c06, floor:0x0e180a, wall:0x0c160a, ceil:0x040a04, accent:0x183018 },
  farmhouse:    { bg:0x0e0c0c, floor:0x201a16, wall:0x1a1614, ceil:0x0c0a08, accent:0x3a2820 },
  tractor_shed: { bg:0x0c0c06, floor:0x1e1c0a, wall:0x181808, ceil:0x0a0a04, accent:0x282a10 },
  silo:         { bg:0x0a0a14, floor:0x181820, wall:0x14141e, ceil:0x080810, accent:0x202030 },
  front_gate:   { bg:0x0c0a1c, floor:0x1a162e, wall:0x141022, ceil:0x08060e, accent:0x2a2040 },
  fox_hole:     { bg:0x100608, floor:0x201010, wall:0x180c0c, ceil:0x0a0406, accent:0x2e1010 },
  petting_zoo:  { bg:0x060e06, floor:0x101c0e, wall:0x0e1810, ceil:0x040c04, accent:0x183018 },
  restrooms:    { bg:0x141820, floor:0x242c38, wall:0x1e2430, ceil:0x0e1016, accent:0x2c3444 },
  closet:       { bg:0x0e0c08, floor:0x1c1810, wall:0x181408, ceil:0x0c0a06, accent:0x2c2216 },
  dog_house:    { bg:0x14100a, floor:0x261e10, wall:0x1c1810, ceil:0x0e0c06, accent:0x342a14 },
  cellar:       { bg:0x080304, floor:0x14080a, wall:0x100408, ceil:0x060204, accent:0x1e0808 },
  workshop:     { bg:0x06030e, floor:0x0e0818, wall:0x0a0614, ceil:0x040210, accent:0x1e1038 },
  kitchen:      { bg:0x100c08, floor:0x2e2620, wall:0x241c18, ceil:0x120f0b, accent:0x5e4a34 },
  arcade:        { bg:0x04001a, floor:0x0a0430, wall:0x080228, ceil:0x020010, accent:0x6000cc },
  cage:          { bg:0x060604, floor:0x0e0c08, wall:0x0c0a06, ceil:0x040402, accent:0x2a2010 },
  generator_room:{ bg:0x020202, floor:0x0a0808, wall:0x080606, ceil:0x040202, accent:0x1a0808 },
  play_place:    { bg:0x060010, floor:0x180828, wall:0x100618, ceil:0x040008, accent:0x6600aa },
  vents:         { bg:0x060606, floor:0x101010, wall:0x1a1a1a, ceil:0x080808, accent:0x444444 },
};

const ROOM_DOORS = {
  cafeteria: [
    { wall:'N', center:-5.5, width:DOOR_W, dest:'barn'        },
    { wall:'N', center: 0.0, width:DOOR_W, dest:'farmhouse'   },
    { wall:'N', center: 5.5, width:DOOR_W, dest:'silo'        },
    { wall:'W', center: 3.5, width:DOOR_W, dest:'tractor_shed'},
    { wall:'E', center:-3.5, width:DOOR_W, dest:'restrooms'   },
    { wall:'E', center: 0.0, width:DOOR_W, dest:'guard_shack' },
    { wall:'E', center: 3.5, width:DOOR_W, dest:'closet'      },
    { wall:'S', center:-4.0, width:DOOR_W, dest:'pasture'     },
    { wall:'S', center: 4.0, width:DOOR_W, dest:'front_gate'  },
  ],
  guard_shack:  [{ wall:'E', center:0,    width:DOOR_W, dest:'cafeteria' }],
  barn:         [{ wall:'S', center:0,    width:4.5,    dest:'cafeteria' },
                 { wall:'E', center:0,    width:DOOR_W, dest:'workshop'  },
                 { wall:'W', center:0,    width:DOOR_W, dest:'cage'      }],
  farmhouse:    [
    { wall:'S', center:0,   width:DOOR_W, dest:'cafeteria' },
    { wall:'W', center:-3,  width:DOOR_W, dest:'cellar'    },
    { wall:'E', center: 3,  width:DOOR_W, dest:'kitchen'   },
  ],
  silo:         [{ wall:'S', center:0,    width:DOOR_W, dest:'cafeteria'  }],
  tractor_shed: [{ wall:'E', center:0,    width:DOOR_W, dest:'cafeteria'  }],
  restrooms:    [{ wall:'W', center:0,    width:DOOR_W, dest:'cafeteria'  }],
  closet:       [{ wall:'W', center:0,    width:DOOR_W, dest:'cafeteria'     },
                 { wall:'S', center:0,    width:DOOR_W, dest:'generator_room'}],
  pasture: [
    { wall:'N', center:-4,  width:DOOR_W, dest:'cafeteria'  },
    { wall:'N', center: 4,  width:DOOR_W, dest:'dog_house'  },
    { wall:'W', center: 0,  width:DOOR_W, dest:'fox_hole'   },
    { wall:'E', center: 0,  width:DOOR_W, dest:'petting_zoo'},
    { wall:'S', center: 0,  width:DOOR_W, dest:'arcade'     },
  ],
  front_gate:   [{ wall:'W', center:0,    width:4.5,    dest:'cafeteria'  }],
  cellar:       [{ wall:'E', center:0,    width:DOOR_W, dest:'farmhouse'  }],
  dog_house:    [{ wall:'S', center:0,    width:DOOR_W, dest:'pasture'    }],
  fox_hole:     [{ wall:'E', center:0,    width:DOOR_W, dest:'pasture'    }],
  petting_zoo:  [{ wall:'W', center:0,    width:DOOR_W, dest:'pasture'    }],
  workshop:     [{ wall:'W', center:0,    width:DOOR_W, dest:'barn'        }],
  kitchen:      [{ wall:'W', center:3,    width:DOOR_W, dest:'farmhouse'   }],
  arcade:       [{ wall:'N', center:0,    width:DOOR_W, dest:'pasture'     },
                 { wall:'S', center:0,    width:DOOR_W, dest:'play_place'  }],
  play_place:   [{ wall:'N', center:0,    width:DOOR_W, dest:'arcade'      }],
  cage:          [{ wall:'E', center:0,    width:DOOR_W, dest:'barn'        }],
  generator_room:[{ wall:'N', center:0,    width:DOOR_W, dest:'closet'      }],
  vents:        [],
};

var ROOM_ADJACENCY = (function(){
  var adj = {};
  for(var room in ROOM_DOORS){
    adj[room] = ROOM_DOORS[room].map(function(d){ return d.dest; });
  }
  return adj;
})();

function findRoomPath(from, to){
  if(from === to) return [from];
  var visited = {}, prev = {}, queue = [from];
  visited[from] = true;
  while(queue.length){
    var cur = queue.shift();
    var nb = ROOM_ADJACENCY[cur] || [];
    for(var i = 0; i < nb.length; i++){
      var n = nb[i];
      if(visited[n]) continue;
      visited[n] = true;
      prev[n] = cur;
      if(n === to){
        var path = [n];
        while(prev[path[0]] !== undefined) path.unshift(prev[path[0]]);
        return path;
      }
      queue.push(n);
    }
  }
  return [from];
}
