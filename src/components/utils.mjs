let cellPositions = []
function computeCellPositions(){
	const container = document.body
	const cells = [...container.querySelectorAll(".cell-empty")]
	const rect = container.getBoundingClientRect()

	cellPositions = cells.map(cell=>{
		const r = cell.getBoundingClientRect()

		return {
			x: r.left - rect.left,
			y: r.top - rect.top
		}
	})
}
window.addEventListener('resize',computeCellPositions)
computeCellPositions()


export function getPos(row,col,cols){

	const index = row*cols+col

	return cellPositions[index]
}