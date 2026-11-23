import type {
  PatchClue,
  PatchRect,
  PatchShape,
  PatchesDifficulty,
  PatchesPuzzle,
} from "./types";

interface RawClue {
  row: number;
  col: number;
  shape: PatchShape;
  area: number | null;
  colorIndex: number;
  solution: PatchRect;
}

interface RawPatchesPreset {
  key: string;
  size: number;
  clues: RawClue[];
}

export const PATCHES_PRESET_BANK: Record<PatchesDifficulty, RawPatchesPreset[]> = {
  easy: [
    {
      key: "easy-1",
      size: 6,
      clues: [
        { row: 0, col: 0, shape: "square", area: 4, colorIndex: 0, solution: { r1: 0, c1: 0, r2: 1, c2: 1 } },
        { row: 0, col: 4, shape: "any", area: 4, colorIndex: 1, solution: { r1: 0, c1: 2, r2: 0, c2: 5 } },
        { row: 1, col: 3, shape: "any", area: 6, colorIndex: 2, solution: { r1: 1, c1: 2, r2: 2, c2: 4 } },
        { row: 2, col: 5, shape: "any", area: 3, colorIndex: 3, solution: { r1: 1, c1: 5, r2: 3, c2: 5 } },
        { row: 3, col: 0, shape: "any", area: 6, colorIndex: 4, solution: { r1: 2, c1: 0, r2: 4, c2: 1 } },
        { row: 3, col: 4, shape: "any", area: 6, colorIndex: 5, solution: { r1: 3, c1: 2, r2: 4, c2: 4 } },
        { row: 5, col: 1, shape: "horizontal", area: 3, colorIndex: 6, solution: { r1: 5, c1: 0, r2: 5, c2: 2 } },
        { row: 5, col: 3, shape: "any", area: 2, colorIndex: 7, solution: { r1: 5, c1: 3, r2: 5, c2: 4 } },
        { row: 5, col: 5, shape: "vertical", area: 2, colorIndex: 8, solution: { r1: 4, c1: 5, r2: 5, c2: 5 } },
      ],
    },
    {
      key: "easy-2",
      size: 6,
      clues: [
        { row: 1, col: 0, shape: "any", area: 6, colorIndex: 0, solution: { r1: 0, c1: 0, r2: 2, c2: 1 } },
        { row: 0, col: 3, shape: "horizontal", area: 6, colorIndex: 1, solution: { r1: 0, c1: 2, r2: 1, c2: 4 } },
        { row: 1, col: 5, shape: "vertical", area: 3, colorIndex: 2, solution: { r1: 0, c1: 5, r2: 2, c2: 5 } },
        { row: 2, col: 2, shape: "square", area: 4, colorIndex: 3, solution: { r1: 2, c1: 2, r2: 3, c2: 3 } },
        { row: 4, col: 4, shape: "any", area: 4, colorIndex: 4, solution: { r1: 2, c1: 4, r2: 5, c2: 4 } },
        { row: 4, col: 1, shape: "any", area: 6, colorIndex: 5, solution: { r1: 3, c1: 0, r2: 5, c2: 1 } },
        { row: 5, col: 2, shape: "square", area: 4, colorIndex: 6, solution: { r1: 4, c1: 2, r2: 5, c2: 3 } },
        { row: 4, col: 5, shape: "any", area: 3, colorIndex: 7, solution: { r1: 3, c1: 5, r2: 5, c2: 5 } },
      ],
    },
    {
      key: "easy-3",
      size: 6,
      clues: [
        { row: 0, col: 1, shape: "any", area: 3, colorIndex: 0, solution: { r1: 0, c1: 0, r2: 0, c2: 2 } },
        { row: 1, col: 4, shape: "square", area: 9, colorIndex: 1, solution: { r1: 0, c1: 3, r2: 2, c2: 5 } },
        { row: 2, col: 1, shape: "any", area: 6, colorIndex: 2, solution: { r1: 1, c1: 0, r2: 2, c2: 2 } },
        { row: 4, col: 0, shape: "vertical", area: 6, colorIndex: 3, solution: { r1: 3, c1: 0, r2: 5, c2: 1 } },
        { row: 3, col: 3, shape: "any", area: 4, colorIndex: 4, solution: { r1: 3, c1: 2, r2: 4, c2: 3 } },
        { row: 4, col: 5, shape: "any", area: 4, colorIndex: 5, solution: { r1: 3, c1: 4, r2: 4, c2: 5 } },
        { row: 5, col: 3, shape: "horizontal", area: 4, colorIndex: 6, solution: { r1: 5, c1: 2, r2: 5, c2: 5 } },
      ],
    },
    {
      key: "easy-4",
      size: 6,
      clues: [
        { row: 0, col: 2, shape: "any", area: 6, colorIndex: 0, solution: { r1: 0, c1: 0, r2: 1, c2: 2 } },
        { row: 1, col: 4, shape: "horizontal", area: 6, colorIndex: 1, solution: { r1: 0, c1: 3, r2: 1, c2: 5 } },
        { row: 2, col: 0, shape: "any", area: 2, colorIndex: 2, solution: { r1: 2, c1: 0, r2: 3, c2: 0 } },
        { row: 3, col: 1, shape: "square", area: 4, colorIndex: 3, solution: { r1: 2, c1: 1, r2: 3, c2: 2 } },
        { row: 3, col: 4, shape: "any", area: 6, colorIndex: 4, solution: { r1: 2, c1: 3, r2: 4, c2: 4 } },
        { row: 4, col: 5, shape: "vertical", area: 4, colorIndex: 5, solution: { r1: 2, c1: 5, r2: 5, c2: 5 } },
        { row: 5, col: 1, shape: "any", area: 6, colorIndex: 6, solution: { r1: 4, c1: 0, r2: 5, c2: 2 } },
        { row: 5, col: 3, shape: "any", area: 2, colorIndex: 7, solution: { r1: 5, c1: 3, r2: 5, c2: 4 } },
      ],
    },
  ],

  medium: [
    {
      key: "medium-1",
      size: 7,
      clues: [
        { row: 0, col: 1, shape: "horizontal", area: 6, colorIndex: 0, solution: { r1: 0, c1: 0, r2: 1, c2: 2 } },
        { row: 1, col: 4, shape: "vertical", area: 6, colorIndex: 1, solution: { r1: 0, c1: 3, r2: 2, c2: 4 } },
        { row: 0, col: 6, shape: "square", area: 4, colorIndex: 2, solution: { r1: 0, c1: 5, r2: 1, c2: 6 } },
        { row: 3, col: 0, shape: "any", area: 6, colorIndex: 3, solution: { r1: 2, c1: 0, r2: 4, c2: 1 } },
        { row: 2, col: 2, shape: "vertical", area: 2, colorIndex: 4, solution: { r1: 2, c1: 2, r2: 3, c2: 2 } },
        { row: 3, col: 6, shape: "any", area: 6, colorIndex: 5, solution: { r1: 2, c1: 5, r2: 4, c2: 6 } },
        { row: 4, col: 3, shape: "any", area: 6, colorIndex: 6, solution: { r1: 3, c1: 3, r2: 5, c2: 4 } },
        { row: 5, col: 2, shape: "any", area: 2, colorIndex: 7, solution: { r1: 4, c1: 2, r2: 5, c2: 2 } },
        { row: 6, col: 0, shape: "square", area: 4, colorIndex: 8, solution: { r1: 5, c1: 0, r2: 6, c2: 1 } },
        { row: 6, col: 3, shape: "horizontal", area: 3, colorIndex: 9, solution: { r1: 6, c1: 2, r2: 6, c2: 4 } },
        { row: 5, col: 6, shape: "any", area: 4, colorIndex: 0, solution: { r1: 5, c1: 5, r2: 6, c2: 6 } },
      ],
    },
    {
      key: "medium-2",
      size: 7,
      clues: [
        { row: 1, col: 1, shape: "square", area: 9, colorIndex: 0, solution: { r1: 0, c1: 0, r2: 2, c2: 2 } },
        { row: 0, col: 5, shape: "horizontal", area: 4, colorIndex: 1, solution: { r1: 0, c1: 3, r2: 0, c2: 6 } },
        { row: 2, col: 3, shape: "any", area: 4, colorIndex: 2, solution: { r1: 1, c1: 3, r2: 2, c2: 4 } },
        { row: 2, col: 6, shape: "vertical", area: 6, colorIndex: 3, solution: { r1: 1, c1: 5, r2: 3, c2: 6 } },
        { row: 3, col: 1, shape: "any", area: 6, colorIndex: 4, solution: { r1: 3, c1: 0, r2: 4, c2: 2 } },
        { row: 4, col: 4, shape: "square", area: 4, colorIndex: 5, solution: { r1: 3, c1: 3, r2: 4, c2: 4 } },
        { row: 5, col: 5, shape: "any", area: 6, colorIndex: 6, solution: { r1: 4, c1: 5, r2: 6, c2: 6 } },
        { row: 6, col: 1, shape: "any", area: 4, colorIndex: 7, solution: { r1: 5, c1: 0, r2: 6, c2: 1 } },
        { row: 6, col: 3, shape: "horizontal", area: 6, colorIndex: 8, solution: { r1: 5, c1: 2, r2: 6, c2: 4 } },
      ],
    },
    {
      key: "medium-3",
      size: 7,
      clues: [
        { row: 1, col: 0, shape: "vertical", area: 4, colorIndex: 0, solution: { r1: 0, c1: 0, r2: 3, c2: 0 } },
        { row: 0, col: 2, shape: "any", area: 6, colorIndex: 1, solution: { r1: 0, c1: 1, r2: 1, c2: 3 } },
        { row: 1, col: 5, shape: "horizontal", area: 6, colorIndex: 2, solution: { r1: 0, c1: 4, r2: 1, c2: 6 } },
        { row: 2, col: 2, shape: "square", area: 4, colorIndex: 3, solution: { r1: 2, c1: 1, r2: 3, c2: 2 } },
        { row: 3, col: 3, shape: "any", area: 6, colorIndex: 4, solution: { r1: 2, c1: 3, r2: 4, c2: 4 } },
        { row: 3, col: 6, shape: "vertical", area: 6, colorIndex: 5, solution: { r1: 2, c1: 5, r2: 4, c2: 6 } },
        { row: 5, col: 0, shape: "any", area: 6, colorIndex: 6, solution: { r1: 4, c1: 0, r2: 6, c2: 1 } },
        { row: 5, col: 2, shape: "vertical", area: 3, colorIndex: 7, solution: { r1: 4, c1: 2, r2: 6, c2: 2 } },
        { row: 6, col: 4, shape: "horizontal", area: 6, colorIndex: 8, solution: { r1: 5, c1: 3, r2: 6, c2: 5 } },
        { row: 6, col: 6, shape: "vertical", area: 2, colorIndex: 9, solution: { r1: 5, c1: 6, r2: 6, c2: 6 } },
      ],
    },
    {
      key: "medium-4",
      size: 7,
      clues: [
        { row: 0, col: 0, shape: "square", area: 4, colorIndex: 0, solution: { r1: 0, c1: 0, r2: 1, c2: 1 } },
        { row: 1, col: 3, shape: "any", area: 6, colorIndex: 1, solution: { r1: 0, c1: 2, r2: 1, c2: 4 } },
        { row: 1, col: 6, shape: "vertical", area: 6, colorIndex: 2, solution: { r1: 0, c1: 5, r2: 2, c2: 6 } },
        { row: 2, col: 1, shape: "horizontal", area: 6, colorIndex: 3, solution: { r1: 2, c1: 0, r2: 3, c2: 2 } },
        { row: 3, col: 3, shape: "any", area: 4, colorIndex: 4, solution: { r1: 2, c1: 3, r2: 3, c2: 4 } },
        { row: 4, col: 5, shape: "any", area: 6, colorIndex: 5, solution: { r1: 3, c1: 5, r2: 5, c2: 6 } },
        { row: 5, col: 1, shape: "vertical", area: 6, colorIndex: 6, solution: { r1: 4, c1: 0, r2: 6, c2: 1 } },
        { row: 4, col: 3, shape: "horizontal", area: 6, colorIndex: 7, solution: { r1: 4, c1: 2, r2: 5, c2: 4 } },
        { row: 6, col: 3, shape: "any", area: 3, colorIndex: 8, solution: { r1: 6, c1: 2, r2: 6, c2: 4 } },
        { row: 6, col: 6, shape: "horizontal", area: 2, colorIndex: 9, solution: { r1: 6, c1: 5, r2: 6, c2: 6 } },
      ],
    },
  ],

  hard: [
    {
      key: "hard-1",
      size: 8,
      clues: [
        { row: 1, col: 0, shape: "vertical", area: 6, colorIndex: 0, solution: { r1: 0, c1: 0, r2: 2, c2: 1 } },
        { row: 0, col: 3, shape: "horizontal", area: null, colorIndex: 1, solution: { r1: 0, c1: 2, r2: 1, c2: 4 } },
        { row: 1, col: 6, shape: "square", area: 9, colorIndex: 2, solution: { r1: 0, c1: 5, r2: 2, c2: 7 } },
        { row: 3, col: 3, shape: "any", area: 6, colorIndex: 3, solution: { r1: 2, c1: 2, r2: 3, c2: 4 } },
        { row: 3, col: 1, shape: "square", area: null, colorIndex: 4, solution: { r1: 3, c1: 0, r2: 4, c2: 1 } },
        { row: 4, col: 6, shape: "horizontal", area: 6, colorIndex: 5, solution: { r1: 3, c1: 5, r2: 4, c2: 7 } },
        { row: 5, col: 2, shape: "any", area: 6, colorIndex: 6, solution: { r1: 4, c1: 2, r2: 6, c2: 3 } },
        { row: 5, col: 4, shape: "vertical", area: 3, colorIndex: 7, solution: { r1: 4, c1: 4, r2: 6, c2: 4 } },
        { row: 6, col: 0, shape: "any", area: 6, colorIndex: 8, solution: { r1: 5, c1: 0, r2: 7, c2: 1 } },
        { row: 6, col: 5, shape: "vertical", area: null, colorIndex: 9, solution: { r1: 5, c1: 5, r2: 7, c2: 6 } },
        { row: 7, col: 7, shape: "vertical", area: 3, colorIndex: 0, solution: { r1: 5, c1: 7, r2: 7, c2: 7 } },
        { row: 7, col: 3, shape: "horizontal", area: 3, colorIndex: 1, solution: { r1: 7, c1: 2, r2: 7, c2: 4 } },
      ],
    },
    {
      key: "hard-2",
      size: 8,
      clues: [
        { row: 0, col: 1, shape: "horizontal", area: 6, colorIndex: 0, solution: { r1: 0, c1: 0, r2: 1, c2: 2 } },
        { row: 1, col: 4, shape: "any", area: 6, colorIndex: 1, solution: { r1: 0, c1: 3, r2: 1, c2: 5 } },
        { row: 1, col: 7, shape: "vertical", area: null, colorIndex: 2, solution: { r1: 0, c1: 6, r2: 2, c2: 7 } },
        { row: 3, col: 0, shape: "any", area: 6, colorIndex: 3, solution: { r1: 2, c1: 0, r2: 4, c2: 1 } },
        { row: 3, col: 3, shape: "square", area: null, colorIndex: 4, solution: { r1: 2, c1: 2, r2: 4, c2: 4 } },
        { row: 3, col: 5, shape: "vertical", area: 3, colorIndex: 5, solution: { r1: 2, c1: 5, r2: 4, c2: 5 } },
        { row: 4, col: 6, shape: "any", area: 6, colorIndex: 6, solution: { r1: 3, c1: 6, r2: 5, c2: 7 } },
        { row: 6, col: 1, shape: "vertical", area: 6, colorIndex: 7, solution: { r1: 5, c1: 0, r2: 7, c2: 1 } },
        { row: 5, col: 3, shape: "horizontal", area: null, colorIndex: 8, solution: { r1: 5, c1: 2, r2: 6, c2: 4 } },
        { row: 6, col: 5, shape: "any", area: 3, colorIndex: 9, solution: { r1: 5, c1: 5, r2: 7, c2: 5 } },
        { row: 7, col: 3, shape: "horizontal", area: 3, colorIndex: 0, solution: { r1: 7, c1: 2, r2: 7, c2: 4 } },
        { row: 7, col: 6, shape: "square", area: 4, colorIndex: 1, solution: { r1: 6, c1: 6, r2: 7, c2: 7 } },
      ],
    },
    {
      key: "hard-3",
      size: 8,
      clues: [
        { row: 1, col: 1, shape: "square", area: 9, colorIndex: 0, solution: { r1: 0, c1: 0, r2: 2, c2: 2 } },
        { row: 0, col: 4, shape: "horizontal", area: null, colorIndex: 1, solution: { r1: 0, c1: 3, r2: 0, c2: 6 } },
        { row: 2, col: 7, shape: "vertical", area: 4, colorIndex: 2, solution: { r1: 0, c1: 7, r2: 3, c2: 7 } },
        { row: 2, col: 4, shape: "any", area: 6, colorIndex: 3, solution: { r1: 1, c1: 3, r2: 2, c2: 5 } },
        { row: 2, col: 6, shape: "vertical", area: 3, colorIndex: 4, solution: { r1: 1, c1: 6, r2: 3, c2: 6 } },
        { row: 3, col: 1, shape: "horizontal", area: 6, colorIndex: 5, solution: { r1: 3, c1: 0, r2: 4, c2: 2 } },
        { row: 4, col: 3, shape: "vertical", area: null, colorIndex: 6, solution: { r1: 3, c1: 3, r2: 5, c2: 4 } },
        { row: 4, col: 5, shape: "any", area: 3, colorIndex: 7, solution: { r1: 3, c1: 5, r2: 5, c2: 5 } },
        { row: 5, col: 6, shape: "square", area: null, colorIndex: 8, solution: { r1: 4, c1: 6, r2: 5, c2: 7 } },
        { row: 6, col: 1, shape: "square", area: 9, colorIndex: 9, solution: { r1: 5, c1: 0, r2: 7, c2: 2 } },
        { row: 7, col: 4, shape: "any", area: 6, colorIndex: 0, solution: { r1: 6, c1: 3, r2: 7, c2: 5 } },
        { row: 7, col: 7, shape: "square", area: 4, colorIndex: 1, solution: { r1: 6, c1: 6, r2: 7, c2: 7 } },
      ],
    },
    {
      key: "hard-4",
      size: 8,
      clues: [
        { row: 0, col: 0, shape: "square", area: null, colorIndex: 0, solution: { r1: 0, c1: 0, r2: 1, c2: 1 } },
        { row: 0, col: 4, shape: "horizontal", area: 8, colorIndex: 1, solution: { r1: 0, c1: 2, r2: 1, c2: 5 } },
        { row: 1, col: 7, shape: "square", area: 4, colorIndex: 2, solution: { r1: 0, c1: 6, r2: 1, c2: 7 } },
        { row: 3, col: 0, shape: "any", area: 6, colorIndex: 3, solution: { r1: 2, c1: 0, r2: 4, c2: 1 } },
        { row: 2, col: 3, shape: "any", area: 4, colorIndex: 4, solution: { r1: 2, c1: 2, r2: 3, c2: 3 } },
        { row: 3, col: 5, shape: "horizontal", area: null, colorIndex: 5, solution: { r1: 2, c1: 4, r2: 3, c2: 6 } },
        { row: 4, col: 7, shape: "vertical", area: 4, colorIndex: 6, solution: { r1: 2, c1: 7, r2: 5, c2: 7 } },
        { row: 4, col: 3, shape: "any", area: 6, colorIndex: 7, solution: { r1: 4, c1: 2, r2: 5, c2: 4 } },
        { row: 5, col: 6, shape: "vertical", area: null, colorIndex: 8, solution: { r1: 4, c1: 5, r2: 6, c2: 6 } },
        { row: 6, col: 1, shape: "vertical", area: 6, colorIndex: 9, solution: { r1: 5, c1: 0, r2: 7, c2: 1 } },
        { row: 7, col: 3, shape: "horizontal", area: 6, colorIndex: 0, solution: { r1: 6, c1: 2, r2: 7, c2: 4 } },
        { row: 7, col: 5, shape: "any", area: 2, colorIndex: 1, solution: { r1: 7, c1: 5, r2: 7, c2: 6 } },
        { row: 7, col: 7, shape: "vertical", area: 2, colorIndex: 2, solution: { r1: 6, c1: 7, r2: 7, c2: 7 } },
      ],
    },
  ],

  expert: [
    {
      key: "expert-1",
      size: 8,
      clues: [
        { row: 0, col: 1, shape: "horizontal", area: null, colorIndex: 0, solution: { r1: 0, c1: 0, r2: 1, c2: 2 } },
        { row: 1, col: 3, shape: "vertical", area: 6, colorIndex: 1, solution: { r1: 0, c1: 3, r2: 2, c2: 4 } },
        { row: 0, col: 6, shape: "horizontal", area: null, colorIndex: 2, solution: { r1: 0, c1: 5, r2: 1, c2: 7 } },
        { row: 3, col: 1, shape: "any", area: 6, colorIndex: 3, solution: { r1: 2, c1: 0, r2: 3, c2: 2 } },
        { row: 3, col: 5, shape: "vertical", area: null, colorIndex: 4, solution: { r1: 2, c1: 5, r2: 4, c2: 6 } },
        { row: 4, col: 7, shape: "vertical", area: 4, colorIndex: 5, solution: { r1: 2, c1: 7, r2: 5, c2: 7 } },
        { row: 4, col: 4, shape: "any", area: 6, colorIndex: 6, solution: { r1: 3, c1: 3, r2: 5, c2: 4 } },
        { row: 4, col: 0, shape: "square", area: null, colorIndex: 7, solution: { r1: 4, c1: 0, r2: 5, c2: 1 } },
        { row: 6, col: 2, shape: "vertical", area: 4, colorIndex: 8, solution: { r1: 4, c1: 2, r2: 7, c2: 2 } },
        { row: 7, col: 0, shape: "square", area: 4, colorIndex: 9, solution: { r1: 6, c1: 0, r2: 7, c2: 1 } },
        { row: 6, col: 4, shape: "horizontal", area: null, colorIndex: 0, solution: { r1: 6, c1: 3, r2: 7, c2: 5 } },
        { row: 5, col: 6, shape: "horizontal", area: 2, colorIndex: 1, solution: { r1: 5, c1: 5, r2: 5, c2: 6 } },
        { row: 7, col: 7, shape: "square", area: 4, colorIndex: 2, solution: { r1: 6, c1: 6, r2: 7, c2: 7 } },
      ],
    },
    {
      key: "expert-2",
      size: 8,
      clues: [
        { row: 1, col: 1, shape: "square", area: null, colorIndex: 0, solution: { r1: 0, c1: 0, r2: 2, c2: 2 } },
        { row: 0, col: 4, shape: "horizontal", area: 6, colorIndex: 1, solution: { r1: 0, c1: 3, r2: 1, c2: 5 } },
        { row: 1, col: 7, shape: "vertical", area: null, colorIndex: 2, solution: { r1: 0, c1: 6, r2: 2, c2: 7 } },
        { row: 2, col: 4, shape: "square", area: 4, colorIndex: 3, solution: { r1: 2, c1: 3, r2: 3, c2: 4 } },
        { row: 4, col: 5, shape: "vertical", area: 4, colorIndex: 4, solution: { r1: 2, c1: 5, r2: 5, c2: 5 } },
        { row: 4, col: 0, shape: "vertical", area: null, colorIndex: 5, solution: { r1: 3, c1: 0, r2: 5, c2: 1 } },
        { row: 4, col: 2, shape: "any", area: 3, colorIndex: 6, solution: { r1: 3, c1: 2, r2: 5, c2: 2 } },
        { row: 5, col: 3, shape: "square", area: null, colorIndex: 7, solution: { r1: 4, c1: 3, r2: 5, c2: 4 } },
        { row: 4, col: 7, shape: "any", area: 6, colorIndex: 8, solution: { r1: 3, c1: 6, r2: 5, c2: 7 } },
        { row: 7, col: 1, shape: "horizontal", area: null, colorIndex: 9, solution: { r1: 6, c1: 0, r2: 7, c2: 2 } },
        { row: 6, col: 4, shape: "any", area: 6, colorIndex: 0, solution: { r1: 6, c1: 3, r2: 7, c2: 5 } },
        { row: 7, col: 6, shape: "square", area: 4, colorIndex: 1, solution: { r1: 6, c1: 6, r2: 7, c2: 7 } },
      ],
    },
    {
      key: "expert-3",
      size: 8,
      clues: [
        { row: 1, col: 0, shape: "vertical", area: 4, colorIndex: 0, solution: { r1: 0, c1: 0, r2: 3, c2: 0 } },
        { row: 0, col: 2, shape: "horizontal", area: null, colorIndex: 1, solution: { r1: 0, c1: 1, r2: 1, c2: 3 } },
        { row: 1, col: 4, shape: "square", area: null, colorIndex: 2, solution: { r1: 0, c1: 4, r2: 1, c2: 5 } },
        { row: 1, col: 7, shape: "any", area: 6, colorIndex: 3, solution: { r1: 0, c1: 6, r2: 2, c2: 7 } },
        { row: 3, col: 2, shape: "any", area: 6, colorIndex: 4, solution: { r1: 2, c1: 1, r2: 3, c2: 3 } },
        { row: 3, col: 5, shape: "vertical", area: null, colorIndex: 5, solution: { r1: 2, c1: 4, r2: 4, c2: 5 } },
        { row: 4, col: 6, shape: "vertical", area: 6, colorIndex: 6, solution: { r1: 3, c1: 6, r2: 5, c2: 7 } },
        { row: 4, col: 1, shape: "horizontal", area: null, colorIndex: 7, solution: { r1: 4, c1: 0, r2: 5, c2: 2 } },
        { row: 5, col: 3, shape: "vertical", area: 3, colorIndex: 8, solution: { r1: 4, c1: 3, r2: 6, c2: 3 } },
        { row: 6, col: 4, shape: "square", area: null, colorIndex: 9, solution: { r1: 5, c1: 4, r2: 6, c2: 5 } },
        { row: 7, col: 1, shape: "horizontal", area: 6, colorIndex: 0, solution: { r1: 6, c1: 0, r2: 7, c2: 2 } },
        { row: 7, col: 4, shape: "horizontal", area: 3, colorIndex: 1, solution: { r1: 7, c1: 3, r2: 7, c2: 5 } },
        { row: 7, col: 7, shape: "any", area: 4, colorIndex: 2, solution: { r1: 6, c1: 6, r2: 7, c2: 7 } },
      ],
    },
    {
      key: "expert-4",
      size: 8,
      clues: [
        { row: 1, col: 1, shape: "horizontal", area: null, colorIndex: 0, solution: { r1: 0, c1: 0, r2: 1, c2: 2 } },
        { row: 0, col: 3, shape: "square", area: 4, colorIndex: 1, solution: { r1: 0, c1: 3, r2: 1, c2: 4 } },
        { row: 1, col: 6, shape: "horizontal", area: 6, colorIndex: 2, solution: { r1: 0, c1: 5, r2: 1, c2: 7 } },
        { row: 3, col: 0, shape: "vertical", area: null, colorIndex: 3, solution: { r1: 2, c1: 0, r2: 4, c2: 1 } },
        { row: 3, col: 3, shape: "square", area: null, colorIndex: 4, solution: { r1: 2, c1: 2, r2: 4, c2: 4 } },
        { row: 3, col: 5, shape: "any", area: 6, colorIndex: 5, solution: { r1: 2, c1: 5, r2: 4, c2: 6 } },
        { row: 4, col: 7, shape: "vertical", area: 4, colorIndex: 6, solution: { r1: 2, c1: 7, r2: 5, c2: 7 } },
        { row: 6, col: 1, shape: "any", area: 6, colorIndex: 7, solution: { r1: 5, c1: 0, r2: 7, c2: 1 } },
        { row: 5, col: 3, shape: "horizontal", area: null, colorIndex: 8, solution: { r1: 5, c1: 2, r2: 6, c2: 4 } },
        { row: 6, col: 5, shape: "vertical", area: null, colorIndex: 9, solution: { r1: 5, c1: 5, r2: 7, c2: 6 } },
        { row: 7, col: 3, shape: "horizontal", area: 3, colorIndex: 0, solution: { r1: 7, c1: 2, r2: 7, c2: 4 } },
        { row: 7, col: 7, shape: "vertical", area: 2, colorIndex: 1, solution: { r1: 6, c1: 7, r2: 7, c2: 7 } },
      ],
    },
  ],
};

