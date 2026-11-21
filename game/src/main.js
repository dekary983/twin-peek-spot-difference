import { Rng, hashSeed } from './random.js';
import { buildScene } from './scenes.js';
import { makeDifferences } from './differences.js';
import { drawScene, drawMarker, drawMiss, drawPanelFrame, drawOverlay } from './render.js';
import { PANEL_X, PANEL_Y, PANEL_W, PANEL_H, locate } from './layout.js';
import { Sfx } from './audio.js';
import { shotState } from './shots.js';

const ROUNDS = [{ diffs: 5, subtle: false }, { diffs: 7, subtle: false }, { diffs: 9, subtle: true }];
const HIT_MIN = 24;
const canvas = document.getElementById('stage');
const ctx = canvas.getContext('2d');
const hud = Object.fromEntries(['left','round','score','time','mistakes'].map((key)=>[key,document.getElementById(`hud-${key}`)]));
const hintButton = document.getElementById('btn-hint');
const restartButton = document.getElementById('btn-restart');
const soundButton = document.getElementById('btn-sound');
const sfx = new Sfx();
const state = { screen:'title', round:0, scene:null, twin:null, diffs:[], found:0, score:0, mistakes:0, startStamp:0, penaltySec:0, frozen:false, hintDiff:null, hintUntil:0, hintsUsed:0, misses:[], runSeed:'' };
let shotTime = 0;

function now() { return performance.now(); }
function elapsed() { return state.frozen ? shotTime : Math.max(0,(now()-state.startStamp)/1000)+state.penaltySec; }
function makeNewScene(seedText) {
  state.runSeed=seedText;
  const rng=new Rng(hashSeed(seedText));
  state.scene=buildScene(rng);
  const result=makeDifferences(state.scene,rng,ROUNDS[state.round].diffs,ROUNDS[state.round].subtle);
  state.twin=result.twin;state.diffs=result.diffs;state.found=0;state.hintDiff=null;state.hintUntil=0;state.hintsUsed=0;
}

function startRound() {
  state.screen='play';state.mistakes=0;state.penaltySec=0;state.startStamp=now();
  makeNewScene(`twin-peek-${Date.now()}-round-${state.round}`);
}
function startGame() { state.score=0;state.round=0;startRound(); }

function findAt(point) {
  let closest=null, best=Infinity;
  for(const diff of state.diffs){if(diff.found)continue;const d=Math.hypot(point.sx-diff.x,point.sy-diff.y);if(d<=Math.max(diff.r,HIT_MIN)&&d<best){closest=diff;best=d;}}
  if(closest){closest.found=true;state.found+=1;state.score+=100;sfx.find();if(state.found===state.diffs.length){const bonus=Math.max(0,300-Math.floor(elapsed())*2);state.score+=bonus;if(state.round===ROUNDS.length-1){state.screen='complete';sfx.complete();}else{state.screen='clear';sfx.clear();}}return;}
  state.mistakes+=1;state.penaltySec+=3;state.misses.push({x:point.sx,y:point.sy,panel:point.panel,stamp:now()});sfx.miss();
}

function hint() {
  if(state.screen!=='play'||state.hintsUsed>=2)return;
  const diff=state.diffs.find((entry)=>!entry.found);if(!diff)return;
  state.hintsUsed+=1;state.hintDiff=diff;state.hintUntil=now()+1500;state.score=Math.max(0,state.score-25);sfx.tone(660,.09,'triangle',.07);
}

function advance() { if(state.round<ROUNDS.length-1){state.round+=1;startRound();}else startGame(); }
function restart() { if(state.screen==='play')startRound(); }
function toggleSound() { const enabled=sfx.toggle();soundButton.textContent=`Sound: ${enabled?'on':'off'}`; }

function formatTime(seconds) { const n=Math.floor(seconds);return `${String(Math.floor(n/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`; }
function updateHud() {
  if(!state.diffs.length){hud.left.textContent='Differences left: 0 of 0';}else hud.left.textContent=`Differences left: ${state.diffs.length-state.found} of ${state.diffs.length}`;
  hud.round.textContent=`Round ${state.round+1} of 3`;hud.score.textContent=`Score ${state.score}`;hud.time.textContent=`Time ${formatTime(elapsed())}`;hud.mistakes.textContent=`Mistakes ${state.mistakes}`;
}

