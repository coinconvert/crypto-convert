const api = require("./api");

function Prices(options = {}) {

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
	
	this.options = {
		"multiple_fiats": true,
		"crypto_interval": options.crypto_interval || (5 * 1e3), //Every 5 seconds
		"fiat_interval": options.fiat_interval || (60 * 1e3) * 60 * 1 //Every 1 hour
	}

	this.log = function () {
		return false;
		Array.from(arguments).forEach((arg) => {
			console.log(arg);
		})
	}
}

Prices.prototype.crypto = async function () {
	this.log("Updating crypto...",this.data.crypto);
	var binance = await api.binance.ticker() || {};
	var bitfinex = await api.bitfinex.ticker() || {};
	var okex = await api.okex.ticker() || {};
	this.data.crypto = {...okex, ...bitfinex, ...binance };
	return this;
}

Prices.prototype.fiat = async function () {
	this.log("Updating fiat...",this.data.fiat);
	var fiat = await api.fiat.all();
	this.data.fiat = fiat || this.data.fiat;
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

Prices.prototype.runBrowser = function () {
	this.browserList();
	this.browserTicker();
	this.crypto_worker = setInterval(this.browserTicker.bind(this), this.options.crypto_interval);
	return this;
}

Prices.prototype.runServer = function () {
	this.lists();
	this.crypto();
	this.fiat();
	this.crypto_worker = setInterval(this.crypto.bind(this), this.options.crypto_interval);
	this.fiat_worker = setInterval(this.fiat.bind(this), this.options.fiat_interval);

	return this;
}

Prices.prototype.run = function () {
	if(typeof window !== "undefined" && window.navigator && window.document) {
		return this.runBrowser();
	}
	return this.runServer();
}


Prices.prototype.stop = function () {
	clearInterval(this.crypto_worker);
	clearInterval(this.fiat_worker);
	return this;
}

const PricesWorker = (new Prices()).run();

module.exports = PricesWorker;
	
	
