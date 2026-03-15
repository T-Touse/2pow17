const BUMP_UP = [
	[{ transform: 'scale(1)' }, { transform: 'scale(1.3)', color: '#edcf72' }, { transform: 'scale(1)' }],
	{ duration: 200, easing: 'ease-out' }
];

const BUMP_DOWN = [
	[{ transform: 'scale(1)' }, { transform: 'scale(0.8)', opacity: 0.5 }, { transform: 'scale(1)' }],
	{ duration: 200, easing: 'ease-in' }
];

function burst(el, count) {
	// On limite le nombre de particules pour éviter de faire ramer l'app
	// Si on gagne 2048 points, on ne veut pas 2048 divs d'un coup.
	const maxParticles = 30;
	const amount = Math.min(count, maxParticles);

	const rect = el.getBoundingClientRect();
	const color = getComputedStyle(el).color;

	for (let i = 0; i < amount; i++) {
		const p = document.createElement('div');
		p.className = 'particle';
		document.body.appendChild(p); // On l'ajoute au body pour éviter les problèmes de overflow:hidden

		const angle = Math.random() * Math.PI * 2;
		const force = 40 + Math.random() * 60;
		const x = Math.cos(angle) * force;
		const y = Math.sin(angle) * force;

		p.style.position = 'fixed';
		p.style.left = `${rect.left + rect.width / 2}px`;
		p.style.top = `${rect.top + rect.height / 2}px`;
		p.style.backgroundColor = color;
		p.style.width = '6px';
		p.style.height = '6px';
		p.style.borderRadius = '50%';
		p.style.pointerEvents = 'none';
		p.style.zIndex = '1000';

		p.animate([
			{ transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
			{ transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(0)`, opacity: 0 }
		], {
			duration: 500 + Math.random() * 500,
			easing: 'ease-out'
		}).onfinish = () => p.remove();
	}
}

export function setScore(el, newScore) {
	const currentScore = parseInt(el.textContent) || 0;
	const diff = newScore - currentScore;

	if (diff > 0) {
		// Le score monte
		el.textContent = newScore;
		el.animate(...BUMP_UP);
		burst(el, diff);
	} else if (diff < 0) {
		// Le score descend (Undo)
		el.textContent = newScore;
		el.animate(...BUMP_DOWN);
		// Pas de particules quand ça descend, l'effet visuel suffit
	}
}