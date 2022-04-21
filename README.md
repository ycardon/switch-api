# switch-api

Simple http server that triggers system commands on predefined URLs
- written in Node.js with minimum dependencies
- support Apple intel platform only, for Apple ARM64 please check the [switch-api-rs](https://github.com/ycardon/switch-api-rs) project 
- used in conjunction with <https://home-assistant.io/components/switch.rest/>
- <http://pm2.keymetrics.io> for automatic startup

[![Known Vulnerabilities](https://snyk.io/test/github/ycardon/switch-api/badge.svg)](https://snyk.io/test/github/ycardon/switch-api)

## usage and integration inside home-assistant

### control mac display (on macOS Mojave)

- `GET /display` : get current screen state (sleeping or not)
- `POST /display body=ON|OFF` : switch screeen state

```yaml
switch:
  - platform: rest
    name: Macbook Display
    resource: 'http://mymac:8182/display'
```

### get battery power status (on macOS Mojave)

- `GET /power`

```yaml
sensor:
  - platform: rest
    name: Macbook battery
    resource: 'http://mymac:8182/power'
    json_attributes:
      - isOnAC
      - isOnBattery
      - isCharged
      - chargingStatus
      - chargePercent
      - remainingChargeTime
      - message
    value_template: '{{ value_json.chargePercent }}'
    unit_of_measurement: '%'
```

### get cpu average, defaults to last 5mn

- `GET /cpu`
  - `/cpu?avg=1` **last mn**
  - `/cpu?avg=5` **last 5mn**
  - `/cpu?avg=15` **last 15mn**

```yaml
sensor:
  - platform: rest
    name: Macbook CPU
    resource: 'http://mymac:8182/cpu'
    value_template: '{{ value | round(1) }}'
    unit_of_measurement: '%'
```

## run in verbose mode

`node app.js --verbose`
```console
Sat Dec 21 2019 09:01:49 GMT-0600 (Central Standard Time) - switch-api server started on http://localhost:8182
Sat Dec 21 2019 09:02:03 GMT-0600 (Central Standard Time) - GET /cpu
Sat Dec 21 2019 09:02:17 GMT-0600 (Central Standard Time) - GET /display
```

## useful commands

- sleep display: `pmset displaysleepnow`
- wake display: `caffeinate -u -t 1`
- test state : `pmset -g powerstate IODisplayWrangler | tail -1 | cut -c29` result <4 are sleeping
- battery power status : `pmset -g batt` (and a painful parsing)
