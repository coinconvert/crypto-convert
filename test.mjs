
import assert from 'assert';
import Convert from './dist/index.js';
import {formatNumber} from './dist/helpers.js';

const convert = new Convert();

const exchanges = ['binance', 'bitfinex', 'coinbase', 'kraken'];
const onlyThisExchange = (exchange)=>{
    return exchanges.reduce((o,v)=>({
        ...o,
        [v]: exchange == v ? true : false
    }),{});
};

describe('Rests API Main', function () {
    
	it('Crypto to Fiat', async function () {
		await convert.ready();

        assert.strictEqual(typeof convert.BTC.USD(1), "number");
        assert.strictEqual(typeof convert.ETH.EUR(1), "number");
        assert.strictEqual(typeof convert.TRX.INR(1), "number");
        assert.strictEqual(typeof convert.LTC.JPY(1), "number");
	});

	it('Fiat to Crypto', async function () {
		await convert.ready();
        assert.strictEqual(typeof convert.USD.BTC(1), "number");
        assert.strictEqual(typeof convert.EUR.ETH(1), "number");
        assert.strictEqual(typeof convert.JPY.TRX(1), "number");
        assert.strictEqual(typeof convert.INR.LTC(1), "number");
	});

    it('Crypto to Crypto', async function () {
		await convert.ready();
        assert.strictEqual(typeof convert.LTC.BTC(1), "number");
        assert.strictEqual(typeof convert.BTC.LTC(1), "number");
        assert.strictEqual(typeof convert.DOGE.ETH(1), "number");
        assert.strictEqual(typeof convert.ETH.DOGE(1), "number");
	});

    it('Fiat to Fiat', async function () {
		await convert.ready();
        assert.equal(formatNumber(1 / convert.EUR.USD(1), 0), formatNumber(convert.USD.EUR(1), 0))
        assert.equal(formatNumber(1 / convert.JPY.INR(1), 0), formatNumber(convert.INR.JPY(1), 0))
	});

    it('Update options correctly', async function () {
		await convert.ready();
        let first = convert.BTC.USD(1);

        convert.setOptions({
            binance: false,
            bitfinex: false,
        });

        let second = convert.BTC.USD(1);

        assert.notEqual(first, second);

        convert.setOptions({
            binance: true,
            bitfinex: true,
        });

        let third = convert.BTC.USD(1);

        assert.equal(first, third);
	});

    it('Custom currencies', async function () {
        convert.addCurrency('TESTING', 'USD', async ()=>{
            return Math.floor((Math.random() * 1000))
         }, 5000);

        await convert.ready();

        assert.strictEqual(typeof convert.TESTING.USD(1), "number");
        assert.strictEqual(typeof convert.USD.TESTING(1), "number");
        assert.strictEqual(typeof convert.BTC.TESTING(1), "number");
        assert.strictEqual(typeof convert.TESTING.LTC(1), "number");
	});

    /**
     * We compare all exchange pairs to look for major differences that indicate that the pricing is not correct.
     */
    it('Prices are correct', async function () {
		await convert.ready();
        
        const allPricesCompare = {};

        for(const exchange of exchanges){

            const pairs = convert.ticker.crypto[exchange];
            
            for(const pair in pairs){
        
                allPricesCompare[pair] = allPricesCompare[pair] || {};
                allPricesCompare[pair][exchange] = pairs[pair];
            }
        }
        
        let differentPrices = 0;

        for(const pair in allPricesCompare){
            const prices = allPricesCompare[pair];
            
            let compare = [];

            let isBigDifference = false;
            
            for(const exchange in prices){
                const price = prices[exchange];

                if(!compare.length){
                    compare.push([
                        exchange, price, 0
                    ])
                    continue;
                }

                let currentDifference = Math.ceil((1 - (compare[0][1] / price)) * 100); 

                if(Math.abs(currentDifference) > 10){
                    isBigDifference = true;
                    differentPrices++;
                }

                compare.push([
                    exchange, price, currentDifference
                ]);
            }

            if(isBigDifference){
                console.warn(`[${pair}] A 10% difference was detected on this pair: `);
                for(const [exchange, price, difference] of compare){
                    console.info(`  ${exchange}: ${price} | ${difference > 0 ? '+' + difference: difference}%`);
                }
                console.info('\r\n');
            }
        }
        if(differentPrices){
            console.warn(`[!] ${differentPrices} prices are not matching.`);
        }

        assert.strictEqual(differentPrices < 20, true);
	});
	
});