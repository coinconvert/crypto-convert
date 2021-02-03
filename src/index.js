const PricesWorker = require('./worker');

function isEmpty(obj) { 
   for (var x in obj) { return false; }
   return true;
}


const coins = PricesWorker.list.crypto;

const fiats = PricesWorker.list.fiat;



function getPrice(coin,to='USD'){
	var result = PricesWorker.data.crypto[coin + to];
	if(!result){
		result = PricesWorker.data.crypto[to + coin] ? 1/PricesWorker.data.crypto[to + coin] : false; //reverse
	}
	return result;
}


var exchangeWrap = function(){
	var all_currencies = coins.concat(fiats);
	var exchange = {}
	
	var wrapper = function(coin,currency){
		var coin = coin;
		var toCurrency = currency;
		
		var doExchange = function(fromAmount){
			
			if(isEmpty(PricesWorker.data.crypto)){
				return false;
			}
		
			var fiatCurrencies = PricesWorker.data.fiat;

			//Same
			if(toCurrency == coin){
				return fromAmount;
			}
		
			//Crypto to Crypto
			if(coins.includes(coin) && coins.includes(toCurrency)){
				this.exchangePrice = getPrice(coin,toCurrency);
				if(!this.exchangePrice){
					this.exchangePrice = wrapper("USD", toCurrency)(wrapper(coin, "USD")(1));
				}
				return parseFloat(Number(this.exchangePrice * parseFloat(fromAmount)).toFixed(8));
			}
			
			//Fiat to Fiat
			if(fiatCurrencies[coin] && fiatCurrencies[toCurrency]){
				return parseFloat(Number((parseFloat(fromAmount) / fiatCurrencies[coin]) * fiatCurrencies[toCurrency]).toFixed(2));
			}
			
			
			//Crypto->Fiat || Crypto->BTC->Fiat
			var getCryptoPrice = function (fiat) {
				var fiatPrice = getPrice(fiat);
				if(!fiatPrice) {
					fiatPrice = wrapper("BTC","USD")(getPrice(fiat,"BTC")) || wrapper("ETH","USD")(getPrice(fiat,"ETH"))
				}
				return fiatPrice;
			}
			
			//Crypto to Fiat
			if(fiatCurrencies[toCurrency]){
				this.usdPrice = getCryptoPrice(coin);
				this.exchangePrice = (this.usdPrice / fiatCurrencies['USD']) * fiatCurrencies[toCurrency]; //Convert USD to choosen FIAT 10000 JPY
				return parseFloat(Number(this.exchangePrice * parseFloat(fromAmount)).toFixed(8));
			}

			//Fiat to Crypto
			if(fiatCurrencies[coin]){
				this.usdPrice = getCryptoPrice(toCurrency);
				this.exchangePrice = (this.usdPrice / fiatCurrencies['USD']) * fiatCurrencies[coin]; //Convert USD to choosen FIAT 10000 JPY
				return parseFloat(Number(parseFloat(fromAmount) / this.exchangePrice).toFixed(8));
			}

			return false;
			
		}
		return doExchange;
	}

	//Make Wrapper
	for(i=0; i < all_currencies.length; i++){
		var coin = all_currencies[i];
		for(a=0; a < all_currencies.length; a++){
			var currency = all_currencies[a];
			if (!exchange[coin]) {
				exchange[coin] = {};
			}
			exchange[coin][currency] = wrapper(coin,currency);
		}
	}

	//List
	exchange['list'] = {
		'crypto': coins,
		'fiat': fiats
	}

	//Ticker
	exchange['ticker'] = {
		get crypto() {
			return PricesWorker.data.crypto;
		},
		get fiat() {
			return PricesWorker.data.fiat;
		}
	}

	//More Readable Prototype
	exchange['from'] = function(coin){
		this.coin = coin.toUpperCase();
		return this;
	}
	exchange['from'].prototype.to = function(currency){
		this.currency = currency.toUpperCase();
		return this;
	}
	exchange['from'].prototype.amount = function(amount=1){
		if(!this.coin || !this.currency || !exchange[this.coin] || !exchange[this.currency]){
			return false;
		}
		return exchange[this.coin][this.currency](amount);
	}

	return exchange;
}();

module.exports = exchangeWrap;