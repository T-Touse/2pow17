
export function toPos(col, row) {
	return {
		left: `${col * 25}%`,
		top: `${row * 25}%`
	}
}

export function setPos(el, col, row) {
	const pos = toPos(col, row)
	el.style.left = pos.left
	el.style.top = pos.top
}