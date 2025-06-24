
import React, { useState, useEffect, useCallback } from 'react';
import { Coordinate } from '../types';
import { Direction, GameState, BOARD_SIZE, INITIAL_SNAKE_POSITION, INITIAL_DIRECTION, GAME_SPEED_MS, CELL_SIZE_PX } from '../constants';

const generateFoodPosition = (snake: Coordinate[]): Coordinate => {
  let newFoodPosition: Coordinate;
  do {
    newFoodPosition = {
      x: Math.floor(Math.random() * BOARD_SIZE),
      y: Math.floor(Math.random() * BOARD_SIZE),
    };
  } while (snake.some(segment => segment.x === newFoodPosition.x && segment.y === newFoodPosition.y));
  return newFoodPosition;
};

export const useSnakeGame = () => {
  const [snake, setSnake] = useState<Coordinate[]>(INITIAL_SNAKE_POSITION);
  const [food, setFood] = useState<Coordinate>(() => generateFoodPosition(INITIAL_SNAKE_POSITION));
  const [direction, setDirection] = useState<Direction>(INITIAL_DIRECTION);
  const [pendingDirection, setPendingDirection] = useState<Direction>(INITIAL_DIRECTION);
  const [score, setScore] = useState<number>(0);
  const [gameState, setGameState] = useState<GameState>(GameState.START_SCREEN);
  const [highScore, setHighScore] = useState<number>(() => {
    const savedHighScore = localStorage.getItem('snakeHighScore');
    return savedHighScore ? parseInt(savedHighScore, 10) : 0;
  });

  const resetGame = useCallback(() => {
    setSnake(INITIAL_SNAKE_POSITION);
    setFood(generateFoodPosition(INITIAL_SNAKE_POSITION));
    setDirection(INITIAL_DIRECTION);
    setPendingDirection(INITIAL_DIRECTION);
    setScore(0);
    setGameState(GameState.PLAYING);
  }, []);

  const startGame = () => {
    resetGame();
  };
  
  const updateHighScore = useCallback((currentScore: number) => {
    if (currentScore > highScore) {
      setHighScore(currentScore);
      localStorage.setItem('snakeHighScore', currentScore.toString());
    }
  }, [highScore]);

  useEffect(() => {
    if (gameState !== GameState.PLAYING) return;

    const gameInterval = setInterval(() => {
      setDirection(pendingDirection); // Apply pending direction at the start of the tick

      setSnake(prevSnake => {
        const newSnake = [...prevSnake];
        let head = { ...newSnake[0] };

        switch (pendingDirection) {
          case Direction.UP: head.y -= 1; break;
          case Direction.DOWN: head.y += 1; break;
          case Direction.LEFT: head.x -= 1; break;
          case Direction.RIGHT: head.x += 1; break;
        }

        // Wall collision
        if (head.x < 0 || head.x >= BOARD_SIZE || head.y < 0 || head.y >= BOARD_SIZE) {
          setGameState(GameState.GAME_OVER);
          updateHighScore(score);
          return prevSnake;
        }

        // Self collision
        for (let i = 1; i < newSnake.length; i++) {
          if (newSnake[i].x === head.x && newSnake[i].y === head.y) {
            setGameState(GameState.GAME_OVER);
            updateHighScore(score);
            return prevSnake;
          }
        }
        
        newSnake.unshift(head); // Add new head

        // Food consumption
        if (head.x === food.x && head.y === food.y) {
          setScore(s => s + 1);
          setFood(generateFoodPosition(newSnake));
        } else {
          newSnake.pop(); // Remove tail if no food eaten
        }
        return newSnake;
      });
    }, GAME_SPEED_MS);

    return () => clearInterval(gameInterval);
  }, [gameState, pendingDirection, food, score, updateHighScore]);


  const changeDirectionHandler = useCallback((newDirection: Direction) => {
    setPendingDirection(prevActualDirection => {
        // Prevent immediate 180-degree turns
        if (newDirection === Direction.UP && direction === Direction.DOWN) return direction;
        if (newDirection === Direction.DOWN && direction === Direction.UP) return direction;
        if (newDirection === Direction.LEFT && direction === Direction.RIGHT) return direction;
        if (newDirection === Direction.RIGHT && direction === Direction.LEFT) return direction;
        return newDirection;
    });
  }, [direction]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (gameState === GameState.START_SCREEN && event.key === 'Enter') {
        startGame();
        return;
      }
      if (gameState === GameState.GAME_OVER && event.key === 'Enter') {
        resetGame();
        return;
      }
      if (gameState !== GameState.PLAYING) return;

      let newDirectionKey: Direction | null = null;
      switch (event.key) {
        case 'ArrowUp':
        case 'w':
          newDirectionKey = Direction.UP;
          break;
        case 'ArrowDown':
        case 's':
          newDirectionKey = Direction.DOWN;
          break;
        case 'ArrowLeft':
        case 'a':
          newDirectionKey = Direction.LEFT;
          break;
        case 'ArrowRight':
        case 'd':
          newDirectionKey = Direction.RIGHT;
          break;
      }
      if (newDirectionKey !== null) {
         changeDirectionHandler(newDirectionKey);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState, changeDirectionHandler, resetGame, startGame]);

  return {
    snake,
    food,
    direction, // current applied direction
    score,
    highScore,
    gameState,
    startGame,
    changeDirectionHandler,
    boardSize: BOARD_SIZE,
    cellSize: CELL_SIZE_PX,
  };
};
