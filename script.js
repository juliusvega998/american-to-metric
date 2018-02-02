(() => {
	const regx = [ 
		/\d+(?:\.\d+)?(?:-\d+(?:\.\d+)?)?\s*inch(?:es)?/gi, 		//inch - 0
		/\d+(?:\.\d+)?(?:-\d+(?:\.\d+)?)?\s*(?:foot|feet)/gi, 		//foot - 1
		/\d+(?:\.\d+)?(?:-\d+(?:\.\d+)?)?\s*mile(?:s)?/gi, 			//miles - 2
		/\d+(?:\.\d+)?(?:-\d+(?:\.\d+)?)?\s*yard(?:s)?/gi, 			//yard - 3

		/\d+(?:\.\d+)?(?:-\d+(?:\.\d+)?)?\s*(?:pound(?:s)?|lbs)/gi,	//lbs - 4
		/\d+(?:\.\d+)?(?:-\d+(?:\.\d+)?)?\s*ton(?:s)?/gi,			//tons - 5
		/\d+(?:\.\d+)?(?:-\d+(?:\.\d+)?)?\s*(?:ounce(?:s)?|oz)/gi,	//oz - 6
		/\d+(?:\.\d+)?(?:-\d+(?:\.\d+)?)?\s*gal(?:lon(?:s)?)?/gi,	//gallons - 7

		/\d+(?:\.\d+)?(?:-\d+(?:\.\d+)?)?\s*(?:(?:°)?\s*(?:f|fahrenheit)|degrees)/gi	//fahrenheit - 8
	];

	let content = $('body').text();
	let matches = [];

	regx.forEach((r) => {
		let temp = content.match(r);
		matches = matches.concat((temp != null)? temp : []);
	});

	console.log(matches)
})();