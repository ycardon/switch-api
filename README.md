# switch-api

Simple http server that triggers system commands on predefined URLs

- used in conjunction with https://home-assistant.io/components/switch.rest/
- http://pm2.keymetrics.io for automatic startup

[![Dependency Status](https://gemnasium.com/badges/github.com/ycardon/switch-api.svg)](https://gemnasium.com/github.com/ycardon/switch-api)
[![Known Vulnerabilities](https://snyk.io/test/github/ycardon/switch-api/badge.svg)](https://snyk.io/test/github/ycardon/switch-api)

## usage

Control macbook display (on macOS Sierra)

- GET /display : get current screen state (sleeping or not)
- POST /display body=ON|OFF : switch screeen state


