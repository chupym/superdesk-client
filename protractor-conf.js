'use strict';

var ScreenShotReporter = require('protractor-screenshot-reporter');

exports.config = {
    baseUrl: 'http://localhost:9090/',

    specs: [
        'spec/setup.js',
        'spec/matchers.js',
        'spec/**/*[Ss]pec.js'
    ],

    capabilities: {
        browserName: 'chrome'
    },

    framework: 'jasmine',

    jasmineNodeOpts: {
        showColors: true,
        isVerbose: false,
        includeStackTrace: false,
        defaultTimeoutInterval: 30000
    },

    /* global jasmine */
    onPrepare: function() {
        jasmine.getEnv().addReporter(new ScreenShotReporter({
            baseDirectory: './screenshots',
            pathBuilder: function pathBuilder(spec, descriptions, results, capabilities) {
                return results.passed() + '_' + descriptions.reverse().join('-');
            },
            takeScreenShotsOnlyForFailedSpecs: true
        }));
    }
};
