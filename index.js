var os = require('os');
var v8 = require('v8');

module.exports = function (options) {
    options = options || {};
    options.getInfo = options.getInfo || function () {
        };

    var url = options.url || '/health';

    return function (ctx, next) {
        if (url === ctx.url) {
            var response = options.getInfo() || {
                    hostname: os.hostname(),
                    platform: os.platform(),
                    uptime: os.uptime(),
                    arch: os.arch(),
                    cpus: os.cpus(),
                    memory: {
                        free: os.freemem(),
                        total: os.totalmem()
                    },
                    heapSpace: v8.getHeapSpaceStatistics()
                };

            return ctx.body = response;
        }

        return next();
    }
};