const api = require("./api");
const fs = require("fs");

function Prices(options = {}) {

	this.lastUpdate = false;
	this.isReady = false;
	this.isBrowser = (typeof window !== "undefined" && window.navigator && window.document);

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

		},
		"fiat": {
			USD: 1
		}
	};
	
	if(!this.isBrowser) {
		this._loadCache();
	}
	this.update(); //Set options

	this.log = function () {
		return false;
		Array.from(arguments).forEach((arg) => {
			console.log(arg);
		})
	}
}

Prices.prototype.update = function (o) {
	o = o || {};
	this.options = {
		"crypto_interval": isNaN(o.crypto_interval) ? (5 * 1e3) : Math.min(1000, o.crypto_interval), //Every 5 seconds
		"fiat_interval": isNaN(o.fiat_interval) ? (60 * 1e3 * 60) : Math.min(5000, o.fiat_interval), //Every 1 hour
		binance: o.hasOwnProperty('binance') ? o.binance : true,
		okex: o.hasOwnProperty('okex') ? o.okex : true,
		bitfinex: o.hasOwnProperty('bitfinex') ? o.bitfinex : true,
		onUpdate: o.onUpdate
	};

	return this;
}

Prices.prototype.crypto = async function () {
	this.log("Updating crypto...", this.data.crypto);
	var binance = this.options.binance ? (await api.binance.ticker() || {}) : {};
	var bitfinex = this.options.bitfinex ? (await api.bitfinex.ticker() || {}) : {};
	var okex = this.options.okex ? (await api.okex.ticker() || {}) : {};

	this.data.crypto = { ...okex, ...bitfinex, ...binance };

	
	if(Object.keys(binance).length > 0 || Object.keys(bitfinex).length > 0 || Object.keys(okex).length > 0) {
		this.lastUpdate = (+ new Date());
		if(typeof this.options.onUpdate === "function") {
			this.options.onUpdate(this.data.crypto);
		}
	}

	this._cache(); //Save local cache

	return this;
}

Prices.prototype.fiat = async function () {
	this.log("Updating fiat...",this.data.fiat);
	var fiat = await api.fiat.all();
	this.data.fiat = fiat || this.data.fiat;
	this._cache(); //Save local cache
	return this;
}

Prices.prototype.lists = async function () {
	this.log("Updating list...", this.list.crypto);
	var topCoins = await api.coinmarketcap.top();
	this.list.crypto = topCoins || this.list.crypto;
	return this;
}

Prices.prototype.browserTicker = async function () {
	var prices = await api.coinconvert.ticker();
	this.data = prices;
	return this;
}

Prices.prototype.browserList = async function () {
	var lists = await api.coinconvert.list();
	this.list = lists;
	return this;
}

Prices.prototype._cache = function (cb = ()=>{}) {
	return fs.writeFile(__dirname + "/cache.json", JSON.stringify(this.data),cb);
}

Prices.prototype._loadCache = function () {
	if (fs.existsSync(__dirname + "/cache.json")) {
		var cache = JSON.parse(fs.readFileSync(__dirname + "/cache.json").toString('utf8'));
		this.data = cache;
		return true;
	}
	return false;
}


Prices.prototype.runBrowser = async function () {
	await this.browserList();
	await this.browserTicker();
	this.isReady = true;
	this.crypto_worker = setInterval(this.browserTicker.bind(this), this.options.crypto_interval);
	return this;
}

Prices.prototype.runServer = async function () {
	await this.lists();
	await this.fiat();
	await this.crypto();

	this.isReady = true;
	this.crypto_worker = setInterval(this.crypto.bind(this), this.options.crypto_interval);
	this.fiat_worker = setInterval(this.fiat.bind(this), this.options.fiat_interval);

	return this;
}

Prices.prototype.run = function () {
	this.isRunning = true;
	if(this.isBrowser) {
		this.runBrowser();
		return this;
	}
	this.runServer();
	return this;
}


Prices.prototype.stop = function () {
	clearInterval(this.crypto_worker);
	clearInterval(this.fiat_worker);
	this.isReady = false;
	this.isRunning = false;
	return this;
}

Prices.prototype.restart = function () {
	return this.stop()
		.run();
}

const PricesWorker = (new Prices()).run();

module.exports = PricesWorker;
	
	
