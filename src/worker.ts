
import API from './api';
import { getAverage } from './helpers';

export interface Options {

	/**
	 * Crypto prices update interval in ms (Default: 5s)
	 */
	crypto_interval?: number,

	/**
	 * Fiat prices update interval in ms (Default: 1 hour)
	 */
	fiat_interval?: number,


	/**
	 * Calculate Average prices from multiple exchanges (Default: true)
	 */
	calculateAverage?: boolean,
	/**
	 * Fetch prices from Binance (Default: true)
	 */
	binance?: boolean,

	/**
	 * Fetch prices from Coinbase (Default: true)
	 */
	coinbase?: boolean,

	/**
	 * Fetch prices from Bitfinex (Default: true)
	 */
	bitfinex?: boolean,

	/**
	 * Callback to call on prices update
	 */
	onUpdate?: (tickers: any, isFiat?: boolean)=>any
}

export interface Tickers {
	crypto:{
		last_update: number | null,
		current:{
			[symbol: string]: number
		} | null,
		binance?: {
			[symbol: string]: number
		},
		bitfinex?: {
			[symbol: string]: number
		},
		coinbase?: {
			[symbol: string]: number
		}
	},
	fiat:{
		last_update: number | null,
		current: null | {
			USD: number,
			JPY: number,
			BGN: number,
			CZK: number,
			DKK: number,
			GBP: number,
			HUF: number,
			PLN: number,
			RON: number,
			SEK: number,
			CHF: number,
			ISK: number,
			NOK: number,
			HRK: number,
			RUB: number,
			TRY: number,
			AUD: number,
			BRL: number,
			CAD: number,
			CNY: number,
			HKD: number,
			IDR: number,
			ILS: number,
			INR: number,
			KRW: number,
			MXN: number,
			MYR: number,
			NZD: number,
			PHP: number,
			SGD: number,
			THB: number,
			ZAR: number,
			EUR: number
		}
	}
	
}

export interface PricesClass {
	data: Tickers,
	list:{
		crypto: string[],
		fiat: string[]
	},
	setOptions: (options: Options)=> PricesClass,
	stop: () => PricesClass,
	restart: () => Promise<PricesClass>,
	run: () => Promise<PricesClass>,
	isRunning: boolean,
	isReady: boolean
}

const isBrowser = (typeof window !== "undefined" && window.document);

function Prices(initialOptions = {}) {

	this.list = {
		"crypto": [
			"BTC", "ETH", "USDT", "XRP", "DOT", "ADA", "LTC", "LINK", "BCH", "BNB", "XLM", "USDC", "UNI", "WBTC", "DOGE", "AAVE", "BSV", "EOS", "XMR", "XEM", "TRX", "XTZ", "THETA", "SNX", "ATOM", "VET", "SUSHI", "DAI", "NEO", "MKR", "COMP", "CRO", "HT", "BUSD", "SOL", "LEO", "MIOTA", "FTT", "CEL", "EGLD", "DASH", "UMA", "AVAX", "FIL", "ZEC", "LUNA", "GRT", "YFI", "KSM", "REV", "ETC", "DCR", "ALGO", "ZIL", "CHSB", "WAVES", "NEAR", "LRC", "HBAR", "REN", "OMG", "NEXO", "RUNE", "RENBTC", "VGX", "CELO", "CRV", "1INCH", "ZRX", "ONT", "HEDG", "BAT", "NANO", "HUSD", "ICX", "BTT", "QNT", "DGB", "SC", "TUSD", "ZEN", "OKB", "RSR", "ALPHA", "QTUM", "STX", "FTM", "AMPL", "FUN", "KNC", "ENJ", "IOST", "MANA", "XVG", "UST", "OCEAN", "BTCB", "BNT", "PAX", "BAND"
		],
		"fiat": [
			"USD", "JPY", "BGN", "CZK", "DKK", "GBP", "HUF", "PLN", "RON", "SEK", "CHF", "ISK", "NOK", "HRK", "RUB", "TRY", "AUD", "BRL", "CAD", "CNY", "HKD", "IDR", "ILS", "INR", "KRW", "MXN", "MYR", "NZD", "PHP", "SGD", "THB", "ZAR", "EUR"
		]
	}

	this.data = {
		"crypto": {
			last_update: null,
			current: null
		},
		"fiat": {
			last_update: null,
			current: null
		}
	};

	this.setOptions(initialOptions); //Set options

	this.log = function () {
		if(!isBrowser && process?.env?.NODE_ENV?.startsWith('dev')){
			Array.from(arguments).forEach((arg) => {
				console.log(arg);
			})
		}
	}

	this.isReady = false;
}

/**
 * Options
 */
