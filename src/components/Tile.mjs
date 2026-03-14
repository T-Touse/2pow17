const POP = [
	[{ scale: 0, opacity: 0 }, { scale: 1.1, opacity: 1 }, { scale: 1, opacity: 1 }],
	{ duration: 200, easing: "ease-out" }
];

const MERGE_BOUNCE = [
	[{ scale: 1 }, { scale: 1.2 }, { scale: 1 }],
	{ duration: 150, easing: "ease-in-out" }
];

function burst(el) {
	const rand = Math.random() * 100;
	let count = 4; // 30% (par défaut)

	if (rand > 30 && rand <= 80) count = 10; // 50%
	else if (rand > 80) count = 25;           // 20% (Jackpot)

	const color = getComputedStyle(el).getPropertyValue('--t-background');

	for (let i = 0; i < count; i++) {
		const p = document.createElement('div');
		p.className = 'particle';
		el.parentElement.appendChild(p);

		// Explosion plus large si il y a beaucoup de particules
		const force = count > 15 ? 120 : 60;
		const angle = Math.random() * Math.PI * 2;
		const x = Math.cos(angle) * (Math.random() * force);
		const y = Math.sin(angle) * (Math.random() * force);

		p.style.left = el.style.left;
		p.style.top = el.style.top;
		p.style.backgroundColor = color;

		p.animate([
			{ transform: 'translate(50%, 50%) scale(1.5)', opacity: 1 },
			{ transform: `translate(calc(50% + ${x}px), calc(50% + ${y}px)) scale(0) rotate(${Math.random() * 360}deg)`, opacity: 0 }
		], {
			duration: 400 + Math.random() * 300,
			easing: 'ease-out'
		}).onfinish = () => p.remove();
	}
}

function toPos(col, row) {
	return {
		left: `${col * 25}%`,
		top: `${row * 25}%`
	}
}

function setPos(el, col, row) {
	const pos = toPos(col, row)
	el.style.left = pos.left
	el.style.top = pos.top
}


function update(el, tile) {
	el.className = `tile tile-${tile.value}`
	el.textContent = tile.value
	setPos(el, tile.col, tile.row)
}

function move(el, col, row) {
	const sx = col > row ? 1.1 : .9
	const sy = col < row ? 1.1 : .9
	const { left, top } = toPos(col, row)
	el.animate([
		{ scale: 1 },
		{ scale: `${sy} ${sx}` },
		{ offset: .9, scale: `${sx} ${sy}`, left, top },
		{ scale: 1, left, top },
	], {
		duration: 180
	})
	setPos(el, col, row)
}

export function Tile(tile, frag) {
	const div = document.createElement('div');
	update(div, tile);

	tile.on?.("spawn", () => {
		div.animate(...POP);
	});

	tile.on?.("stuckOnTop", ({ isVert, isRev }) => {
		// On définit l'origine du mouvement : si on va à droite (isRev), on s'écrase sur le bord 'right'
		const originX = isVert ? 'center' : (isRev ? 'right' : 'left');
		const originY = isVert ? (isRev ? 'bottom' : 'top') : 'center';

		div.animate([
			{ scale: '1', transformOrigin: `${originX} ${originY}` },
			{
				// Si vertical : on réduit la hauteur (Y) à 0.9
				// Si horizontal : on réduit la largeur (X) à 0.9
				scale: isVert ? '1 0.9' : '0.9 1',
				transformOrigin: `${originX} ${originY}`
			},
			{ scale: '1', transformOrigin: `${originX} ${originY}` },
		], {
			duration: 150, // Un peu plus rapide pour un effet "ressort"
			easing: "ease-in-out"
		});
	});

	tile.on?.("move", ({ row, col }) => {
		// Calcul de la direction pour incliner la tuile pendant le vol
		move(div, col, row);
	});

	tile.on?.("merge", () => {
		update(div, tile);
		div.animate(...MERGE_BOUNCE);
		burst(div); // Effet de particules à l'impact
		if (navigator.vibrate) navigator.vibrate([15]); // Petite vibration haptique
	});

	tile.on?.("mergeInto", (mergeTile) => {
		move(div, mergeTile.col, mergeTile.row);
		// On attend la fin du slide avant de supprimer
		setTimeout(() => div.remove(), 180);
	});

	tile.on?.("destroy", () => {
		div.animate([{ scale: 1, opacity: 1 }, { scale: 0, opacity: 0 }], { duration: 100 })
			.onfinish = () => div.remove();
	});

	return div;
}