import os from 'os';
import v8 from 'v8';
import process from 'process';
import pusage from 'pidusage';

export default function (options) {
    options = options || {};

    const url = options.url || '/health';
    const strategy = options.strategy;

    if (strategy && typeof strategy !== 'function') {
        throw new Error('The parameter of strategy must be a function.');
    }

    return async function (ctx, next) {
        if (url === ctx.url && process.env.NODE_ENV === 'development') {
            const monitorData = {
                os: getOsInfo(),
                process: await getProcessInfo(),
                heap: getHeapSpace()
            };
            monitorData.status = checkHealth(monitorData, strategy) ? 'ok' : 'warn';

            ctx.status = monitorData.status === 'ok' ? 200 : 429;
            ctx.body = monitorData;
        } else if (url === ctx.url && process.env.NODE_ENV === 'production') {
            if (strategy) {
                const monitorData = {
                    os: getOsInfo(),
                    process: await getProcessInfo(),
                    heap: getHeapSpace()
                };
                monitorData.status = checkHealth(monitorData, strategy) ? 'ok' : 'warn';

                ctx.status = monitorData.status === 'ok' ? 200 : 429;
                ctx.body = {status: monitorData.status};
            } else {
                ctx.body = {status: 'ok'};
            }
        } else if (`${url}/detail` === ctx.url) {
            const monitorData = {
                os: getOsInfo(),
                process: await getProcessInfo(),
                heap: getHeapSpace()
            };
            monitorData.status = checkHealth(monitorData, strategy) ? 'ok' : 'warn';

            ctx.status = monitorData.status === 'ok' ? 200 : 429;
            ctx.body = monitorData;
        }

        return next();
    }
};

function checkHealth(monitorData, strategy) {
    if (!strategy) {
        return true;
    }

    return strategy(monitorData);
}

function getOsInfo() {
    return {
        hostname: os.hostname(),
        platform: os.platform(),
        uptime: os.uptime(),
        arch: os.arch(),
        cpus: os.cpus(),
        avg: os.loadavg(),
        memory: {
            free: os.freemem(),
            total: os.totalmem()
        }
    }
}

async function getProcessInfo() {
    let state = {};
    try {
        state = await getCpuMemoryPercent();
    } catch (ignore) {
    }

    return {
        uptime: process.uptime(),
        cpuUsage: process.cpuUsage(),
        memoryUsage: process.memoryUsage(),
        percent: state
    }
}

function getHeapSpace() {
    return v8.getHeapSpaceStatistics();
}

function getCpuMemoryPercent() {
    return new Promise((resolve, reject) => {
        pusage.stat(process.pid, function (err, stat) {
            if (err) {
                return reject(err);
            }

            resolve(stat);
        })
    });
}
