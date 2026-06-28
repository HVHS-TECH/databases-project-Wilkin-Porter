/*****************************************************************************************************/
// P5.play: game.js
// Vacuuming Simulator Main Script
// Written by Wilkin Porter - Term 1 2026
/*****************************************************************************************************/


/*****************************************************************************************************/
// Global Variables, Constants and Arrays
/*****************************************************************************************************/

// This is a variable so it can be changed in the console, it could just as easily be a constant.
// Set to 'true' to enable performance stats and removal zone visualisation
let debugModeEnable = false;

// This is a variable so it can be changed in the console, it could just as easily be a constant.
// Set to 'boost' so the player can press spacebar to increase their suction radius temporarily
// set to 'display' so the vacuum cleaner displays how much dust is left
// Set to 'none' so the vacuum cleaner only shows full and doesn't change
let indicatorMode = 'boost';

const PLAYER_MOVEMENT_SPEED = 4;
const PLAYER_ROTATION_SPEED = 1.7;
const DUST_TO_SPAWN = 10000;
const DUST_SIZE = 6;
const DUST_MOVEMENT_SPEED = 0.4; // Lower number = faster
const WALL_THICKNESS = 1;
const WALL_DUST_SPAWNING_OFFSET = 6;
const MOVE_RADIUS_NORMAL = 55;
const MOVE_RADIUS_BOOST = 100;
const REMOVAL_RADIUS = 30;
const MOVE_DISTANCE_FROM_PLAYER = 80;
const REMOVAL_DISTANCE_FROM_PLAYER = 62;
const TEXT_REMOVE_ZONE_X = 260;
const TEXT_REMOVE_ZONE_Y = 95;

const dustArray = [];

let playerDirection = 270;
let movingInReverse = false;
let dustLeft = 0;
let totalDustSucked = 0;
let moveRadius = 55;
let timer = 0;
let timerSecs = 0;
let timerMins = 0;
let gameMode = 'startScreen';
let gameModePostGame = '';
let initialising = true;
let scale;
let changePlayerImageBoostModeTimer;
let changePlayerImageBoostMode = 'ready';

let canvas;
let player;
let dustGroup;
let textBackground;
let freeRoamExitButton;
let timeTrialStartButton;
let freeRoamStartButton;
let controlsButton;
let userInterfaceGroup;
let wallsGroup;

let indicatorHigh;
let indicatorMedium;
let indicatorLow;
let indicatorNone;


/*****************************************************************************************************/
// preload()
// Loads assets before setup() is called
/*****************************************************************************************************/
function preload() {
	indicatorHigh = loadImage('assets/indicatorHigh.png');
	indicatorMedium = loadImage('assets/indicatorMedium.png');
	indicatorLow = loadImage('assets/indicatorLow.png');
	indicatorNone = loadImage('assets/indicatorNone.png');
}


