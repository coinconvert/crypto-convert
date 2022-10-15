
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
	 * Fetch prices from Kraken (Default: true)
	 */
	kraken?: boolean,

	/**
	 * Callback to call on prices update
	 */
	onUpdate?: (tickers: any, isFiat?: boolean) => any,


	/**
	 * Use the hosted version of the API on server-side as well.
	 */
	 serverSideCCAPI?: boolean,

	 /**
	  * Refresh crypto list (server-side only)
	  */

	 refreshCryptoList?: boolean,
}

export interface Tickers {
	crypto: {
		last_updated: number | null,
		current: {
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
		},
		kraken?: {
			[symbol: string]: number
		}
	},
	fiat: {
		last_updated: number | null,
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
	list: {
		crypto: string[],
		fiat: string[]
	},
	setOptions: (options: Options | ((currentOptions: Options) => Options)) => PricesClass,
	stop: () => PricesClass,
	restart: () => Promise<PricesClass>,
	run: () => Promise<PricesClass>,
	options: Options,
	isRunning: boolean,
	isReady: boolean,
	onCryptoListRefresh: (list: any) => any,
	/**
	 * Metadata information about cryptocurrencies
	 */
	cryptoInfo: {
		[crypto: string]: {
			id: number,
			symbol: string,
			title: string,
			logo: string,
			rank: number
		}
	}
}

const isBrowser = (typeof window !== "undefined" && window.document);

function Prices(initialOptions = {}) {


	this.exchanges = ['binance', 'bitfinex', 'coinbase', 'kraken'];

	this.list = {
		"crypto": [
			"BTC", "ETH", "USDT", "USDC", "BNB", "XRP", "BUSD", "ADA", "SOL", "DOGE", "DOT", "DAI", "MATIC", "SHIB", "TRX", "AVAX", "UNI", "WBTC", "LEO", "LTC", "ETC", "LINK", "ATOM", "FTT", "XLM", "NEAR", "CRO", "XMR", "ALGO", "BCH", "LUNC", "FLOW", "QNT", "VET", "TON", "FIL", "APE", "ICP", "CHZ", "HBAR", "MANA", "XTZ", "SAND", "EOS", "EGLD", "THETA", "AAVE", "AXS", "OKB", "USDP", "BSV", "KCS", "TUSD", "ZEC", "MIOTA", "XEC", "USDD", "MKR", "BTT", "HT", "GRT", "USDN", "HNT", "CAKE", "NEO", "KLAY", "FTM", "SNX", "PAXG", "RUNE", "NEXO", "LDO", "CRV", "GT", "DASH", "ENJ", "BAT", "COMP", "STX", "KAVA", "RVN", "ZIL", "WAVES", "FEI", "MINA", "RSR", "XDC", "LRC", "GMT", "DCR", "TWT", "CELO", "XEM", "BTG", "KSM", "HOT", "1INCH", "CEL", "CVX", "BNX", "AR", "GNO", "LUNA", "ROSE", "ENS", "USTC", "GUSD", "QTUM", "YFI", "ANKR", "TFUEL", "GALA", "GLM", "IOTX", "KDA", "BTRST", "ONE", "OMG", "BAL", "ZRX", "LPT", "POLY", "JST", "FLUX", "ICX", "BORA", "IOST", "HIVE", "AMP", "OP", "KNC", "XYM", "SRM", "ONT", "WAXP", "STORJ", "MXC", "CSPR", "IMX", "SC", "ZEN", "AUDIO", "GLMR", "SXP", "XCH", "ABBC", "CHSB", "VGX", "UMA", "WOO"
		],
		"fiat": [
			"USD", "JPY", "BGN", "CZK", "DKK", "GBP", "HUF", "PLN", "RON", "SEK", "CHF", "ISK", "NOK", "HRK", "RUB", "TRY", "AUD", "BRL", "CAD", "CNY", "HKD", "IDR", "ILS", "INR", "KRW", "MXN", "MYR", "NZD", "PHP", "SGD", "THB", "ZAR", "EUR"
		]
	}

	this.cryptoInfo = [{ "id": 1, "title": "Bitcoin", "symbol": "BTC", "rank": 1 }, { "id": 1027, "title": "Ethereum", "symbol": "ETH", "rank": 2 }, { "id": 825, "title": "Tether", "symbol": "USDT", "rank": 3 }, { "id": 3408, "title": "USD Coin", "symbol": "USDC", "rank": 4 }, { "id": 1839, "title": "BNB", "symbol": "BNB", "rank": 5 }, { "id": 52, "title": "XRP", "symbol": "XRP", "rank": 6 }, { "id": 4687, "title": "Binance USD", "symbol": "BUSD", "rank": 7 }, { "id": 2010, "title": "Cardano", "symbol": "ADA", "rank": 8 }, { "id": 5426, "title": "Solana", "symbol": "SOL", "rank": 9 }, { "id": 74, "title": "Dogecoin", "symbol": "DOGE", "rank": 10 }, { "id": 6636, "title": "Polkadot", "symbol": "DOT", "rank": 11 }, { "id": 4943, "title": "Dai", "symbol": "DAI", "rank": 12 }, { "id": 3890, "title": "Polygon", "symbol": "MATIC", "rank": 13 }, { "id": 5994, "title": "Shiba Inu", "symbol": "SHIB", "rank": 14 }, { "id": 1958, "title": "TRON", "symbol": "TRX", "rank": 15 }, { "id": 5805, "title": "Avalanche", "symbol": "AVAX", "rank": 16 }, { "id": 7083, "title": "Uniswap", "symbol": "UNI", "rank": 17 }, { "id": 3717, "title": "Wrapped Bitcoin", "symbol": "WBTC", "rank": 18 }, { "id": 3957, "title": "UNUS SED LEO", "symbol": "LEO", "rank": 19 }, { "id": 2, "title": "Litecoin", "symbol": "LTC", "rank": 20 }, { "id": 1321, "title": "Ethereum Classic", "symbol": "ETC", "rank": 21 }, { "id": 1975, "title": "Chainlink", "symbol": "LINK", "rank": 22 }, { "id": 3794, "title": "Cosmos", "symbol": "ATOM", "rank": 23 }, { "id": 4195, "title": "FTX Token", "symbol": "FTT", "rank": 24 }, { "id": 512, "title": "Stellar", "symbol": "XLM", "rank": 25 }, { "id": 6535, "title": "NEAR Protocol", "symbol": "NEAR", "rank": 26 }, { "id": 3635, "title": "Cronos", "symbol": "CRO", "rank": 27 }, { "id": 328, "title": "Monero", "symbol": "XMR", "rank": 28 }, { "id": 4030, "title": "Algorand", "symbol": "ALGO", "rank": 29 }, { "id": 1831, "title": "Bitcoin Cash", "symbol": "BCH", "rank": 30 }, { "id": 4172, "title": "Terra Classic", "symbol": "LUNC", "rank": 31 }, { "id": 4558, "title": "Flow", "symbol": "FLOW", "rank": 32 }, { "id": 3155, "title": "Quant", "symbol": "QNT", "rank": 33 }, { "id": 3077, "title": "VeChain", "symbol": "VET", "rank": 34 }, { "id": 11419, "title": "Toncoin", "symbol": "TON", "rank": 35 }, { "id": 2280, "title": "Filecoin", "symbol": "FIL", "rank": 36 }, { "id": 18876, "title": "ApeCoin", "symbol": "APE", "rank": 37 }, { "id": 8916, "title": "Internet Computer", "symbol": "ICP", "rank": 38 }, { "id": 4066, "title": "Chiliz", "symbol": "CHZ", "rank": 39 }, { "id": 4642, "title": "Hedera", "symbol": "HBAR", "rank": 40 }, { "id": 1966, "title": "Decentraland", "symbol": "MANA", "rank": 41 }, { "id": 2011, "title": "Tezos", "symbol": "XTZ", "rank": 42 }, { "id": 6210, "title": "The Sandbox", "symbol": "SAND", "rank": 43 }, { "id": 1765, "title": "EOS", "symbol": "EOS", "rank": 44 }, { "id": 6892, "title": "Elrond", "symbol": "EGLD", "rank": 45 }, { "id": 2416, "title": "Theta Network", "symbol": "THETA", "rank": 46 }, { "id": 7278, "title": "Aave", "symbol": "AAVE", "rank": 47 }, { "id": 6783, "title": "Axie Infinity", "symbol": "AXS", "rank": 48 }, { "id": 3897, "title": "OKB", "symbol": "OKB", "rank": 49 }, { "id": 3330, "title": "Pax Dollar", "symbol": "USDP", "rank": 50 }, { "id": 3602, "title": "Bitcoin SV", "symbol": "BSV", "rank": 51 }, { "id": 2087, "title": "KuCoin Token", "symbol": "KCS", "rank": 52 }, { "id": 2563, "title": "TrueUSD", "symbol": "TUSD", "rank": 53 }, { "id": 1437, "title": "Zcash", "symbol": "ZEC", "rank": 54 }, { "id": 1720, "title": "IOTA", "symbol": "MIOTA", "rank": 55 }, { "id": 10791, "title": "eCash", "symbol": "XEC", "rank": 56 }, { "id": 19891, "title": "USDD", "symbol": "USDD", "rank": 57 }, { "id": 1518, "title": "Maker", "symbol": "MKR", "rank": 58 }, { "id": 16086, "title": "BitTorrent-New", "symbol": "BTT", "rank": 59 }, { "id": 2502, "title": "Huobi Token", "symbol": "HT", "rank": 60 }, { "id": 6719, "title": "The Graph", "symbol": "GRT", "rank": 61 }, { "id": 5068, "title": "Neutrino USD", "symbol": "USDN", "rank": 62 }, { "id": 5665, "title": "Helium", "symbol": "HNT", "rank": 63 }, { "id": 7186, "title": "PancakeSwap", "symbol": "CAKE", "rank": 64 }, { "id": 1376, "title": "Neo", "symbol": "NEO", "rank": 65 }, { "id": 4256, "title": "Klaytn", "symbol": "KLAY", "rank": 66 }, { "id": 3513, "title": "Fantom", "symbol": "FTM", "rank": 67 }, { "id": 2586, "title": "Synthetix", "symbol": "SNX", "rank": 68 }, { "id": 4705, "title": "PAX Gold", "symbol": "PAXG", "rank": 69 }, { "id": 4157, "title": "THORChain", "symbol": "RUNE", "rank": 70 }, { "id": 2694, "title": "Nexo", "symbol": "NEXO", "rank": 71 }, { "id": 8000, "title": "Lido DAO", "symbol": "LDO", "rank": 72 }, { "id": 6538, "title": "Curve DAO Token", "symbol": "CRV", "rank": 73 }, { "id": 4269, "title": "GateToken", "symbol": "GT", "rank": 74 }, { "id": 131, "title": "Dash", "symbol": "DASH", "rank": 75 }, { "id": 2130, "title": "Enjin Coin", "symbol": "ENJ", "rank": 76 }, { "id": 1697, "title": "Basic Attention Token", "symbol": "BAT", "rank": 77 }, { "id": 5692, "title": "Compound", "symbol": "COMP", "rank": 78 }, { "id": 4847, "title": "Stacks", "symbol": "STX", "rank": 79 }, { "id": 4846, "title": "Kava", "symbol": "KAVA", "rank": 80 }, { "id": 2577, "title": "Ravencoin", "symbol": "RVN", "rank": 81 }, { "id": 2469, "title": "Zilliqa", "symbol": "ZIL", "rank": 82 }, { "id": 1274, "title": "Waves", "symbol": "WAVES", "rank": 83 }, { "id": 8642, "title": "Fei USD", "symbol": "FEI", "rank": 84 }, { "id": 8646, "title": "Mina", "symbol": "MINA", "rank": 85 }, { "id": 3964, "title": "Reserve Rights", "symbol": "RSR", "rank": 86 }, { "id": 2634, "title": "XDC Network", "symbol": "XDC", "rank": 87 }, { "id": 1934, "title": "Loopring", "symbol": "LRC", "rank": 88 }, { "id": 18069, "title": "STEPN", "symbol": "GMT", "rank": 89 }, { "id": 1168, "title": "Decred", "symbol": "DCR", "rank": 90 }, { "id": 5964, "title": "Trust Wallet Token", "symbol": "TWT", "rank": 91 }, { "id": 5567, "title": "Celo", "symbol": "CELO", "rank": 92 }, { "id": 873, "title": "NEM", "symbol": "XEM", "rank": 93 }, { "id": 2083, "title": "Bitcoin Gold", "symbol": "BTG", "rank": 94 }, { "id": 5034, "title": "Kusama", "symbol": "KSM", "rank": 95 }, { "id": 2682, "title": "Holo", "symbol": "HOT", "rank": 96 }, { "id": 8104, "title": "1inch Network", "symbol": "1INCH", "rank": 97 }, { "id": 2700, "title": "Celsius", "symbol": "CEL", "rank": 98 }, { "id": 9903, "title": "Convex Finance", "symbol": "CVX", "rank": 99 }, { "id": 9891, "title": "BinaryX", "symbol": "BNX", "rank": 100 }, { "id": 5632, "title": "Arweave", "symbol": "AR", "rank": 101 }, { "id": 1659, "title": "Gnosis", "symbol": "GNO", "rank": 102 }, { "id": 20314, "title": "Terra", "symbol": "LUNA", "rank": 103 }, { "id": 7653, "title": "Oasis Network", "symbol": "ROSE", "rank": 104 }, { "id": 13855, "title": "Ethereum Name Service", "symbol": "ENS", "rank": 105 }, { "id": 7129, "title": "TerraClassicUSD", "symbol": "USTC", "rank": 106 }, { "id": 3306, "title": "Gemini Dollar", "symbol": "GUSD", "rank": 107 }, { "id": 1684, "title": "Qtum", "symbol": "QTUM", "rank": 108 }, { "id": 5864, "title": "yearn.finance", "symbol": "YFI", "rank": 109 }, { "id": 3783, "title": "Ankr", "symbol": "ANKR", "rank": 110 }, { "id": 3822, "title": "Theta Fuel", "symbol": "TFUEL", "rank": 111 }, { "id": 7080, "title": "Gala", "symbol": "GALA", "rank": 112 }, { "id": 1455, "title": "Golem", "symbol": "GLM", "rank": 113 }, { "id": 2777, "title": "IoTeX", "symbol": "IOTX", "rank": 114 }, { "id": 5647, "title": "Kadena", "symbol": "KDA", "rank": 115 }, { "id": 11584, "title": "Braintrust", "symbol": "BTRST", "rank": 116 }, { "id": 3945, "title": "Harmony", "symbol": "ONE", "rank": 117 }, { "id": 1808, "title": "OMG Network", "symbol": "OMG", "rank": 118 }, { "id": 5728, "title": "Balancer", "symbol": "BAL", "rank": 119 }, { "id": 1896, "title": "0x", "symbol": "ZRX", "rank": 120 }, { "id": 3640, "title": "Livepeer", "symbol": "LPT", "rank": 121 }, { "id": 2496, "title": "Polymath", "symbol": "POLY", "rank": 122 }, { "id": 5488, "title": "JUST", "symbol": "JST", "rank": 123 }, { "id": 3029, "title": "Flux", "symbol": "FLUX", "rank": 124 }, { "id": 2099, "title": "ICON", "symbol": "ICX", "rank": 125 }, { "id": 3801, "title": "BORA", "symbol": "BORA", "rank": 126 }, { "id": 2405, "title": "IOST", "symbol": "IOST", "rank": 127 }, { "id": 5370, "title": "Hive", "symbol": "HIVE", "rank": 128 }, { "id": 6945, "title": "Amp", "symbol": "AMP", "rank": 129 }, { "id": 11840, "title": "Optimism", "symbol": "OP", "rank": 130 }, { "id": 9444, "title": "Kyber Network Crystal v2", "symbol": "KNC", "rank": 131 }, { "id": 8677, "title": "Symbol", "symbol": "XYM", "rank": 132 }, { "id": 6187, "title": "Serum", "symbol": "SRM", "rank": 133 }, { "id": 2566, "title": "Ontology", "symbol": "ONT", "rank": 134 }, { "id": 2300, "title": "WAX", "symbol": "WAXP", "rank": 135 }, { "id": 1772, "title": "Storj", "symbol": "STORJ", "rank": 136 }, { "id": 3628, "title": "MXC", "symbol": "MXC", "rank": 137 }, { "id": 5899, "title": "Casper", "symbol": "CSPR", "rank": 138 }, { "id": 10603, "title": "Immutable X", "symbol": "IMX", "rank": 139 }, { "id": 1042, "title": "Siacoin", "symbol": "SC", "rank": 140 }, { "id": 1698, "title": "Horizen", "symbol": "ZEN", "rank": 141 }, { "id": 7455, "title": "Audius", "symbol": "AUDIO", "rank": 142 }, { "id": 6836, "title": "Moonbeam", "symbol": "GLMR", "rank": 143 }, { "id": 4279, "title": "SXP", "symbol": "SXP", "rank": 144 }, { "id": 9258, "title": "Chia", "symbol": "XCH", "rank": 145 }, { "id": 3437, "title": "ABBC Coin", "symbol": "ABBC", "rank": 146 }, { "id": 2499, "title": "SwissBorg", "symbol": "CHSB", "rank": 147 }, { "id": 1817, "title": "Voyager Token", "symbol": "VGX", "rank": 148 }, { "id": 5617, "title": "UMA", "symbol": "UMA", "rank": 149 }, { "id": 7501, "title": "WOO Network", "symbol": "WOO", "rank": 150 }]
		.reduce((o, v) => {
			o[v.symbol] = {
				...o,
				logo: `https://s2.coinmarketcap.com/static/img/coins/128x128/${v.id}.png`
			}
			return o;
		}, {});


	this.data = {
		"crypto": {
			last_updated: null,
			current: null
		},
		"fiat": {
			last_updated: null,
			current: null
		}
	};

	this.options = {
		crypto_interval: isBrowser ? 15 * 1e3 : (5 * 1e3), //Every 5 seconds on server/Every 15 seconds on browser
		fiat_interval: (60 * 1e3 * 60), //Every 1 hour (server only)
		calculateAverage: true,
		onUpdate: undefined,
		serverSideCCAPI: false,
		refreshCryptoList: false,
		//Enable all exchanges by default
		...(this.exchanges.reduce((o: any, exchange: string) => ({
			...o,
			[exchange]: true,
		}), {})),

		...initialOptions
	};

	this.log = function () {
		if (!isBrowser && process?.env?.NODE_ENV?.startsWith('dev')) {
			Array.from(arguments).forEach((arg) => {
				console.log(arg);
			})
		}
	}

	this.isReady = false;

	this.onCryptoListRefresh;
}

/**
 * Options
 */
Prices.prototype.setOptions = function (o?: Options | ((currentOptions: Options) => Options)) {
	let newOptions = typeof o === "function" ?
		o({ ...this.options }) :
		(o || {});

	if (isBrowser && !isNaN(newOptions.crypto_interval) && newOptions.crypto_interval < 10000) {
		console.warn(`The minimum allowed interval on frontend is 10s.`);
	}

	//Check if new options affect exchanges
	let exchangesUpdated = false,
		averageUpdated = newOptions.hasOwnProperty('calculateAverage') && newOptions.calculateAverage !== this.options.calculateAverage;
	for (const exchange of this.exchanges) {
		if (newOptions.hasOwnProperty(exchange) && newOptions[exchange] !== this.options[exchange]) {
			exchangesUpdated = true;
			break;
		}
	}


	//Save options
	this.options = {
		...this.options,
		...newOptions,
		crypto_interval: isNaN(newOptions.crypto_interval) ? this.options.crypto_interval : Math.max(isBrowser ? 10000 : 1000, newOptions.crypto_interval),
		fiat_interval: isNaN(newOptions.fiat_interval) ? this.options.fiat_interval : Math.max(60 * 30 * 1e3, newOptions.fiat_interval),
	}

	//Update current prices
	if (isBrowser || this.options.serverSideCCAPI) {
		if(exchangesUpdated || averageUpdated){
			return this.browserTicker();
		}
		
	} else {
		this.data.crypto.current = this.joinPrices(this.data);
	}

	return this;
}

Prices.prototype.updateCrypto = async function () {
	if (!this.data.crypto.last_updated) {
		this.log("Updating crypto...");
	}

	const tickers = this.exchanges.reduce((o: any, exchange: string) => ({
		...o,
		[exchange]: API[exchange].ticker
	}), {});

	let currents = [],
		current = {};

	for (const ticker in tickers) {
		try {
			this.data.crypto[ticker] = await tickers[ticker]();

			if (this.options[ticker]) {
				currents.push(this.data.crypto[ticker]);
				current = {
					...current,
					...this.data.crypto[ticker]
				}
				this.data.crypto.last_updated = (+ new Date());
			}
		} catch (err) {
			this.data.crypto[ticker] = null;
			console.error(`Failed fetching prices from ${ticker}`, err);
		}
	}

	if (currents.length) {
		this.data.crypto.current = this.options.calculateAverage ?
			{
				...current,
				...getAverage(currents)
			}
			: current;

		if (typeof this.options.onUpdate === "function") {
			this.options.onUpdate(this.data.crypto);
		}
	}


	return this;
}

Prices.prototype.updateFiat = async function () {
	this.log("Updating fiat...");

	try {
		this.data.fiat.current = await API.fiat.all();
		this.data.fiat.last_updated = (+ new Date());

		if (typeof this.options.onUpdate === "function") {
			this.options.onUpdate(this.data.fiat, true);
		}

	} catch (err) {
		console.error(`Failed fetching fiat prices from ECB`, err);
	}

	return this;
}

Prices.prototype.updateLists = async function () {
	if (!this.data.crypto.last_updated) {
		this.log("Updating top currency list...");
	}
	
	try {
		const getTopList = await API.coinmarketcap.top();
		this.list.crypto = Object.keys(getTopList);
		this.cryptoInfo = getTopList;

		if(typeof this.onCryptoListRefresh == "function" && this.isReady){
			this.onCryptoListRefresh(this.list.crypto);
		}

	} catch (err) {
		console.error(`Failed fetching fiat prices from ECB`, err);
	}
	return this;
}

Prices.prototype.joinPrices = function (data: Tickers) {
	const exchangesData = this.exchanges.reduce((o: any, exchange: string) => ({
		...o,
		[exchange]: data.crypto[exchange]
	}), {});

	let currents = [],
		current = {};

	for (const exchange in exchangesData) {
		if (!this.options[exchange] || !exchangesData[exchange]) {
			continue;
		}

		currents.push(exchangesData[exchange]);

		current = {
			...current,
			...exchangesData[exchange]
		}
	}

	return this.options.calculateAverage ? {
		...current,
		...getAverage(currents)
	} : current;
}

Prices.prototype.browserTicker = async function () {
	try {
		const currentOptions = this.options;

		const disabledExchanges = this.exchanges.filter((exchange: string) => !currentOptions[exchange]);
	
		const data = await API.coinconvert.ticker(disabledExchanges.length ? {
			'filterExchanges': disabledExchanges,
			'noAverage': !this.options.calculateAverage ? true : undefined 
		} : {}) as any;

		this.data = data;

		if (typeof this.options.onUpdate === "function") {
			this.options.onUpdate(this.data);
		}

	} catch (err) {
		console.error(`Failed fetching prices from API`, err);
	}

	return this;
}

Prices.prototype.browserLists = async function () {
	try{
		const getTopList = await API.coinconvert.list() as any;
		this.list.crypto = Object.keys(getTopList.crypto);
		this.list.fiat = getTopList.fiat;
		this.cryptoInfo = getTopList.crypto;

		if(typeof this.onCryptoListRefresh == "function" && this.isReady){
			this.onCryptoListRefresh(this.list.crypto);
		}
	}
	catch(err){
		console.error('Failed fetching currencies list from API', err);
	}

	return this;
}

Prices.prototype.runBrowser = async function () {

	if (typeof window !== "undefined" && window['__ccRunning']) {
		throw new Error(`The crypto-convert worker seems to be already running. 
			- There might be an issue with the way your app imports javascript dependencies. 
			- Make sure to call 'convert.stop()' on component unmounts if you are using SPA frameworks (e.g React).`
		);
	}

	//First run only
	if (!this.isReady) {
		await this.browserTicker();

		//Update lists
		await this.browserLists();

		if(!isBrowser && this.options.serverSideCCAPI && this.options.refreshCryptoList){
			this.lists_worker = setInterval(
				this.browserLists.bind(this),
				86400 //every day
			);
		}
	}

	this.crypto_worker = setInterval(
		this.browserTicker.bind(this),
		this.options.crypto_interval
	);

	this.isReady = true;

	if (typeof window !== "undefined") {
		window['__ccRunning'] = true;
		if (window['__ccRunID']) {
			clearInterval(window['__ccRunID']);
		}
		window['__ccRunID'] = this.crypto_worker;
	}

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

	if(this.options.refreshCryptoList){
		this.lists_worker = setInterval(
			this.updateLists.bind(this),
			86400 //every day
		);
	}
	
	return this;
}

Prices.prototype.run = function () {
	if(this.isRunning || this.crypto_worker){
		throw new Error("Crypto-convert is already running.");
	}

	this.isRunning = true;

	if (isBrowser || this.options.serverSideCCAPI) {
		return this.runBrowser();
	}

	return this.runServer();
}

Prices.prototype.stop = function () {
	clearInterval(this.crypto_worker);
	clearInterval(this.fiat_worker);
	this.crypto_worker = 0;
	this.fiat_worker = 0;

	if(this.lists_worker){
		clearInterval(this.lists_worker);
		this.lists_worker = 0;
	}

	this.isRunning = false;

	if (typeof window !== "undefined") {
		window['__ccRunning'] = false;
	}

	return this;
}

Prices.prototype.restart = function () {
	return this.stop().run();
}

const PricesWorker: PricesClass = new Prices();
export const WorkerReady = PricesWorker.run();

export default PricesWorker;

