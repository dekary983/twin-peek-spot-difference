const SHOTS = {
  title: { screen: 'title' },
  cover: { screen: 'play', round: 0, seedText: 'twin-peek-cover', foundCount: 2, timeSec: 42, score: 340, mistakes: 1 },
  round2: { screen: 'play', round: 1, seedText: 'twin-peek-round2', foundCount: 3, timeSec: 65, score: 890, mistakes: 2 },
  clear: { screen: 'clear', round: 0, seedText: 'twin-peek-cover', timeSec: 74, score: 520, mistakes: 1 },
};

export function shotState(name) {
  const shot = SHOTS[name];
  return shot ? { ...shot } : null;
}

export const SHOT_NAMES = ['title', 'cover', 'round2', 'clear'];
