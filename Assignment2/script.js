const fs = require('fs')

let /** Array<string> */ initialGrid; // Declaring the Grid
let /** Array<number> */ penguInitialPosition ; 
let /** Array<number> */ pathArray = []; // This array consists of the path travelled by the Pengu
let /** boolean */ isInitialPenguPosition = true; // this helps us to trigger the penguSlider 
let /** number */ counter = 0; // counter to check the count of the path
let /** number */ totalFishcount = 0; // counter to count the fishes caught by the Pengu

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

let initialState = {
    penguPosition : null,
    fishCount : 0,
    fishPositionsCaught: [],
    path: '',
    penguStatus: null
}

const status = ["KILLED", "STUCK_BY_WALL", "STUCK_AT_SNOW","FISH_OR_ICE_CELL"];

// Reading the arguments(input and output file names) from the bash file and initializing to the variables
let [inputFile, outputFile] = process.argv.slice(2);


if(!(inputFile && outputFile)){
    inputFile = 'gradinginput.txt';
    outputFile = 'gradingoutput.txt';
}

function log(...params){
    return console.log(params)
  }

/** 
 * function reads the input file and note the pengu position and grid to 2d array
*/
function readAndLoadPositions(){
    // Reading the input file which is captured in inputFile variable
    fs.readFile(inputFile, 'utf8' , (err, data) => {
      if (err) {
        console.error(err)
        return
      }
      // initializing the grid data into initialGrid
      initialGrid = data.split('\n').map(i => i.trim().split('')).slice(1)
      //console.log(initialGrid)
      for(let i = 0; i< initialGrid.length;i++){
        for(let j = 0; j< initialGrid[0].length;j++){
          // finding Pengus position
          if(initialGrid[i][j] == 'P'){
            // initializing penguInitialPosition
            penguInitialPosition = [i,j];
            initialState.penguPosition = [i,j];
          }
          // finding total no of Fishes
          if(initialGrid[i][j] == '*'){
            totalFishcount++;
          }
        }
      }
        // Clearing the initial pengu position
        initialGrid[penguInitialPosition[0]][penguInitialPosition[1]] = ' ';
        const output = BreadthFirstSearch(initialGrid);
        log('Output: ', JSON.stringify(output))
        writeOutputToFile(output)       
    })  
  }


/**
 * 
 * @param {*} penguPosition 
 * @param {*} grid 
 */

  const BreadthFirstSearch = function(grid){
      let queue = [initialState];
      const visitedPositions = new Set()
      while(queue.length > 0){
        const currentState = queue.shift();
                
        if(currentState.fishCount >= 8){
            //log('Queue: ',JSON.stringify(queue))
            return currentState;
        }

        if(penguStatus(currentState.penguPosition) == 'KILLED'){
            continue;
        }

        const loadQueue = continueSlidingForValidMoves(currentState, grid)

        loadQueue.forEach(item => {
            const visitedString = hashForVisitedPositions(currentState.penguPosition, item.penguPosition,item.fishPositionsCaught)
            if(!visitedPositions.has(visitedString)){
                visitedPositions.add(visitedString)
                queue.push(item)
            }
        })
    
      }
      //return currentState;
  }


 /**
   * to pick a next Valid move from the grid
   * @param {!Array<number>} penguPos 
   * @param {!Array<string>} grid 
   * @returns {!Array<number>} direction and next moves for the Pengu
   */
  function getNextValidMoves(currentState, grid){
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
    //log('Next Moves for ', JSON.stringify(currentState), 'are ', JSON.stringify(moves))
    return moves;
  }


  const continueSlidingForValidMoves = function(currentState, grid){
    const moves = getNextValidMoves(currentState, grid); 
    log('before continueSlidingForValidMoves ',JSON.stringify(moves))
    let validMoves = [];
    for(let i = 0;i<moves.length; i++){
        validMoves.push(continueInTheSameDirection(moves[i], grid));
    }
    log('continueSlidingForValidMoves: ',JSON.stringify(validMoves))
    return validMoves;
  }
  

  /**
   * Anticipating the pengus next move based on the direction and current postion of the Pengu
   * @param {number} direction 
   * @param {!Array<number>} currentPos 
   * @returns {!Array<number>}
   */
   const continueInTheSameDirection = function(currentState, grid){
    let direction = currentState.path[currentState.path.length-1];
    let tempPath = currentState.path;
    let tempPosition = currentState.penguPosition;
    let tempFishCount = currentState.fishCount;
    let tempFishCaughtPositions = [...currentState.fishPositionsCaught];
    let status;
    
    const rollbackPositions = ['#', '0', 'S', 'U'];
    //const rollbackPositions = new Set(['#', '0', 'S', 'U'])
    //log(`Checking for sliding..${tempPosition}`)
    while(!rollbackPositions.includes(grid[tempPosition[0]][tempPosition[1]])){
        if(grid[tempPosition[0]][tempPosition[1]] == '*'){
            if(!tempFishCaughtPositions.find(i => i[0] == tempPosition[0] && i[1] == tempPosition[1])){
                tempFishCount++;
                tempFishCaughtPositions.push(tempPosition)
            }
            // tempFishCount++;
            // tempFishCaughtPositions.push(tempPosition)
        }
        if(getCellValue(getNextMove(tempPosition, direction)) == '#'){
            break;
        }
        tempPosition = getNextMove(tempPosition, direction)
    }
    status = penguStatus(tempPosition)
    //log(`Slided Till ${tempPosition}- Path:${tempPath}- status: ${status}`)
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
   * @param {number} direction 
   * @param {!Array<number>} currentPos 
   * @returns {!Array<number>}
   */
   const getNextMove = function(currentPos, direction){
    const coordinateForTheDirection = directions.find(dir => dir[0] == direction)[1];
    return [currentPos[0]+coordinateForTheDirection[0], currentPos[1]+coordinateForTheDirection[1]];
  }

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

  const getCellValue = function(position){
      return initialGrid[position[0]][position[1]];
  }

  const hashForVisitedPositions = function(currentPosition, newPosition,fishesCaught){
    return `${currentPosition.join('')}-${newPosition.join('')}-${fishesCaught.join('')}`
  }

  const writeOutputToFile = function(output){
    const {penguPosition, fishPositionsCaught, fishCount, path} = output;
    fishPositionsCaught.forEach(item => initialGrid[item[0]][item[1]] = ' ');
    initialGrid[penguPosition[0]][penguPosition[1]] = 'P';
    const content = `${path}\n${fishCount}\n${initialGrid.map(i => i.join('')).join('\n')}`;
  
    fs.writeFile(outputFile, content, err => {
      if (err) {
        console.error(err)
        return
      }
      log(`Successfully wrote the output to ${outputFile}`)
    })
  }

readAndLoadPositions();