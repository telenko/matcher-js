module.exports = config => {
    config.set({
        frameworks: ['mocha', 'chai', 'sinon'],
        files: ['test/**/*.js'],
        reporters: ['progress'],
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        browsers: ['ChromeHeadless'],
        autoWatch: false,
        concurrency: Infinity,
        preprocessors: {
            'test/**/*.js': [ 'webpack' ],
            'src/**/*.js': [ 'webpack' ]
        }
    });
}