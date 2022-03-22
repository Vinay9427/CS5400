const fs = require('fs')

let /** Array<string> */ initialGrid; // Declaring the Grid
let /** Array<number> */ penguInitialPosition ; 
//Initial game state wrt Pengu, this is loaded into empty queue
let initialState = {
    penguPosition : null,
    fishCount : 0,
    fishPositionsCaught: [],
    path: '',
    penguStatus: null
}

// Below directions are helpful for finding the co-ordinates wrt the direction of the Pengu
let directions = [
                  [1, [1, -1]],
                  [2, [1, 0]],
                  [3, [1, 1]],
                  [4, [0, -1]],
                  [6, [0, 1]],
                  [7, [-1, -1]],
                  [8, [-1, 0]],
                  [9, [-1, 1]],
                ]

// possible status of the pengu in a Cell
const status = ["KILLED", "STUCK_BY_WALL", "STUCK_AT_SNOW","FISH_OR_ICE_CELL"];

// Reading the arguments(input and output file names) from the bash file and initializing to the variables
let [inputFile, outputFile] = process.argv.slice(2);

function log(...params){
    return console.log(params)
  }

/** 
 * function reads the input file and note the pengu position and grid to 2d array
*/
async function readAndLoadPositions() {
    return new Promise((resolve, reject) => {
      fs.readFile(inputFile, 'utf8', function (err, data) {
        if (err) {
          reject(err);
        }
        initialGrid = data.split('\n').map(i => i.trim().split('')).slice(1)
        for(let i = 0; i< initialGrid.length;i++){
            for(let j = 0; j< initialGrid[0].length;j++){
              // finding Pengus position
              if(initialGrid[i][j] == 'P'){
                penguInitialPosition = [i,j];
                initialState.penguPosition = [i,j];
              }
            }
        }
        initialGrid[penguInitialPosition[0]][penguInitialPosition[1]] = ' ';
        resolve(initialGrid);
      });
    });
  }

  const BreadthFirstSearch = function(){
    let queue = [initialState];
    const visitedPositions = new Set();
    let currentState;
    let statesToVisit;
    while(queue.length > 0){
      currentState = queue.shift();
      // Checking for goal condition
      if(currentState.fishCount >= 20){
          return currentState;
      }
      
      if(penguStatus(currentState.penguPosition) == 'KILLED'){
          // Skip to next state if pengu is KILLED
          continue;
      }

      // exploring the un-visited states
      statesToVisit = continueSlidingForValidStates(currentState, initialGrid)
      statesToVisit.forEach(item => {
          const visitedString = 
          hashForVisitedPositions(
                                    currentState.penguPosition, 
                                    item.penguPosition, 
                                    item.fishPositionsCaught, 
                                    item.path
                                  )
          // Checking for the visited positions
          if(!visitedPositions.has(visitedString)){
              visitedPositions.add(visitedString)
              // only push to a queue if it is not visited
              queue.push(item)
          }
      })
    }
    return currentState;
}

  /**
   * to generate next valid state
   * @param {Object<string|number>} currentState has the state of the board
   * @param {!Array<string>} grid 
   * @returns the next possible states 
   */
  function getNextValidStates(currentState, grid){
    const { penguPosition, fishCount, path, fishPositionsCaught, penguStatus } = currentState;
    let moves = [];
    directions.forEach(item => {
        const nextPos = [penguPosition[0]+item[1][0], penguPosition[1]+item[1][1]];
        if(grid[nextPos[0]][nextPos[1]] != '#'){
            moves.push(
                            { 
                                penguPosition: nextPos, 
                                fishPositionsCaught: [...fishPositionsCaught], 
                                status: penguStatus, 
                                fishCount: fishCount, 
                                path: path+item[0]
                            }
                        )
        }
    })
    return moves;
  }

  /**
   * This function gets the valid states to push into Queue 
   * @param {*} currentState is state of the game board
   * @param {*} grid is the whole 2-d Array 
   * @returns the states which needs to be enqueued to queue
   */
  const continueSlidingForValidStates = function(currentState, grid){
    const moves = getNextValidStates(currentState, grid); 
    let validMoves = [];
    for(let i = 0;i<moves.length; i++){
        validMoves.push(continueInTheSameDirection(moves[i], grid));
    }
    return validMoves;
  }
  
  /**
   * This slides the pengu until it hits by a wall/snow cell or a Hazard (Shark, Bear)
   * @param {Object<string>} currentState 
   * @param {Array<string>} grid 
   * @returns the Array of Slided States
   */
   const continueInTheSameDirection = function(currentState, grid){
    let direction = currentState.path[currentState.path.length-1];
    let tempPath = currentState.path;
    let tempPosition = currentState.penguPosition;
    let tempFishCount = currentState.fishCount;
    let tempFishCaughtPositions = [...currentState.fishPositionsCaught];
    let status;
    const rollbackPositions = new Set(['#', '0', 'S', 'U'])

    while(!rollbackPositions.has(grid[tempPosition[0]][tempPosition[1]])){
        if(grid[tempPosition[0]][tempPosition[1]] == '*'){
            if(!tempFishCaughtPositions.find(i => i[0] == tempPosition[0] && i[1] == tempPosition[1])){
                tempFishCount++;
                tempFishCaughtPositions.push(tempPosition)
            }
        }
        if(getCellValue(getNextMove(tempPosition, direction)) == '#'){
            break;
        }
        tempPosition = getNextMove(tempPosition, direction)
    }
    status = penguStatus(tempPosition)
    return { 
            penguPosition: tempPosition, 
            fishPositionsCaught: tempFishCaughtPositions, 
            penguStatus: status,
            fishCount: tempFishCount, 
            path: tempPath 
        }
  }


  /**
   * Anticipating the pengus next move based on the direction and current postion of the Pengu
   * @param {number} direction to anticipate nect move
   * @param {Array<number>} currentPos is used to get next move
   * @returns {Array<number>} the next position in the direction
   */
   const getNextMove = function(currentPos, direction){
    const coordinateForTheDirection = directions.find(dir => dir[0] == direction)[1];
    return [currentPos[0]+coordinateForTheDirection[0], currentPos[1]+coordinateForTheDirection[1]];
  }

  /**
   * To get Pengustatus
   * @param {Array<number>} penguPosition 
   * @returns status of the Pengu
   */
  const penguStatus = function(penguPosition){
    if(getCellValue(penguPosition) == 'S' || getCellValue(penguPosition) == 'U'){
        return 'KILLED';
    }
    
    if(getCellValue(penguPosition) == '0'){
        return 'STUCK_AT_SNOW';
    }
    
    if(getCellValue(penguPosition) == '#'){
        return 'STUCK_BY_WALL';
    }
    
    if(getCellValue(penguPosition)){
        return 'FISH_OR_ICE_CELL';
    }
  }

  /**
   * this function gets the cell value 
   * @param { Array<number> } position Position to check
   * @returns the cell value at the given position
   */
  const getCellValue = function(position){
      return initialGrid[position[0]][position[1]];
  }

  /**
   * This function generates hash
   * @param { Array<number> } currentPosition Current position of the Pengu
   * @param { Array<number> } newPosition new Position of the Pengu
   * @param { number } fishesCaught fishes caught while traversing
   * @param { string } path while traversing for goal
   * @returns a Hashed String
   */
  const hashForVisitedPositions = function(currentPosition, newPosition, fishes, path){
    return `${currentPosition.join('')}-${newPosition.join('')}-${fishes.join('')}-${path.length}}`
  }