/*****************************************************************************************************/
// setup()
// Initialises things such as sprites, also supplimented by the initialisation section in 
// each gamemode's function
/*****************************************************************************************************/
function setup() {
	// Best Time Setup
	if (localStorage.getItem('bestTimeTimer') == null) {
		localStorage.setItem('bestTimeMins', 5);
		localStorage.setItem('bestTimeSecs', 0);
		localStorage.setItem('bestTimeTimer', 300);
	}

	// Canvas
	if (windowWidth / 16 > windowHeight / 9) {
		canvas = createCanvas(((windowHeight / 9) * 16) - 4, windowHeight - 4);
	} else {
		canvas = createCanvas(windowWidth - 4, ((windowWidth / 16) * 9) - 4);
	}
	
	//cnv = createCanvas(640, 360);
	canvas.position((windowWidth/2) - (width/2), (windowHeight/2) - (height/2));

	// Scale
	scale = width/1916; // 1916 is the regular width, where scale = exactly 1

	// User Interface Group
	userInterfaceGroup = new Group();

	// Buttons
	timeTrialStartButton = new Sprite(width/2, height/2 - (40 * scale), 450, 60, 'kinematic');
	timeTrialStartButton.color = '#1f8f28';
	timeTrialStartButton.textSize = 30 * scale;
	timeTrialStartButton.text = 'Start Time Trial';
	timeTrialStartButton.scale = scale;
	userInterfaceGroup.add(timeTrialStartButton);

	freeRoamStartButton = new Sprite(width/2, height/2 + (40 * scale), 450, 60, 'kinematic');
	freeRoamStartButton.color = '#2269ac';
	freeRoamStartButton.textSize = 30 * scale;
	freeRoamStartButton.text = 'Start Free Roam';
	freeRoamStartButton.scale = scale;
	userInterfaceGroup.add(freeRoamStartButton);

	controlsButton = new Sprite(width/2, height/2 + (120 * scale), 450, 60, 'kinematic');
	controlsButton.color = '#5a5a5a';
	controlsButton.textSize = 30 * scale;
	controlsButton.text = 'View Controls';
	controlsButton.scale = scale;

	// Title Text 
	titleBox = new Sprite(width/2, height/4, 600, 100, 'kinematic');
	titleBox.color = 'white';
	titleBox.textSize = 50 * scale;
	titleBox.text = 'Vacuuming Simulator';
	titleBox.scale = scale;
	userInterfaceGroup.add(titleBox);

	// Player
	player = new Sprite(width/2, height/2, 165, 85, 'dynamic');
	player.rotation = playerDirection;
	player.direction = playerDirection;
	player.scale = scale;
	player.visible = false;

	// In Game Score
	textBackground = new Sprite(
		WALL_THICKNESS + (TEXT_REMOVE_ZONE_X / 2) * scale, 
		WALL_THICKNESS + (TEXT_REMOVE_ZONE_Y / 2) * scale, 
		TEXT_REMOVE_ZONE_X, 
		TEXT_REMOVE_ZONE_Y, 
		'kinematic'
	);
	textBackground.color = 'white';
	textBackground.scale = scale;
	textBackground.visible = false;

	// Free Roam Exit Button
	freeRoamExitButton = new Sprite(
		WALL_THICKNESS + (TEXT_REMOVE_ZONE_X / 2) * scale, 
		WALL_THICKNESS + ((TEXT_REMOVE_ZONE_Y / 2) + (TEXT_REMOVE_ZONE_Y / 4)) * scale, 
		TEXT_REMOVE_ZONE_X, 
		TEXT_REMOVE_ZONE_Y/2, 
		'kinematic'
	);
	freeRoamExitButton.color = '#cc4444';
	freeRoamExitButton.textSize = 30 * scale;
	freeRoamExitButton.text = 'Exit Free Roam';
	freeRoamExitButton.scale = scale;
	freeRoamExitButton.visible = false;

	// Post Game Score
	scoreBox = new Sprite(width/2, height/2, 350, 200, 'none');
	scoreBox.color = 'white';
	scoreBox.scale = scale;
	scoreBox.visible = false;

	// Collision Walls
	wallsGroup = new Group();
	wallLH = new Sprite(WALL_THICKNESS, height/2, WALL_THICKNESS, height, 'kinematic');
	wallLH.color = 'black';
	wallsGroup.add(wallLH);
	wallRH = new Sprite(width - WALL_THICKNESS, height/2, WALL_THICKNESS, height, 'kinematic');
	wallRH.color = 'black';
	wallsGroup.add(wallRH);
	wallTop = new Sprite(width/2, WALL_THICKNESS, width, WALL_THICKNESS, 'kinematic');
	wallTop.color = 'black';
	wallsGroup.add(wallTop);
	wallBot = new Sprite(width/2, height - WALL_THICKNESS, width, WALL_THICKNESS, 'kinematic');
	wallBot.color = 'black';
	wallsGroup.add(wallBot);
	wallsGroup.visible = false;
}


/*****************************************************************************************************/
// draw()
// Runs every frame, calls every gamemode function 
/*****************************************************************************************************/
function draw() {
	background('lightgrey'); 

	// Debug
	if (debugModeEnable == true) {
		p5play.renderStats = true;
	} else {
		p5play.renderStats = false;
	}

	if (gameMode == 'timeTrial') {
		timeTrial();
		return;
	}

	if (gameMode == 'freeRoam') {
		freeRoam();
		return;
	}
	
	if (gameMode == 'startScreen') {
		startScreen();
		return;
	}

	if (gameMode == 'endScreen') {
		endScreen();
		return;
	}

	if (gameMode == 'controlsScreen') {
		controlsScreen();
		return;
	}
}


