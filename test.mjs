
import assert from 'assert';
import convert from './dist/index.js';
import {formatNumber} from './dist/helpers.js';

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
	
});