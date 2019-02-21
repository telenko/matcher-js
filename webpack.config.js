module.exports = {
    mode: "production",
    entry: "./src/index.js",
    devtool: "sourcemap",
    output: {
        path: __dirname + "/dist",
        filename: "matcherjs.min.js"
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader'
            }
        ]
    }
};