/*****************************************************************************************************/
// spawnDust()
// Parameter 1: How many particles to create / add to the array
// Called by timeTrial() and freeRoam()
// Adds (parameter 1) pieces of dust with a random position and colour to the dustArray, then calls 
// removeDust() and moveDust(), and if any dust is not visible it chooses a new random position for 
// those pieces of dust, it continues doing that until all dust are visible
/*****************************************************************************************************/
function spawnDust(dustToSpawn) {
	for (let i = 0; i < dustToSpawn; i++) {
		dustArray.push({
			xPos: random(WALL_DUST_SPAWNING_OFFSET, width-WALL_DUST_SPAWNING_OFFSET), 
			yPos: random(WALL_DUST_SPAWNING_OFFSET, height-WALL_DUST_SPAWNING_OFFSET), 
			color: random(['#633a0e', '#855624', '#2e1a05']),
			visible: true
		});
	}

	// Call these functions, which make colliding dust not visible
	moveDust();
	removeDust();
	
	// Checks if there is any dust not visible
	while (calculateDustLeft() < DUST_TO_SPAWN) {
		// Chooses a new posittion for non visible dust, then makes it visible
		for (let i = 0; i < dustArray.length; i++) {
			if (dustArray[i].visible == false) {
				dustArray[i].xPos = random(WALL_DUST_SPAWNING_OFFSET, width-WALL_DUST_SPAWNING_OFFSET);
				dustArray[i].yPos = random(WALL_DUST_SPAWNING_OFFSET, height-WALL_DUST_SPAWNING_OFFSET);
				dustArray[i].visible = true;
			} 
		}
		// Call these functions again, to hide colliding dust, then runs the loop until no dust is left non visible
		moveDust();
		removeDust();
	}
}


/*****************************************************************************************************/
// handleInput()
// Called by timeTrial() and freeRoam()
// Handles the keyboard inputs and changes the movement and rotation of the player sprite.
// If both back and forward arrows or the w and s keys are pressed it stops movement.
/*****************************************************************************************************/
function handleInput() {
	if (kb.pressing('left')) {
		if (movingInReverse == false) {
			playerDirection = playerDirection - PLAYER_ROTATION_SPEED;
		} else {
			playerDirection = playerDirection + PLAYER_ROTATION_SPEED;
		}
	};
	if (kb.pressing('right')) {
		if (movingInReverse == false) {
			playerDirection = playerDirection + PLAYER_ROTATION_SPEED;
		} else {
			playerDirection = playerDirection - PLAYER_ROTATION_SPEED;
		}
	};
	
	// Update the player rotation since player direction variable is independent to fix a visual bug
	player.rotation = playerDirection;
	player.direction = playerDirection;

	// Checks if both forward and reverse keys are pressed at the same time, if not it moves on
	if (kb.pressing('down') && kb.pressing('up')) {
		player.speed = 0;
		movingInReverse = false;
	} else {
		if (kb.pressing('up')) {
			player.speed = PLAYER_MOVEMENT_SPEED * scale;
		};

		if (kb.pressing('down')) {    
			player.speed = -PLAYER_MOVEMENT_SPEED * scale;
			movingInReverse = true;
		};
	}
	
	if (kb.released('up')) {    
		player.speed = 0;
	};

	if (kb.released('down')) {    
		player.speed = 0;
		movingInReverse = false;
	};
}


/*****************************************************************************************************/
// drawDust()
// Called by timeTrial() and freeRoam()
// Goes through the array, and for any pieces of dust that are visible, it draws a point with that 
// dust's colour at it's x and y position
/*****************************************************************************************************/
function drawDust() {
	for (let i = 0; i < dustArray.length; i++) {
		// Only draws dust that is visible
		if (dustArray[i].visible == true) {
			stroke(dustArray[i].color);
			strokeWeight(DUST_SIZE * scale);
			point(dustArray[i].xPos, dustArray[i].yPos);
		}
	}

	// Reset stroke size and colour
	stroke('black');
	strokeWeight(1);
}