function drawFrame(time) {
  ctx.fillStyle='#f7ead9';ctx.fillRect(0,0,canvas.width,canvas.height);
  if(state.scene){
    for(let i=0;i<2;i+=1){ctx.save();ctx.translate(PANEL_X[i],PANEL_Y);ctx.beginPath();ctx.rect(0,0,PANEL_W,PANEL_H);ctx.clip();drawScene(ctx,i===0?state.scene:state.twin);ctx.restore();drawPanelFrame(ctx,PANEL_X[i],i===0?'ORIGINAL':'TWIN');}
    const pulse=state.frozen?0:(Math.sin(time/300)+1)/4;
    for(const diff of state.diffs){if(diff.found){for(let i=0;i<2;i+=1){ctx.save();ctx.translate(PANEL_X[i],PANEL_Y);drawMarker(ctx,diff.x,diff.y,diff.r,pulse);ctx.restore();}}}
    if(state.hintDiff&&state.hintUntil>now())for(let i=0;i<2;i+=1){ctx.save();ctx.translate(PANEL_X[i],PANEL_Y);ctx.beginPath();ctx.arc(state.hintDiff.x,state.hintDiff.y,state.hintDiff.r+10+(1-(state.hintUntil-now())/1500)*9,0,Math.PI*2);ctx.strokeStyle='#ffb703';ctx.lineWidth=4;ctx.stroke();ctx.restore();}
    state.misses=state.misses.filter((miss)=>time-miss.stamp<600);
    for(const miss of state.misses){ctx.save();ctx.translate(PANEL_X[miss.panel],PANEL_Y);drawMiss(ctx,miss.x,miss.y,(time-miss.stamp)/600);ctx.restore();}
  }
  updateHud();
  if(state.screen==='title')drawOverlay(ctx,'TWIN PEEK',['Spot the difference between the twin pictures.','Click a difference in either picture. Wrong clicks add 3 seconds.','Three rounds: 5, then 7, then 9 differences.'],'Click anywhere to start');
  else if(state.screen==='clear')drawOverlay(ctx,`ROUND ${state.round+1} CLEAR!`,[`Time ${formatTime(elapsed())}`,`Mistakes ${state.mistakes}`,`Score ${state.score}`],state.round===ROUNDS.length-1?'':'Press N or click for the next round');
  else if(state.screen==='complete')drawOverlay(ctx,'YOU FOUND THEM ALL!',[`Final score ${state.score}`],'Click to play again');
  requestAnimationFrame(drawFrame);
}

canvas.addEventListener('click',(event)=>{
  if(state.frozen)return;
  if(state.screen==='title'){startGame();return;}
  if(state.screen==='play'){const point=locate(canvas,event);if(point)findAt(point);return;}
  if(state.screen==='clear')advance();else if(state.screen==='complete')startGame();
});
window.addEventListener('keydown',(event)=>{const key=event.key.toLowerCase();if(key==='h')hint();if(key==='r')restart();if(key==='m')toggleSound();if(key==='n'&&state.screen==='clear')advance();});
hintButton.addEventListener('click',hint);restartButton.addEventListener('click',restart);soundButton.addEventListener('click',toggleSound);

const shot=shotState(new URLSearchParams(location.search).get('shot'));
if(shot){
  state.frozen=true;state.screen=shot.screen;
  if(shot.screen!=='title'){
    state.round=shot.round;state.score=shot.score;state.mistakes=shot.mistakes;shotTime=shot.timeSec;
    makeNewScene(shot.seedText);
    const foundCount=shot.screen==='clear'?state.diffs.length:shot.foundCount;
    for(let i=0;i<foundCount;i+=1)state.diffs[i].found=true;
    state.found=foundCount;
  }
}
requestAnimationFrame(drawFrame);
