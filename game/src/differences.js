import { itemAnchor, VIEW } from './scenes.js';

export const MUTATIONS = ['remove', 'recolor', 'resize', 'flip', 'move', 'toggle', 'count'];

const COLORS = ['#e4572e', '#2a9d8f', '#4361ee', '#ef476f', '#ffd166', '#06d6a0', '#8d99ae', '#c77dff'];
const RECOLOR_FIELD = { boat: 'hull', cloud: 'tint', umbrella: 'canopy', chair: 'color', cup: 'color', book: 'color', flower: 'color', cat: 'body', beachball: 'stripe', starfish: 'color', kite: 'color', ring: 'color' };
const RESIZABLE = new Set(['sun', 'cloud', 'beachball', 'starfish', 'shell', 'kite']);
const FLIPPABLE = new Set(['boat', 'chair', 'cat', 'birds']);
const TOGGLABLE = new Set(['sun', 'book', 'cat', 'flower', 'sign', 'umbrella']);
const COUNTABLE = new Set(['birds', 'palm', 'stringlights', 'kite']);

function supported(item) {
  return ['remove', 'move'].concat(RECOLOR_FIELD[item.kind] ? ['recolor'] : [], RESIZABLE.has(item.kind) ? ['resize'] : [], FLIPPABLE.has(item.kind) ? ['flip'] : [], TOGGLABLE.has(item.kind) ? ['toggle'] : [], COUNTABLE.has(item.kind) ? ['count'] : []);
}

function mutate(item, mutation, rng, subtle) {
  const before = JSON.stringify(item);
  switch (mutation) {
    case 'remove': item._removed = true; break;
    case 'recolor': {
      const field = RECOLOR_FIELD[item.kind];
      if (!field) return false;
      const options = COLORS.filter((color) => color !== item[field]);
      if (!options.length) return false;
      item[field] = rng.pick(options);
      break;
    }
    case 'resize': {
      const factor = subtle ? rng.pick([0.85, 1.18]) : rng.pick([0.72, 1.32]);
      if (item.kind === 'sun' || item.kind === 'beachball') item.r *= factor;
      else if (item.scale !== undefined) item.scale *= factor;
      else if (item.kind === 'starfish') item.size = factor;
      break;
    }
    case 'flip':
      if (item.kind === 'cat') item.tailUp = !item.tailUp;
      else item.flipped = !item.flipped;
      break;
    case 'move': {
      const limit = subtle ? 18 : 34;
      const dx = rng.range(-limit, limit), dy = rng.range(-limit, limit);
      item.x = Math.max(30, Math.min(VIEW.width - 30, item.x + dx));
      item.y = Math.max(30, Math.min(VIEW.height - 30, item.y + dy));
      if (item.x === Number(item._oldX) && item.y === Number(item._oldY)) item.x = Math.min(VIEW.width - 30, item.x + 1);
      break;
    }
    case 'toggle':
      if (item.kind === 'sun') item.rays = !item.rays;
      else if (item.kind === 'book') item.open = !item.open;
      else if (item.kind === 'cat') item.asleep = !item.asleep;
      else if (item.kind === 'flower') item.bent = !item.bent;
      else if (item.kind === 'sign') [item.fg, item.bg] = [item.bg, item.fg];
      else if (item.kind === 'umbrella') item.tilt = item.tilt === 0 ? 1 : -item.tilt;
      break;
    case 'count':
      if (item.kind === 'birds') item.count = item.count >= 5 ? item.count - 1 : item.count + 1;
      else if (item.kind === 'palm') item.coconuts = item.coconuts >= 3 ? item.coconuts - 1 : item.coconuts + 1;
      else if (item.kind === 'stringlights') item.bulbs = item.bulbs >= 11 ? item.bulbs - 2 : item.bulbs + 2;
      else if (item.kind === 'kite') item.tail = item.tail >= 7 ? item.tail - 2 : item.tail + 2;
      break;
    default: return false;
  }
  return before !== JSON.stringify(item);
}

function applyChange(item, mutation, rng, subtle) {
  const copy = structuredClone(item);
  if (mutation === 'remove') return { copy, ok: true };
  if (mutation === 'move') {
    const limit = subtle ? 18 : 34;
    const dx = rng.range(-limit, limit), dy = rng.range(-limit, limit);
    copy.x = Math.max(30, Math.min(VIEW.width - 30, copy.x + dx));
    copy.y = Math.max(30, Math.min(VIEW.height - 30, copy.y + dy));
    if (copy.x === item.x && copy.y === item.y) copy.x = Math.min(VIEW.width - 30, copy.x + 1);
    return { copy, ok: JSON.stringify(copy) !== JSON.stringify(item) };
  }
  return { copy, ok: mutate(copy, mutation, rng, subtle) };
}

export function makeDifferences(scene, rng, count, subtle = false) {
  const twin = structuredClone(scene);
  const eligible = twin.items.map((item, itemIndex) => ({ item, itemIndex })).filter(({ item }) => supported(item).length);
  rng.shuffle(eligible);
  const selected = eligible.slice(0, Math.min(count, eligible.length));
  const diffs = [];
  for (const { item, itemIndex } of selected) {
    const original = scene.items[itemIndex];
    const choices = rng.shuffle(supported(item).slice());
    let mutation, changed;
    for (const candidate of choices) {
      const attempt = applyChange(item, candidate, rng, subtle);
      if (attempt.ok) { mutation = candidate; changed = attempt.copy; break; }
    }
    if (!mutation) {
      const fallback = applyChange(item, 'move', rng, subtle);
      mutation = 'move'; changed = fallback.copy;
    }
    const anchor = itemAnchor(original);
    let x = anchor.x, y = anchor.y;
    if (mutation === 'move') {
      const movedAnchor = itemAnchor(changed);
      x = (anchor.x + movedAnchor.x) / 2;
      y = (anchor.y + movedAnchor.y) / 2;
    }
    twin.items[itemIndex] = changed;
    diffs.push({ id: `diff-${itemIndex}`, itemIndex, kind: item.kind, mutation, x, y, r: anchor.r, found: false });
  }
  twin.items = twin.items.filter((item) => !item._removed);
  return { twin, diffs };
}

export function describeMutation(diff) {
  const subject = ({ birds: 'birds', stringlights: 'string lights', beachball: 'beach ball', starfish: 'starfish', shell: 'shell', cat: 'cat', boat: 'boat', palm: 'palm tree', chair: 'chair', cup: 'cup', book: 'book', flower: 'flower', umbrella: 'umbrella', sun: 'sun', cloud: 'cloud', table: 'table', sign: 'sign', ring: 'lifebuoy', kite: 'kite' })[diff.kind] ?? diff.kind;
  const action = ({ remove: 'is missing', recolor: 'changed colour', resize: 'changed size', flip: 'is flipped', move: 'moved', toggle: 'changed', count: 'has a different count' })[diff.mutation] ?? 'changed';
  return `the ${subject} ${action}`;
}