/*****************************************************************************************************/
// moveDust()
// Called by timeTrial(), freeRoam() and spawnDust()
// Uses sine and cosine to find the x and y position of a point ahead of the player, then it uses
// pythagoras to find the distance from the x and y position of each piece of dust in the array to the
// x and y position of the point ahead of the player, if the distance is shorter than moveRadius,
// then it changes that piece of dusts x and y position to the horizontal and vertical distance between
// the dust and the point ahead of the player divided by DUST_MOVEMENT_SPEED divided by the direct 
// distance between the point ahead of the player and the piece of dust
// Also, when initialising it makes any dust in the move circle not visible so they will be redraw in 
// the spawnDust() function.
/*****************************************************************************************************/
function moveDust() {
	// Finding the position of the point ahead of the player
	let xPosDustMoveCircle = player.x + cos(player.rotation) * MOVE_DISTANCE_FROM_PLAYER * scale;
	let yPosDustMoveCircle = player.y + sin(player.rotation) * MOVE_DISTANCE_FROM_PLAYER * scale;

	// Debug
	if (debugModeEnable == true) {
		noFill();
		stroke('cyan');
		circle(xPosDustMoveCircle, yPosDustMoveCircle, (moveRadius * 2) * scale); 
		fill('black')
		stroke('black');
	}

	// Goes through the array to check if dust is in a circle around the point ahead of the player
	for (let i = 0; i < dustArray.length; i++) {
		if (((dustArray[i].xPos - xPosDustMoveCircle) ** 2) + ((dustArray[i].yPos - yPosDustMoveCircle) ** 2) < ((moveRadius * scale) ** 2)) {
			// Changes the piece of dust's x and y position of the dust that is colliding with the circle around the point ahead of the player
			// to the horizontal and vertical distance between the dust and the point ahead of the player divided by DUST_MOVEMENT_SPEED 
			// divided by the direct distance between the point ahead of the player and the piece of dust that is colliding
			dustArray[i].xPos = dustArray[i].xPos - ((dustArray[i].xPos - xPosDustMoveCircle) / DUST_MOVEMENT_SPEED / (Math.sqrt(((dustArray[i].xPos - xPosDustMoveCircle) ** 2) + ((dustArray[i].yPos - yPosDustMoveCircle) ** 2))));
			dustArray[i].yPos = dustArray[i].yPos - ((dustArray[i].yPos - yPosDustMoveCircle) / DUST_MOVEMENT_SPEED / (Math.sqrt(((dustArray[i].yPos - yPosDustMoveCircle) ** 2) + ((dustArray[i].xPos - xPosDustMoveCircle) ** 2))));
		}

		// For spawn dust it makes it non visible imediately so it can be moved to a new location
		if (initialising == true && ((dustArray[i].xPos - xPosDustMoveCircle) ** 2) + ((dustArray[i].yPos - yPosDustMoveCircle) ** 2) < ((moveRadius * scale) ** 2)) {
			dustArray[i].visible = false;
		}
	}
}


/*****************************************************************************************************/
// removeDust()
// Called by timeTrial(), freeRoam() and spawnDust()
// Uses sine and cosine to find the x and y position of a point ahead of the player, then it uses
// pythagoras to find the distance from the x and y position of each piece of dust in the array to the
// x and y position of the point ahead of the player, if the distance is shorter than REMOVAL_RADIUS,
// then it sets that piece of dusts visible parameter to false (this essentially creates a removal 
// circle ahead of the player)
// It also checks if dust is behind the timer display and if it is then it sets that dusts visible
// parameter to false
/*****************************************************************************************************/
function removeDust() {
	// Finding the position of the point ahead of the player
	let xPosDustRemovalCircle = player.x + cos(player.rotation) * REMOVAL_DISTANCE_FROM_PLAYER * scale;
	let yPosDustRemovalCircle = player.y + sin(player.rotation) * REMOVAL_DISTANCE_FROM_PLAYER * scale;

	// Debug
	if (debugModeEnable == true) {
		noFill();
		stroke('purple');
		circle(xPosDustRemovalCircle, yPosDustRemovalCircle, (REMOVAL_RADIUS * 2) * scale); 
		fill('black')
		stroke('black');
	}

	// Goes through the array to check if dust is in a circle around the point ahead of the player
	for (let i = 0; i < dustArray.length; i++) {
		if (((dustArray[i].xPos - xPosDustRemovalCircle) ** 2) + ((dustArray[i].yPos - yPosDustRemovalCircle) ** 2) < ((REMOVAL_RADIUS * scale) ** 2) && dustArray[i].visible == true) {
			// If dust is colliding with the circle, set it to be not visible
			dustArray[i].visible = false;

			// if initialising is not true (in game) and a dust is set to not visible, 
			// then increase this counter that is used in the freeroam mode to tell the player the total dust sucked up
			if (initialising !== true) {
				totalDustSucked = totalDustSucked + 1;
			}
		}

		// Used for spawnDust(), if dust is colliding with the text box in the top left, 
		// it is set to not visible which means it's relocated
		if (initialising == true && 
			dustArray[i].xPos < (TEXT_REMOVE_ZONE_X + WALL_DUST_SPAWNING_OFFSET) * scale && 
			dustArray[i].yPos < (TEXT_REMOVE_ZONE_Y + WALL_DUST_SPAWNING_OFFSET) * scale
		) {
			dustArray[i].visible = false;
		}
	}
}


