// Simple http server that triggers system commands on predefined URLs
// Yann CARDON - https://github.com/ycardon/switch-api 
// 2017.05 - display switch
// 2018.11 - power and cpu sensor

const SWITCH_API_PORT = 8182

const http = require('http')
const url  = require('url')
const body = require('body')
const exec = require('child_process').exec
const os = require('os')
const querystring = require('querystring')

// parse the output of the 'pmset -g batt' command
function parsePowerStatus(out) {
    const powerRegex = /'(.*) Power'/.exec(out);
    const chargingStatusRegex = /; (.*);/.exec(out);
    const chargePercentRegex = /\t(.*)%/.exec(out);
    const remainingChargeTimeRegex = /;.*; ((.*) remaining|(\(no estimate\)))/.exec(out);

    return {
        isOnAC: (powerRegex && powerRegex[1] == 'AC') ? true : false,
        isOnBattery: (powerRegex && powerRegex[1] == 'Battery') ? true : false,
        isCharged: (chargingStatusRegex && chargingStatusRegex[1] == 'charged') ? true : false,
        chargingStatus: chargingStatusRegex ? chargingStatusRegex[1] : null,
        chargePercent: chargePercentRegex ? parseInt(chargePercentRegex[1]) : null,
        remainingChargeTime: remainingChargeTimeRegex ? remainingChargeTimeRegex[2] || null : null,
        message: out
    }
}

function mapQueryAvgToLoadAvgIndex(reqUrl) {
    const query = JSON.parse(JSON.stringify(querystring.parse(url.parse(reqUrl).query)));
       
    let avg = 1;
    if (query) {
        switch (query.avg) {
            case 1:
                avg = 0;
                break;
            case 15:
                avg = 2;
                break;
            case 5:
            default:
                avg = 1;
        }
    }

    return avg;
}

const isSettingVerbose = process.argv.includes('--verbose');

// start http server listening on 8182
const startMessage = 'switch-api server started on http://localhost:' + SWITCH_API_PORT
console.log(isSettingVerbose ? new Date() + ' - ' + startMessage : startMessage)

http.createServer( (req, res)=>{
    switch (url.parse(req.url).pathname) {
            
        // macbook display
        case '/display':

            // switch on or off
            if (req.method == 'POST') body(req, (_, body)=>{
                isSettingVerbose && console.log(new Date() + ' - POST /display ' + body)
                body == 'ON' ? exec('caffeinate -u -t 1') : exec('pmset displaysleepnow')
                res.end()
            })

            // get current state
            else {
                isSettingVerbose && console.log(new Date() + ' - GET /display')
                exec('pmset -g powerstate IODisplayWrangler | tail -1 | cut -c29', (_, out, __)=>{
                    res.write(parseInt(out) < 4 ? 'OFF' : 'ON')
                    res.end()
                })
            }
            break

        // power status
        case '/power':
            if (req.method == 'GET') {
                isSettingVerbose && console.log(new Date() + ' - GET /power')
                exec('pmset -g batt', (_, out, __)=>{
                    res.setHeader('Content-Type', 'application/json');
                    res.write(JSON.stringify(parsePowerStatus(out)))
                    res.end()
                })
            } else {
                res.statusCode = 405 // method not allowed
                res.end()
            }
            break

        // cpu
        case '/cpu':
            isSettingVerbose && console.log(new Date() + ' - GET /cpu')
            req.method == 'GET' ? res.write(os.loadavg()[mapQueryAvgToLoadAvgIndex(req.url)].toString()) : res.statusCode = 405
            res.end()
            break

        // all other routes
        default:
            res.write(
                '<a href="/display">/display</a><br>' +
                '<a href="/power">/power</a><br>' + 
                '<a href="/cpu">/cpu</a>'
            )
            res.end()
    }
}).listen(SWITCH_API_PORT)
