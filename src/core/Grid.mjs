import { Model } from "../lib/UIX.mjs"

export class Tile extends Model {

	#row
	#col
	#value
	#grid

	get row(){ return this.#row }
	get col(){ return this.#col }
	get value(){ return this.#value }
	get grid(){ return this.#grid }

	constructor(grid,row,col,value=2){
		super()
		this.#grid=grid
		this.#row=row
		this.#col=col
		this.#value=value
	}

	canMerge(otherTile){
		return otherTile && otherTile.value===this.#value
	}

	mergeWith(otherTile){
		if(!this.canMerge(otherTile)) return false
		
		this.#value*=2
		this._emit('merge',otherTile)
		otherTile._emit('mergeInto',this)
		return true
	}

	move(row,col){
		this.#row=row
		this.#col=col
		this._emit('move',{row,col})
	}

	serialize(){
		return {
			row:this.#row,
			col:this.#col,
			value:this.#value
		}
	}
}



export class Grid extends Model {

	#tiles=new Set()
	#score=0
	get score(){
		return this.#score
	}

	#rows
	#cols

	get rows(){ return this.#rows }
	get cols(){ return this.#cols }
	get score(){ return this.#score }

	constructor(rows=4,cols=4){
		super()
		this.#rows=rows
		this.#cols=cols
	}

	getTiles(){
		return [...this.#tiles]
	}

	addTile(tile){
		this.#tiles.add(tile)

		tile.on?.('destroy',()=>{
			this.#tiles.delete(tile)
		})
	}

	getRow(n){
		return [...this.#tiles]
			.filter(t=>t.row===n)
			.sort((a,b)=>a.col-b.col)
	}

	getCol(n){
		return [...this.#tiles]
			.filter(t=>t.col===n)
			.sort((a,b)=>a.row-b.row)
	}

	getEmptyCells(){

		const cells=[]

		for(let r=0;r<this.#rows;r++){
			for(let c=0;c<this.#cols;c++){

				const occ=[...this.#tiles].find(t=>t.row===r && t.col===c)

				if(!occ) cells.push({row:r,col:c})
			}
		}

		return cells
	}


	#slideLine(tiles,index,isVert,isRev){

		let target=0

		if(isRev) target=(isVert?this.#rows:this.#cols)-1

		const step=isRev?-1:1
		let last = tiles.length-1

		for(let i=0;i<tiles.length;i++){

			const tile=tiles[i]

			let next=tiles[i+1]

			const row=isVert?target:index
			const col=isVert?index:target

			if(tile.row==row && tile.col==col){
				if(i === last)
					tile._emit('stuckOnTop',{isVert,isRev})
				else
					tile._emit('stuck',{isVert,isRev})
			}else{
				tile.move(row,col)
			}

			if(next && tile.canMerge(next)){

				tile.mergeWith(next)

				this.#score+=tile.value

				this.#tiles.delete(next)

				i++
			}

			target+=step
		}
	}


	slide(direction){

		const isVert=direction==="up" || direction==="down"
		const isRev=direction==="down" || direction==="right"

		const count=isVert?this.#cols:this.#rows

		for(let i=0;i<count;i++){

			let tiles=isVert?this.getCol(i):this.getRow(i)

			if(isRev) tiles=[...tiles].reverse()

			this.#slideLine(tiles,i,isVert,isRev)
		}

		this._emit('update')
	}

	clear(){
		this.#tiles.clear()
		this._emit('update')
	}

	spawnRandom(){

		const empties=this.getEmptyCells()

		if(!empties.length) return

		const cell=empties[Math.floor(Math.random()*empties.length)]

		const value=Math.random()<0.9?2:4

		const tile=new Tile(this,cell.row,cell.col,value)

		this.addTile(tile)

		this._emit('spawn',tile)
		tile._emit('spawn')
	}



	serialize(){
		return {
			rows:this.#rows,
			cols:this.#cols,
			score:this.#score,
			tiles:[...this.#tiles].map(t=>t.serialize())
		}
	}
}