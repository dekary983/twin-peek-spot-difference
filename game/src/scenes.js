export const VIEW = { width: 560, height: 420 };

const LIGHT_COLORS = ['#ffd166', '#ef476f', '#06d6a0', '#118ab2', '#f78c6b'];

// Items are ordered back to front so a renderer can paint them in sequence.
export function buildScene(rng) {
  const items = [
    { kind: 'sun', x: 70, y: 62, r: 30, rays: true },
  ];
  for (let i = 0; i < 3; i++) items.push({ kind: 'cloud', x: rng.range(150, 480), y: rng.range(30, 90), scale: rng.range(0.7, 1.3), tint: rng.pick(['#ffffff', '#ffeef5', '#e8f4ff']) });
  items.push(
    { kind: 'birds', count: rng.int(3, 5), x: 300, y: 70, spread: 90, scale: 0.9 },
    { kind: 'boat', x: rng.range(330, 420), y: 212, hull: rng.pick(['#e4572e', '#2a9d8f', '#4361ee']), sail: '#fff7e6', flipped: rng.chance(0.5) },
    { kind: 'palm', x: 492, y: 262, height: rng.range(120, 140), lean: rng.range(-8, 8), coconuts: rng.int(1, 3) },
    { kind: 'stringlights', x: 30, y: 96, bulbs: 9, colors: Array.from({ length: 9 }, (_, i) => LIGHT_COLORS[i % LIGHT_COLORS.length]) },
    { kind: 'umbrella', x: 150, y: 250, canopy: rng.pick(['#ef476f', '#118ab2', '#f4a261']), tilt: rng.range(-6, 6) },
    { kind: 'chair', x: 96, y: 318, color: '#2a9d8f', flipped: false },
    { kind: 'chair', x: 212, y: 318, color: '#e9c46a', flipped: true },
    { kind: 'table', x: 150, y: 330 },
    { kind: 'cup', x: 132, y: 308, color: rng.pick(['#118ab2', '#ef476f', '#06d6a0']) },
    { kind: 'book', x: 172, y: 312, color: rng.pick(['#4361ee', '#e4572e']), open: true },
    { kind: 'flower', x: 150, y: 300, color: rng.pick(['#ef476f', '#ffd166', '#c77dff']) },
    { kind: 'cat', x: 452, y: 352, body: rng.pick(['#f4a261', '#8d99ae', '#e9c46a']), tailUp: rng.chance(0.6), asleep: rng.chance(0.4) },
    { kind: 'beachball', x: 330, y: 368, r: 20, stripe: rng.pick(['#ef476f', '#118ab2', '#06d6a0']) },
    { kind: 'starfish', x: 262, y: 386, color: '#f78c6b', rotation: rng.range(0, 6.28) },
  );
  for (let i = 0; i < 2; i++) items.push({ kind: 'shell', x: rng.range(40, 520), y: rng.range(380, 400), scale: rng.range(0.8, 1.2) });
  items.push(
    { kind: 'sign', x: 330, y: 136, text: 'TWIN PEEK', bg: '#264653', fg: '#ffd166' },
    { kind: 'ring', x: 36, y: 210, color: '#e4572e' },
    { kind: 'kite', x: 520, y: 60, color: rng.pick(['#ffd166', '#06d6a0', '#ef476f']), tail: 5 },
  );
  return { items };
}

export function itemAnchor(item) {
  const radius = {
    sun: item.r + 8,
    cloud: item.scale * 46,
    birds: 46,
    boat: 46,
    palm: 52,
    stringlights: 42,
    umbrella: 54,
    chair: 30,
    table: 44,
    cup: 16,
    book: 18,
    flower: 16,
    cat: 36,
    beachball: item.r + 6,
    starfish: 20,
    shell: 16 * item.scale,
    sign: 44,
    ring: 24,
    kite: 26,
  }[item.kind] ?? 24;
  if (item.kind === 'stringlights') return { x: item.x + 180, y: item.y, r: radius };
  return { x: item.x, y: item.y, r: radius };
}