/**
 * This function writes the output to a file
 * @param {!Object<string>} output a state which satisfies goal
 */

 async function writeOutputToFile(output) {
    return new Promise((resolve, reject) => {
        const {penguPosition, fishPositionsCaught, fishCount, path} = output;
        fishPositionsCaught.forEach(item => initialGrid[item[0]][item[1]] = ' ');
        if(penguStatus(penguPosition) == 'KILLED'){
          initialGrid[penguPosition[0]][penguPosition[1]] = 'X';
        }else {
          initialGrid[penguPosition[0]][penguPosition[1]] = 'P';
        }
        const content = `${path}\n${fishCount}\n${initialGrid.map(i => i.join('')).join('\n')}`;

        fs.writeFile(outputFile, content, err => {
            if (err) {
                reject(err);
            }
            resolve(`Successfully wrote the output to ${outputFile}`);
        });
    });
  }

  /**
   * checks for goal condition
   * @param {Object<string>} state to check the goal condition
   * @returns a boolean 
   */
  const goalFunction = function(state){
    return state.fishCount >= 16;
  }

/**
 * Initial Loader to trigger functions
 */
const loader = async function(){
    await readAndLoadPositions();
    const depth = 0;
    console.time()
    const output = iterativeDeepeningDFS(goalFunction, depth);
    console.timeEnd();
    log('Output: ', JSON.stringify(output))
    await writeOutputToFile(output)
}

loader();

// https://stackoverflow.com/questions/42919469/efficient-way-to-implement-priority-queue-in-javascript
// https://codepen.io/beaucarnes/pen/QpaQRG?editors=0012