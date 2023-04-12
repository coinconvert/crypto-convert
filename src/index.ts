/*!
 * crypto-convert (c) 2022
 * Author: Elis
 * License: https://github.com/coinconvert/crypto-convert
 */

import { formatNumber, isBrowser, isEmpty } from "./helpers";
import PricesWorker, { Options } from "./worker";
import { Pairs } from './pairs';
import CustomWorkers from "./custom";

const customWorkers = new CustomWorkers();


class CryptoConvert {

	private worker: PricesWorker;

	private internalMethods: string[];
	
	private workerReady: Promise<false | PricesWorker>;

	constructor(options: Options = {}){

		if(isBrowser){
			if(window['__ccInitialized']){
				throw new Error("You have already initalized one instance of crypto-convert. You cannot initialize multiple instances.");
			}
			window['__ccInitialized'] = true;
		}
		
		this.worker = new PricesWorker(options);
		this.workerReady = this.worker.run();
		this.internalMethods = Object.getOwnPropertyNames(CryptoConvert.prototype);
		
		Promise.resolve(this.workerReady).then(()=>{
			this.populate();

			this.worker.onCryptoListRefresh = ()=>{
				this.populate();
			}
		});
	}
	
	/**
	 * Get a symbol price from tickers
	 */
	protected getPrice(coin: string, to='USD'){
	
		var customResult = customWorkers.ticker[coin+to] || (
			customWorkers.ticker[to + coin] ? 1/customWorkers.ticker[to + coin] : null
		);
	
		var result = this.worker.data.crypto.current[coin + to] || (
			this.worker.data.crypto.current[to + coin] ? 1/this.worker.data.crypto.current[to + coin] : null
		);
	
		return customResult || result;
	}

