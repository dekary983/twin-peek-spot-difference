export const PANEL_W = 560;
export const PANEL_H = 420;
export const PANEL_Y = 35;
export const PANEL_X = [20, 600];

// Convert browser client coordinates into the canvas's intrinsic coordinates.
export function canvasPoint(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) * (canvas.width / rect.width),
    y: (event.clientY - rect.top) * (canvas.height / rect.height),
  };
}

// Return a scene-local point only when the click lands inside either picture.
export function locate(canvas, event) {
  const point = canvasPoint(canvas, event);
  for (let panel = 0; panel < PANEL_X.length; panel += 1) {
    const sx = point.x - PANEL_X[panel];
    const sy = point.y - PANEL_Y;
    if (sx >= 0 && sx <= PANEL_W && sy >= 0 && sy <= PANEL_H) {
      return { panel, sx, sy };
    }
  }
  return null;
}
