import { decodeWorld, encodeWorld } from "./Utils/WorldCodec";

export type Tile = "empty" | "dirt" | "stone" | "invisible";

type Props = {
  width: number;
  height: number;
  blocks: string;
  tileSize?: number;
};

export class World {
  tiles: Tile[][];
  tileSize: number;

  // Editor mode flag

  constructor({ width, height, blocks, tileSize = 32 }: Props) {
    this.tileSize = tileSize;

    const tiles = decodeWorld(blocks, width, height);

    this.tiles = tiles;

    //eslint-disable-next-line
    //@ts-expect-error
    document.createEmptyWorld = this.createEmptyWorld.bind(this);
    //eslint-disable-next-line
    //@ts-expect-error
    document.exportCurrentWorld = this.exportCurrentWorld.bind(this);
  }

  draw(ctx: CanvasRenderingContext2D) {
    for (let y = 0; y < this.tiles.length; y++) {
      for (let x = 0; x < this.tiles[y].length; x++) {
        const tile = this.tiles[y][x];
        if (tile === "dirt") {
          ctx.fillStyle = "#8B4513"; // brown dirt
        } else if (tile === "stone") {
          ctx.fillStyle = "#555"; // grey stone
        } else {
          ctx.fillStyle = "#aad3f5"; // light blue empty tile
        }

        ctx.fillRect(
          x * this.tileSize,
          y * this.tileSize,
          this.tileSize,
          this.tileSize,
        );

        if (!["empty", "invisible"].includes(tile)) {
          ctx.strokeStyle = "#000"; // black border for blocks
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

  handleEditorClick(px: number, py: number, block: Tile) {
    this.setTileAtPixel(px, py, "invisible");
  }

  createEmptyWorld(width: number, height: number) {
    const blocks: Tile[][] = Array.from({ length: height }, (_, y) =>
      Array.from({ length: width }, (_, x) => {
        // Stone on borders
        if (y === 0 || y === height - 1 || x === 0 || x === width - 1)
          return "stone";
        return "empty"; // empty inside
      }),
    );

    this.tiles = blocks; // load into world
    return blocks; // also return for console
  }

  exportCurrentWorld() {
    return encodeWorld(this.tiles);
  }

  get width(): number {
    return this.tiles[0].length * this.tileSize;
  }

  get height(): number {
    return this.tiles.length * this.tileSize;
  }
}
