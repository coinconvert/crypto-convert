export function symbolMap(symbol: string, map: {
    /**
     * @example
     * 
     * {
     *  'USDT': 'USD' //Replace USDT with USD
     * }
     */
    [currentSymbol: string]: string
}){

    const mapKeys = Object.keys(map);

    for(var c=0; c < mapKeys.length; c++){
        if(
            symbol.length >= mapKeys[c].length + 3 && (
                symbol.endsWith(mapKeys[c]) || 
                symbol.startsWith(mapKeys[c])
            )
        ){
            return symbol.replace(mapKeys[c], map[mapKeys[c]]);
        }
    }

    return symbol;
}

export function getAverage(pairs: {
    [symbol: string]: number
}[]){
    if(!pairs.length){
        return {}
    };
    
    return Object.keys(pairs[0]).reduce((o, pair)=>{
        let values = pairs.map((e)=> e[pair]).filter(v => v),
            averageValue = values.reduce((sum, v)=> sum + v, 0) / values.length;

        o[pair] = averageValue;

        return o;
    }, {});
}

export function formatNumber(n: number | string, decimals?: number){
    
    if(typeof n != "number"){
        n = Number(n);
        if(isNaN(n)){
            return NaN;
        }
    }

    let s = typeof decimals == "number" ? (n.toFixed(decimals)): n + '';

	let clean = s.match(/\./) ? s.replace(/0+$/g, '').replace(/\.+$/g,'') : s;

    return parseFloat(clean);
}