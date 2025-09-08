import { World } from "./World";
import { EndPortal } from "./EndPortal";
import type { SelectedActionType } from "./HUD";
import { SPRITE_FRAMES } from "./Animations/NpcSprite";

type Props = {
  x: number;
  y: number;
  width?: number;
  height?: number;
  speed?: number;
};

type NpcOnClickProps = {
  action: SelectedActionType;
  world: World;
};

const npcSprite = new Image();
npcSprite.src = "sprite.png";

export class Npc {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  direction: number;
  vy: number;
  survived = false;

  private health: number;
  private fallStartY: number | null;
  private readonly maxFallSafe = 32 * 3; // 3 Blocks

  state: "inAir" | "walking" | "digging" | "death" | "stopothers" = "inAir";

  private digTimer = 0;
  private readonly digDuration = 1; // seconds

  // --- Animation State ---
  private frameIndex = 0;
  private animationTimer = 0;
  private animationSpeed = 0.15; // seconds per frame

  constructor({ x, y, width = 20, height = 30, speed = 50 }: Props) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speed = speed;
    this.direction = 1;
    this.vy = 0;

    this.health = 100;
    this.fallStartY = null;
  }

  update(dt: number, world: World, portal: EndPortal) {
    this.updateAnimation(dt);
    if (this.survived || ["death", "stopothers"].includes(this.state)) return;

    this.vy += 500 * dt;
    this.y += this.vy * dt;

    if (!["digging", "inAir"].includes(this.state)) {
      this.x += this.speed * this.direction * dt;
    }

    this.checkCollisions(world, dt);

    if (this.state === "digging") {
      this.digTimer += dt;
      if (this.digTimer >= this.digDuration) {
        const blockBelow = world.getTileAtPixel(
          this.x + this.width / 2,
          this.y + this.height + world.tileSize,
        );
        this.performDig(world);
        this.digTimer = 0;
        if (blockBelow === "empty" || blockBelow === "stone") {
          this.state = "inAir";
        }
      }
    }

    this.updateState(world);

    this.checkPortal(portal);
  }

  private updateAnimation(dt: number) {
    const frames = SPRITE_FRAMES[this.state];
    if (!frames || frames.length === 0) return;

    this.animationTimer += dt;
    if (this.animationTimer >= this.animationSpeed) {
      this.animationTimer = 0;

      const shouldLoop = !["death"].includes(this.state);

      if (shouldLoop) {
        this.frameIndex = (this.frameIndex + 1) % frames.length;
      } else {
        if (this.frameIndex < frames.length - 1) {
          this.frameIndex += 1;
        }
      }
    }
  }
  private performDig(world: World) {
    const targetY = this.y + this.height + 1;
    const targetX = this.x + this.width / 2;
    const targetBlock = world.getTileAtPixel(targetX, targetY);
    if (targetBlock === "stone") return;

    world.setTileAtPixel(targetX, targetY, "empty");
  }

  private updateState(world: World) {
    const bottomY = this.y + this.height;
    const leftX = this.x + 1;
    const rightX = this.x + this.width - 1;

    const tileBelowLeft = world.getTileAtPixel(leftX, bottomY);
    const tileBelowRight = world.getTileAtPixel(rightX, bottomY);

    const isSolid = (tile: string | undefined) => tile && tile !== "empty";

    const onGround = isSolid(tileBelowLeft) || isSolid(tileBelowRight);
    if (this.state !== "digging") {
      this.state = onGround ? "walking" : "inAir";
    }
    if (this.state === "inAir" && this.fallStartY === null) {
      this.fallStartY = this.y;
    }
    if (this.state !== "inAir" && this.fallStartY !== null) {
      const distance = this.y - this.fallStartY;
      if (distance > this.maxFallSafe) {
        this.health -= distance;
      }
      this.fallStartY = null;
    }

    if (this.health <= 0) {
      this.state = "death";
    }
  }

  private checkCollisions(world: World, dt: number) {
    const step = 1;
    const bottomY = this.y + this.height;
    const topOffset = 1;
    const bottomOffset = this.height - 1;
    const dir = this.direction;

    const leftX = this.x + 1;
    const rightX = this.x + this.width - 1;
    const tileBelowLeft = world.getTileAtPixel(leftX, bottomY);
    const tileBelowRight = world.getTileAtPixel(rightX, bottomY);
    if (
      (tileBelowLeft && tileBelowLeft !== "empty") ||
      (tileBelowRight && tileBelowRight !== "empty")
    ) {
      const tileY = Math.floor(bottomY / world.tileSize) * world.tileSize;
      this.y = tileY - this.height;
      this.vy = 0;
    }

    const frontX = dir === 1 ? this.x + this.width + 1 : this.x - 1;
    const tileFrontTop = world.getTileAtPixel(frontX, this.y + topOffset);
    const tileFrontBottom = world.getTileAtPixel(frontX, this.y + bottomOffset);

    if (
      (tileFrontTop && tileFrontTop !== "empty") ||
      (tileFrontBottom && tileFrontBottom !== "empty")
    ) {
      let canStep = true;
      if (tileFrontTop === "invisible") {
        canStep = false;
      } else {
        for (let i = 1; i <= step; i++) {
          const tileAboveBottom = world.getTileAtPixel(
            frontX,
            this.y + bottomOffset - i * world.tileSize,
          );
          if (!tileAboveBottom || tileAboveBottom !== "empty") {
            canStep = false;
            break;
          }
        }
      }

      if (canStep) {
        this.y -= step * world.tileSize;
        this.x += this.speed * 2 * this.direction * dt;
      } else {
        this.direction = -dir;
      }
    }
  }

  private checkPortal(portal: EndPortal) {
    if (
      this.x < portal.x + portal.width &&
      this.x + this.width > portal.x &&
      this.y < portal.y + portal.height &&
      this.y + this.height > portal.y
    ) {
      this.survived = true;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    //Hardcoded if its death and last animation img we wont render him
    if (this.state === "death" && this.frameIndex === 8) return;

    const frames = SPRITE_FRAMES[this.state];
    if (frames && frames.length > 0 && npcSprite.complete) {
      const safeIndex = Math.min(this.frameIndex, frames.length - 1);
      const f = frames[safeIndex];

      ctx.save();
      ctx.imageSmoothingEnabled = false;

      if (this.direction === -1) {
        ctx.translate(this.x + this.width / 2, this.y);
        ctx.scale(-1, 1);
        ctx.drawImage(
          npcSprite,
          f.x,
          f.y,
          f.w,
          f.h,
          -this.width / 2,
          0,
          this.width,
          this.height,
        );
      } else {
        ctx.drawImage(
          npcSprite,
          f.x,
          f.y,
          f.w,
          f.h,
          this.x,
          this.y,
          this.width,
          this.height,
        );
      }

      ctx.restore();
    } else {
      ctx.fillStyle = "red";
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    // Draw health above NPC
    if (this.state !== "death" && !this.survived) {
      const text = `${this.health} HP`;
      ctx.font = "12px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";

      const textX = this.x + this.width / 2;
      const textY = this.y - 4;

      ctx.strokeStyle = "black";
      ctx.lineWidth = 3;
      ctx.strokeText(text, textX, textY);

      ctx.fillStyle = "white";
      ctx.fillText(text, textX, textY);
    }
  }

  containsPoint(px: number, py: number): boolean {
    const clickPadding = 20;
    return (
      Math.abs(px - (this.x + this.width / 2)) <=
        this.width / 2 + clickPadding &&
      Math.abs(py - (this.y + this.height / 2)) <=
        this.height / 2 + clickPadding
    );
  }

  centerNpcOnBlock(world: World) {
    const currentBlockX = Math.floor(this.x / world.tileSize);
    this.x = currentBlockX * world.tileSize + (world.tileSize - this.width) / 2;
    const currentBlockY = Math.floor((this.y + this.height) / world.tileSize);
    this.y = currentBlockY * world.tileSize - this.height;
  }

  dig(world: World) {
    if (this.state === "digging") return;
    this.state = "digging";
    this.digTimer = 0;
    this.centerNpcOnBlock(world);
  }

  stopOthers(world: World) {
    if (this.state === "stopothers") return;
    this.state = "stopothers";
    world.setTileAtPixel(this.x, this.y, "invisible");
    this.centerNpcOnBlock(world);
  }

  onClick({ action, world }: NpcOnClickProps) {
    if (this.state !== "walking") return;
    if (action === "dig") this.dig(world);
    if (action === "stopothers") this.stopOthers(world);
  }
}
