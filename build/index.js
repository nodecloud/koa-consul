'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

let getProcessInfo = (() => {
    var _ref2 = _asyncToGenerator(function* () {
        let state = {};
        try {
            state = yield getCpuMemoryPercent();
        } catch (ignore) {}

        return {
            uptime: _process2.default.uptime(),
            cpuUsage: _process2.default.cpuUsage(),
            memoryUsage: _process2.default.memoryUsage(),
            percent: state
        };
    });

    return function getProcessInfo() {
        return _ref2.apply(this, arguments);
    };
})();

exports.default = function (options) {
    options = options || {};

    const url = options.url || '/health';
    const strategy = options.strategy;

    if (strategy && typeof strategy !== 'function') {
        throw new Error('The parameter of strategy must be a function.');
    }

    return (() => {
        var _ref = _asyncToGenerator(function* (ctx, next) {
            if (url === ctx.url && _process2.default.env.NODE_ENV === 'development') {
                const monitorData = {
                    os: getOsInfo(),
                    process: yield getProcessInfo(),
                    heap: getHeapSpace()
                };
                monitorData.status = checkHealth(monitorData, strategy) ? 'ok' : 'warn';

                ctx.status = monitorData.status === 'ok' ? 200 : 429;
                ctx.body = monitorData;
            } else if (url === ctx.url && _process2.default.env.NODE_ENV === 'production') {
                if (strategy) {
                    const monitorData = {
                        os: getOsInfo(),
                        process: yield getProcessInfo(),
                        heap: getHeapSpace()
                    };
                    monitorData.status = checkHealth(monitorData, strategy) ? 'ok' : 'warn';

                    ctx.status = monitorData.status === 'ok' ? 200 : 429;
                    ctx.body = { status: monitorData.status };
                } else {
                    return { status: 'ok' };
                }
            } else if (`${url}/detail` === ctx.url) {
                const monitorData = {
                    os: getOsInfo(),
                    process: yield getProcessInfo(),
                    heap: getHeapSpace()
                };
                monitorData.status = checkHealth(monitorData, strategy) ? 'ok' : 'warn';

                ctx.status = monitorData.status === 'ok' ? 200 : 429;
                ctx.body = monitorData;
            }

            return next();
        });

        return function (_x, _x2) {
            return _ref.apply(this, arguments);
        };
    })();
};

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _v = require('v8');

var _v2 = _interopRequireDefault(_v);

var _process = require('process');

var _process2 = _interopRequireDefault(_process);

var _pidusage = require('pidusage');

var _pidusage2 = _interopRequireDefault(_pidusage);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

;

function checkHealth(monitorData, strategy) {
    if (!strategy) {
        return true;
    }

    return strategy(monitorData);
}

function getOsInfo() {
    return {
        hostname: _os2.default.hostname(),
        platform: _os2.default.platform(),
        uptime: _os2.default.uptime(),
        arch: _os2.default.arch(),
        cpus: _os2.default.cpus(),
        avg: _os2.default.loadavg(),
        memory: {
            free: _os2.default.freemem(),
            total: _os2.default.totalmem()
        }
    };
}

function getHeapSpace() {
    return _v2.default.getHeapSpaceStatistics();
}

function getCpuMemoryPercent() {
    return new Promise((resolve, reject) => {
        _pidusage2.default.stat(_process2.default.pid, function (err, stat) {
            if (err) {
                return reject(err);
            }

            resolve(stat);
        });
    });
}