  
# Crypto-Convert
[![license](https://img.shields.io/github/license/elis-k/crypto-convert)](https://github.com/elis-k/crypto-convert/blob/master/LICENSE)
[![npm](https://img.shields.io/npm/v/crypto-convert)](https://www.npmjs.com/package/crypto-convert)
[![npm](https://img.shields.io/npm/dw/crypto-convert)](https://www.npmjs.com/package/crypto-convert)

Instantly convert cryptocurrency and get price information. 

- Top 100 Crypto Currencies Supported
- Top  30 Fiats Supported
- Price & Ticker information updated on a configurable interval from multiple secure sources (Binance, Bitfinex, OKEx)
- Any pair can be converted, be it Crypto -> Crypto or Fiat -> Crypto.
- Instant convert, no slow promises.

## Installation
`npm i crypto-convert`


## Usage
```javascript
const convert = require("crypto-convert");

(async function(){

	//Cache is not yet loaded on application start
	if(!convert.isReady){
		await convert.ready();
	}

	convert.BTC.USD(1);
	convert.ETH.JPY(255);
	convert.LINK.LTC(5);
	convert.USD.CRO(100);

	//More readable syntax
	new convert.from("BTC").to("USD").amount(1);
})();

```

## For Browsers
```html
<script type="text/javascript" src="https://coinconvert.net/assets/js/crypto-convert.min.js"></script>

<script>
	console.log(convert.BTC.USD(1));
</script>
``` 

## Configuration

```javascript
const convert = require("crypto-convert");

convert.set({
	crypto_interval: 5000, //Crypto cache update interval, default every 5 seconds
	fiat_interval: (60 * 1e3 * 60) //Fiat cache update interval, default every 1 hour
	binance: true, //Use binance rates
	bitfinex: true, //Use bitfinex rates
	okex: true, //Use okex rates
	onUpdate: (tickers)=> {}, //Call Hook on every crypto update	
});

```


## API

Free public API, up to 50 req/s.

`https://api.coinconvert.net/convert/btc/usd?amount=1`

