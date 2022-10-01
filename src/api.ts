import Rests from "rests";
import { formatNumber, symbolMap } from "./helpers";

import {API as APITypes} from './api.d';


//We need to specify the list of pairs for kraken ticker API, because the mfs couldn't add an 'ALL' parameter.
//This is done automatically and saved on this variable as cache.
let krakenPairsList: string[];

//Binance shows old prices on closed markets for some reason.
//We check the book ticker to filter out closed markets.
let closedMarketsBinance: string[];

const API = Rests({
	binance: {
		$options:{
			base: "https://api.binance.com/api/v3"
		},
		bookTicker:{
			path: '/ticker/bookTicker',
			on_success: (response)=>(response.json)
		},
		ticker: {
			path: "/ticker/price",
			async on_request(request){
				if(!closedMarketsBinance){
					const bookTicker = await request.instance.binance.bookTicker();
					closedMarketsBinance = bookTicker.map((pair: any)=>{
						if(parseFloat(pair.askPrice) <= 0){
							return pair.symbol;
						}
						return false;
					}).filter(p => p);

					//console.log(`${closedMarketsBinance.length} Binance Closed Markets have been filtered.`);
				}
			},
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
					//Filter closed markets
					if(closedMarketsBinance && closedMarketsBinance.indexOf(pair.symbol) !== -1){
						return obj;
					}
					
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
							coinAliases,
							true
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
						bPrice = formatNumber(1 / parseFloat(data.rates[v]), 8);

					o[bSymbol] = bPrice;
					return o;
				}, {});

			}
		}
	},
	kraken:{
		$options:{
			base: 'https://api.kraken.com/0/public'
		},
		pairs: {
			path: '/AssetPairs',
			on_success: (res)=>{
				//console.log("Getting kraken pairs...");
				return Object.keys(res.json.result);
			}
		},
		ticker:{
			path: '/Ticker',
			on_request: async (request)=> {
			
				if(!krakenPairsList){
					const assetPairs = await request.instance.kraken.pairs();
					krakenPairsList = assetPairs;
				}
				
				return {
					url: request.url + '?pair=' + krakenPairsList
				}
			},
			on_success: (response)=>{
				//They have weird symbols like XXRPXXBT
				const fixedSymbols = {
					'XETC': 'ETC',
					'XETH': 'ETH',
					'XLTC': 'LTC',
					'XMLN': 'MLN',
					'XREP': 'REP',
					'XXBT': 'BTC',
					'XXDG': 'XDG',
					'XXLM': 'XLM',
					'XXMR': 'XMR',
					'XXRP': 'XRP',
					'XZEC': 'ZEC',
					'XBT': 'BTC',
					'ZAUD': 'AUD',
					'ZEUR': 'EUR',
					'ZGBP': 'GBP',
					'ZUSD': 'USD',
					'ZCAD': 'CAD',
					'ZJPY': 'JPY'
				},
				data = response.json?.result;
			
				if(!data) {
					throw new Error(`Invalid response from Kraken: ${JSON.stringify(data)}`);
				}

				return Object.keys(data).reduce((obj, symbol) => {

					const bSymbol = symbolMap(symbol, fixedSymbols, true),
						bPrice = parseFloat(data[symbol].c[0]);

					obj[bSymbol] = bPrice;

					return obj;
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
					default: "150",
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

				return data.data.cryptoCurrencyMap.reduce((o: any, v: any) => {
					o[v.symbol] = {
						id: v.id,
						title: v.name,
						symbol: v.symbol,
						logo: `https://s2.coinmarketcap.com/static/img/coins/128x128/${v.id}.png`,
						rank: v.rank,
					}
					return o;
				}, {});
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
		$options:{
			base: 'https://api.coinconvert.net'
		},
		ticker: {
			path: "/v2/ticker",
			params: {
				v: {
					default: '{version}'
				},
				filterExchanges: {
					type: "array"
				},
				noAverage:{
					type: "boolean"
				}
			},
			on_success: (response)=>(response.json)
		},
		list: {
			path: "/v2/list?v={version}",
			on_success: (response)=>(response.json)
		}
	}
});


export default API as APITypes;