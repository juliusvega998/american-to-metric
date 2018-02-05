const dig_regx = /0*(\d+(?:\.\d+)?(?:-\d+(?:\.\d+)?)?).*/;

$(window).on('load', () => {
	const regx = [ 
		/\d+(?:\.\d+)?(?:-\d+(?:\.\d+)?)?\s*inch(?:es)?\b/gi,
		/\d+(?:\.\d+)?(?:-\d+(?:\.\d+)?)?\s*(?:foot|feet)\b/gi,
		/\d+(?:\.\d+)?(?:-\d+(?:\.\d+)?)?\s*mile(?:s)?\b/gi,
		/\d+(?:\.\d+)?(?:-\d+(?:\.\d+)?)?\s*yard(?:s)?\b/gi,

		/\d+(?:\.\d+)?(?:-\d+(?:\.\d+)?)?\s*(?:pound(?:s)?|lbs)\b/gi,
		/\d+(?:\.\d+)?(?:-\d+(?:\.\d+)?)?\s*ton(?:s)?\b/gi,
		/\d+(?:\.\d+)?(?:-\d+(?:\.\d+)?)?\s*(?:ounce(?:s)?|oz)\b/gi,
		/\d+(?:\.\d+)?(?:-\d+(?:\.\d+)?)?\s*gal(?:lon(?:s)?)?\b/gi,

		/\d+(?:\.\d+)?(?:-\d+(?:\.\d+)?)?\s*(?:(?:°\s*)?\s*(?:f|fahrenheit)|degrees)\b/gi
	];

	const tags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'li', 'td', 'span'];

	let matches = [];
	let converted = [];

	$.notify.defaults({
		className: 'success',
		autoHideDelay: 3000
	});

	const start = (mutationsList) => {
		if(mutationsList) {
			for(var m of mutationsList) {
				findMatches(m.target)
			}
		} else {
			findMatches('body');
		}
	}

	const findMatches = (target) => {
		let content = $(target).text();

		regx.forEach((r) => {
			let temp = content.match(r);
			matches = matches.concat((temp != null)? temp : []);
		});

		matches = [...new Set(matches)];

		convertMatches();
	}

	const convertMatches = () => {
		const conversion = {
			'in2cm': 2.54,
			'foot2cm': 30.48,
			'miles2km': 1.60934,
			'yards2m': 0.9144,
			'lbs2kg': 0.453592,
			'tons2kg': 907.185,
			'oz2ml': 29.5735,
			'gallons2l': 3.78541,
			'f2c': 1
		}

		const convert = (str, units) => {
			let num = dig_regx.exec(str)[1];
			if(units == 'f2c') {
				return convert2Celsius(num) + "°C";
			}

			if(num.includes("-")) {
				let nums = num.split("-");
				return convertNumber(nums[0], units) + "-" + convertNumber(nums[1], units) + " " + units.split("2")[1];
			} else {
				return convertNumber(num, units) + " " + units.split("2")[1];
			}
		}	

		const convertNumber = (num, units) => {
			return parseInt(num) * conversion[units]
		}

		const convert2Celsius = (num) => {
			return Math.floor(((parseInt(num) - 32) * 5 / 9) * 100) / 100;
		}

		matches.forEach((e) => {
			switch(true) {
				case !!e.match(regx[0]): converted.push(convert(e, 'in2cm')); break;
				case !!e.match(regx[1]): converted.push(convert(e, 'foot2cm')); break;
				case !!e.match(regx[2]): converted.push(convert(e, 'miles2km')); break;
				case !!e.match(regx[3]): converted.push(convert(e, 'yard2m')); break;
				case !!e.match(regx[4]): converted.push(convert(e, 'lbs2kg')); break;
				case !!e.match(regx[5]): converted.push(convert(e, 'tons2kg')); break;
				case !!e.match(regx[6]): converted.push(convert(e, 'oz2ml')); break;
				case !!e.match(regx[7]): converted.push(convert(e, 'gallons2l')); break;
				case !!e.match(regx[8]): converted.push(convert(e, 'f2c')); break;
				default: console.log(e + " does not match to any unit"); converted.push(''); break;
			}
		});
		applyChanges();
	}

	const applyChanges = () => {
		let j = 0;

		matches.forEach((orig, i) => {
			let contains = ':contains(\'' + orig + '\')'
			let selector = '';
			tags.forEach((t, i) => {
				selector += t + contains;
				if( i != tags.length - 1) {
					selector += ', ';
				}
			});

			let elems = $(selector).toArray();
			elems.forEach((e) => {
				let text = $(e).html().replace(orig, ' <span class=\'a2m-convertable\' id=\'a2m-' + j + '\'>' + converted[i] + '</span>');
				$(e).html(text);

				$('span#a2m-' + j).qtip({
					content: {
						text: orig
					}
				});

				j++;
			});
		});

		$('span.a2m-convertable').css('text-decoration', 'underline');
		$('span.a2m-convertable').css('text-decoration-style', 'dotted');

		$.notify(converted.length + ' american units converted to metric!');

		matches = [];
		converted = [];
	}

	const createMutationObserver = () => {
		let config = { childList: true };
		let node = document.getElementsByTagName('BODY')[0];
		let observer = new MutationObserver(start);

		observer.observe(node, config);
	}

	createMutationObserver();
	start();
});