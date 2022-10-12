  
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

<a href='https://oh.gold' target='_blank'><img src='https://oh.gold/assets/img/general.jpg' width="450px"></a>


## Installation
`npm i crypto-convert`

### Import
```javascript
import convert from 'crypto-convert';
```

Or with `require`, import it like this to get TypeScript:
```javascript
const convert = require("crypto-convert").default;
```

## Usage
```javascript
(async function(){

	await convert.ready(); //Cache is not yet loaded on first run
	
	convert.BTC.USD(1);
	convert.ETH.JPY(255);
	convert.LINK.LTC(5);
	convert.USD.CRO(100.1256);

})();
```

## Configuration

```javascript
convert.setOptions({
	crypto_interval: 5000, //Crypto prices update interval in ms , (default: 5 seconds on Node.js/15 seconds on Browsers)
	fiat_interval: (60 * 1e3 * 60), //Fiat prices update interval, default every 1 hour (only on Node.js)
	calculateAverage: true, //Calculate the average crypto price from exchanges
	binance: true, //Use binance rates
	bitfinex: true, //Use bitfinex rates
	coinbase: true, //Use coinbase rates
	kraken: true, //Use kraken rates
	onUpdate: (tickers, isFiatUpdate?)=> any //Callback on every crypto update	
});

```
## HTTP API
Free public API

`https://api.coinconvert.net/convert/btc/usd?amount=1`

## CDN
```html
<script src='https://coinconvert.net/assets/js/crypto-convert.min.js'></script>
```

## Other parameters

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





