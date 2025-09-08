type Frame = { x: number; y: number; w: number; h: number };
type AnimationFrames = Record<string, Frame[]>;

export const SPRITE_FRAMES: AnimationFrames = {
  walking: [
    { x: 16, y: 26, w: 8, h: 8 },
    { x: 26, y: 26, w: 8, h: 8 },
    { x: 36, y: 26, w: 8, h: 8 },
  ],
  digging: [
    {
      x: 16,
      y: 56,
      w: 8,
      h: 8,
    },
    {
      x: 26,
      y: 56,
      w: 8,
      h: 8,
    },
    {
      x: 36,
      y: 56,
      w: 8,
      h: 8,
    },
    {
      x: 46,
      y: 56,
      w: 8,
      h: 8,
    },
    {
      x: 56,
      y: 56,
      w: 8,
      h: 8,
    },
    {
      x: 66,
      y: 56,
      w: 8,
      h: 8,
    },
    {
      x: 76,
      y: 56,
      w: 8,
      h: 8,
    },
    {
      x: 86,
      y: 56,
      w: 8,
      h: 8,
    },
    {
      x: 96,
      y: 56,
      w: 8,
      h: 8,
    },
    {
      x: 106,
      y: 56,
      w: 8,
      h: 8,
    },
  ],
  inAir: [
    {
      x: 16,
      y: 16,
      w: 8,
      h: 8,
    },
    {
      x: 36,
      y: 16,
      w: 8,
      h: 8,
    },
    {
      x: 16,
      y: 16,
      w: 8,
      h: 8,
    },

    {
      x: 126,
      y: 16,
      w: 8,
      h: 8,
    },
  ],
  death: [
    {
      x: 16,
      y: 114,
      w: 8,
      h: 16,
    },
    {
      x: 26,
      y: 114,
      w: 8,
      h: 16,
    },
    {
      x: 36,
      y: 114,
      w: 8,
      h: 16,
    },
    {
      x: 46,
      y: 114,
      w: 8,
      h: 16,
    },
    {
      x: 56,
      y: 114,
      w: 8,
      h: 16,
    },
    {
      x: 66,
      y: 114,
      w: 8,
      h: 16,
    },
    {
      x: 76,
      y: 114,
      w: 8,
      h: 16,
    },
    {
      x: 86,
      y: 114,
      w: 8,
      h: 16,
    },
    {
      x: 96,
      y: 114,
      w: 8,
      h: 16,
    },
  ],
};
