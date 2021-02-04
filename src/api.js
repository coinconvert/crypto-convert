const Wrape = require("wrape");

const endpoints = {
	binance: {
		ticker: {
			method: "GET",
			path: "https://api.binance.com/api/v3/ticker/price",
			params: {},
			response: function (res) {
				var coin_names = {
					'USDC':'USD',
					'TUSD':'USD',
				}
				
				var replace_k = Object.keys(coin_names);

				var data = res.json;

				if(!data || !Array.isArray(data)) {
					return false;
				}

				var result = data.reduce((obj, pair, index) => {
					obj = obj || {};
					for(c=0; c < replace_k.length; c++){
						pair.symbol = pair.symbol.endsWith(replace_k[c]) || pair.symbol.startsWith(replace_k[c]) ? pair.symbol.replace(replace_k[c],coin_names[replace_k[c]]) : pair.symbol;
					}
					obj[pair.symbol] = parseFloat(pair.price);
					return obj;
				},{});
					
				return result;
			}
		}
	},
	bitfinex: {
		ticker: {
			method: "GET",
			path: "https://api-pub.bitfinex.com/v2/tickers?symbols=ALL",
			params: {},
			response: function (res) { 
				var coin_names = {
					'BAB': 'BCH',
					'DSH': 'DASH'
				};

				var data = res.json;
				
				if(!data || !Array.isArray(data)){
					return false;
				}

				var result = data.reduce((obj, pair, i) => {
					obj = obj || {};
					if(pair[0].length == 7 && pair[0].startsWith("t")){
						var pairs = [pair[0].substring(1,4),pair[0].substring(4,pair[0].length)].map((kpair)=>{
							return coin_names[kpair] || kpair;
						}).join('');
						obj[pairs] = parseFloat(pair[7]);
					}
					return obj;
				}, {});
				
				return result;
			}
		}
	},

	okex: {
		ticker: {
			method: "GET",
			path: "https://www.okex.com/api/spot/v3/instruments/ticker",
			params: {},
			response: function (res) {

				var coin_names = {
					'USDC':'USD',
					'USDT':'USD',
					'USDK':'USD',
				}

				var data = res.json;

				if(!data || !Array.isArray(data)) {
					return false;
				}

				return data.reduce((obj, pair, i) => {
					obj = obj || {};
					var [a, b] = pair.instrument_id.split("-").map((instrument) => {
						return coin_names[instrument] || instrument;
					});

					var pairName = a + b;
					obj[pairName] = parseFloat(pair.last);
					return obj;
				}, {});
			}
		}
	},
	coinbase: {
		ticker: {
			method: "GET",
			path: "https://api.pro.coinbase.com/products/stats",
			params: {},
			response: function (res) {
				var data = res.json;

				if(!data ||  !Array.isArray(data)) {
					return false;
				}
			}
		}
	},
	coinmarketcap: {
		top: {
			method: "GET",
			path: "https://api.coinmarketcap.com/data-api/v3/map/all?listing_status=active",
			params: {
				limit: {
					default: 100,
				}
			},
			response: function (res) {
				var data = res.json;

				if(!data || !data.data || !Array.isArray(data.data.cryptoCurrencyMap)) {
					return false;
				}

				return data.data.cryptoCurrencyMap.map((coin) => {
					return coin.symbol;
				});
			}
		}
	},
	fiat: {
		all: {
			method: "GET",
			path: "https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml",
			params: {},
			response: function (res) {
				var xml = res.text;
				var currencies = xml.match(/(?<=currency=["'])([A-Za-z]+)/gi)
				var rates = xml.match(/(?<=rate=["'])([.0-9]+)/gi);
				var full = currencies.reduce((obj, key, index) => ({ ...obj, [key]: rates[index] }), {});
				full['EUR'] = 1 //Base is in EUR
				return full;
			}
		}
	},
	coinconvert: {
		ticker: {
			method: "GET",
			path: "https://api.coinconvert.net/ticker",
			params: {},
			response: function (res) {
				return res.json || false;
			}
		},
		list: {
			method: "GET",
			path: "https://api.coinconvert.net/list",
			params: {},
			response: function (res) {
				return res.json || false;
			}
		}
	}
}

const api = Wrape(endpoints, {
	errors: false
});

module.exports = api;