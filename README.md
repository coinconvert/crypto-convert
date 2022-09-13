  
# Crypto-Convert

[![npm](https://img.shields.io/npm/v/crypto-convert)](https://www.npmjs.com/package/crypto-convert)
[![npm](https://img.shields.io/npm/dw/crypto-convert)](https://www.npmjs.com/package/crypto-convert)

Convert crypto to fiat and vice-versa instantly.

- Top 100 Cryptocurrencies Supported
- 20+ fiats Supported
- Instantly convert, no slow promises.
- Cross-compatible on Node.js & Browser
- Price & Ticker information updated on a configurable interval from multiple secure sources (Binance, Bitfinex, Coinbase)
- Any pair can be converted, be it Crypto -> Crypto or Fiat -> Crypto.


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

	await convert.ready(); //Cache is not yet loaded on first start
	
	convert.BTC.USD(1);
	convert.ETH.JPY(255);
	convert.LINK.LTC(5);
	convert.USD.CRO(100);

	//More readable syntax
	new convert.from("BTC").to("USD").amount(1);
})();
```

## Configuration

```javascript
convert.setOptions({
	crypto_interval: 5000, //Crypto prices update interval, default every 5 seconds
	fiat_interval: (60 * 1e3 * 60), //Fiat prices update interval, default every 1 hour
	calculateAverage: true, //Calculate the average crypto price from exchanges
	binance: true, //Use binance rates
	bitfinex: true, //Use bitfinex rates
	coinbase: true, //Use coinbase rates
	onUpdate: (tickers, isFiat?)=> any //Callback on every crypto update	
});

```

## CDN
```html
<script src='https://coinconvert.net/assets/js/crypto-convert.min.js'></script>
```

## API
Free public API

`https://api.coinconvert.net/convert/btc/usd?amount=1`

