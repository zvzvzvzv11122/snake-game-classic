
import React from 'react';
import { Coordinate } from '../types';
import { BOARD_SIZE, CELL_SIZE_PX } from '../constants';

interface GameBoardProps {
  snake: Coordinate[];
  food: Coordinate;
}

const GameBoard: React.FC<GameBoardProps> = ({ snake, food }) => {
  const cells: React.ReactNode[] = [];

  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      let cellType = 'empty';
      if (food.x === x && food.y === y) {
        cellType = 'food';
      } else if (snake.some(segment => segment.x === x && segment.y === y)) {
        cellType = 'snake';
        if (snake[0].x === x && snake[0].y === y) {
            cellType = 'snake-head';
        }
      }

      let cellStyle = 'bg-gray-700'; // Empty cell
      if (cellType === 'snake') {
        cellStyle = 'bg-green-500 rounded-sm';
      } else if (cellType === 'snake-head') {
        cellStyle = 'bg-green-400 rounded-sm'; // Slightly different color for head
      } else if (cellType === 'food') {
        cellStyle = 'bg-red-500 rounded-full animate-pulse';
      }
      
      cells.push(
        <div
          key={`${x}-${y}`}
          className={`w-full h-full ${cellStyle} transition-colors duration-50`}
          style={{ width: `${CELL_SIZE_PX}px`, height: `${CELL_SIZE_PX}px` }}
        ></div>
      );
    }
  }

  return (
    <div
      className="grid border border-gray-600 shadow-2xl bg-gray-800"
      style={{
        gridTemplateColumns: `repeat(${BOARD_SIZE}, ${CELL_SIZE_PX}px)`,
        gridTemplateRows: `repeat(${BOARD_SIZE}, ${CELL_SIZE_PX}px)`,
        width: `${BOARD_SIZE * CELL_SIZE_PX}px`,
        height: `${BOARD_SIZE * CELL_SIZE_PX}px`,
      }}
    >
      {cells}
    </div>
  );
};

export default GameBoard;