Prices.prototype.setOptions = function (o?: Options) {
	o = o || {};

	this.options = {
		crypto_interval: isNaN(o.crypto_interval) ? (5 * 1e3) : Math.min(1000, o.crypto_interval), //Every 5 seconds
		fiat_interval: isNaN(o.fiat_interval) ? (60 * 1e3 * 60) : Math.min(5000, o.fiat_interval), //Every 1 hour
		calculateAverage: o.hasOwnProperty('calculateAverage') ? o.calculateAverage : true,
		binance: o.hasOwnProperty('binance') ? o.binance : true,
		coinbase: o.hasOwnProperty('coinbase') ? o.coinbase : true,
		bitfinex: o.hasOwnProperty('bitfinex') ? o.bitfinex : true,
		onUpdate: o.onUpdate
	};

	return this;
}

Prices.prototype.updateCrypto = async function () {
	this.log("Updating crypto...", this.data.crypto);

	const tickers = {
		binance: API.binance.ticker,
		bitfinex: API.bitfinex.ticker,
		coinbase: API.coinbase.ticker
	};

	let currents = [],
		current = {};

	for(const ticker in tickers){
		try{
			this.data.crypto[ticker] = await tickers[ticker]();

			if(this.options[ticker]){
				currents.push(this.data.crypto[ticker]);
				current = {
					...current,
					...this.data.crypto[ticker]
				}
				this.data.crypto.last_updated = (+ new Date());
			}
		} catch(err){
			this.data.crypto[ticker] = null;
			console.error(`Failed fetching prices from ${ticker}`, err);
		}
	}

	if(currents.length){
		this.data.crypto.current = this.options.calculateAverage ?	
			{	
				...current,	
				...getAverage(currents)
			}
			: current;

		if(typeof this.options.onUpdate === "function") {
			this.options.onUpdate(this.data.crypto);
		}	
	}

	
	return this;
}

Prices.prototype.updateFiat = async function () {
	this.log("Updating fiat...",this.data.fiat);

	try{
		this.data.fiat.current = await API.fiat.all();
		this.data.fiat.last_updated = (+ new Date());

		if(typeof this.options.onUpdate === "function") {
			this.options.onUpdate(this.data.fiat, true);
		}	

	} catch(err) {
		console.error(`Failed fetching fiat prices from ECB`, err);
	}
	
	return this;
}

Prices.prototype.updateLists = async function () {
	this.log("Updating top currency list...", this.list.crypto);

	try{
		this.list.crypto = await API.coinmarketcap.top();
	} catch(err) {
		console.error(`Failed fetching fiat prices from ECB`, err);
	}
	return this;
}

Prices.prototype.browserTicker = async function () {
	try{
		const data = await API.coinconvert.ticker() as unknown as any;

		let exchangesData = {
			binance: data.crypto.binance,
			coinbase: data.crypto.coinbase,
			bitfinex: data.crypto.bitfinex,
		}

		let currents = [],
			current = {};

		for(const exchange in exchangesData){
			if(!this.options[exchange] || !exchangesData[exchange]){
				continue;
			}
			
			currents.push(exchangesData[exchange]);

			current = {
				...current,
				...exchangesData[exchange]
			}
		}

		this.data = {
			...data,
			crypto:{
				...crypto,
				current: this.options.calculateAverage ? {
					...current,
					...getAverage(currents)
				} : current
			}
		};
		
	} catch(err){
		console.error(`Failed fetching prices from API`, err);
	}
	
	return this;
}

Prices.prototype.runBrowser = async function () {
	await this.browserTicker();

	this.list = await API.coinconvert.list();

	this.isReady = true;

	if(this.crypto_worker){
		clearInterval
	}

	this.crypto_worker = setInterval(
		this.browserTicker.bind(this), 
		this.options.crypto_interval
	);
	return this;
}

Prices.prototype.runServer = async function () {
	await this.updateLists();
	await this.updateFiat();
	await this.updateCrypto();

	this.isReady = true;

	this.crypto_worker = setInterval(
		this.updateCrypto.bind(this), this.options.crypto_interval
	);

	this.fiat_worker = setInterval(
		this.updateFiat.bind(this), 
		this.options.fiat_interval
	);

	return this;
}

Prices.prototype.run = function () {
	this.isRunning = true;

	if(isBrowser) {
		return this.runBrowser();
	}

	return this.runServer();
}

Prices.prototype.stop = function () {
	clearInterval(this.crypto_worker);

	clearInterval(this.fiat_worker);

	this.isRunning = false;

	return this;
}

Prices.prototype.restart = function () {
	return this.stop().run();
}

const PricesWorker: PricesClass = new Prices();
export const WorkerReady = PricesWorker.run();

export default PricesWorker;
	
