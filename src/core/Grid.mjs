import { Model } from "../lib/UIX.mjs"
import { History } from "./History.mjs"
import { Tile } from "./Tile.mjs"

export class Grid extends Model {

	#tiles = new Set()
	#score = 0
	get score() {
		return this.#score
	}

	#rows
	#cols

	get rows() { return this.#rows }
	get cols() { return this.#cols }
	get score() { return this.#score }
	get isEmpty() { return this.#tiles.size == 0 }

	#history = new History();

	constructor(rows = 4, cols = 4) {
		super()
		this.#rows = rows
		this.#cols = cols
	}

	getTiles() {
		return [...this.#tiles]
	}

	addTile(tile) {
		this.#tiles.add(tile)

		tile.on?.('destroy', () => {
			this.#tiles.delete(tile)
		})
	}

	getRow(n) {
		return [...this.#tiles]
			.filter(t => t.row === n)
			.sort((a, b) => a.col - b.col)
	}

	getCol(n) {
		return [...this.#tiles]
			.filter(t => t.col === n)
			.sort((a, b) => a.row - b.row)
	}

	getEmptyCells() {

		const cells = []

		for (let r = 0; r < this.#rows; r++) {
			for (let c = 0; c < this.#cols; c++) {
				const occ = [...this.#tiles].find(t => t.row === r && t.col === c)
				if (!occ) cells.push({ row: r, col: c })
			}
		}

		return cells
	}


	#slideLine(tiles, index, isVert, isRev) {
		let hasMerge = false

		let target = 0
		if (isRev) target = (isVert ? this.#rows : this.#cols) - 1

		const step = isRev ? -1 : 1
		let last = tiles.length - 1

		for (let i = 0; i < tiles.length; i++) {

			const tile = tiles[i]

			let next = tiles[i + 1]

			const row = isVert ? target : index
			const col = isVert ? index : target

			if (tile.row == row && tile.col == col) {
				if (i === last)
					tile._emit('stuckOnTop', { isVert, isRev })
				else
					tile._emit('stuck', { isVert, isRev })
			} else {
				tile.move(row, col)
			}
			if (next && tile.canMerge(next)) {
				tile.mergeWith(next)

				this.#score += tile.value
				this.#tiles.delete(next)
				i++

				hasMerge ||= true
			}
			target += step
		}

		return { hasMerge }
	}


	slide(direction) {

		const isVert = direction === "up" || direction === "down"
		const isRev = direction === "down" || direction === "right"

		let hasMerge = false

		const count = isVert ? this.#cols : this.#rows

		for (let i = 0; i < count; i++) {
			let tiles = isVert ? this.getCol(i) : this.getRow(i)

			if (isRev) tiles = [...tiles].reverse()

			const rsult = this.#slideLine(tiles, i, isVert, isRev)
			hasMerge ||= rsult.hasMerge
		}
		this.#history.push(this.serialize())
		this._emit('update', { hasMerge })
		this.triggerAutoSave();
	}

	clear() {
		this.#score = 0
		this.#tiles.clear()
		this._emit('update', {})
	}

	spawnRandom() {

		const empties = this.getEmptyCells()
		if (!empties.length) return

		const cell = empties[Math.floor(Math.random() * empties.length)]
		const value = Math.random() < 0.9 ? 2 : 4
		const tile = new Tile(this, cell.row, cell.col, value)
		this.addTile(tile)

		this._emit('spawn', tile)
		tile._emit('spawn')
	}

	undo() {
		const previous = this.#history.undo();
		if (!previous) return;
		this.hydrate(previous)
		this.save()
	}

	checkGameOver() {
		const empties = this.getEmptyCells();
		if (empties.length > 0) return false;

		// Si plein, on vérifie si une fusion est encore possible horizontalement ou verticalement
		const tilesArray = [...this.#tiles];

		for (let t of tilesArray) {
			// Check voisin droite et bas
			const neighbors = tilesArray.filter(n =>
				(n.row === t.row && n.col === t.col + 1) ||
				(n.col === t.col && n.row === t.row + 1)
			);
			if (neighbors.some(n => n.value === t.value)) return false;
		}

		this._emit('gameover', { score: this.#score });
		return true;
	}

	#saveTimeout;
	triggerAutoSave() {
		clearTimeout(this.#saveTimeout);
		this.#saveTimeout = setTimeout(() => {
			Model.save(this)
			console.log("💾 Jeu sauvegardé");
		}, 500);
	}

	hydrate(data) {
		if (!data) return;

		// 1. Nettoyage complet
		this.#tiles.forEach(t => t._emit('destroy'));
		this.#tiles.clear();

		// 2. Restauration des propriétés
		this.#score = data.score || 0;
		this.#rows = data.rows || 4;
		this.#cols = data.cols || 4;

		// 3. Recréation des tuiles
		if (data.tiles) {
			data.tiles.forEach(tData => {
				const tile = new Tile(this, tData.row, tData.col, tData.value);
				this.addTile(tile);
				// On émet spawn pour que l'UI crée le composant visuel
				this._emit('spawn', tile);
			});
		}

		this._emit('update', { isRestored: true });
	}
	serialize() {
		return {
			rows: this.#rows,
			cols: this.#cols,
			score: this.#score,
			tiles: [...this.#tiles].map(t => t.serialize())
		}
	}
}