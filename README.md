
<p align="center">

<img src="https://github.com/homebridge/branding/raw/master/logos/homebridge-wordmark-logo-vertical.png" width="150">

</p>


# Homebridge Apple TV

This is a Homebridge plugin that exposes Apple TVs to HomeKit, noteably the power state as a switch and optionally the device state (playing, paused, etc.) as motion sensors.

## Installation

To make this plugin work you need to install [PyATV](https://pypi.org/project/pyatv/). To ensure you did it right run
```
atvremote --version
```

## Configuration
Configuration can be done using [Homebridge Config UI X](https://github.com/oznu/homebridge-config-ui-x).

## Sample Configuration

```yaml
{
    "platform": "AppleTV",
    "devices": [
        {
            "name": "Living Room",
            "host": "192.168.0.36",
            "credentials": "...",
            "device_state_sensors": [
                "idle",
                "paused",
                "playing"
            ],
            "app_sensors": [
                "Netflix",
                "Disney+"
            ],
            "generic_sensors": [
                {
                    "property": "mediaType",
                    "values": [
                        "music",
                        "tv",
                        "video",
                        "unknown"
                    ]
                },
                {
                    "property": "genre",
                    "values": [
                        "Pop"
                    ]
                }
            ]
        }
    ]
}
```
### Configuration Definition

* **platform**: The identifier for the platform (*AppleTv*).
* **devices**: A list of devices you would like to register with the platform.     
  * **name**: The name of the Apple TV.    
  * **host**: The IP of the device.
  * **credentials**: The credentials needed to authorise connection to the device.
  * **device_state_sensors** [*optional*]: Enables a "motion sensor" for detecting device states. Possible values: "idle", "loading", "paused", "playing", "seeking", "stopped"
  * **app_sensors** [*optional*]: Enables a "motion sensor" for detecting current appin use.
  * **generic_sensors** [*optional*]: Enables a "motion sensor" for detecting generic states.

## Retrieving credentials

In order to retrieve credentials for your Apple TV, please follow these step

1. Execute the following command to scan for Apple TVs:

```
atvremote scan
```
2. Choose the device with which you would like to pair and run the following command:

```
atvremote -s {YOUR-APPLE-ID-IP-ADDRESS} --protocol companion pair
```
3. Enter the PIN shown on your device.