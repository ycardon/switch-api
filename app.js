// Simple server that triggers system commands on predefined URLs
// Used in conjunction with https://home-assistant.io/components/switch.rest/
// To be demonized with http://pm2.keymetrics.io
//
// 2017.05.22 - Yann Cardon

const http = require('http')
const url = require('url')
const body = require('body')
const exec = require('child_process').exec

http.createServer( (req, res)=> {
    switch (url.parse(req.url).pathname) {
        
        // switch the macbook display on or off
        case '/display':
            if (req.method == 'POST') body(req, (_, body)=> {
                body == 'ON' ? exec('caffeinate -u -t 1') : exec('pmset displaysleepnow')
            })
            break

    }
    res.end()
}).listen(8182)
