var game = {};
game.of = {};
game.of.life = {};

game.of.life.parameters = {
	height : 10,
	width : 10
};

game.of.life.Utils = function () {
	this.process = function (m) {
		for(var row=0;row<game.of.life.parameters.height;row++) {
			for(var column=0;column<game.of.life.parameters.width;column++) {
				m(row,column);
			}
		}	
	}
}

game.of.life.Messages = function() {
	var messages = {
		
		none : {
			alive : "Will die (lonely).",
			dead : "Will stay dead."
		},
		one : {
			alive : "Will die (lonely).",
			dead : "Will stay dead."
		},
		two : {
			alive : "Will be OK this time.",
			dead : "Will stay dead."
		},
		three : {
			alive : "Will be OK this time.",
			dead : "Will come to life."
		},
		fourOrMore : {
			alive : "Will die (overcrowding).",
			dead : "Will stay dead."
		}
	};
	
	this.getFor = function(count, alive) {
		switch(count) {
			case 0:
				if(alive) {
					return messages.none.alive;
				} else {
					return messages.none.dead;
				}
				break;
			case 1:
				if(alive) {
					return messages.one.alive;
				} else {
					return messages.one.dead;
				}				
				break;
			case 2:
				if(alive) {
					return messages.two.alive;
				} else {
					return messages.two.dead;
				}				
				break;
			case 3:
				if(alive) {
					return messages.three.alive;
				} else {
					return messages.three.dead;
				}				
				break;
			default:
				if(alive) {
					return messages.fourOrMore.alive;
				} else {
					return messages.fourOrMore.dead;
				}	    
			}
	}
 }

game.of.life.Cell = function () {

	    var cellIsAlive = false;

	    this.getCellStatus = function() {
	        return cellIsAlive;
	    }

	    this.kill = function() {
	        cellIsAlive = false;
	    }

	    this.bringToLife = function() {
	        cellIsAlive = true;
	    }

	    this.isAlive = function() {
	        return cellIsAlive == true;
	    }
	}

game.of.life.Board = function (h, w) {

	var height = h;
	var width = w;

	var topEdge = 0;
	var bottomEdge = height - 1;
	
	var leftSideEdge = 0;
	var rightSideEdge = width - 1;

	var board;
	
	var utils = new game.of.life.Utils();
	
	function constructBoard() {
		board = new Array(height);
		for(var x=0; x<height; x++) {
			var row = new Array(width);
			for(var y=0; y<width; y++) {
				row[y] = new game.of.life.Cell();
			}
			board[x] = row;
		}
	}

	function shouldCountThisCell(row, column, cellRow, cellColumn) {		
		if(row === cellRow && column === cellColumn) {
			return false;
		}	
		
		return true;
	}

	function killCellAt(x,y) {
		board[x][y].kill();
	}
	
	function bringCellToLifeAt (x,y) {
		board[x][y].bringToLife();
	}

	function countNeighbours(currentRow, currentColumn) {
		var neighbourCount = 0;
				
		var rowsToCheck = new Array(3);
		rowsToCheck[0] = currentRow;
		
		if(currentRow === topEdge) {
			rowsToCheck[1] = currentRow + 1;
			rowsToCheck[2] = bottomEdge;
		} else if (currentRow === bottomEdge) {
			rowsToCheck[1] = currentRow - 1;
			rowsToCheck[2] = topEdge;	
		} else {
			rowsToCheck[1] = currentRow + 1;
			rowsToCheck[2] = currentRow - 1;	
		}
				
		var columnsToCheck = new Array(3);
		columnsToCheck[0] = currentColumn;
		
		if(currentColumn === leftSideEdge) {
			columnsToCheck[1] = currentColumn + 1;
			columnsToCheck[2] = rightSideEdge;
		} else if (currentColumn === rightSideEdge) {
			columnsToCheck[1] = currentColumn - 1;
			columnsToCheck[2] = leftSideEdge;	
		} else {
			columnsToCheck[1] = currentColumn + 1;
			columnsToCheck[2] = currentColumn - 1;	
		}
						
		for(var x=0; x<rowsToCheck.length; x++) {
			for(var y=0; y<columnsToCheck.length; y++) {
				var row = rowsToCheck[x];
				var column = columnsToCheck[y];				
				if(shouldCountThisCell(row, column, currentRow, currentColumn) && board[row][column].isAlive()) {
					neighbourCount++;
				}
			}
		}
		return neighbourCount;
	}

	this.processBoard = function () {
		var otherBoard = new game.of.life.Board(game.of.life.parameters.height, game.of.life.parameters.width);
			
		utils.process(function(x,y){
			var count = countNeighbours(x,y);

			if (count <= 1) {
		   		otherBoard.updateCellAt(x,y, false);
			}
			else if (count >= 4) {
	            otherBoard.updateCellAt(x,y, false);
			}
	        else if (count == 3) {
	            otherBoard.updateCellAt(x,y, true);
			} else {
				otherBoard.updateCellAt(x,y,board[x][y].isAlive());
			}	
		});	
							
		return otherBoard;
	}


	
	this.updateCellAt = function(x,y, alive) {
		if(alive) {
			bringCellToLifeAt(x,y);
		} else {
			killCellAt(x,y);
		}
	}

	this.isCellAliveAt = function(x,y) {
		return board[x][y].isAlive();
	}
	
	this.neighbourCountFor = function(x,y) {		
		return countNeighbours(x,y);
	}
	
	this.getCellIdFor = function(x,y) {
		return x + "-" + y;
	}
	
	constructBoard();
}

