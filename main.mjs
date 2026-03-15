import { onMove } from "./src/control.mjs";
import { useGridView } from "./src/components/Grid.mjs";
import { Grid } from "./src/core/Grid.mjs";
import { setScore } from "./src/components/ScoreBoard.mjs";

const container = document.getElementById('tile-layer');
const scoreBoard = document.getElementById('score');
const gameOverScreen = document.getElementById('game-over');
const finalScoreText = document.getElementById('final-score');
const retryBtn = document.getElementById('retry-btn');

const [element, grid] = useGridView(new Grid(4), container);
function initGame() {
	grid.clear()
	grid.spawnRandom()
	grid.spawnRandom()
}

grid.on('update', () => {
	gameOverScreen.classList.remove('visible');
	setScore(scoreBoard, grid.score)
	grid.checkGameOver();
	grid.spawnRandom();
})

grid.on('gameover', ({ score }) => {
	finalScoreText.textContent = score;
	gameOverScreen.classList.add('visible');

	// Petite vibration longue pour marquer la défaite
	if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
});

// Branchement
onMove((dir) => {
	grid.slide(dir)
	if (navigator.vibrate) navigator.vibrate(20);
});
initGame()

window.initGame = initGame
window.undo = ()=>grid.undo()