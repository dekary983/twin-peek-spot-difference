import { PANEL_H, PANEL_W, PANEL_Y } from './layout.js';

const OUTLINE = 'rgba(38,70,83,0.55)';

function path(ctx, points, fill, stroke = OUTLINE) {
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); }
}

function ellipse(ctx, x, y, rx, ry, fill, stroke = null) {
  ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = fill; ctx.fill();
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); }
}

function paintItem(ctx, item) {
  const { x, y } = item;
  ctx.save();
  switch (item.kind) {
    case 'sun':
      if (item.rays) {
        ctx.strokeStyle = '#ffb703'; ctx.lineWidth = 4;
        for (let i = 0; i < 8; i += 1) {
          const a = i * Math.PI / 4;
          ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * (item.r + 7), y + Math.sin(a) * (item.r + 7));
          ctx.lineTo(x + Math.cos(a) * (item.r + 17), y + Math.sin(a) * (item.r + 17)); ctx.stroke();
        }
      }
      ellipse(ctx, x, y, item.r, item.r, '#ffd93b', OUTLINE); ellipse(ctx, x, y, item.r * .72, item.r * .72, '#ffec8b'); break;
    case 'cloud': {
      const s = item.scale; ctx.fillStyle = item.tint; ctx.beginPath();
      ctx.ellipse(x - 26*s, y+2*s, 23*s, 15*s, 0, 0, Math.PI*2); ctx.ellipse(x, y-7*s, 29*s, 21*s, 0, 0, Math.PI*2); ctx.ellipse(x+27*s, y+2*s, 23*s, 15*s, 0, 0, Math.PI*2); ctx.fill(); break;
    }
    case 'birds':
      for (let i=0;i<item.count;i+=1) { const bx=x-item.spread/2+item.spread*i/Math.max(1,item.count-1), by=y+(i%2)*10, s=item.scale;
        ctx.beginPath(); ctx.moveTo(bx-8*s,by); ctx.quadraticCurveTo(bx-3*s,by-7*s,bx,by); ctx.quadraticCurveTo(bx+4*s,by-7*s,bx+9*s,by); ctx.strokeStyle='#264653'; ctx.lineWidth=2.4*s; ctx.stroke(); } break;
    case 'boat':
      path(ctx, [[x-37,y],[x+37,y],[x+26,y+18],[x-27,y+18]],item.hull);
      ctx.strokeStyle='#6d4c41';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x,y-44);ctx.lineTo(x,y);ctx.stroke();
      path(ctx,item.flipped?[[x,y-41],[x-27,y-5],[x,y-5]]:[[x,y-41],[x+27,y-5],[x,y-5]],item.sail);
      path(ctx,[[x,y-44],[x+11,y-39],[x,y-34]],'#ef476f'); ellipse(ctx,x,y+24,25,3,'rgba(255,255,255,.28)'); break;
    case 'palm': {
      const crownY=y+70-item.height; ctx.beginPath();ctx.moveTo(x,y+70);ctx.quadraticCurveTo(x+item.lean*.55,y+35,x+item.lean,crownY);ctx.strokeStyle='#9c6644';ctx.lineWidth=8;ctx.stroke();
      for(let i=0;i<5;i+=1){const a=-Math.PI*.95+i*Math.PI*.23;ctx.beginPath();ctx.moveTo(x+item.lean,crownY);ctx.quadraticCurveTo(x+item.lean+Math.cos(a)*26,crownY+Math.sin(a)*24,x+item.lean+Math.cos(a)*52,crownY+Math.sin(a)*36);ctx.strokeStyle='#2a9d8f';ctx.lineWidth=5;ctx.stroke();}
      for(let i=0;i<item.coconuts;i+=1)ellipse(ctx,x+item.lean+(i-(item.coconuts-1)/2)*7,crownY+7,5,5,'#8d5524');break;
    }
    case 'stringlights':
      ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+185,y+30,x+370,y+14);ctx.strokeStyle='#6d597a';ctx.lineWidth=2;ctx.stroke();
      for(let i=0;i<item.bulbs;i+=1){const t=i/Math.max(1,item.bulbs-1), bx=x+370*t, by=y+14*t+30*t*(1-t);ctx.beginPath();ctx.moveTo(bx,by);ctx.lineTo(bx,by+6);ctx.stroke();ellipse(ctx,bx,by+11,5.5,5.5,item.colors[i%item.colors.length]);ellipse(ctx,bx-1,by+9,1.5,1.5,'rgba(255,255,255,.8)');}break;
    case 'umbrella':
      ctx.translate(x,y);ctx.rotate((item.tilt||0)*Math.PI/180);ctx.strokeStyle='#8d6e63';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,74);ctx.stroke();ctx.beginPath();ctx.arc(0,0,62,Math.PI,0);ctx.lineTo(62,4);for(let i=3;i>=0;i-=1)ctx.quadraticCurveTo(46-i*24,16,31-i*20,4);ctx.closePath();ctx.fillStyle=item.canopy;ctx.fill();ctx.strokeStyle=OUTLINE;ctx.lineWidth=2;ctx.stroke();path(ctx,[[-7,-56],[0,-66],[7,-56]],item.canopy);break;
    case 'chair':
      ctx.translate(x,y);if(item.flipped)ctx.scale(-1,1);ctx.strokeStyle='#795548';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-15,0);ctx.lineTo(-25,-42);ctx.lineTo(3,-48);ctx.lineTo(15,0);ctx.moveTo(-25,-42);ctx.lineTo(-3,-2);ctx.lineTo(30,-2);ctx.moveTo(-3,-2);ctx.lineTo(-10,24);ctx.moveTo(30,-2);ctx.lineTo(38,22);ctx.stroke();ctx.fillStyle=item.color;ctx.fillRect(-22,-39,21,32);ctx.fillRect(-2,-5,32,9);break;
    case 'table': ellipse(ctx,x,y,46,12,'#fff',OUTLINE);ctx.strokeStyle='#b08968';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(x,y+3);ctx.lineTo(x,y+33);ctx.moveTo(x-16,y+33);ctx.lineTo(x+16,y+33);ctx.stroke();ellipse(ctx,x,y+39,34,5,'rgba(88,68,47,.12)');break;
    case 'cup':
      path(ctx,[[x-10,y-10],[x+10,y-10],[x+8,y+5],[x-8,y+5]],item.color);ctx.beginPath();ctx.arc(x+10,y-3,7,-Math.PI/2,Math.PI/2);ctx.strokeStyle=OUTLINE;ctx.lineWidth=2;ctx.stroke();ellipse(ctx,x,y+8,14,3,'#fff');break;
    case 'book':
      if(item.open){path(ctx,[[x,y-8],[x-15,y-14],[x-15,y+7],[x,y+12]],'#fff');path(ctx,[[x,y-8],[x+15,y-14],[x+15,y+7],[x,y+12]],'#fff');ctx.strokeStyle=item.color;ctx.lineWidth=3;ctx.stroke();}else{ctx.fillStyle=item.color;ctx.fillRect(x-13,y-9,26,18);ctx.fillStyle='rgba(255,255,255,.4)';ctx.fillRect(x-10,y-9,3,18);}break;
    case 'flower':
      path(ctx,[[x-10,y],[x+10,y],[x+7,y+16],[x-7,y+16]],'#c96f4a');ctx.strokeStyle='#478c57';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y-16);ctx.stroke();for(let i=0;i<5;i+=1){const a=i*2*Math.PI/5;ellipse(ctx,x+Math.cos(a)*8,y-21+Math.sin(a)*8,5,5,item.color);}ellipse(ctx,x,y-21,3,3,'#ffd166');break;
    case 'cat':
      ellipse(ctx,x,y,26,16,item.body,OUTLINE);ellipse(ctx,x+20,y-14,13,13,item.body,OUTLINE);path(ctx,[[x+11,y-23],[x+14,y-37],[x+23,y-26]],item.body);path(ctx,[[x+26,y-26],[x+36,y-35],[x+36,y-20]],item.body);
      ctx.strokeStyle=item.body;ctx.lineWidth=4;ctx.beginPath();if(item.tailUp){ctx.moveTo(x-23,y+1);ctx.quadraticCurveTo(x-43,y-20,x-34,y-38);}else{ctx.moveTo(x-22,y+5);ctx.quadraticCurveTo(x-42,y+19,x-47,y+10);}ctx.stroke();ctx.fillStyle='#264653';if(item.asleep){for(const ex of [x+16,x+25]){ctx.beginPath();ctx.arc(ex,y-14,3,0,Math.PI);ctx.stroke();}}else{ellipse(ctx,x+16,y-15,1.5,2,'#264653');ellipse(ctx,x+25,y-15,1.5,2,'#264653');}for(let i=0;i<3;i+=1){ctx.beginPath();ctx.moveTo(x+30,y-10+i*3);ctx.lineTo(x+42,y-13+i*7);ctx.strokeStyle='#555';ctx.lineWidth=1;ctx.stroke();}break;
    case 'beachball':
      ctx.save();ctx.beginPath();ctx.arc(x,y,item.r,0,Math.PI*2);ctx.clip();for(let i=0;i<3;i+=1){ctx.beginPath();ctx.moveTo(x,y);ctx.arc(x,y,item.r,i*2*Math.PI/3,(i+1)*2*Math.PI/3);ctx.closePath();ctx.fillStyle=[item.stripe,'#fff','#ffd166'][i];ctx.fill();}ctx.restore();ctx.beginPath();ctx.arc(x,y,item.r,0,Math.PI*2);ctx.strokeStyle=OUTLINE;ctx.lineWidth=2;ctx.stroke();ellipse(ctx,x-item.r*.35,y-item.r*.4,3,3,'rgba(255,255,255,.8)');break;
    case 'starfish':
      ctx.save();ctx.translate(x,y);ctx.rotate(item.rotation);const pts=[];for(let i=0;i<10;i+=1){const a=-Math.PI/2+i*Math.PI/5,r=i%2?7:16;pts.push([Math.cos(a)*r,Math.sin(a)*r]);}path(ctx,pts,item.color);for(let i=0;i<5;i+=1)ellipse(ctx,Math.cos(-Math.PI/2+i*2*Math.PI/5)*8,Math.sin(-Math.PI/2+i*2*Math.PI/5)*8,1,1,'#fff');ctx.restore();break;
    case 'shell':
      ctx.beginPath();ctx.arc(x,y+7,item.scale*18,Math.PI,0);ctx.lineTo(x+item.scale*18,y+7);ctx.lineTo(x-item.scale*18,y+7);ctx.closePath();ctx.fillStyle='#f7c8d8';ctx.fill();ctx.strokeStyle=OUTLINE;ctx.lineWidth=2;ctx.stroke();for(let i=-2;i<=2;i+=1){ctx.beginPath();ctx.moveTo(x,y+7);ctx.lineTo(x+i*6*item.scale,y-8*item.scale);ctx.stroke();}break;
    case 'sign':
      ctx.strokeStyle='#9c6644';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x-48,y-34);ctx.lineTo(x-48,y-18);ctx.moveTo(x+48,y-34);ctx.lineTo(x+48,y-18);ctx.stroke();ctx.fillStyle=item.bg;ctx.beginPath();ctx.roundRect(x-75,y-20,150,40,6);ctx.fill();ctx.fillStyle=item.fg;ctx.font='bold 19px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(item.text,x,y);break;
    case 'ring':
      ctx.fillStyle='#9c6644';ctx.fillRect(x,y-35,10,64);ellipse(ctx,x+5,y-6,17,17,item.color,OUTLINE);ellipse(ctx,x+5,y-6,8,8,'#f2d69a');ctx.save();ctx.translate(x+5,y-6);ctx.rotate(Math.PI/4);ctx.fillStyle='#fff';for(let i=-1;i<=1;i+=1)ctx.fillRect(i*9-2,-17,4,34);ctx.restore();break;
    case 'kite':
      path(ctx,[[x,y-22],[x+17,y],[x,y+22],[x-17,y]],item.color);ctx.strokeStyle=OUTLINE;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(x,y-22);ctx.lineTo(x,y+22);ctx.moveTo(x-17,y);ctx.lineTo(x+17,y);ctx.stroke();ctx.beginPath();ctx.moveTo(x,y+22);ctx.quadraticCurveTo(x-8,y+38,x+3,y+53);ctx.stroke();for(let i=0;i<item.tail;i+=1){const ty=y+30+i*10;path(ctx,[[x-3,ty],[x+4,ty+4],[x+9,ty],[x+4,ty+7]],i%2?'#ffb703':'#ef476f',null);}break;
    default: break;
  }
  ctx.restore();
}

