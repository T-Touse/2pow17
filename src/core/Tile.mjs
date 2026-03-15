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
