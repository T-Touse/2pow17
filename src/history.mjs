let history = [];

function saveHistory() {
	const snap = grid.map(row => row.map(cell => cell ? { v: cell.v } : null));
	history.push({ snap, score });
	if (history.length > 5) history.shift();
}

function undo() {
	if (!history.length) return;
	const last = history.pop();
	score = last.score;
	document.getElementById('score').textContent = score;
	container.innerHTML = '';
	grid = last.snap.map((row, r) => row.map((c, col) => c ? createTile(c.v, r, col) : null));
}