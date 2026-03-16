export class Model {
	#events = new Map

	get storageKey(){
		return this.constructor.name
	}
	
	on(name, listener) {
		if (!this.#events.has(name))
			this.#events.set(name, new Set)
		this.#events.get(name).add(listener)
		return () => this.#events.get(name).delete(listener)
	}
	_emit(name, ...args) {
		this.#events.get(name)?.forEach(cb => {
			cb(...args)
		})
	}
	hydrate(data) { }
	serialize() { }

	static save(model){
		if (!model.storageKey) return;
        const data = model.serialize();
        localStorage.setItem(model.storageKey, JSON.stringify(data));
	}
	static load(model){
		if (!model.storageKey) return null;
        const saved = localStorage.getItem(model.storageKey);
		model.hydrate(saved ? JSON.parse(saved) : null)
        return model
	}
}

const VIEWS = new Map()
export function createView(Model, view, ...args) {
	return (...args2) => {
		const instance = new Model(...args2)
		const element = view(instance, ...args)
		VIEWS.set(instance, element)
		return instance
	}
}
export function useView(model) {
	return VIEWS.get(model)
}

export class Fragment {
	#keys = new Map();
	#parent;

	constructor(parent) {
		this.#parent = parent;
	}

	sync(collection, ViewFn) {
		// collection doit être un Set ou un Array d'instances de Model
		const currentModels = collection instanceof Set ? collection : new Set(collection);

		// 1. Suppression : on itère sur ce qui est actuellement dans le DOM
		for (const [model, element] of this.#keys.entries()) {
			if (!currentModels.has(model)) {
				element.unmount?.();
				element.remove();
				this.#keys.delete(model);
			}
		}

		// 2. Ajout : on itère sur la nouvelle collection
		currentModels.forEach(model => {
			if (!this.#keys.has(model)) {
				const element = ViewFn(model);
				this.#parent.appendChild(element);
				this.#keys.set(model, element);
			}
		});
	}
}

export class SoundManager {
	play(src,playbackRate = 1) {
		const audio = new Audio(src);
		audio.playbackRate = playbackRate;

		audio.play().catch(e => console.warn("Audio blocké : attend un clic utilisateur."));
	}
}

window.addEventListener('pointerdown', () => {
	const silent = new Audio();
	silent.volume = 0;
	silent.play().catch(() => { });
}, { once: true });
window.addEventListener('keydown', () => {
	const silent = new Audio();
	silent.volume = 0;
	silent.play().catch(() => { });
}, { once: true });