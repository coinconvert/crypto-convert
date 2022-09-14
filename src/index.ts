import { formatNumber } from "./helpers";
import PricesWorker, { Options, PricesClass, Tickers, WorkerReady } from "./worker";
import { Pairs } from './paris';


/*
type Convert = {
	[fromCurrency: string]: {
		[toCurrency: string]: (amount: number)=> number | false | null
	}
}*/

interface Convert extends Pairs {
	/**
	 * Update options
	 */
	setOptions: (options?: Options)=> PricesClass,
	
	/**
	 * Price Tickers
	 */
	ticker: Tickers,

	/**
	 * Support currencies list
	 */
	list: {
		crypto: string[],
		fiat: string[]
	},

	isReady: boolean,
	
	/**
	 * Check if cache has loaded.
	 */
	ready: ()=> Promise<Convert>,

	/**
	 * Stop the worker. 
	 * 
	 * It's recommended to do this on Component unmounts (i.e if you are using React).
	 */
	stop: ()=> PricesClass,

	/**
	 * Re-start the worker when it has been stopped.
	 * 
	 * Returns a promise to wait for when it's ready.
	 * 
	 * ```javascript
	 * const is_ready = await convert.start();
	 * ```
	 */

	start: ()=> Promise<PricesClass>
}

function isEmpty(obj: any) { 
	if(!obj){
		return true;
	}
   	for (var _ in obj) { return false; }
   	return true;
}

const coins = PricesWorker.list.crypto,
	fiats = PricesWorker.list.fiat;


function getPrice(coin: string,	to='USD'){
	var result = PricesWorker.data.crypto.current[coin + to] || (
		PricesWorker.data.crypto.current[to + coin] ? 1/PricesWorker.data.crypto.current[to + coin] : null
	);

	return result;
}

