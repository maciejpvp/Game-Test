export type Tile = "empty" | "dirt" | "stone";

export class World {
  tiles: Tile[][];
  tileSize: number;

  // Editor mode flag
  static EDITOR = false;

  constructor(width: number, height: number, tileSize = 12) {
    this.tileSize = tileSize;

    // Generate simple ground
    this.tiles = Array.from({ length: height }, (_, y) =>
      Array.from({ length: width }, (_, x) => {
        // Stone border
        if (x === 0 || x === width - 1 || y === 0 || y === height - 1)
          return "stone";

        // Two layers of dirt at the bottom
        if (y >= height - 4) return "dirt";

        // Empty space
        return "empty";
      }),
    );
  }

  draw(ctx: CanvasRenderingContext2D) {
    for (let y = 0; y < this.tiles.length; y++) {
      for (let x = 0; x < this.tiles[y].length; x++) {
        const tile = this.tiles[y][x];
        if (tile === "dirt") {
          ctx.fillStyle = "#8B4513";
        } else if (tile === "stone") {
          ctx.fillStyle = "#888";
        } else {
          continue; // skip empty
        }

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

  handleEditorClick(px: number, py: number, leftShift: boolean) {
    if (!World.EDITOR) return;
    if (leftShift) {
      this.setTileAtPixel(px, py, "dirt"); // place block
    } else {
      this.setTileAtPixel(px, py, "empty"); // remove block
    }
  }

  get width(): number {
    return this.tiles[0].length * this.tileSize;
  }

  get height(): number {
    return this.tiles.length * this.tileSize;
  }
}
