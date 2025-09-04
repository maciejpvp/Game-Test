import type { Tile } from "../World";

const TILE_CODE: Record<Tile, number> = { empty: 0, dirt: 1, stone: 2 };
const TILE_MAP: Record<number, Tile> = { 0: "empty", 1: "dirt", 2: "stone" };

/**
 * Encode Tile[][] into shortest string (Base64 packed).
 */
export function encodeWorld(tiles: Tile[][]): string {
  // Flatten to "012..."
  const flat: number[] = tiles.flat().map((t) => TILE_CODE[t]);
  const bytes: number[] = [];

  // Pack 4 tiles into 1 byte (2 bits each)
  for (let i = 0; i < flat.length; i += 4) {
    let byte = 0;
    for (let j = 0; j < 4; j++) {
      const val = flat[i + j] ?? 0;
      byte |= val << (j * 2);
    }
    bytes.push(byte);
  }

  return btoa(String.fromCharCode(...bytes));
}

/**
 * Decode shortest string (Base64 packed) back to Tile[][].
 */
export function decodeWorld(
  data: string,
  width: number,
  height: number,
): Tile[][] {
  const bytes = atob(data)
    .split("")
    .map((c) => c.charCodeAt(0));
  const flat: Tile[] = [];

  for (const byte of bytes) {
    for (let j = 0; j < 4; j++) {
      const val = (byte >> (j * 2)) & 3;
      flat.push(TILE_MAP[val]);
      if (flat.length >= width * height) break;
    }
  }

  // Rebuild 2D array
  const tiles: Tile[][] = [];
  for (let y = 0; y < height; y++) {
    tiles.push(flat.slice(y * width, (y + 1) * width));
  }
  return tiles;
}
