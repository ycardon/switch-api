// Simple http server that triggers system commands on predefined URLs
// Yann CARDON - https://github.com/ycardon/switch-api 
// 2017.05 - display switch
// 2018.11 - power and cpu sensor

const http = require('http')
const url  = require('url')
const body = require('body')
const exec = require('child_process').exec
const os = require('os')

// parse the output of the 'pmset -g batt' command
function parsePowerStatus(out) {
    return {
        isOnBattery: (/'(.*) Power'/.exec(out)[1] == 'Battery') ? true : false,
        isCharged: (/; (.*);/.exec(out)[1] == 'charged') ? true : false,
        chargingStatus: /; (.*);/.exec(out)[1],
        chargePercent: parseInt(/\t(.*)%/.exec(out)[1]),
        remainingChargeTime: /;.*; ((.*) remaining|(\(no estimate\)))/.exec(out)[2] || null,
        message: out
    }
}

// start http server listening on 8182
http.createServer( (req, res)=>{
    switch (url.parse(req.url).pathname) {
            
        // macbook display
        case '/display':

            // switch on or off
            if (req.method == 'POST') body(req, (_, body)=>{
                console.log(new Date() + ' - POST /display ' + body)
                body == 'ON' ? exec('caffeinate -u -t 1') : exec('pmset displaysleepnow')
                res.end()
            })

            // get current state
            else {
                console.log(new Date() + ' - GET /display')
                exec('pmset -g powerstate IODisplayWrangler | tail -1 | cut -c29', (_, out, __)=>{
                    res.write(parseInt(out) < 4 ? 'OFF' : 'ON')
                    res.end()
                })
            }
            break

        // power status
        case '/power':
            if (req.method == 'GET') {
                console.log(new Date() + ' - GET /power')
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
            console.log(new Date() + ' - GET /cpu')
            req.method == 'GET' ? res.write(os.loadavg()[1].toString()) : res.statusCode = 405
            res.end()
            break

        // all other routes
        default:
            res.write('call /display /power or /cpu')
            res.end()
    }
}).listen(8182)
