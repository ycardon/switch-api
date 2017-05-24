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
                console.log('POST /display ' + body)
                body == 'ON' ? exec('caffeinate -u -t 1') : exec('pmset displaysleepnow')
                res.end()
            })

            // get current state
            else {
                console.log('GET /display')
                exec('pmset -g powerstate IODisplayWrangler | tail -1 | cut -c29', (_, out, __)=>{
                    res.write(out < 4 ? 'OFF' : 'ON')
                    res.end()
                })
            }
            break

        // all other routes
        default:
            res.write('call /display')
            res.end()
    }
}).listen(8182)
