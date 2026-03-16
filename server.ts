import { serve } from "bun";

serve({
	port: 3000,
	fetch(req) {
		const url = new URL(req.url);
		let path = url.pathname;

		// Redirection par défaut sur l'index
		if (path === "/") path = "/index.html";

		// Sert le fichier depuis le dossier local
		const file = Bun.file(`.${path}`);
		return new Response(file);
	},
});

console.log("Serveur lancé sur http://localhost:3000");