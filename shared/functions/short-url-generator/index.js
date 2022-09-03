const { Client, query } = require("faunadb");

const client = new Client({
	secret: process.env.FAUNA_DB_SECRET,
});

// Example Body Payload:
// {
// 	"longUrl": "https://whatever.com", // Required
// 	"honeypot": "", // Required
// 	"shortCode": "blahblah" // Optional (Used to specify the short string. Otherwise it will be autogenerated.)
// }

exports.handler = async (event, context) => {
	const body = JSON.parse(event.body);
	const honeypot = body.honeypot;
	if (honeypot !== "") {
		return {
			statusCode: 200,
			headers: {
				"access-control-allow-origin": "*",
			},
		};
	}

	// If the user provided a short url, ensure that it doesn't already exist.
	// If it does, return an error.
	if (body.shortCode) {
		const existingShortUrl = await shortUrlLookup(body.shortCode.toLowerCase());
		if (existingShortUrl) {
			return {
				statusCode: 422, // Unprocessable Entity (ShortCode is already in use.)
				headers: {
					"access-control-allow-origin": "*",
				},
			};
		}
	}

	const shortUrl = await generateShortUrl(body.longUrl, body.shortCode);

	if (shortUrl) {
		return {
			statusCode: 201,
			headers: {
				"access-control-allow-origin": "*",
				"Cache-Control": "no-cache",
			},
			body: JSON.stringify({
				shortUrl,
				longUrl: body.longUrl.toLowerCase(),
			}),
		};
	} else {
		return {
			statusCode: 500,
			headers: {
				"Cache-Control": "no-cache",
			},
		};
	}
};

const shortUrlLookup = async (shortCode) => {
	// Lookup shortCode in FaunaDb & get the longUrl if it exists
	try {
		const response = await client.query(
			query.Map(query.Paginate(query.Match(query.Index("shortCodesBySource"), shortCode.toLowerCase())), query.Lambda("shortcodes", query.Get(query.Var("shortcodes"))))
		);

		if (response.data && response.data.length > 0) {
			return response.data[0];
		}
	} catch (err) {
		console.log(err);
	}

	return undefined;
};

const longUrlLookup = async (longUrl) => {
	// Lookup longUrl in FaunaDb & get the longUrl if it exists
	try {
		const response = await client.query(
			query.Map(query.Paginate(query.Match(query.Index("shortCodesByTarget"), longUrl.toLowerCase())), query.Lambda("shortcodes", query.Get(query.Var("shortcodes"))))
		);

		if (response.data && response.data.length > 0) {
			return response.data[0];
		}
	} catch (err) {
		console.log(err);
	}

	return undefined;
};

const random = (length = 7) => {
	return Math.random().toString(16).substr(2, length);
};

const generateShortUrl = async (longUrl, shortCode) => {
	// Check to see if longUrl has been used before.
	const existingRecord = await longUrlLookup(longUrl);

	if (existingRecord) {
		return `https://dpgr.am/${existingRecord.data.source}`;
	}

	if (shortCode) {
		shortCode = shortCode.toLowerCase();
	} else {
		shortCode = random();
	}

	try {
		await client.query(
			query.Create(query.Collection("shortcodes"), {
				data: {
					source: shortCode.toLowerCase(),
					target: longUrl.toLowerCase(),
				},
			})
		);
	} catch (err) {
		console.log(err);
		return undefined;
	}

	return `https://dpgr.am/${shortCode}`;
};