export function drawBackdrop(ctx) {
  let g=ctx.createLinearGradient(0,0,0,252);g.addColorStop(0,'#a8e6ff');g.addColorStop(1,'#fdf3d8');ctx.fillStyle=g;ctx.fillRect(0,0,PANEL_W,252);
  g=ctx.createLinearGradient(0,168,0,252);g.addColorStop(0,'#43c6e6');g.addColorStop(1,'#1d8fb8');ctx.fillStyle=g;ctx.fillRect(0,168,PANEL_W,84);
  g=ctx.createLinearGradient(0,252,0,420);g.addColorStop(0,'#f7e3ac');g.addColorStop(1,'#eec27f');ctx.fillStyle=g;ctx.fillRect(0,252,PANEL_W,168);
  ctx.save();ctx.globalAlpha=.23;ctx.strokeStyle='#fff';ctx.lineWidth=2;for(let i=0;i<5;i+=1){const yy=181+i*14;ctx.beginPath();ctx.moveTo(28+i*91,yy);ctx.quadraticCurveTo(48+i*91,yy-5,68+i*91,yy);ctx.stroke();}ellipse(ctx,275,228,115,11,'rgba(255,255,255,.18)');ctx.restore();
}

export function drawScene(ctx, scene) { drawBackdrop(ctx); for (const item of scene.items) paintItem(ctx,item); }