/*****************************************************************************************************/
// calculateDustLeft()
// Called by spawnDust(), timeTrial(), and freeRoam()
// Goes through the array and for every piece of dust that is visible it increments a counter
// It outputs a variable called dustLeft and also returns the counter
/*****************************************************************************************************/
function calculateDustLeft() {
	let dustLeftTemporary = 0;

	// Goes through the array and if any dust is visible it increases the counter
	for (let i = 0; i < dustArray.length; i++) {
		if (dustArray[i].visible == true) {
			dustLeftTemporary++;
		}
	}

	// Sets dustLeft to the amount of dust particles drawn, 
	// so that this function only has to be called once per frame, improving performance
	dustLeft = dustLeftTemporary; 

	// Returns the amount of dust particles drawn for places where 
	// this function isn't called before dustLeft is needed
	return dustLeftTemporary;
}


/*****************************************************************************************************/
// changePlayerImage()
// This changes what the battery on the vacuum cleaner does in all 3 modes, changed with indicatorMode
// If set to boost, the player can press the spacebar to boost the vacuum radius for 3 seconds before
// it must recharge for 9 seconds. While it is recharging it cannot be used again.
// If set to display, it will display the dust left to vacuum going from low indicator to high.
// If set to none, it will always be full.
/*****************************************************************************************************/
function changePlayerImage() {
	// Boost mode
	if (indicatorMode == 'boost') {
		// Detect spacebar press
		if (kb.presses('space') && changePlayerImageBoostMode == 'ready') {
			moveRadius = MOVE_RADIUS_BOOST;
			changePlayerImageBoostModeTimer = 3;
			changePlayerImageBoostMode = 'discharge';
		}

		// Boost radius and lower charge.
		if (changePlayerImageBoostMode == 'discharge') {
			if (frameCount % 60 == 0 && changePlayerImageBoostModeTimer > 0) {
				changePlayerImageBoostModeTimer--;

				// Change player image
				if (changePlayerImageBoostModeTimer == 2) {
					player.image = (indicatorMedium);
				}

				if (changePlayerImageBoostModeTimer == 1) {
					player.image = (indicatorLow);
				}

				if (changePlayerImageBoostModeTimer == 0) {
					player.image = (indicatorNone);
				}
			}

			// When timer runs out switch to charging
			if (changePlayerImageBoostModeTimer == 0) {
				moveRadius = MOVE_RADIUS_NORMAL;
				changePlayerImageBoostModeTimer = 9;
				changePlayerImageBoostMode = 'charge';
				
			}
		}

		// Return radius to regular size and increase charge. 
		if (changePlayerImageBoostMode == 'charge') {
			if (frameCount % 60 == 0 && changePlayerImageBoostModeTimer > 0) {
				changePlayerImageBoostModeTimer--;

				// Change player image
				if (changePlayerImageBoostModeTimer == 6) {
					player.image = (indicatorLow);
				}

				if (changePlayerImageBoostModeTimer == 3) {
					player.image = (indicatorMedium);
				}

				if (changePlayerImageBoostModeTimer == 0) {
					player.image = (indicatorHigh);
				}
			}

			// When timer runs out switch to ready state
			if (changePlayerImageBoostModeTimer == 0) {
				moveRadius = MOVE_RADIUS_NORMAL;
				changePlayerImageBoostMode = 'ready';
			}
		}
	}

	// Display mode
	if (indicatorMode == 'display') {
		// Change player image based on how much dust is left
		if (dustLeft < DUST_TO_SPAWN * 0.25) {
			player.image = (indicatorHigh);
			return;
		}

		if (dustLeft < DUST_TO_SPAWN * 0.5) {
			player.image = (indicatorMedium);
			return;
		}

		if (dustLeft < DUST_TO_SPAWN * 0.75) {
			player.image = (indicatorLow);
			return;
		}

		if (dustLeft < DUST_TO_SPAWN) {
			player.image = (indicatorNone);
			return;
		}
	}

	// Always full
	if (indicatorMode == 'none') {
		player.image = (indicatorHigh);
	}
}


