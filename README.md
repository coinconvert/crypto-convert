  
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

## Usage

```javascript
const convert = require("crypto-convert");

convert.BTC.USD(1); 
convert.ETH.JPY(255);
convert.LINK.LTC(5);
convert.USD.CRO(100);

//More readable syntax
new convert.from("BTC").to("USD").amount(1);

```


## Installation
`npm i crypto-convert`
