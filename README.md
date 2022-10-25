  
# Crypto-Convert

[![npm](https://img.shields.io/npm/v/crypto-convert)](https://www.npmjs.com/package/crypto-convert)
[![npm](https://img.shields.io/npm/dw/crypto-convert)](https://www.npmjs.com/package/crypto-convert)

Convert crypto to fiat and vice-versa instantly.

- Top 100+ Cryptocurrencies Supported
- 20+ fiats Supported
- Instantly convert, no slow promises.
- Cross-compatible on Node.js & Browser
- Price & Ticker information updated on a configurable interval from multiple secure sources (Binance, Bitfinex, Coinbase, Kraken)
- Any pair can be converted, be it Crypto -> Crypto or Fiat -> Crypto.

<a href='https://coinconvert.net' target='_blank'><img src='https://coinconvert.net/assets/img/general.jpg' width="450px"></a>

## HTTP API
Free public API

`https://api.coinconvert.net/convert/btc/usd?amount=1`


## Installation
`npm i crypto-convert`


### Import
```javascript
import CryptoConvert from 'crypto-convert';
```

Or with `require`, import it like this to get TypeScript:
```javascript
const CryptoConvert = require("crypto-convert").default;
```

## CDN For Browsers
```html
<script src='https://coinconvert.net/assets/js/crypto-convert.min.js'></script>
```

## Usage
```javascript
const convert = new CryptoConvert(/*options?*/);

(async function(){

	await convert.ready(); //Wait for the initial cache to load
	
	convert.BTC.USD(1);
	convert.ETH.JPY(255);
	convert.LINK.LTC(5);
	convert.USD.CRO(100.1256);

	//... convert any pair
	// prices are automatically updated on background

})();
```
`Note`: You should only initialize the CryptoConvert class once. It's recommend to make a seperate file for it.

## Configuration

Here are some of the options you can specify on initialization:

```javascript
new CryptoConvert({
	cryptoInterval: 5000, //Crypto prices update interval in ms (default 5 seconds on Node.js & 15 seconds on Browsers)
	fiatInterval: (60 * 1e3 * 60), //Fiat prices update interval (default every 1 hour)
	calculateAverage: true, //Calculate the average crypto price from exchanges
	binance: true, //Use binance rates
	bitfinex: true, //Use bitfinex rates
	coinbase: true, //Use coinbase rates
	kraken: true, //Use kraken rates
	onUpdate: (tickers, isFiatUpdate?)=> any //Callback on every crypto update
	HTTPAgent: null //HTTP Agent for server-side proxies (Node.js only)
});
```


## Other Parameters

Get crypto prices last updated timestamp (ms)
```javascript
console.log(convert.lastUpdated)
// Prints:
// 1664657163857
```


Get the list supported currencies
```javascript
console.log(convert.list);
// Prints:
// {
//		crypto: ['BTC','ETH', ... + 148 more],
//		fiats: ['USD', 'EUR', ... + 25 more]	
// }
```

Get cryptocurrencies metadata (title/symbol/logo/rank)
```javascript
console.log(convert.cryptoInfo);

// Prints:
// {
//		BTC: {
//		    "id": 1,
//		    "title": "Bitcoin",
//		    "symbol": "BTC",
//		    "logo": "[logo_url]",
//		    "rank": 1
//		}
//		ETH: {
//			...
//		}
//		... +148 more
// }
```

## Custom Plug-ins

In cases when you want to support a custom currency you can do so like this:

```javascript
convert.addCurrency(
	'ANYCURRENCY',  //Your custom currency symbol here
	'USD', //The quote fiat price. Must be a supported fiat currency.
	async ()=>{
		//...call your api here
		return price;
	}, 
	5000 //Update interval in ms
);
```

Adding custom plugins is useful for  supporting more fiats, precious metals, or anything that can be exchanged.

For removing custom currencies:

```javascript
convert.removeCurrency('ANYCURRENCY');
```