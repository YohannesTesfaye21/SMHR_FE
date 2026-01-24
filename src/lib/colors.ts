/**
 * Generate a consistent color from a string (e.g. facility type name).
 * Used by the map and dashboard so facility types share the same colors.
 */
function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = str.charCodeAt(i) + ((h << 5) - h);
  }
  return h;
}

export function stringToColor(str: string): string {
  const h = hash(str);
  const hue = Math.abs(h % 360);
  const saturation = 65 + (Math.abs(h) % 20);
  const lightness = 45 + (Math.abs(h >> 8) % 15);
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

/** Light tint for card backgrounds, same hue as stringToColor. */
export function stringToColorLight(str: string): string {
  const h = hash(str);
  const hue = Math.abs(h % 360);
  return `hsl(${hue}, 35%, 95%)`;
}
