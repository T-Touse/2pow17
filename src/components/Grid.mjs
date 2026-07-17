import { Fragment, SoundManager } from "../lib/UIX.mjs"
import { Tile } from "./Tile.mjs"
const bubble_pop = './assets/bubble_pop.mp3'
const multi_pop = './assets/multi_pop.mp3'
const swipe = './assets/swipe.mp3'

const sound = new SoundManager()

const SHAKE = [
	[
		{},
		{translate:'5px',rotate:'1deg'},
		{translate:'-5px',rotate:'-1deg'},
		{translate:'5px',rotate:'1deg'},
		{},
	],
	{duration:250,easing: "ease-in-out"}
]

export function Grid(grid){
	const div = document.createElement('div')
	div.className = "grid"
	const tiles = new Fragment(div)
	// spawn
	grid.on?.("spawn",(tile)=>{
		tiles.sync(grid.getTiles(),Tile)
	})
	let combo = 0
	grid.on?.("update",({hasMerge})=>{
		tiles.sync(grid.getTiles(),Tile)
		//div.animate(...SHAKE)
		if(hasMerge){
			sound.play(
				Math.random()<.5?bubble_pop:multi_pop
				,Math.min(2.5,.8 + (combo * 0.5))
			)
			combo++
		}else{
			combo = 0
			sound.play(
				swipe,.8+Math.random()*.4
			)
		}
	})
	
	grid.on?.("gameover",()=>{
		div.animate(...SHAKE)
	})
	return div
}

export function useGridView(grid,container){
	const div = new Grid(grid)
	const gridStatic = document.createElement('div')
	gridStatic.className = 'grid-static'
	const gridDiv = document.createElement('div')
	gridDiv.className = 'grid'
	gridDiv.style.setProperty('--grid-size', grid.cols)
	gridDiv.style.setProperty('--grid-gap', '.5rem')
	gridDiv.style.setProperty('--grid-padding', '.75rem')
	const rows = grid.rows
	const cols = grid.cols
	console.log(rows,cols)
	for(let y = 0;y<rows;y++){
		for(let x = 0;x<cols;x++){
			const tile = document.createElement('div')
			tile.className = 'tile tile-empty'
			gridDiv.appendChild(tile)
		}
	}
	gridStatic.appendChild(gridDiv)
	
	const gridTile = document.createElement('div')
	gridTile.className = 'grid-static'
	div.style.setProperty('--grid-size', grid.cols)
	div.style.setProperty('--grid-gap', '.5rem')
	div.style.setProperty('--grid-padding', '.75rem')
	gridTile.appendChild(div)

	container.appendChild(gridStatic)
	container.appendChild(gridTile)
	
	return [div,grid]
}