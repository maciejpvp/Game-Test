export type Tile = "empty" | "dirt" | "stone";

export class World {
  tiles: Tile[][];
  tileSize: number;

  constructor(width: number, height: number, tileSize = 32) {
    this.tileSize = tileSize;

    // Generate simple ground
    this.tiles = Array.from({ length: height }, (_, y) =>
      Array.from({ length: width }, () => (y > height / 2 ? "dirt" : "empty")),
    );
  }

  draw(ctx: CanvasRenderingContext2D) {
    for (let y = 0; y < this.tiles.length; y++) {
      for (let x = 0; x < this.tiles[y].length; x++) {
        if (this.tiles[y][x] === "dirt") {
          ctx.fillStyle = "#8B4513";
          ctx.fillRect(
            x * this.tileSize,
            y * this.tileSize,
            this.tileSize,
            this.tileSize,
          );
          ctx.strokeStyle = "#000";
          ctx.strokeRect(
            x * this.tileSize,
            y * this.tileSize,
            this.tileSize,
            this.tileSize,
          );
        }
      }
    }
  }

  getTileAtPixel(x: number, y: number): Tile | undefined {
    const tx = Math.floor(x / this.tileSize);
    const ty = Math.floor(y / this.tileSize);
    return this.tiles[ty]?.[tx];
  }

  setTileAtPixel(x: number, y: number, value: Tile) {
    const tx = Math.floor(x / this.tileSize);
    const ty = Math.floor(y / this.tileSize);
    if (this.tiles[ty] && this.tiles[ty][tx] !== undefined) {
      this.tiles[ty][tx] = value;
    }
  }

  get width(): number {
    return this.tiles[0].length * this.tileSize;
  }

  get height(): number {
    return this.tiles.length * this.tileSize;
  }
}
