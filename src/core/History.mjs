export class History {
	constructor() {
		this.history = [];
	}

	push(data) {
		// On clone la donnée pour éviter les références directes
		this.history.push(JSON.stringify(data));
		if (this.history.length > 10) this.history.shift();
	}

	undo() {
		if (this.history.length === 0) return null;
		return JSON.parse(this.history.pop());
	}
}