	/**
	 * This is where conversion happens.
	 */
	private wrapper(coin: string, currency: string){
		var coin = coin;
		var toCurrency = currency;

		const doExchange = (function(fromAmount: number){

			if(isEmpty(this.worker.data.crypto.current) || isEmpty(this.worker.data.fiat.current)){
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

			const fiatCurrencies = this.worker.data.fiat.current;
			const cryptoCurrenciesList = this.worker.list.crypto.concat(customWorkers.list);
		
			//Same
			if(toCurrency == coin){
				return fromAmount;
			}
		
			//Crypto to Crypto
			if(cryptoCurrenciesList.includes(coin) && cryptoCurrenciesList.includes(toCurrency)){
				let exchangePrice = this.getPrice(coin, toCurrency) ||
					this.wrapper("USD", toCurrency)(this.wrapper(coin, "USD")(1) as number);


				return formatNumber(exchangePrice * fromAmount, 8); 
			}

			//Fiat to Fiat
			if(fiatCurrencies[coin] && fiatCurrencies[toCurrency]){

				return formatNumber(
					((fromAmount / fiatCurrencies[coin]) * fiatCurrencies[toCurrency]),
					4
				);
			}


			//Crypto->Fiat || Crypto->BTC->Fiat
			var getCryptoPrice = (function (coin: string) {
				var coinPrice = this.getPrice(coin) ||
					this.wrapper("BTC","USD")(this.getPrice(coin,"BTC") as number) || 
					this.wrapper("ETH","USD")(this.getPrice(coin,"ETH") as number);

				return coinPrice;
			}).bind(this);

			//Crypto to Fiat
			if(fiatCurrencies[toCurrency]){
				let usdPrice = getCryptoPrice(coin);
				let exchangePrice = (usdPrice / fiatCurrencies['USD']) * fiatCurrencies[toCurrency]; //Convert USD to chosen FIAT
				return formatNumber(exchangePrice * fromAmount, 8);
			}
		
			//Fiat to Crypto
			if(fiatCurrencies[coin]){
				let usdPrice = getCryptoPrice(toCurrency);
				let exchangePrice = (usdPrice / fiatCurrencies['USD']) * fiatCurrencies[coin]; //Convert USD to chosen FIAT
				return formatNumber(fromAmount / exchangePrice, 8);
			}
		
			return null;
		}).bind(this);
		return doExchange;
	}

	
	private isSafeKey(key: string){

		const functionProto = function(){};

		return (
			!this.internalMethods.includes(key) &&
			!key.startsWith('__') &&
			!functionProto[key]
		);
	}
	
	/**
	 * Recursively creates the conversion wrapper functions for all the currencies.
	 */
	private populate () {
		let types = '';

		//Generate typescript interface
		types += `type amount = (amount: number | string) => number | false | null;`;
		types +='\nexport interface Pairs {';

		const all_currencies = this.worker.list.crypto.concat(this.worker.list.fiat, customWorkers.list);

		for(var i = 0; i < all_currencies.length; i++) {
			var coin = all_currencies[i];
			

			if(!coin || typeof coin !== "string" || !this.isSafeKey(coin)){
				continue;
			}

			if(!this[coin]) {
				this[coin] = {};
			}
			

			types += `\n\t'${coin.replace(/\'/g,"\\'")}': {`

			for(var a = 0; a < all_currencies.length; a++) {
				var currency = all_currencies[a];

				if(!currency || typeof currency !== "string" || !this.isSafeKey(coin)){
					continue;
				}

				this[coin][currency] = this.wrapper(coin, currency);

				types += `\n\t\t'${currency.replace(/\'/g,"\\'")}': amount,`;
			}

			types += '\n},';
		}

		types +='\n}';

		//Create types file for Node.js. With Runtime types generation ^^
		if(typeof window === "undefined" && typeof module !== "undefined" && typeof process !== "undefined"){
			(async function(){
				try{
					// Here we save the types file. Using eval because static linting checks on frontend apps are annoying af.
					eval(`
						const fs = require('fs');
						const path = require('path');
						const isDist = path.basename(__dirname) == 'dist';
						const typesFile = path.join(__dirname, isDist ? 'pairs.d.ts' : 'pairs.ts');

						fs.writeFileSync(typesFile, types, 'utf-8');
					`);
				}
				catch(err){
					console.warn(err);
				}
			})();
		}
	};

	/**
	 * Quick check if cache has loaded.
	 */
	get isReady() {
		return this.worker.isReady;
	}
	
	/**
	 * Supported currencies list
	 */
	get list(){
		return {
			'crypto': this.worker.list.crypto.concat(customWorkers.list),
			'fiat': this.worker.list.fiat
		}
	}

	/**
	 * Metadata information about cryptocurrencies
	 */
	get cryptoInfo(){
		return this.worker.cryptoInfo
	}

	/**
	 * Get crypto prices last updated ms
	 */
	get lastUpdated(){
		return this.worker.data.crypto.last_updated
	}
	

	/**
	 * Price Tickers
	 */
	get ticker(){
		return this.worker.data;
	}

	/**
	 * Update options
	 */
	setOptions(options: Options){

		const workerIntervalChanged = (options.cryptoInterval || options.fiatInterval) && (
			options.cryptoInterval !== this.worker.options.cryptoInterval ||
			options.fiatInterval !== this.worker.options.fiatInterval
		);
		
		if(workerIntervalChanged || 
			(
				options.hasOwnProperty('refreshCryptoList') && options.refreshCryptoList !== this.worker.options.refreshCryptoList
			) ||
			(
				options.hasOwnProperty('useHostedAPI') && options.useHostedAPI !== this.worker.options.useHostedAPI
			) ||
			(
				options.listLimit && options.listLimit != this.worker.options.listLimit
			)
		){

			if(!this.worker.isReady){
				throw new Error("You cannot set these options here because CryptoConvert is not ready yet. Instead set the options on the constructor parameter.");
			}

			//Restart the worker in order to clear interval & update to new interval
			this.workerReady = Promise.resolve(this.worker.setOptions(options))
			.then(async ()=>{
				await this.worker.restart();

				if(options.listLimit){
					this.populate();
				}

				return this.worker;
			}); 

			return this.worker;
		}

		return this.worker.setOptions(options);
	}

	/**
	 * Stop the worker. 
	 * 
	 * It's recommended to do this on Component unmounts (i.e if you are using React).
	 */
	stop(){
		return this.worker.stop();
	}

	/**
	 * Re-start the worker when it has been stopped.
	 */
	restart(){
		this.workerReady = this.worker.restart();
		return this.workerReady;
	}

	/**
	 * Promise function that resolves when cache has loaded.
	 */
	async ready(){
		await Promise.resolve(this.workerReady);
		await Promise.resolve(customWorkers.ready());
		return this;
	}

	/**
	 * Add a custom currency fetcher. Can be anything.
	 * 
	 * @example
	 * ```javascript
	 * convert.addCurrency('ANY','USD', async fetchPrice()=>{
	 * 		//...call your api here
	 * 		return price;
	 * }, 10000);
	 * ```
	 */
	async addCurrency(base: string, ...rest: any): Promise<void>{

		if(this.hasOwnProperty(base)){
			throw new Error("This property already exists.");
		}

		return Promise.resolve(
			customWorkers.addCurrency.apply(customWorkers, [base, ...rest])
		).then(()=>{
			if(this.worker.isReady){
				this.populate();
			}
		});
	};

	/**
	 * Remove custom currency fetcher.
	 */
	removeCurrency(base: string, quote?: string){

		if(customWorkers.list.includes(base) && this.isSafeKey(base)){
			delete this[base];

			const all_currencies = this.worker.list.crypto.concat(this.worker.list.fiat, customWorkers.list);

			for(const currency of all_currencies){
				if(this[currency]?.[base]){
					delete this[currency]?.[base];
				}
			}
		}

		return customWorkers.removeCurrency(base, quote);
	}
}


/**
 * Convert crypto to fiat and vice-versa.
 * 
 * @example
 * ```javascript
 * convert.BTC.USD(1);
 * convert.USD.BTC(1);
 * convert.BTC.ETH(1);
 * convert.ETH.JPY(1);
 * convert.USD.EUR(1);
 * ```
 * 
 * @see {@link https://github.com/coinconvert/crypto-convert Documentation}
 * 
 */
interface CryptoConvert extends Pairs{}

//@ts-ignore
CryptoConvert.default = CryptoConvert;
if(typeof module !== "undefined" && module.exports){
	module.exports = CryptoConvert;
}

export default CryptoConvert;