function hashSeed(seed: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function transformCell(
  r: number,
  c: number,
  n: number,
  rot: number,
  flipH: boolean
): [number, number] {
  let rr = r;
  let cc = flipH ? n - 1 - c : c;
  for (let i = 0; i < rot; i++) {
    const nextR = cc;
    const nextC = n - 1 - rr;
    rr = nextR;
    cc = nextC;
  }
  return [rr, cc];
}

function transformShape(shape: PatchShape, rot: number): PatchShape {
  if (rot % 2 === 1) {
    if (shape === "horizontal") return "vertical";
    if (shape === "vertical") return "horizontal";
  }
  return shape;
}

/**
 * Deterministically picks a verified preset and applies dihedral symmetry
 * (rotation + reflection) + color palette offset in 0ms.
 */
export function buildTransformedPatchesPreset(
  difficulty: PatchesDifficulty,
  seed: string
): PatchesPuzzle {
  const bank = PATCHES_PRESET_BANK[difficulty];
  const h = hashSeed(seed);
  const preset = bank[h % bank.length];
  const rot = (h >>> 4) % 4;
  const flipH = ((h >>> 6) & 1) === 1;
  const colorShift = (h >>> 8) % 10;
  const n = preset.size;

  const clues: PatchClue[] = preset.clues.map((raw, idx) => {
    const [tr, tc] = transformCell(raw.row, raw.col, n, rot, flipH);
    const [sr1, sc1] = transformCell(
      raw.solution.r1,
      raw.solution.c1,
      n,
      rot,
      flipH
    );
    const [sr2, sc2] = transformCell(
      raw.solution.r2,
      raw.solution.c2,
      n,
      rot,
      flipH
    );

    return {
      id: `clue-${idx}`,
      row: tr,
      col: tc,
      shape: transformShape(raw.shape, rot),
      area: raw.area,
      colorIndex: (raw.colorIndex + colorShift) % 10,
      solution: {
        r1: Math.min(sr1, sr2),
        c1: Math.min(sc1, sc2),
        r2: Math.max(sr1, sr2),
        c2: Math.max(sc1, sc2),
      },
    };
  });

  return {
    id: `patches-${difficulty}-${preset.key}-${seed}`,
    difficulty,
    size: n,
    clues,
  };
}
