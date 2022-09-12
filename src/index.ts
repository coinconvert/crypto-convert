import { formatNumber } from "./helpers";
import PricesWorker, { Options, PricesClass, Tickers, WorkerReady } from "./worker";



type Convert = {
	[fromCurrency: string]: {
		[toCurrency: string]: (amount: number)=> number | false | null
	}
} & {
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

	/**
	 * Check if cache has loaded.
	 */
	ready: ()=> Promise<Convert>
}

function isEmpty(obj: any) { 
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
	
	const wrapper = function(coin: string, currency: string){
		var coin = coin;
		var toCurrency = currency;
		
		var doExchange = function(fromAmount: number){
			
			if(isEmpty(PricesWorker.data.crypto) || !fromAmount){
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
				this.exchangePrice = getPrice(coin, toCurrency);
				if(!this.exchangePrice){
					this.exchangePrice = wrapper("USD", toCurrency)(wrapper(coin, "USD")(1) as number);
				}
				
				return formatNumber(this.exchangePrice * fromAmount, 8); 
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
				this.usdPrice = getCryptoPrice(coin);
				this.exchangePrice = (this.usdPrice / fiatCurrencies['USD']) * fiatCurrencies[toCurrency]; //Convert USD to choosen FIAT 10000 JPY
				return formatNumber(this.exchangePrice * fromAmount, 4);
			}

			//Fiat to Crypto
			if(fiatCurrencies[coin]){
				this.usdPrice = getCryptoPrice(toCurrency);
				this.exchangePrice = (this.usdPrice / fiatCurrencies['USD']) * fiatCurrencies[coin]; //Convert USD to choosen FIAT 10000 JPY
				return formatNumber(fromAmount / this.exchangePrice, 8);
			}

			return null;
		}
		return doExchange;
	}

	const initialize = function () {
		//Make Wrapper
		for(var i = 0; i < all_currencies.length; i++) {
			var coin = all_currencies[i];
			for(var a = 0; a < all_currencies.length; a++) {
				var currency = all_currencies[a];
				if(!exchange[coin]) {
					exchange[coin] = {};
				}
				exchange[coin][currency] = wrapper(coin, currency);
			}
		}
	}();

	
	exchange['setOptions'] = function (options: Options) {
		return PricesWorker.setOptions(options); //.restart();
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