/**
 * Color conversion utilities for the design token editor.
 * Handles oklch <-> hex conversions using browser APIs.
 */

export function oklchToHex(oklch: string): string {
  if (typeof document === 'undefined') return '#000000';
  try {
    const el = document.createElement('div');
    el.style.color = oklch;
    el.style.position = 'absolute';
    el.style.visibility = 'hidden';
    document.body.appendChild(el);
    const computed = getComputedStyle(el).color;
    document.body.removeChild(el);
    // computed is rgb(r, g, b)
    const match = computed.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (!match) return '#000000';
    const r = parseInt(match[1]).toString(16).padStart(2, '0');
    const g = parseInt(match[2]).toString(16).padStart(2, '0');
    const b = parseInt(match[3]).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  } catch {
    return '#000000';
  }
}

export function hexToOklch(hex: string): string {
  // Store hex directly - CSS supports hex values in custom properties
  return hex;
}

/**
 * Resolve a CSS variable value to hex color
 */
export function resolveColorToHex(value: string): string {
  if (typeof document === 'undefined') return '#000000';
  // If it's already a hex value, return it
  if (value.startsWith('#')) return value;
  // If it's an oklch value, convert it
  if (value.startsWith('oklch')) return oklchToHex(value);
  // If it's a CSS variable reference like var(--brand-600), resolve it
  if (value.startsWith('var(')) {
    const varName = value.match(/var\(([^)]+)\)/)?.[1];
    if (varName) {
      const resolved = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
      return resolveColorToHex(resolved);
    }
  }
  // Try to resolve as-is
  return oklchToHex(value);
}
