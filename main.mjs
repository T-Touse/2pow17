import { createTile, updatePos } from "./src/components/Tile.mjs";
import { onMove } from "./src/control.mjs";

const container = document.getElementById('tile-layer');
const scoreBoard = document.getElementById('score');

let grid = Array(4).fill().map(() => Array(4).fill(null));
let score = 0;

function setScore(score) {
	scoreBoard.textContent = score;
}

function addRandomTile() {
	const empties = [];
	for (let r = 0; r < 4; r++)
		for (let c = 0; c < 4; c++)
			if (!grid[r][c])
				empties.push({ r, c });
	if (!empties.length) return;
	const { r, c } = empties[Math.floor(Math.random() * empties.length)];
	const tile = createTile(Math.random() < 0.9 ? 2 : 4, r, c);
	grid[r][c] = tile
	container.appendChild(tile.el)
}

function initGame() {
	container.innerHTML = '';
	grid = Array(4).fill().map(() => Array(4).fill(null));
	score = 0;
	setScore(score);
	addRandomTile();
	addRandomTile();
}
export function slide(line) {
	// 1. Filtrer les nulls (tasser)
	let tiles = line.filter(t => t !== null);
	let scoreGain = 0;
	let moved = false;

	// 2. Fusionner
	for (let i = 0; i < tiles.length - 1; i++) {
		if (tiles[i].v === tiles[i + 1].v) {
			tiles[i].v *= 2;
			scoreGain += tiles[i].v;
			// On marque la tuile fusionnée pour destruction
			tiles[i + 1].merged = true;
			tiles.splice(i + 1, 1);
			moved = true;
		}
	}

	// 3. Remplir de nulls pour revenir à 4
	while (tiles.length < 4) tiles.push(null);
	return { tiles, scoreGain, moved };
}
// main.mjs (complément)

function move(direction) {
	let hasChanged = false;
	let totalScoreGain = 0;

	for (let i = 0; i < 4; i++) {
		// Extraction de la ligne ou colonne
		let line = [];
		for (let j = 0; j < 4; j++) {
			const r = (direction === 'up' || direction === 'down') ? j : i;
			const c = (direction === 'up' || direction === 'down') ? i : j;
			line.push(grid[r][c]);
		}

		// Sens de lecture
		const isReverse = (direction === 'right' || direction === 'down');
		if (isReverse) line.reverse();

		// Calcul du mouvement
		const result = slide(line);
		if (isReverse) result.tiles.reverse();
		if (result.moved) hasChanged = true;
		totalScoreGain += result.scoreGain;

		// Mise à jour de la grille et des positions
		for (let j = 0; j < 4; j++) {
			const r = (direction === 'up' || direction === 'down') ? j : i;
			const c = (direction === 'up' || direction === 'down') ? i : j;

			const tile = result.tiles[j];
			if (grid[r][c] !== tile) hasChanged = true;

			grid[r][c] = tile;

			if (grid[r][c]) {
				// On met à jour la valeur visuelle (au cas où fusion)
				grid[r][c].el.textContent = grid[r][c].v;
				grid[r][c].el.className = `tile tile-${grid[r][c].v}`;
				// Animation de déplacement
				updatePos(grid[r][c].el, r, c);
			}
		}
	}

	if (hasChanged) {
		score += totalScoreGain;
		setScore(score);
		setTimeout(addRandomTile, 110); // Délai pour laisser l'animation finir
		if (navigator.vibrate) navigator.vibrate(10);
	}
}

// Branchement
onMove((dir) => move(dir));
initGame()