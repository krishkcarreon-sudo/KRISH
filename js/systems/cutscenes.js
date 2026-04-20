// Cutscene flow, jumpscares, and win/lose scene behavior.

'use strict';

var cutsceneCallback = null;
var cutsceneUnskippable = false;

function skipCutscene(){
  if(cutsceneUnskippable) return;
  document.getElementById('cutscene').classList.remove('active');
  cutscenePlaying = false;
  if(cutsceneCallback){
    var cb = cutsceneCallback;
    cutsceneCallback = null;
    cb();
  }
}

window.skipCutscene = skipCutscene;

document.addEventListener('keydown', function(e){
  if(cutscenePlaying && !cutsceneUnskippable && e.code !== 'Escape') skipCutscene();
});

document.getElementById('cutscene').addEventListener('click', function(){
  if(cutscenePlaying && !cutsceneUnskippable) skipCutscene();
});

function showPoliceCutscene(){
  cutscenePlaying = true;
  cutsceneUnskippable = true;

  var csEl   = document.getElementById('cutscene');
  var title  = document.getElementById('cs-title');
  var cap    = document.getElementById('cs-caption');
  var scn    = document.getElementById('cs-scene');
  var skip   = document.getElementById('cs-skip');
  skip.style.display = 'none';

  // ── SCENE 1: finding the phone ─────────────────────────────────────────────
  title.textContent = 'EVIDENCE FOUND';
  cap.innerHTML =
    'You scroll through the Farmer\'s phone...<br>'+
    'Photos. Videos. Recordings.<br>'+
    '<span style="color:#ff5555">Evidence of everything he\'s done here.</span>';
  scn.className = 'cs-scene';
  scn.innerHTML =
    '<div style="font-size:72px;margin-top:30px">📱</div>'+
    '<div style="color:#ff4444;font-size:13px;margin-top:12px;font-family:Courier New">'+
      '... 47 files ... 12 videos ... 9 audio recordings ...'+'</div>';
  csEl.classList.add('active');

  // ── SCENE 2: dialling 911 ──────────────────────────────────────────────────
  setTimeout(function(){
    title.textContent = 'CALLING FOR HELP';
    cap.innerHTML = 'Your hands are shaking.<br>You dial 911.<br>'+
      '<span style="color:#88ff88">"Please state your emergency..."</span>';
    scn.innerHTML =
      '<div style="font-size:64px;margin-top:30px">📞</div>'+
      '<div style="color:#88ff88;font-size:15px;margin-top:14px;font-family:Courier New">'+
        'CALL CONNECTED — 911</div>';
  }, 5000);

  // ── SCENE 3: police arrive ─────────────────────────────────────────────────
  setTimeout(function(){
    title.textContent = 'THEY CAME';
    cap.innerHTML =
      'Within minutes the county road fills with flashing lights.<br>'+
      'A dozen officers pour through the gate.<br>'+
      '<span style="color:#aaaaff">For the first time all night — you feel safe.</span>';
    scn.innerHTML =
      '<div class="police-road"></div>'+
      '<div class="police-car"><div class="police-light"></div></div>'+
      '<div class="officer" style="left:38%">👮</div>'+
      '<div class="officer" style="left:55%">👮</div>'+
      '<div style="position:absolute;top:10px;left:0;width:100%;text-align:center;'+
        'font-size:11px;color:#aaa;font-family:Courier New">[ SEVERAL MINUTES LATER ]</div>';
  }, 11000);

  // ── SCENE 4: farmer arrested ───────────────────────────────────────────────
  setTimeout(function(){
    title.textContent = 'JUSTICE';
    cap.innerHTML =
      'The Farmer is brought out in cuffs.<br>'+
      'He doesn\'t fight. He just looks at you.<br>'+
      '<span style="color:#ffaa44">"I only wanted to keep them running..."</span>';
    scn.innerHTML =
      '<div class="police-road"></div>'+
      '<div class="police-car"><div class="police-light"></div></div>'+
      '<div class="farmer-cuffed">🧑‍🌾</div>'+
      '<div class="officer">👮</div>'+
      '<div style="position:absolute;top:10px;left:0;width:100%;text-align:center;'+
        'font-size:11px;color:#aaa;font-family:Courier New">[ ARRESTED ]</div>';
  }, 18000);

  // ── SCENE 5: aftermath ─────────────────────────────────────────────────────
  setTimeout(function(){
    title.textContent = 'THE MORNING AFTER';
    cap.innerHTML =
      'The farm is taped off. Investigators walk the grounds.<br>'+
      'Somewhere inside, an animatronic slowly powers down.<br>'+
      '<span style="color:#cccccc">It\'s over.</span>';
    scn.innerHTML =
      '<div style="font-size:60px;margin-top:28px">🌅</div>'+
      '<div style="color:#ffcc88;font-size:13px;margin-top:10px;font-family:Courier New">DAWN — HAUNTED FARM INVESTIGATION SITE</div>';
  }, 26000);

  // ── Auto-close after 34 seconds ────────────────────────────────────────────
  setTimeout(function(){
    cutsceneUnskippable = false;
    skip.style.display = '';
    csEl.classList.remove('active');
    cutscenePlaying = false;
    doFinalWinScreen(
      'YOU SURVIVED',
      'You told them everything.<br>'+
      'The farm was shut down. The animatronics were dismantled.<br>'+
      '<span style="color:#aaffaa">Nobody will ever come here again.</span>'
    );
  }, 34000);

  cutsceneCallback = null;
}

