/*!
 * Made with Rests
 * github.com/el1s7/rests
 */

type json = 
 			| string
 			| number
 			| boolean
 			| null
 			| json[]
 			| {[key: string]: json};
	
interface FormData {
	[Symbol.iterator](): IterableIterator<[string, File | string]>;
	/** Returns an array of key, value pairs for every entry in the list. */
	entries(): IterableIterator<[string, File | string]>;
	/** Returns a list of keys in the list. */
	keys(): IterableIterator<string>;
	/** Returns a list of values in the list. */
	values(): IterableIterator<File | string>;
}

interface ResponseObject {
	statusCode: number,
	statusText: string,
	headers: Headers,
	type: "basic" | "cors" | "default" | "error" | "opaque" | "opaqueredirect" ,
	ok: boolean,
	json?: any,
	text?: string,
	formData?: FormData,
	blob?: Blob,
	message?: string
}

type HookRequest = {
	/**
	 * Fetch URL
	 */
	url: string, 

	/**
	 * Fetch Options
	 */
	options: any,
	
	/**
	 * The parameters supplied for this request
	 */
	 params: any

	/**
	 * Rests instance
	 */
	instance: any

	/**
	 * Endpoint Key, e.g "user.login"
	 */
	key: string
};

interface Hooks {
	/**
	 * A global hook function that is called on request.
	 * 
	 */
	on_request?: (request: HookRequest) => any,

	/**
	 * A hook function that is called on successful response, you can also modify and return a different response.
	 */
	 on_success?: (response: ResponseObject, request?: HookRequest) => any,
	
	/**
	 * A hook function that is called on errors.
	 * 
	 * 
	 * To return a different error:
	 */
	
	on_error?: (error: ResponseObject | unknown, request?: HookRequest) => any,
}

interface Params {
	[name: string]:{
		/** The parameter HTTP name */
		name?: string,
		
		/** Required or not */
		required?: boolean,

		/** A help message to throw in case of errors */
		help?: string,

		/** Param type (default: any)*/
		type?: "string" | "number" | "array" | "object" | "boolean" | "any",

		/** Example value */
		example?: any,

		/** Format functions that accepts supplied value and returns formatted value. */
		format?: (value: any)=>any,

		/** Regex validation */
		validate?: RegExp | string,

		/** Array validation */
		in?: any[],

		max?: number,

		min?: number,

		/** Default value */
		default?: any,

		/** HTTP Location */
		location?: "body" | "headers" | "query" | "path",

	}
}

interface Options extends Hooks {
	base?: string,

	sandboxBase?: string,

	headers?: any,

	params?: Params,
	
	/**
	 * Set default values for parameters
	 */
	 values?: {
		[param_name: string]: any
	}

	/**
	 * Node-Fetch option for adding a proxy
	 */
	fetch_agent?: any, 
}

interface newCategoryOptions {
	/**
	 * Override global options for this category
	 */
	$options: Options;
}

interface newCategoryWithOptions extends newCategoryOptions {
	[param: string]: any | Options;
}

type newCategoryValues = {
	[param: string]: any
} | newCategoryWithOptions;



declare class HideFuncProps<T>{
	private name;
	private apply;
	private bind;
	private arguments;
	private call;
	private caller;
	private length;
	private prototype;
	private toString;
	//public set: (values: newCategoryValues) => T;
}


interface updateOptions<X> extends HideFuncProps<X>{
	set: (values: newCategoryValues) => X
}

interface newCategory<T> extends HideFuncProps<T> {
	new(values: newCategoryValues): T & updateOptions<T>;
}

export interface APIBinance extends newCategory<APIBinance> {

	/**
	 * BookTicker - GET request 
	 */
	bookTicker: () => Promise<ResponseObject>;


	/**
	 * Ticker - GET request 
	 */
	ticker: () => Promise<ResponseObject>;

}

export interface APIBitfinex extends newCategory<APIBitfinex> {

	/**
	 * Ticker - GET request 
	 */
	ticker: (params?: {
	/**
	 * The symbols you want information about as a comma separated list, or ALL for every symbol. (Examples of possible symbols: tBTCUSD, tETHUSD, fUSD, fBTC)	
	 * 
	 * @example
	 * 
	 * `"ALL"`
	 * 						 
	 */
	symbols?: string
	
} | FormData) => Promise<ResponseObject>;

}

export interface APICoinbase extends newCategory<APICoinbase> {

	/**
	 * Ticker - GET request 
	 */
	ticker: (params?: {
	/**
	 * The exchange currency (default USD) 
	 */
	currency?: any
	
} | FormData) => Promise<ResponseObject>;

}

export interface APIKraken extends newCategory<APIKraken> {

	/**
	 * Pairs - GET request 
	 */
	pairs: () => Promise<ResponseObject>;


	/**
	 * Ticker - GET request 
	 */
	ticker: () => Promise<ResponseObject>;

}

export interface APICoinmarketcap extends newCategory<APICoinmarketcap> {

	/**
	 * Top - GET request 
	 */
	top: (params?: {
	/**
	 * 	
	 * 
	 * @example
	 * 
	 * `"150"`
	 * 						 
	 */
	limit?: any
	

	/**
	 * 	
	 * 
	 * @example
	 * 
	 * `"active"`
	 * 						 
	 */
	listing_status?: any
	
} | FormData) => Promise<ResponseObject>;

}

export interface APIFiat extends newCategory<APIFiat> {

	/**
	 * All - GET request 
	 */
	all: () => Promise<ResponseObject>;

}

export interface APICoinconvert extends newCategory<APICoinconvert> {

	/**
	 * Ticker - GET request 
	 */
	ticker: (params?: {
	/**
	 * 	
	 * 
	 * @example
	 * 
	 * `"{version}"`
	 * 						 
	 */
	v?: any
	

	/**
	 *  
	 */
	filterExchanges?: any[]
	

	/**
	 *  
	 */
	noAverage?: boolean
	
} | FormData) => Promise<ResponseObject>;


	/**
	 * List - GET request 
	 */
	list: () => Promise<ResponseObject>;

}

export interface API extends updateOptions<API> {
	/**
	 * Binance Endpoints Category 
	 */
	binance: APIBinance

	/**
	 * Bitfinex Endpoints Category 
	 */
	bitfinex: APIBitfinex

	/**
	 * Coinbase Endpoints Category 
	 */
	coinbase: APICoinbase

	/**
	 * Kraken Endpoints Category 
	 */
	kraken: APIKraken

	/**
	 * Coinmarketcap Endpoints Category 
	 */
	coinmarketcap: APICoinmarketcap

	/**
	 * Fiat Endpoints Category 
	 */
	fiat: APIFiat

	/**
	 * Coinconvert Endpoints Category 
	 */
	coinconvert: APICoinconvert

}

declare const API: API;

export default API;
	