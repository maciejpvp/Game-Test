export type Tile = "empty" | "dirt" | "stone";

type Props = {
  width: number;
  height: number;
  blocks: Tile[][];
  tileSize?: number;
};

export class World {
  tiles: Tile[][];
  tileSize: number;

  // Editor mode flag
  static EDITOR = true;

  constructor({ width, height, blocks, tileSize = 32 }: Props) {
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
        let color = "#fff";

        if (tile === "dirt") {
          color = "#8B4513";
        } else if (tile === "stone") {
          color = "#888";
        } else {
          continue; // skip empty
        }

        ctx.fillStyle = color;
        ctx.strokeStyle = color;

        ctx.fillRect(
          x * this.tileSize,
          y * this.tileSize,
          this.tileSize,
          this.tileSize,
        );
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
    console.log(this.tiles);
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