function showCarCrashCutscene(afterCallback){
  cutscenePlaying = true;
  document.getElementById('cs-title').textContent = 'YOU ESCAPED... OR DID YOU?';
  document.getElementById('cs-caption').innerHTML =
    'You speed away from the farm, heart pounding.<br>'+
    'The road is empty. The night is quiet.<br>'+
    '<span style="color:#ff5555">Then — in the headlights — a figure.</span><br>'+
    '<span style="color:#ffffff;font-size:12px">The Farmer. Grinning. Right in the middle of the road.</span>';
  var sc = document.getElementById('cs-scene');
  sc.className = 'cs-scene road-scene';
  sc.innerHTML =
    '<div class="road-lines"></div>'+
    '<div class="player-car" id="cs-pcar">🚗</div>'+
    '<div class="farmer-ghost">🧑‍🌾</div>'+
    '<div class="crash-text">CRASH!</div>';
  document.getElementById('cutscene').classList.add('active');
  setTimeout(function(){
    var pc = document.getElementById('cs-pcar');
    if(pc) pc.classList.add('crash');
  }, 2400);
  cutsceneCallback = afterCallback || null;
}

function showPacifistEnding(){
  win = true;
  bots.purple.alive = false;
  cutscenePlaying = true;
  document.getElementById('boss-bar').style.display = 'none';

  // Scene 1 — talking him down
  document.getElementById('cs-title').textContent = 'PEACE';
  document.getElementById('cs-caption').innerHTML =
    'You lower your weapon. The Farmer stops.<br>'+
    'His eyes clear. He looks at the dog — then at you.<br>'+
    '<span style="color:#aaffcc;font-style:italic">"I remember you," he says. "I remember all of this."</span><br>'+
    '<span style="color:#cccccc">The machines go quiet.</span>';

  var sc = document.getElementById('cs-scene');
  sc.className = 'cs-scene';
  sc.innerHTML =
    '<div class="pacifist-bg"></div>'+
    '<div class="pacifist-player">🧍</div>'+
    '<div class="pacifist-farmer">🧑‍🌾</div>'+
    '<div class="pacifist-dog">🐕</div>'+
    '<div class="pacifist-glow"></div>';
  document.getElementById('cutscene').classList.add('active');

  cutsceneCallback = function(){ showPacifistDriveHome(); };
}