/*****************************************************************************************************/
// displayText()
// Called by timeTrial() and freeRoam()
// If there is more than 0 dust left, then it counts total time in seconds (timer) counts seconds up to 
// 59 (timerSecs) before rolling over to minutes (timerMins). It displays timerSecs and timerMins on 
// the 'textBackground' sprite
/*****************************************************************************************************/
function displayText() {
	textBackground.textSize = 30 * scale;

	// Timer
	if (dustLeft !== 0 && frameCount % 60 == 0 && gameMode == 'timeTrial') {
		timer++;
		timerSecs = timer % 60;
		timerMins = Math.trunc(timer / 60);
	}

	// Display text
	if (gameMode == 'timeTrial') {
		if (timerMins < 1) {
			textBackground.text = "Dust Left: " + dustLeft + "\nTime: " + timerSecs + 's', 20, 40;
		} else {
			textBackground.text = "Dust Left: " + dustLeft + "\nTime: " + timerMins + 'm ' + timerSecs + 's', 20, 40;
		}
	} else {
		textBackground.text = "Dust Left: " + dustLeft, 20, 40;
	}
}


/*****************************************************************************************************/
// updateScoreBoxText()
// Called by endScreen()
// Displays the local best time and the current game time on the end screen, then if the current game 
// time is faster than the local time, it updates the local time to be the current game time. 
/*****************************************************************************************************/
function updateScoreBoxText() {
	scoreBox.textSize = 30 * scale;

	// Gets the timer from local storage, converts it to an integer and if the local time is 
	// less than the saved time it updates the saved time to be the local time.
	if (parseInt(localStorage.getItem('bestTimeTimer')) > timer) {
		localStorage.setItem('bestTimeMins', timerMins);
		localStorage.setItem('bestTimeSecs', timerSecs);
		localStorage.setItem('bestTimeTimer', timer);
	}

	// ********************************************************************************************************************* // Added lines for database update
	if (timerMins < 1) {
		fb_writeVacuumingSimulator(timer, timerSecs + 's'); 
	} else {
		fb_writeVacuumingSimulator(timer, timerMins + 'm ' + timerSecs + 's'); 
	}
	

	// Displays the text in the box
	if (parseInt(localStorage.getItem('bestTimeMins')) < 1) {
		if (timerMins < 1) {
			scoreBox.text = 
			'Your Time:\n' + timerSecs + 's' + 
			'\nBest Time:\n' + localStorage.getItem('bestTimeSecs') + 's';
		} else {
			scoreBox.text = 
			'Your Time:\n' + timerMins + 'm ' + timerSecs + 's' + 
			'\nBest Time:\n' + localStorage.getItem('bestTimeSecs')  + 's';
		}
	} else {
		if (timerMins < 1) {
			scoreBox.text = 
			'Your Time:\n' + timerSecs + 's' + 
			'\nBest Time:\n' + localStorage.getItem('bestTimeMins') + 'm ' + localStorage.getItem('bestTimeSecs') + 's';
		} else {
			scoreBox.text = 
			'Your Time:\n' + timerMins + 'm ' + timerSecs + 's' + 
			'\nBest Time:\n' + localStorage.getItem('bestTimeMins') + 'm ' + localStorage.getItem('bestTimeSecs') + 's';
		}
	}
}


