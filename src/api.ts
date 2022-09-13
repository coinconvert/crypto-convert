import Rests from "rests";
import { symbolMap } from "./helpers";

import {API as APITypes} from './api.d';

const API = Rests({
	binance: {
		$options:{
			base: "https://api.binance.com/api/v3"
		},
		ticker: {
			path: "/ticker/price",
			on_success(response, request?) {

				//We use USD stablecoins to calculate Binance price
				const usdPegs = {
						'USDT':'USD',
						'USDC':'USD',
						'BUSD': 'USD'
					},
					data = response.json;
				
				if(!data || !Array.isArray(data)) {
					throw new Error(`Invalid response from Binance: ${JSON.stringify(data)}`);
				}

				return data.reduce((obj, pair) => {

					const bSymbol = symbolMap(pair.symbol, usdPegs),
						bPrice = parseFloat(pair.price);

					obj[bSymbol] = bPrice;
					
					return obj;
				}, {});
			},
		}
	},
	bitfinex: {
		$options:{
			base: "https://api-pub.bitfinex.com/v2"
		},
		ticker: {
			path: "/tickers",
			params:{
				symbols:{
					help: 'The symbols you want information about as a comma separated list, or ALL for every symbol. (Examples of possible symbols: tBTCUSD, tETHUSD, fUSD, fBTC)',
					default: 'ALL',
					type: 'string'
				}
			},
			on_success: function (response) { 

				const coinAliases = {
						'BAB': 'BCH',
						'DSH': 'DASH'
					},
					data = response.json;
			
				if(!data || !Array.isArray(data)) {
					throw new Error(`Invalid response from Bitfinex: ${JSON.stringify(data)}`);
				}

				return data.reduce((obj, pair) => {
				
					if(!pair[0].startsWith("t")){
						return obj;
					}

					const bSymbol = symbolMap(
							pair[0].replace(/^t/,''),
							coinAliases
						).replace(':', ''),
						bPrice = parseFloat(pair[7]);
					
					obj[bSymbol] = bPrice;

					return obj;
				}, {});
			}
		}
	},
	coinbase:{
		$options:{
			base: 'https://api.coinbase.com/v2'
		},
		ticker:{
			path: '/exchange-rates',
			params:{
				currency:{
					help: 'The exchange currency (default USD)',
				},
			},
			on_success: (response)=>{
				const data = response?.json?.data;

				if(!data){
					throw new Error(`Invalid response from Coinbase: ${data}`);
				}

				return Object.keys(data.rates).reduce((o,v,i)=>{
					const bSymbol = v + data.currency,
						bPrice = 1 / parseFloat(data.rates[v]);

					o[bSymbol] = bPrice;
					return o;
				}, {});

			}
		}
	},
	coinmarketcap: {
		$options:{
			base: "https://api.coinmarketcap.com/data-api/v3"
		},
		top: {
			path: "/map/all",
			params: {
				limit: {
					default: "100",
				},
				listing_status:{
					default: "active"
				}
			},
			on_success: function (response) {
				const data = response.json;

				if(!data || !data.data || !Array.isArray(data.data.cryptoCurrencyMap)) {
					throw new Error(`Invalid response from CoinMarketCap: ${JSON.stringify(data)}`);
				}

				return data.data.cryptoCurrencyMap.map((coin) => {
					return coin.symbol;
				});
			}
		}
	},
	fiat: {
		all: {
			path: "https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml",
			on_success: function (response) {
				var xml = response.text;
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
			path: "https://api.coinconvert.net/v2/ticker?v={version}",
			on_success: (response)=>(response.json)
		},
		list: {
			path: "https://api.coinconvert.net/list?v={version}",
			on_success: (response)=>(response.json)
		}
	}
});


export default API as APITypes;