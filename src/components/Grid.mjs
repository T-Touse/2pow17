import { Fragment } from "../lib/UIX.mjs"
import { Tile } from "./Tile.mjs"

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
	grid.on?.("update",()=>{
		tiles.sync(grid.getTiles(),Tile)
		//div.animate(...SHAKE)
	})
	
	grid.on?.("gameover",()=>{
		div.animate(...SHAKE)
	})
	return div
}

export function useGridView(grid,container){
	const div = new Grid(grid)
	container.appendChild(div)
	return [div,grid]
}