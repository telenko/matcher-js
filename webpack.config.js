module.exports = env => {
    const isDev = env === 'dev';
    return {
        mode: isDev ? "development" : "production",
        entry: "./src/index.js",
        devtool: "sourcemap",
        output: {
            path: __dirname + "/dist",
            filename: `matcherjs${isDev ? '' : '.min'}.js`
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
};
