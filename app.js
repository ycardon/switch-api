// Simple http server that triggers system commands on predefined URLs
// 2017.05 - Yann Cardon

const http = require('http')
const url  = require('url')
const body = require('body')
const exec = require('child_process').exec

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
                    res.write(JSON.stringify({
                        isOnBattery: (/'(.*) Power'/.exec(out)[1] == 'Battery') ? true : false,
                        isCharged: (/; (.*);/.exec(out)[1] == 'charged') ? true : false,
                        chargingStatus: /; (.*);/.exec(out)[1],
                        chargePercent: parseInt(/\t(.*)%/.exec(out)[1]),
                        remainingChargeTime: /;.*; ((.*) remaining|(\(no estimate\)))/.exec(out)[2] || null,
                        message: out
                    }))
                    res.setHeader('Content-Type', 'application/json');
                    res.end()
                })
            }
            else {
                res.statusCode = 405 // method not allowed
                res.end()
            }
            break

        // all other routes
        default:
            res.write('call /display or /power')
            res.end()
        }
}).listen(8182)
