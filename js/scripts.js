import { figures, colors } from './figures.js';

// elements
const newGameButton = document.getElementById('newGameButton');
const overlapLayout = document.getElementById('overlapLayout');
const overlapInfo = document.getElementById('overlapInfo');
const gameLayout = document.getElementById('game');
const gameContext = gameLayout.getContext('2d');
const cubeSize = (gameLayout.width / 10);

// game properties
let gameId = null;
let map = [];
let nextFigure = [];
let figure = [];
let offsetX = 0;
let offsetY = 0;
let score = 0;

newGameButton.addEventListener('mouseup', startGame);
drawMap();

function startGame(event) {
  if(gameId === null) {
    // reset game properties
    map = getMatrix(10, 20);
    overlapLayout.style.opacity = 0;
    nextFigure = getFigure(figures, colors);
    figure = getFigure(figures, colors);
    offsetX = Math.floor((map[0].length / 2) - (figure[0].length / 2));
    offsetY = 0;
    score = 0;

    // add listener to move figures
    window.addEventListener('keydown', moveFigure);

    // draw main matrix
    drawMap();

    // ...and start game
    gameId = setInterval(gameLoop, 1000);
  }
}

function gameLoop() {
  let isGameOver = false;
  // current figure move to down
  let isUpdated = setFigurePosition(0, 1);

  if(!isUpdated) {
    // fix current map
    map = mixMatrix(map, figure, offsetX, offsetY);

    // update figure
    figure = nextFigure;
    nextFigure = getFigure(figures, colors);

    // reset offsets
    offsetX = Math.floor((map[0].length / 2) - (figure[0].length / 2));
    offsetY = 0;

    // if a new figure collides, then "game over"
    if(checkCollision(map, figure, offsetX, offsetY)) {
      isGameOver = true;
    }
  }

  // if "game over" then...
  if(isGameOver) {  
    // stop game
    clearInterval(gameId);
    gameId = null;

    // remove listener to escape move figures
    window.removeEventListener('keydown', moveFigure);

    // ...and show overlap
    overlapLayout.style.opacity = 1;
    overlapInfo.style.display = 'flex';
  }
  // or continue game
  else {  
    score += checkLines();
    drawMap();
  }
}

function drawMap() {
  gameContext.fillStyle = '#000';
  gameContext.fillRect(0,0, gameLayout.width, gameLayout.height);

  let tempMap = mixMatrix(map, figure, offsetX, offsetY);

  // map
  for(let y = 0; y < tempMap.length; y++) {
    for(let x = 0; x < tempMap[y].length; x++) {
      if(tempMap[y][x] > 0) {
        let color = colors.filter(c => c.index == tempMap[y][x])[0].color;

        // draw cubes
        gameContext.fillStyle = color;
        gameContext.fillRect(x * cubeSize, y * cubeSize, cubeSize, cubeSize);

        // draw cube borders
        gameContext.strokeStyle = 'rgb(0, 0, 0, 0.2)';
        gameContext.lineWidth = 5;
        gameContext.strokeRect(x * cubeSize + 2, y * cubeSize + 2, cubeSize - 4, cubeSize - 4);
      }
    }
  }
}

function rotateFigure(figure) {
  let figureVertical = figure.length;
  let figureHorizontal = figure[0].length;

  // create a new array - H->V and V->H
  let rotatedFigure = new Array(figureHorizontal);
  for(let y = 0; y < rotatedFigure.length; y++) {
    rotatedFigure[y] = new Array(figureVertical);
  }

  // rotate figure
  for(let y = 0; y < figureVertical; y++) {
    for(let x = 0; x < figureHorizontal; x++) {
      // reflect figure
      rotatedFigure[x][figureVertical-1-y] = figure[y][x];
    }
  }
  return rotatedFigure;
}

function moveFigure(event) {
  switch(event.key) {
    case 'ArrowLeft':
      setFigurePosition(-1);
      break;

    case 'ArrowRight':
      setFigurePosition(1);
      break;

    case 'ArrowDown':  
      setFigurePosition(0, 1);
      break;

    case ' ':
      let rotatedFigure = rotateFigure(figure);
      let fixedX = 0;
      if(offsetX >= Math.floor(map[0].length / 2)) {
        fixedX = rotatedFigure[0].length - figure[0].length;
      }

      if(!checkCollision(map, rotatedFigure, offsetX - fixedX, offsetY)) {
        offsetX -= fixedX;
        figure = rotatedFigure;
        drawMap();
        break;
      }
      break;   
  }
}

function setFigurePosition(x = 0, y = 0) {
  if(!checkCollision(map, figure, offsetX + x, offsetY + y)) {
    offsetX += x;
    offsetY += y;
    drawMap();
    return true;
  }
  else {
    return false;
  }        
}

function checkLines() {
  let removedLines = 0;
  for(let y = 0; y < map.length; y++) {
    if(map[y].filter(i => i != 0).length == map[0].length) {
      map.splice(y, 1);
      map.unshift(map[0]);
      removedLines++;
    }
  }
  return removedLines;
}

function getFigure(figures, colors) {
  let figureindex = Math.floor(Math.random() * figures.length);
  let colorIndex = Math.floor(Math.random() * colors.length);
  let figure = figures[figureindex];

  // colorize figure
  for(let y = 0; y < figure.length; y++) {
    for(let x = 0; x < figure[y].length; x++) {
      if(figure[y][x] != 0) {
        figure[y][x] = colors[colorIndex].index;
      }
    }
  }

  return figure;
}

function getMatrix(xSize, ySize, symbol = 0) {
  let map = new Array(ySize);
  for(let y = 0; y < map.length; y++) {
    map[y] = new Array(xSize);
    for(let x = 0; x < map[y].length; x++) {
      map[y][x] = symbol;
    }
  }
  return map;
}

function mixMatrix(matrixA, matrixB, offsetX, offsetY) {
  let mixedMatrix = new Array(matrixA.length);
  for(let y = 0; y < matrixA.length; y++) {
    mixedMatrix[y] = new Array(matrixA[y].length);
    for(let x = 0; x < matrixA[y].length; x++) {
      mixedMatrix[y][x] = matrixA[y][x];
    }
  }

  for(let y = 0; y < matrixB.length; y++) {
    for(let x = 0; x < matrixB[y].length; x++) {
      let xPosition = x + offsetX;
      let yPosition = y + offsetY;

      if(matrixB[y][x] > 0) {
        mixedMatrix[yPosition][xPosition] = matrixB[y][x];
      }
    }
  }

  return mixedMatrix;
}

function checkCollision(matrixA, matrixB, offsetX, offsetY) {
  for(let y = 0; y < matrixB.length; y++) {
    for(let x = 0; x < matrixB[y].length; x++) {
      let xPosition = x + offsetX;
      let yPosition = y + offsetY;

      if(matrixB[y][x] > 0) {
        if(matrixA[yPosition] == null 
        || matrixA[yPosition][xPosition] == null 
        || matrixA[yPosition][xPosition] != 0) {
            return true;
        }
      }
    }
  }

  return false;
}