function showPacifistDriveHome(){
  cutscenePlaying = true;
  document.getElementById('cs-title').textContent = 'GOING HOME';
  document.getElementById('cs-caption').innerHTML =
    'He shuts off the machines. One by one, the lights die.<br>'+
    'You find an old pickup at the gate. The dog rides in the back.<br>'+
    '<span style="color:#ffe8aa">The farm shrinks in the mirror. Neither of you looks back.</span>';

  var sc = document.getElementById('cs-scene');
  sc.className = 'cs-scene road-scene';
  sc.innerHTML =
    '<div class="road-lines"></div>'+
    '<div class="pacifist-truck" id="pac-truck">🚛</div>'+
    '<div class="pacifist-dog-back">🐕</div>'+
    '<div style="position:absolute;top:10px;left:0;width:100%;text-align:center;'+
      'font-size:11px;color:#aaa;font-family:Courier New">[ DAWN ]</div>';
  document.getElementById('cutscene').classList.add('active');

  cutsceneCallback = function(){
    doFinalWinScreen(
      'THE BEST ENDING',
      'You never hurt a single one of them.<br>'+
      'You brought your father home.<br>'+
      '<span style="color:#ffe8aa">The dog fell asleep across both your laps<br>before you even reached the highway.</span><br>'+
      '<span style="color:#aaffcc;font-size:11px">Pacifist route — all animatronics spared &bull; dog companion &bull; farmer talked down</span>'
    );
  };
}

function triggerWin(){
  if(hasEscapeKey){
    showCarCrashCutscene(function(){ showRevealEnding(); });
  } else {
    showRevealEnding();
  }
}

function showRevealEnding(){
  cutscenePlaying = true;
  document.getElementById('cs-title').textContent = 'WAKING UP...';
  document.getElementById('cs-caption').innerHTML =
    'The room spins. Your body aches.<br>'+
    'You don\'t remember how you got here.<br>'+
    '<span style="color:#ccbbaa;font-style:italic">On the wall — a photograph.</span>';

  var sc = document.getElementById('cs-scene');
  sc.className = 'cs-scene';
  sc.innerHTML =
    '<div class="reveal-room"></div>'+
    '<div class="reveal-photo-frame">🧍 🧑‍🌾</div>'+
    '<div class="reveal-player-fig">🧍</div>'+
    '<div class="reveal-sorry">"...Sorry, Dad."</div>';
  document.getElementById('cutscene').classList.add('active');

  cutsceneCallback = function(){
    // brief true black before police scene
    setTimeout(showPoliceInterrogation, 320);
  };
}

function showPoliceInterrogation(){
  cutscenePlaying = true;
  document.getElementById('cs-title').textContent = 'THE NEXT MORNING';
  document.getElementById('cs-caption').innerHTML =
    'Two officers. A fluorescent light.<br>'+
    'A cup of cold coffee you haven\'t touched.<br>'+
    '<span style="color:#8899cc;font-style:italic">"Can you tell us what happened out there?"</span>';

  var sc = document.getElementById('cs-scene');
  sc.className = 'cs-scene';
  sc.innerHTML =
    '<div class="interrog-room"></div>'+
    '<div class="interrog-lamp"></div>'+
    '<div class="interrog-table"></div>'+
    '<div class="interrog-officer">👮</div>'+
    '<div class="interrog-subject">🧍</div>'+
    '<div class="interrog-line1">"We found the workshop. The vats. All of it."</div>'+
    '<div class="interrog-line2">"We just need to hear it from you."</div>';
  document.getElementById('cutscene').classList.add('active');

  cutsceneCallback = function(){
    doFinalWinScreen(
      'YOU SURVIVED',
      'You told them everything.<br>'+
      'The engineer. The dead soil. The machines fed on blood.<br>'+
      '<span style="color:#ccbbaa">The farm is condemned now. The animatronics are evidence.<br>'+
      'But some nights you still hear the grain shifting in the silo.</span>'
    );
  };
}

