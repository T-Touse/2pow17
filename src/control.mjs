function move(dir){
	subs.forEach(cb=>{
		cb(dir)
	})
}
const subs = new Set()
export function onMove(callback){
	subs.add(callback)
	return ()=>subs.delete(callback)
}

window.addEventListener('keydown', (e) => {
	if (e.key === 'ArrowUp') move('up');
	if (e.key === 'ArrowDown') move('down');
	if (e.key === 'ArrowLeft') move('left');
	if (e.key === 'ArrowRight') move('right');
})
let pointerStart
window.addEventListener('pointerdown', (e) => {
	pointerStart = {x:e.clientX,y:e.clientY}
})

const DMIN = 30

window.addEventListener('pointerup', (e) => {
	const pointerEnd = {x:e.clientX,y:e.clientY}
	const dx = pointerEnd.x - pointerStart.x;
	const dy = pointerEnd.y - pointerStart.y;

	if(Math.hypot(dx,dy)<DMIN)return

	if (Math.abs(dx) > Math.abs(dy))
		move(dx > 0 ? 'right' : 'left');
	else
		move(dy > 0 ? 'down' : 'up');
})