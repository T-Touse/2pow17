import { onMove } from "./src/control.mjs";
import { useGridView } from "./src/components/Grid.mjs";
import { Grid } from "./src/core/Grid.mjs";

const container = document.getElementById('tile-layer');
const scoreBoard = document.getElementById('score');


const [element,grid] = useGridView(new Grid(4),container);
function initGame(){
	grid.clear()
	grid.spawnRandom()
	grid.spawnRandom()
}
grid.on('update',()=>{
	scoreBoard.textContent = grid.score
	grid.spawnRandom()
})

// Branchement
onMove((dir) =>{
	grid.slide(dir)
	if (navigator.vibrate) navigator.vibrate(20);
});
initGame()

window.initGame = initGame