function doFinalWinScreen(title, body){
  win = true;
  var ov = document.getElementById('overlay');
  ov.innerHTML = '<h1 style="color:#ccbbaa;font-size:28px;text-shadow:0 0 20px #886644">' + title + '</h1>' +
    '<p>' + body + '</p>' +
    '<button onclick="location.reload()" style="background:#228822;color:#fff;border:none;'+
    'padding:12px 34px;border-radius:8px;font-size:15px;cursor:pointer;'+
    'font-family:Courier New,monospace;letter-spacing:2px;margin-top:12px">PLAY AGAIN</button>';
  ov.style.display = 'flex';
}

var JUMPSCARE_DATA = {
  'COW':          { bg:'#1a0a00', flash:'#ff8800', icon:'🐮', scream:'M O O O O !',   sub:'THE COW HAS YOU' },
  'PIG':          { bg:'#1a0008', flash:'#ff44aa', icon:'🐷', scream:'S Q U E A L !', sub:'THE PIG HAS YOU' },
  'CHICKEN':      { bg:'#1a1400', flash:'#ffee00', icon:'🐔', scream:'B A W K ! ! !', sub:'THE CHICKEN HAS YOU' },
  'FOX':          { bg:'#1a0500', flash:'#ff5500', icon:'🦊', scream:'S N A P ! ! !', sub:'THE FOX HAS YOU' },
  'TURKEY':       { bg:'#1a0c00', flash:'#cc7722', icon:'🦃', scream:'G O B B L E !', sub:'THE TURKEY HAS YOU' },
  'GOAT':         { bg:'#0a1a00', flash:'#88cc00', icon:'🐐', scream:'B L E A T ! !', sub:'THE GOAT HAS YOU' },
  'SHEEP':        { bg:'#0e0e1a', flash:'#ccccff', icon:'🐑', scream:'B A A A A !',   sub:'THE SHEEP HAS YOU' },
  'WOLF':         { bg:'#06001a', flash:'#8866ff', icon:'🐺', scream:'H O W L ! ! !', sub:'THE WOLF HAS YOU' },
  'BUNNY':        { bg:'#1a0014', flash:'#ff88dd', icon:'🐰', scream:'S C R E E E !', sub:'THE BUNNY HAS YOU' },
  'FROG':         { bg:'#001a06', flash:'#00ff66', icon:'🐸', scream:'C R O A K ! !', sub:'THE FROG HAS YOU' },
  'PANDA':        { bg:'#0a0a0a', flash:'#ffffff', icon:'🐼', scream:'R O A R ! ! !', sub:'THE PANDA HAS YOU' },
  'RHINO':        { bg:'#0a0e0a', flash:'#88aa88', icon:'🦏', scream:'C H A R G E !', sub:'THE RHINO HAS YOU' },
  'HORSE':        { bg:'#1a0a00', flash:'#8B5520', icon:'🐴', scream:'N E I G H ! !', sub:'THE HORSE HAS YOU' },
  'FARMER':       { bg:'#1a0000', flash:'#ff0000', icon:'🧑‍🌾', scream:'G O T  Y O U !', sub:'THE FARMER HAS YOU' },
  'PLUSH COW':    { bg:'#001a1a', flash:'#aaddff', icon:'🐮', scream:'H U G ! ! ! !', sub:'THE PLUSH CLAIMS YOU' },
  'PLUSH PIG':    { bg:'#1a001a', flash:'#ffbbdd', icon:'🐷', scream:'S Q Z ! ! ! !', sub:'THE PLUSH CLAIMS YOU' },
  'PLUSH CHKN':   { bg:'#1a1a00', flash:'#ffffaa', icon:'🐔', scream:'P E C K ! ! !', sub:'THE PLUSH CLAIMS YOU' },
  'PLUSH FOX':    { bg:'#1a0800', flash:'#ffcc99', icon:'🦊', scream:'N I P ! ! ! !', sub:'THE PLUSH CLAIMS YOU' },
  'PLUSH TURKEY': { bg:'#1a1000', flash:'#ffe0bb', icon:'🦃', scream:'G O B ! ! ! !', sub:'THE PLUSH CLAIMS YOU' },
  'PLUSH GOAT':   { bg:'#0a1400', flash:'#cceeaa', icon:'🐐', scream:'B L T ! ! ! !', sub:'THE PLUSH CLAIMS YOU' },
  'PLUSH SHEEP':  { bg:'#0e0e1a', flash:'#eeeeff', icon:'🐑', scream:'B A A ! ! ! !', sub:'THE PLUSH CLAIMS YOU' },
  'PLUSH WOLF':   { bg:'#06001a', flash:'#ccccff', icon:'🐺', scream:'H W L ! ! ! !', sub:'THE PLUSH CLAIMS YOU' },
  'PLUSH BUNNY':  { bg:'#1a001a', flash:'#ffd0ee', icon:'🐰', scream:'S Q Z ! ! ! !', sub:'THE PLUSH CLAIMS YOU' },
};