/*****************************************************************************************************/
// timeTrial()
// Called by draw()
// On the first loop it initialises certain things, like spawning dust and changing the visibility of
// sprites and groups of sprites, then it calls other functions.
// This gamemode diplays the endscreen when every piece of dust is no longer visible.
/*****************************************************************************************************/
function timeTrial() {
	// Similar to the setup() function, it's run only on the first time this function is called, and
	// used for things like resetting variables and visibilty when starting a new game
	if (initialising == true) {
		gameModePostGame = 'timeTrial';
		totalDustSucked = 0;
		player.rotation = playerDirection;
		player.direction = playerDirection;

		spawnDust(DUST_TO_SPAWN);

		textBackground.y = WALL_THICKNESS + ((TEXT_REMOVE_ZONE_Y / 2) * scale);
		textBackground.height = TEXT_REMOVE_ZONE_Y * scale;
			
		// Visibility
		player.visible = true;
		wallsGroup.visible = true;
		userInterfaceGroup.visible = false;
		userInterfaceGroup.collider = 'none';
		controlsButton.visible = false;
		controlsButton.collider = 'none';
		scoreBox.visible = false;
		textBackground.visible = true;
		initialising = false;
	}

	// Ran every frame, calls other functions
	handleInput();
	drawDust();
	moveDust();
	removeDust();
	calculateDustLeft();
	changePlayerImage();
	allSprites.draw();
	displayText();

	// Game end detection (no dust left)
	if (dustLeft == 0) {
		initialising = true;
		gameMode = 'endScreen';
	}
}


/*****************************************************************************************************/
// freeRoam()
// Called by draw()
// On the first loop it initialises certain things, like spawning dust and changing the visibility of
// sprites and groups of sprites, then it calls other functions.
// This gamemode deletes the dustArray, then respawns every piece of dust when every piece of dust is 
// no longer visible.
/*****************************************************************************************************/
function freeRoam() {
	// Similar to the setup() function, it's run only on the first time this function is called, and
	// used for things like resetting variables and visibilty when starting a new game
	if (initialising == true) {
		gameModePostGame = 'freeRoam';
		totalDustSucked = 0;
		player.rotation = playerDirection;
		player.direction = playerDirection;

		spawnDust(DUST_TO_SPAWN);

		textBackground.y = WALL_THICKNESS + ((TEXT_REMOVE_ZONE_Y / 4) * scale);
		textBackground.height = TEXT_REMOVE_ZONE_Y / 2 * scale;

		// Visibility
		player.visible = true;
		wallsGroup.visible = true;
		userInterfaceGroup.visible = false;
		userInterfaceGroup.collider = 'none';
		controlsButton.visible = false;
		controlsButton.collider = 'none';
		scoreBox.visible = false;
		textBackground.visible = true;
		freeRoamExitButton.visible = true;
		initialising = false;
	}

	// Ran every frame, calls other functions
	handleInput();
	drawDust();
	moveDust();
	removeDust();
	calculateDustLeft();
	changePlayerImage();
	allSprites.draw();
	displayText();

	// Respawn dust
	if (dustLeft == 0) {
		initialising = true;
		dustArray.length = 0;
		spawnDust(DUST_TO_SPAWN);
		initialising = false;
	}

	// Game end detection (exit button)
	if (freeRoamExitButton.mouse.presses('left')) {
		initialising = true;
		gameMode = 'endScreen';
	}
}


/*****************************************************************************************************/
// startScreen()
// Called by draw()
// On the first run it resets everything associated with the controls screen, just in case the game is 
// going back from the controls screen. Then the function detects presses of the two start buttons and 
// the controls button, then starts each gamemode (or changes to the controls screen) respectively
/*****************************************************************************************************/
function startScreen() {
	// Similar to the setup() function, it's run only on the first time this function is called, and
	// used for things like resetting variables and visibilty when starting a new game
	if (initialising == true) {
		controlsButton.y = height/2 + (120 * scale)
		controlsButton.text = 'View Controls';

		if (indicatorMode == 'display') {
			player.image = (indicatorNone);
		} else {
			player.image = (indicatorHigh);
		}

		userInterfaceGroup.visible = true;
		userInterfaceGroup.collider = 'kinematic';
		
		scoreBox.visible = false;
		scoreBox.width = 350 * scale;
		scoreBox.height = 200 * scale;
		scoreBox.text = '';
		freeRoamExitButton.visible = false;
		initialising = false;
	}

	// Button presses
	if (timeTrialStartButton.mouse.presses('left')) {
		initialising = true;
		gameMode = 'timeTrial';
	}

	if (freeRoamStartButton.mouse.presses('left')) {
		initialising = true;
		gameMode = 'freeRoam';
	}

	if (controlsButton.mouse.presses('left')) {
		initialising = true;
		gameMode = 'controlsScreen';
	}
}


