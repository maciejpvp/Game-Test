export class EndPortal {
  x: number;
  y: number;
  width: number;
  height: number;

  constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  // Axis-aligned rectangle intersection
  intersectsRect(ax: number, ay: number, aw: number, ah: number): boolean {
    return !(
      ax + aw < this.x ||
      ax > this.x + this.width ||
      ay + ah < this.y ||
      ay > this.y + this.height
    );
  }

  draw(ctx: CanvasRenderingContext2D) {
    const g = ctx.createLinearGradient(
      this.x,
      this.y,
      this.x,
      this.y + this.height,
    );
    ctx.fillStyle = "#5600bb";
    ctx.fillRect(this.x, this.y, this.width, this.height);

    ctx.lineWidth = 2;
    ctx.strokeStyle = "#fff";
    ctx.strokeRect(this.x, this.y, this.width, this.height);
  }
}
