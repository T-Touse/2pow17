
export function toPos(col, row, grid) {
	return {
		gridColumn: col + 1,
		gridRow: row + 1
	}
}

export function setPos(el, col, row, grid) {
	const pos = toPos(col, row, grid)
	el.style.gridColumn = pos.gridColumn
	el.style.gridRow = pos.gridRow
}