/*****************************************************************************************************/
// endScreen()
// Called by draw()
// Stops the game, resets everything ready for another game, calls updateScoreBoxText() to display the
// current game time and the local best time, then waits for the user to press the start buttons, 
// similar to startScreen()
/*****************************************************************************************************/
function endScreen() {
	// Similar to the setup() function, it's run only on the first time this function is called, and
	// used for things like resetting variables and visibilty when starting a new game
	if (initialising == true) {
		// Reset player position, rotation, speed and image
		player.speed = 0;
		movingInReverse = false;
		player.x = width/2;
		player.y = height/2;
		playerDirection = 270;
		player.rotation = playerDirection;
		player.direction = playerDirection;
		changePlayerImageBoostModeTimer = 0;
		changePlayerImageBoostMode = 'ready';
		moveRadius = MOVE_RADIUS_NORMAL;
		if (indicatorMode == 'display') {
			player.image = (indicatorNone);
		} else {
			player.image = (indicatorHigh);
		}

		// Change position of start buttons 
		timeTrialStartButton.y = height / 1.3 - (40 * scale);
		freeRoamStartButton.y = height / 1.3 + (40 * scale);	

		// Display time, then reset the timers
		if (gameModePostGame == 'timeTrial') {
			updateScoreBoxText();
			timer = 0;
			timerSecs = 0;
			timerMins = 0;
		} else {
			scoreBox.textSize = 30 * scale;
			scoreBox.text = 'Total Dust Sucked Up\n' + totalDustSucked;
		}
		
		// Empty the array
		dustArray.length = 0;
			
		// Visibility
		player.visible = false;
		wallsGroup.visible = false;
		userInterfaceGroup.visible = true;
		userInterfaceGroup.collider = 'kinematic';
		scoreBox.visible = true;
		textBackground.visible = false;
		freeRoamExitButton.visible = false;
		initialising = false;
	}

	if (timeTrialStartButton.mouse.presses('left')) {
		initialising = true;
		gameMode = 'timeTrial';
	}

	if (freeRoamStartButton.mouse.presses('left')) {
		initialising = true;
		gameMode = 'freeRoam';
	}
}


/*****************************************************************************************************/
// controlsScreen()
// Called by draw()
// On the first run it display controls text in the score box that usually displays the final score, 
// it also changes the text of the controls button to act as a back button, and when pressed it brings 
// the game to the start screen
/*****************************************************************************************************/
function controlsScreen() {
	// Similar to the setup() function, it's run only on the first time this function is called, and
	// used for things like resetting variables and visibilty when starting a new game
	while (initialising == true) {
		controlsButton.visible = true;
		controlsButton.y = height/2 + (240 * scale)
		controlsButton.text = 'Back To Menu';

		userInterfaceGroup.visible = false;
		userInterfaceGroup.collider = 'none';
		
		scoreBox.visible = true;
		scoreBox.width = 350 * 4 * scale;
		scoreBox.height = 200 * 1.8 * scale;
		scoreBox.textSize = 30 * scale;

		// Display different controls for different indicator modes
		if (indicatorMode == 'boost') {
			scoreBox.text = 'WASD or arrow keys to move and rotate player.\n\nPress spacebar to boost your suction radius, your battery will decline and then recharge over time.\n\nIn time trial mode, vacuum all dust to win, your time will be recorded.\nIn free roam, vacuum as much or a little dust as you like and click exit free roam to end the game.';
		}

		if (indicatorMode == 'display') {
			scoreBox.text = 'WASD or arrow keys to move and rotate player.\n\nYour vacuum cleaner displays how much dust is left.\n\nIn time trial mode, vacuum all dust to win, your time will be recorded.\nIn free roam, vacuum as much or a little dust as you like and click exit free roam to end the game.';
		}

		if (indicatorMode == 'none') {
			scoreBox.text = 'WASD or arrow keys to move and rotate player.\n\nIn time trial mode, vacuum all dust to win, your time will be recorded.\nIn free roam, vacuum as much or a little dust as you like and click exit free roam to end the game.';
		}
		
		initialising = false;
	}

	if (controlsButton.mouse.presses('left')) {
		initialising = true;
		gameMode = 'startScreen';
	}
}