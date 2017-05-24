# switch-api

Simple http server that triggers system commands on predefined URLs

- used in conjunction with https://home-assistant.io/components/switch.rest/
- http://pm2.keymetrics.io for automatic startup

## usage

Control macbook display (on macOS Sierra)

- GET /display : get current screen state (sleeping or not)
- POST /display body=ON|OFF : switch screeen state


