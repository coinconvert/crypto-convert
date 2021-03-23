const path = require('path');

module.exports = [
	{
		target: "web",
		mode: "production",
		entry: "./src/index.js",
		output: {
			path: path.resolve(__dirname, "dist"),
			filename: "crypto-convert.min.js",
			library: { // There is also an old syntax for this available (click to show)
				type: "umd", // universal module definition
				// the type of the exported library
				name: "convert",
			},
			globalObject: 'this'
		},

		externals: {
			'node-fetch': 'fetch',
			'form-data': 'FormData',
			'fs': 'fs'
		},
		resolve: {
			extensions: [".js"],
		},
		node: {
			global: true,
		},
		
	},
	{
		target: "node",
		mode: "production",
		entry: "./src/index.js",
		output: {
			path: path.resolve(__dirname, "dist"),
			filename: "crypto-convert.node.min.js",
			library: { // There is also an old syntax for this available (click to show)
				type: "umd", // universal module definition
				// the type of the exported library
				name: "convert",
			},
			globalObject: 'this'
		},
		externals: {
			'node-fetch': 'node-fetch',
			'form-data': 'form-data'
		},
		resolve: {
			extensions: [".js"],
		},
	}
	
]