game.of.life.Game = function() {
	var intervalId;
	var board = new game.of.life.Board(game.of.life.parameters.height, game.of.life.parameters.width);
	var messages = new game.of.life.Messages();
	var utils = new game.of.life.Utils();
	
	function getXCoordinateOfCell(cellId) {
		return cellId.split("-")[0];
	}
	
	function getYCoordinateOfCell(cellId) {
		return cellId.split("-")[1];
	}
	
	function updateMessage(cell) {
		var message = "Your looking at " + cell.attr("id") + " which is: ";

		var x = parseInt(getXCoordinateOfCell(cell.attr("id")));
		var y = parseInt(getYCoordinateOfCell(cell.attr("id")));
		var cellIsAlive = board.isCellAliveAt(x,y);
		var neighbourCount = board.neighbourCountFor(x, y);
		if(cellIsAlive) {
			message = message + "alive ";
		} else {
			message = message + "dead ";
		}
		message = message + " and has " + neighbourCount + " neighbours. " + messages.getFor(neighbourCount, cellIsAlive);
		jQ("#cellInformation").text(message);	
	}
	
	function clearBoard() {
		utils.process(function (row,column) {
			var cellId = board.getCellIdFor(row,column);
			jQ("#" + cellId).removeClass('alive');
			board.updateCellAt(row,column,false);	
		});
	}
	
	function updateScreen() {
		board = board.processBoard();
	
		utils.process(function(row,column){
			var cellId = board.getCellIdFor(row,column);
			if(board.isCellAliveAt(row,column)) {
				jQ("#" + cellId).addClass('alive');
			} else {
				jQ("#" + cellId).removeClass('alive');
			}	
		});
	}

	function stopGame() {
		window.clearInterval(intervalId);
		jQ("#information").text("Game stopped");	
	}

	function startGame() {
		intervalId = window.setInterval(function() {
			updateScreen();
		}, 100);
		jQ("#information").text("Game in progress");	
	}

	this.constructExternalBoardRepresentation = function () {
		var row = "";
		for(var i=0; i<game.of.life.parameters.height; i++) {
			row = row + '<div class="row">';
			for(var j=0; j<game.of.life.parameters.width; j++) {
				row = row + '<div class="cell" id=' + i + '-' + j + '></div>';
			}
			row = row + '</div>';
		}	
		return row;
	}
	
	this.setUpMouseEvents = function() {
		jQ('.board').mouseleave(function() {
			jQ("#cellInformation").text("No cell selected.");	
		});
		jQ('.cell').mouseenter(function() {	
			updateMessage(jQ(this));	
		});
		jQ('.cell').click(function(e) {
			jQ(this).toggleClass('alive');
			board.updateCellAt(
				getXCoordinateOfCell(jQ(this).attr("id")), 
				getYCoordinateOfCell(jQ(this).attr("id")), 
	 			jQ(this).hasClass('alive')
			);
			updateMessage(jQ(this));	
		});
		jQ("#startButton").click(function() {
			startGame();
		});
		jQ("#stopButton").click(function() {
			stopGame();
		});
		jQ("#clearButton").click(function() {
			stopGame();
			clearBoard();
		});
	}
	
	this.getBoard = function() {
		return board;
	}
}


