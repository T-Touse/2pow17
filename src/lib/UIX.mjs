export class Model {
	#events = new Map
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
	serialize() { }
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

let saveTimeout;
function autoSave(model) {
	clearTimeout(saveTimeout);
	saveTimeout = setTimeout(() => {
		const data = model.serialize();

		console.log("Partie sauvegardée !");
	}, 500); // Attend 500ms d'inactivité avant de sauvegarder
}

window.addEventListener('visibilitychange', () => {
	if (document.visibilityState === 'hidden') {
		// Sauvegarde immédiate sans délai

	}
});
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