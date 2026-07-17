import { onMove } from "./src/control.mjs";
import { useGridView } from "./src/components/Grid.mjs";
import { Grid } from "./src/core/Grid.mjs";
import { setScore } from "./src/components/ScoreBoard.mjs";
import { Model } from "./src/lib/UIX.mjs";

const container = document.getElementById('game-container');
const scoreBoard = document.getElementById('score');
const gameOverScreen = document.getElementById('game-over');
const finalScoreText = document.getElementById('final-score');
const retryBtn = document.getElementById('retry-btn');

const [element, grid] = useGridView(new Grid(5), container);
window.__grid = grid;

Model.load(grid)
grid.checkGameOver();

function restartGame() {
	gameOverScreen.classList.remove('visible');
	grid.clear()
	grid.spawnRandom()
	grid.spawnRandom()
}

grid.on('update', ({ hasMove, isRestored } = {}) => {
	gameOverScreen.classList.remove('visible');
	setScore(scoreBoard, grid.score)

	if (isRestored) return

	const isGameOver = grid.checkGameOver();
	if (isGameOver) return

	if (hasMove) {
		grid.spawnRandom();
	}
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
	grid.checkGameOver();
});

if(grid.isEmpty)
	restartGame()
else
	setScore(scoreBoard, grid.score)

window.restartGame = restartGame
window.undo = () => {
	grid.undo();
	gameOverScreen.classList.remove('visible');
}

window.addEventListener('visibilitychange', () => {
	if (document.visibilityState === 'hidden') {
		Model.save(grid)
	}
});