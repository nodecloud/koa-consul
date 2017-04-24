var os = require('os');

module.exports = function (options) {
    options = options || {};

    var url = options.url || '/health';
    var response = options.response || {
            hostname: os.hostname(),
            platform: os.platform(),
            uptime: os.uptime(),
            arch: os.arch(),
            cpus: os.cpus(),
            memory: {
                free: os.freemem(),
                total: os.totalmem()
            }
        };

    return function (ctx, next) {
        if (url === ctx.url) {
            return ctx.body = response;
        }

        return next();
    }
};