function showJumpscare(killerName, callback){
  var data = JUMPSCARE_DATA[killerName] || JUMPSCARE_DATA['FARMER'];
  var el = document.getElementById('jumpscare');
  el.innerHTML =
    '<div class="js-flash" style="background:' + data.flash + '"></div>' +
    '<div class="js-face">' + data.icon + '</div>' +
    '<div class="js-scream">' + data.scream + '</div>' +
    '<div class="js-sub">' + data.sub + '</div>';
  el.style.background = data.bg;
  el.classList.add('active');
  setTimeout(function(){
    el.classList.remove('active');
    el.innerHTML = '';
    if(callback) callback();
  }, 500);
}

function triggerGameOver(killerName){
  gameOver = true;
  showJumpscare(killerName || 'FARMER', function(){
    showConversionCutscene();
  });
}

function showConversionCutscene(){
  cutscenePlaying = true;
  document.getElementById('cs-title').textContent = 'YOU HAVE BEEN PROCESSED';
  document.getElementById('cs-caption').innerHTML =
    'The animatronics drag you to the Workshop...<br>'+
    'Bolts drilled. Circuits wired. Suit fitted.<br>'+
    '<span style="color:#cc88ff">Your body becomes a vessel for the machine.</span><br>'+
    '<span style="color:#ff5555">You are now one of them — forever.</span>';
  var sc = document.getElementById('cs-scene');
  sc.className = 'cs-scene';
  sc.innerHTML =
    '<div class="conv-bg"></div>'+
    '<div class="conv-table"></div>'+
    '<div class="conv-player">🧑</div>'+
    '<div class="conv-parts">🐮&nbsp;⚙️&nbsp;🐷&nbsp;⚙️&nbsp;🐺</div>'+
    '<div class="conv-bolt1">⚡</div>'+
    '<div class="conv-bolt2">⚡</div>'+
    '<div class="conv-bolt3">⚡</div>'+
    '<div class="conv-bar"><div class="conv-bar-fill"></div></div>'+
    '<div class="conv-label">CONVERSION IN PROGRESS...</div>';
  document.getElementById('cutscene').classList.add('active');
  cutsceneCallback = function(){
    cutscenePlaying = false;
    var ov = document.getElementById('overlay');
    ov.innerHTML =
      '<h1 style="color:#cc44ff;text-shadow:0 0 30px #aa00ff">CONVERTED</h1>'+
      '<p style="color:#cc88ff">You have been built into an animatronic.<br>'+
      'Your eyes glow. You stalk the halls.<br>'+
      '<span style="color:#888">The farm claims another soul.</span></p>'+
      '<p style="font-size:36px;margin:12px 0;text-shadow:0 0 16px #aa00ff">🐮🤖🐷🤖🐺</p>'+
      '<button onclick="location.reload()" style="background:#6622aa;color:#fff;border:none;'+
      'padding:12px 34px;border-radius:8px;font-size:15px;cursor:pointer;'+
      'font-family:Courier New,monospace;letter-spacing:2px;margin-top:12px">TRY AGAIN</button>';
    ov.style.display = 'flex';
  };
}