export function drawMarker(ctx,x,y,r,pulse) {
  ctx.save();ctx.shadowColor='rgba(255,89,100,.55)';ctx.shadowBlur=14;ctx.beginPath();ctx.arc(x,y,r+6+pulse*2,0,Math.PI*2);ctx.strokeStyle='#ff5964';ctx.lineWidth=5;ctx.stroke();ctx.shadowBlur=0;ctx.beginPath();ctx.arc(x,y,r+1,0,Math.PI*2);ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.stroke();ctx.restore();
}
export function drawMiss(ctx,x,y,age) { ctx.save();ctx.globalAlpha=Math.max(0,1-age);ctx.strokeStyle='#d90429';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(x-12,y-12);ctx.lineTo(x+12,y+12);ctx.moveTo(x+12,y-12);ctx.lineTo(x-12,y+12);ctx.stroke();ctx.restore(); }

export function drawPanelFrame(ctx,px,caption) {
  ctx.save();ctx.shadowColor='rgba(38,70,83,.2)';ctx.shadowBlur=9;ctx.shadowOffsetY=3;ctx.beginPath();ctx.roundRect(px-2,PANEL_Y-2,PANEL_W+4,PANEL_H+4,12);ctx.strokeStyle='#fff';ctx.lineWidth=4;ctx.stroke();ctx.restore();ctx.fillStyle='#264653';ctx.font='bold 15px system-ui';ctx.textAlign='left';ctx.textBaseline='alphabetic';ctx.fillText(caption,px+6,24);
}

export function drawOverlay(ctx,title,lines,prompt) {
  ctx.save();ctx.fillStyle='rgba(38,70,83,.55)';ctx.fillRect(0,0,1180,470);ctx.beginPath();ctx.roundRect(330,115,520,240,18);ctx.fillStyle='#fffaf0';ctx.fill();ctx.strokeStyle='#264653';ctx.lineWidth=3;ctx.stroke();ctx.fillStyle='#264653';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='bold 40px system-ui';ctx.fillText(title,590,158);ctx.font='18px system-ui';lines.forEach((line,i)=>ctx.fillText(line,590,210+i*29));if(prompt){ctx.font='italic 16px system-ui';ctx.fillText(prompt,590,320);}ctx.restore();
}