const exchangeWrap = function(){
	const all_currencies = coins.concat(fiats);

	const exchange = {
		get isReady() {
			return PricesWorker.isReady;
		}
	}
	
	//Main conversion function
	const wrapper = function(coin: string, currency: string){
		var coin = coin;
		var toCurrency = currency;
		
		var doExchange = function(fromAmount: number){
			
			if(isEmpty(PricesWorker.data.crypto.current) || isEmpty(PricesWorker.data.fiat.current)){
				console.warn("[~] Prices are loading.\nYou should use `await convert.ready()` to make sure prices are loaded before calling convert.");
				return false;
			}

			if(!fromAmount){
				return false;
			}

			fromAmount = formatNumber(fromAmount);
			
			if(isNaN(fromAmount)){
				return false;
			}
			
			const fiatCurrencies = PricesWorker.data.fiat.current;

			//Same
			if(toCurrency == coin){
				return fromAmount;
			}
		
			//Crypto to Crypto
			if(coins.includes(coin) && coins.includes(toCurrency)){
				let exchangePrice = getPrice(coin, toCurrency) ||
					wrapper("USD", toCurrency)(wrapper(coin, "USD")(1) as number);
				
				
				return formatNumber(exchangePrice * fromAmount, 8); 
			}
			
			//Fiat to Fiat
			if(fiatCurrencies[coin] && fiatCurrencies[toCurrency]){
				
				return formatNumber(
					((fromAmount / fiatCurrencies[coin]) * fiatCurrencies[toCurrency]),
					2
				);
			}
			
			
			//Crypto->Fiat || Crypto->BTC->Fiat
			var getCryptoPrice = function (fiat: string) {
				var fiatPrice = getPrice(fiat) ||
					wrapper("BTC","USD")(getPrice(fiat,"BTC") as number) || 
					wrapper("ETH","USD")(getPrice(fiat,"ETH") as number);
				
				return fiatPrice;
			}
			
			//Crypto to Fiat
			if(fiatCurrencies[toCurrency]){
				let usdPrice = getCryptoPrice(coin);
				let exchangePrice = (usdPrice / fiatCurrencies['USD']) * fiatCurrencies[toCurrency]; //Convert USD to choosen FIAT 10000 JPY
				return formatNumber(exchangePrice * fromAmount, 4);
			}

			//Fiat to Crypto
			if(fiatCurrencies[coin]){
				let usdPrice = getCryptoPrice(toCurrency);
				let exchangePrice = (usdPrice / fiatCurrencies['USD']) * fiatCurrencies[coin]; //Convert USD to choosen FIAT 10000 JPY
				return formatNumber(fromAmount / exchangePrice, 8);
			}

			return null;
		}
		return doExchange;
	}

	
	let types = '';

	//Build conversion pairs object
	const initialize = function () {

		//Generate typescript interface
		types += `type amount = (amount: number | string) => number | false | null;`;
		types +='\nexport interface Pairs {';

		for(var i = 0; i < all_currencies.length; i++) {
			var coin = all_currencies[i];
			

			if(!coin || typeof coin !== "string"){
				continue;
			}

			if(!exchange[coin]) {
				exchange[coin] = {};
			}
			

			types += `\n\t'${coin.replace(/\'/g,"\\'")}': {`

			for(var a = 0; a < all_currencies.length; a++) {
				var currency = all_currencies[a];

				if(!currency || typeof currency !== "string"){
					continue;
				}

				exchange[coin][currency] = wrapper(coin, currency);

				types += `\n\t\t'${currency.replace(/\'/g,"\\'")}': amount,`;
			}

			types += '\n},';
		}

		types +='\n}';
	}();
	
	

	exchange['setOptions'] = function (options: Options) {

		let update = PricesWorker.setOptions(options);

		if(options.crypto_interval || options.fiat_interval){
			return update.restart();
		}
		
		return update;
	}

	exchange['stop'] = function(){
		return PricesWorker.stop();
	}

	exchange['start'] = function(){
		return PricesWorker.restart();
	}

	exchange['ready'] = async function () {
		await Promise.resolve(WorkerReady);
		return exchange;
	}

	//List
	exchange['list'] = {
		'crypto': coins,
		'fiat': fiats
	}

	//Ticker
	exchange['ticker'] = {
		get crypto() {
			return PricesWorker.data.crypto;
		},
		get fiat() {
			return PricesWorker.data.fiat;
		}
	}

	//More Readable Prototype
	exchange['from'] = function(coin: string){
		this.coin = coin.toUpperCase();
		return this;
	}
	exchange['from'].prototype.to = function(currency: string){
		this.currency = currency.toUpperCase();
		return this;
	}
	exchange['from'].prototype.amount = function(amount=1){
		if(!this.coin || !this.currency || !exchange[this.coin] || !exchange[this.currency]){
			return false;
		}
		return exchange[this.coin][this.currency](amount);
	}


	//Create types file for Node.js. With Runtime types generation ^^
	if(typeof window === "undefined" && typeof module !== "undefined" && typeof process !== "undefined"){
		(async function(){
			try{
				//Static checks on frontend apps are annoying af
				eval(`
					const fs = require('fs');
					const path = require('path');
					const isDist = path.basename(__dirname) == 'dist';
					const typesFile = path.join(__dirname, isDist ? 'paris.d.ts' : 'paris.ts');

					fs.writeFileSync(typesFile, types, 'utf-8');
				`);
			}
			catch(err){
				console.warn(err);
			}
		})();
	}

	return exchange;
}();

/**
 * Convert crypto to fiat and vice-versa.
 * 
 * ```javascript
 * convert.BTC.USD(1);
 * convert.USD.BTC(1);
 * convert.BTC.ETH(1);
 * convert.ETH.JPY(1);
 * convert.USD.EUR(1);
 * ```
 * 
 * To check supported currencies:
 * ```javascript
 * let supportedCurrencies = convert.list;
 * ```
 * 
 * To change options:
 * 
 * ```javascript
 * convert.setOptions({
 *		crypto_interval: 5000, //Crypto prices update interval, default every 5 seconds
 *		fiat_interval: (60 * 1e3 * 60), //Fiat prices update interval, default every 1 hour
 *		binance: true, //Use binance rates
 *		bitfinex: true, //Use bitfinex rates
 *		coinbase: true, //Use coinbase rates
 *		onUpdate: (tickers, isFiat)=> any //Callback to run on prices update	
 * });
 * ```
 */
const convert = exchangeWrap as unknown as Convert;

//@ts-ignore
convert.default = convert;
if(typeof module !== "undefined" && module.exports){
	module.exports = convert;
}

export default convert;