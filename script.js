const dig_regx = /((?:\d|,)+(?:\.\d+)?(?:-\d+(?:\.\d+)?)?).*/;

$(window).on('load', () => {
	const regx = [ 
		/(?:\d|,)+(?:\.\d+)?(?:-\d+(?:\.\d+)?)?\s*inch(?:es)\b/gi,
		/(?:\d|,)+(?:\.\d+)?(?:-\d+(?:\.\d+)?)?\s*(?:foot|feet|ft)\b/gi,
		/(?:\d|,)+(?:\.\d+)?(?:-\d+(?:\.\d+)?)?\s*mile(?:s)?\b/gi,
		/(?:\d|,)+(?:\.\d+)?(?:-\d+(?:\.\d+)?)?\s*yard(?:s)?\b/gi,

		/(?:\d|,)+(?:\.\d+)?(?:-\d+(?:\.\d+)?)?\s*(?:pound(?:s)?|lbs)\b/gi,
		/(?:\d|,)+(?:\.\d+)?(?:-\d+(?:\.\d+)?)?\s*ton(?:s)?\b/gi,
		/(?:\d|,)+(?:\.\d+)?(?:-\d+(?:\.\d+)?)?\s*(?:ounce(?:s)?|oz)\b/gi,
		/(?:\d|,)+(?:\.\d+)?(?:-\d+(?:\.\d+)?)?\s*gal(?:lon(?:s)?)?\b/gi,

		/(?:\d|,)+(?:\.\d+)?(?:-\d+(?:\.\d+)?)?\s*(?:(?:°\s*)?\s*(?:f|fahrenheit)|degrees)\b/gi,

		/(?:\d|,)+(?:\.\d+)?(?:-\d+(?:\.\d+)?)?\s*mph\b/gi,

		/\d+('|’)\d+("|”)?\b/gi

	];

	const tags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'li', 'td', 'span'];

	let matches = [];
	let converted = [];

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

		regx.forEach((r, i) => {
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
			'mph2kph': 1.60934,
			'yards2m': 0.9144,
			'lbs2kg': 0.453592,
			'tons2kg': 907.185,
			'oz2ml': 29.5735,
			'gallons2l': 3.78541,
			'f2c': 1
		}

		const convert = (str, units) => {
			let num = dig_regx.exec(str)[1];
			let isRange = num.includes('-');
			let unit = units.toLowerCase().split('2')[1];

			let low, high;

			if(units == 'f2c') {
				unit = '°C';
				if(isRange) {
					let nums = num.split('-');

					low = convert2Celsius(nums[0])
					high = convert2Celsius(nums[1]);
				}else {
					low =  convert2Celsius(num);
				}
			} else if(units == 'inft2cm') {
				unit = 'cm';
				low = convert2cm(str);
			} else if(isRange) {
				let nums = num.split('-');

				low = convertNumber(nums[0], units);
				high = convertNumber(nums[1], units);
			} else {
				let converted = convertNumber(num, units);

				low = converted;
			}

			let res = toHigherMetric(low, high, unit);

			if(isRange) {
				return res.low + '-' + res.high + ' ' + res.unit;
			} else {
				return res.low + ' ' + res.unit;
			}
		}

		const toHigherMetric = (low, high, unit) => {
			let res;

			if(low >= 100 && unit == 'cm') {
				res = reduceNumber(low, high, unit, 100);
				low = res.low;
				high = res.high;
				unit = res.unit;
			}

			if(low >= 1000 && (unit == 'm' || unit == 'ml')) {
				res = reduceNumber(low, high, unit, 1000);
				low = res.low;
				high = res.high;
				unit = res.unit;
			}

			return {
				low: low,
				high: high,
				unit: unit
			}
		}

		const reduceNumber = (low, high, unit, factor) => {
			low = toTwoDecimalPlaces(low / factor);
			if(high) high = toTwoDecimalPlaces(low / factor);
			unit = 'm';

			return {
				low: low,
				high: high,
				unit: unit
			}
		}

		const convertNumber = (num, units) => {
			return toTwoDecimalPlaces(parseInt(num) * conversion[units]);
		}

		const convert2Celsius = (num) => {
			return toTwoDecimalPlaces((parseInt(num) - 32) * 5 / 9);
		}

		const convert2cm = (str) => {
			let tok = str.split(/('|’)/g);
			let ft = parseInt(tok[0]);
			let inch = parseInt(tok[2]);

			return toTwoDecimalPlaces(ft * conversion['foot2cm'] + inch * conversion['in2cm']);
		}

		const toTwoDecimalPlaces = (num) => {
			return Math.floor(num * 100) / 100;
		}

		matches.forEach((e) => {
			switch(true) {
				case !!e.match(regx[0]): converted.push(convert(e.replace(/,/g, ''), 'in2cm')); break;
				case !!e.match(regx[1]): converted.push(convert(e.replace(/,/g, ''), 'foot2cm')); break;
				case !!e.match(regx[2]): converted.push(convert(e.replace(/,/g, ''), 'miles2km')); break;
				case !!e.match(regx[3]): converted.push(convert(e.replace(/,/g, ''), 'yard2m')); break;
				case !!e.match(regx[4]): converted.push(convert(e.replace(/,/g, ''), 'lbs2kg')); break;
				case !!e.match(regx[5]): converted.push(convert(e.replace(/,/g, ''), 'tons2kg')); break;
				case !!e.match(regx[6]): converted.push(convert(e.replace(/,/g, ''), 'oz2ml')); break;
				case !!e.match(regx[7]): converted.push(convert(e.replace(/,/g, ''), 'gallons2l')); break;
				case !!e.match(regx[8]): converted.push(convert(e.replace(/,/g, ''), 'f2c')); break;
				case !!e.match(regx[9]): converted.push(convert(e.replace(/,/g, ''), 'mph2kph')); break;
				case !!e.match(regx[10]): converted.push(convert(e.replace(/,/g, ''), 'inft2cm')); break;
				default: console.log(e + ' does not match to any unit'); converted.push(e); break;
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
				let text = $(e).html().replace(orig, ' <span id=\'a2m-' + j + '\'>' + converted[i] + '</span>');
				$(e).html(text);

				$('span#a2m-' + j).qtip({
					content: {
						text: orig
					}
				});
				$('span#a2m-' + j).css('text-decoration', 'underline');
				$('span#a2m-' + j).css('text-decoration-style', 'dotted');

				j++;
			});
		});

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