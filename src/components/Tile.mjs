export function createTile(v, r, c) {
	const el = document.createElement('span');
	el.className = `tile tile-${v} tile-new`;
	el.textContent = v;
	updatePos(el, r, c);
	return { el, v, r, c };
}
export function updatePos(el, r, c) {
	// On calcule la position en pourcentage pur par rapport au parent
	// 2.5% (padding) + l'index * (taille cellule + gap)
	const left = 2.5 + (c * 24.375);
	const top = 2.5 + (r * 24.375);

	// Au lieu de transform, on peut utiliser top/left pour le responsive 
	// ou garder translate si on veut garder de la fluidité
	el.style.left = `${left}%`;
	el.style.top = `${top}%`;
}