export async function getSluggedJson(path: string) {
	// get all json files
	let files = import.meta.glob("../content/**/*.json");
	files = Object.fromEntries(Object.entries(files).filter(([key]) => key.includes(`../content/${path}`)));

	let items = [];

	for (const path in files) {
		const item = await files[path]();
		const slug = path.split("/").pop().replace(".json", " ").trim();

		items.push({ ...(item as object), slug });
	}

	const dateable = items.every((item) => "date" in item);

	if (dateable) {
		items = items.sort((a, b) => {
			const aDate = new Date(b.date);
			const bDate = new Date(a.date);
			return aDate.getTime() - bDate.getTime();
		});
	}

	return items;
}

export async function getUuid() {
	let uuid;

	try {
		const crypto = await import("node:crypto");
		uuid = crypto.randomUUID();
	} catch (err) {
		uuid = Math.floor(Math.random() * 100);
		console.log("crypto support is disabled! make sure you're on at least node 16.7");
	}

	return uuid;
}
