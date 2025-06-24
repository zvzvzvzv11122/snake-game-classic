
export enum Direction {
  UP,
  DOWN,
  LEFT,
  RIGHT,
}

export enum GameState {
  START_SCREEN,
  PLAYING,
  GAME_OVER,
}

export const BOARD_SIZE = 20; // 20x20 grid
export const CELL_SIZE_PX = 16; // Each cell is 16px x 16px
export const INITIAL_SNAKE_POSITION = [
  { x: Math.floor(BOARD_SIZE / 2) + 1, y: Math.floor(BOARD_SIZE / 2) },
  { x: Math.floor(BOARD_SIZE / 2), y: Math.floor(BOARD_SIZE / 2) },
  { x: Math.floor(BOARD_SIZE / 2) - 1, y: Math.floor(BOARD_SIZE / 2) },
];
export const INITIAL_DIRECTION = Direction.RIGHT;
export const GAME_SPEED_MS = 150; // Milliseconds
