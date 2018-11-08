# switch-api

Simple http server that triggers system commands on predefined URLs

- used in conjunction with <https://home-assistant.io/components/switch.rest/>
- <http://pm2.keymetrics.io> for automatic startup

[![Known Vulnerabilities](https://snyk.io/test/github/ycardon/switch-api/badge.svg)](https://snyk.io/test/github/ycardon/switch-api)

## usage and integration inside home-assistant

### control macbook display (on macOS Mojave)

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
      - isOnBattery
      - isCharged
      - chargingStatus
      - chargePercent
      - remainingChargeTime
      - message
    value_template: '{{ value_json.chargePercent }}'
    unit_of_measurement: '%'
```

### get cpu average for last 5mn

- `GET /cpu`

```yaml
sensor:
  - platform: rest
    name: Macbook CPU
    resource: 'http://mymac:8182/cpu'
    value_template: '{{ value | round(1) }}'
    unit_of_measurement: '%'
```

## useful commands

- sleep display: `pmset displaysleepnow`
- wake display: `caffeinate -u -t 1`
- test state : `pmset -g powerstate IODisplayWrangler | tail -1 | cut -c29` result <4 are sleeping
- battery power status : `pmset -g batt` (and a painful parsing)
