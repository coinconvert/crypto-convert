const path = require('path');

module.exports = [
	{
		target: "web",
		mode: "production",
		entry: "./src/index.ts",
		output: {
			path: path.resolve(__dirname, "cdn"),
			filename: "crypto-convert.min.js",
			library: { // There is also an old syntax for this available (click to show)
				type: "umd", // universal module definition
				// the type of the exported library
				name: "CryptoConvert",
			},
			globalObject: 'this'
		},

		externals: {
			'node-fetch': 'fetch',
			'form-data': 'FormData',
			'fs': 'fs'
		},
        module: {
            rules: [
              {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
              },
            ],
        },
		resolve: {
			extensions: [".js", ".ts"],
		},
		node: {
			global: true,
		},
}];