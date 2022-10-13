import PricesWorker from './worker';

class CustomCurrency{

	public ticker: {
		[pair: string]: number
	} = {};

	public list: string[] = [];

	private workers: {
		[pair: string]: NodeJS.Timer
	} = {}; 

	private workersPromises: any[] = [];

	constructor(
	) {
		//nothing
	}

	async ready(){
		return Promise.all(this.workersPromises);
	}

	async addCurrency(
		base:  string,
		quote: keyof typeof PricesWorker.data.fiat.current,
		getter: ()=>number | Promise<number>,
		interval?: number,
	) {
		
		if(typeof base !== "string" || typeof quote !== "string" || !PricesWorker.list.fiat.includes(quote)){
			throw new Error("Invalid currency pair.");
		}
		
		if(typeof getter !== "function"){
			throw new Error("No function specified.");
		}
		
		base = base.toUpperCase(),
		quote = quote.toUpperCase() as any;
		
		if(this.ticker[base+quote] || this.ticker[quote+base] || this.list.indexOf(base) != -1){
			console.warn(`This custom currency already exists, it will be overriden.`);
			this.removeCurrency(base);
		}

		this.list.push(base);

		if(interval){
			if(typeof interval !== "number"){
				throw new Error("Invalid interval specfied.");
			}
			this.workers[base+quote] = setInterval(()=>{
				return Promise.resolve(getter())
					.then((value)=>{
						this.ticker[base+quote] = Number(value);
					})
			}, interval);
		}
	
		const currentPromise = Promise.resolve(getter())
			.then((value)=>{
				this.ticker[base+quote] = Number(value);
			});

		this.workersPromises.push(currentPromise);

		return currentPromise;
	}

	removeCurrency(base: string, quote?: string){
		
		base = base.toUpperCase(),
		quote = quote ? quote.toUpperCase() : '';

		for(const worker in this.workers){
			if(worker.includes(base+quote)){
				clearInterval(this.workers[worker]);
				delete this.ticker[worker];
			}
		}
		
		this.list = this.list.filter((v)=> v !== base);
	}


}

export default CustomCurrency;

