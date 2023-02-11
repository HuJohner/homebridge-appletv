import pyatv, { NodePyATVDevice, NodePyATVDeviceEvent, NodePyATVDeviceState, NodePyATVPowerState } from '@sebbo2002/node-pyatv';
import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';

import { AppleTVPlatform } from './platform';

/**
 * AppleTV Accessory
 */
export class AppleTVAccessory {
  static IDLE_SERVICE = 'Idle Service';
  static LOADING_SERVICE = 'Loading Service';
  static PAUSED_SERVICE = 'Paused Service';
  static PLAYING_SERVICE = 'Playing Service';
  static SEEKING_SERVICE = 'Seeking Service';
  static STOPPED_SERVICE = 'Stopped Service';

  private atv: NodePyATVDevice;
  private accessoryInfoService: Service;
  private powerStateService: Service;
  private idleService: Service | undefined;
  private loadingService: Service | undefined;
  private pausedService: Service | undefined;
  private playingService: Service | undefined;
  private seekingService: Service | undefined;
  private stoppedService: Service | undefined;

  constructor(
    private readonly platform: AppleTVPlatform,
    private readonly accessory: PlatformAccessory,
  ) {
    this.atv = pyatv.device({
      name: this.accessory.context.device.name,
      host: this.accessory.context.device.host,
      airplayCredentials: this.accessory.context.device.credentials,
    });

    this.accessoryInfoService = this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Apple Inc.')
      .setCharacteristic(this.platform.Characteristic.Model, 'AppleTV')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, this.atv.id ?? 'Serial');

    this.powerStateService = this.accessory.getService(this.platform.Service.Switch)
      || this.accessory.addService(this.platform.Service.Switch);
    this.powerStateService.setCharacteristic(this.platform.Characteristic.Name, 'Power State');

    if (this.accessory.context.device.device_state_sensors?.includes('idle')) {
      this.idleService = this.accessory.getService(AppleTVAccessory.IDLE_SERVICE)
        || this.accessory.addService(this.platform.Service.MotionSensor, AppleTVAccessory.IDLE_SERVICE, 'idle');
      this.idleService.setCharacteristic(this.platform.Characteristic.Name, 'Idle');
    }
    if (this.accessory.context.device.device_state_sensors?.includes('loading')) {
      this.loadingService = this.accessory.getService(AppleTVAccessory.LOADING_SERVICE)
        || this.accessory.addService(this.platform.Service.MotionSensor, AppleTVAccessory.LOADING_SERVICE, 'loading');
      this.loadingService.setCharacteristic(this.platform.Characteristic.Name, 'Loading');
    }
    if (this.accessory.context.device.device_state_sensors?.includes('paused')) {
      this.pausedService = this.accessory.getService(AppleTVAccessory.PAUSED_SERVICE)
        || this.accessory.addService(this.platform.Service.MotionSensor, AppleTVAccessory.PAUSED_SERVICE, 'paused');
      this.pausedService.setCharacteristic(this.platform.Characteristic.Name, 'Paused');
    }
    if (this.accessory.context.device.device_state_sensors?.includes('playing')) {
      this.playingService = this.accessory.getService(AppleTVAccessory.PLAYING_SERVICE)
        || this.accessory.addService(this.platform.Service.MotionSensor, AppleTVAccessory.PLAYING_SERVICE, 'playing');
      this.playingService.setCharacteristic(this.platform.Characteristic.Name, 'Playing');
    }
    if (this.accessory.context.device.device_state_sensors?.includes('seeking')) {
      this.seekingService = this.accessory.getService(AppleTVAccessory.SEEKING_SERVICE)
        || this.accessory.addService(this.platform.Service.MotionSensor, AppleTVAccessory.SEEKING_SERVICE, 'seeking');
      this.seekingService.setCharacteristic(this.platform.Characteristic.Name, 'Seeking');
    }
    if (this.accessory.context.device.device_state_sensors?.includes('stopped')) {
      this.stoppedService = this.accessory.getService(AppleTVAccessory.STOPPED_SERVICE)
        || this.accessory.addService(this.platform.Service.MotionSensor, AppleTVAccessory.STOPPED_SERVICE, 'stopped');
      this.stoppedService.setCharacteristic(this.platform.Characteristic.Name, 'Stopped');
    }

    for (const service of this.accessory.services) {
      if (service === this.accessoryInfoService || service === this.powerStateService || service === this.idleService
        || service === this.loadingService || service === this.pausedService || service === this.playingService
        || service === this.seekingService || service === this.stoppedService) {
        continue;
      }
      this.platform.log.info('Removing unused service: ', service.name);
      this.accessory.removeService(service);
    }

    this.powerStateService.getCharacteristic(this.platform.Characteristic.On)
      .onSet(this.setOn.bind(this));
    this.atv.on('update:powerState', (event: NodePyATVDeviceEvent | Error) => {
      if (event instanceof Error) {
        return;
      }
      this.powerStateService.getCharacteristic(this.platform.Characteristic.On).updateValue(event.newValue === NodePyATVPowerState.on);
    });
    this.atv.on('update:deviceState', (event: NodePyATVDeviceEvent | Error) => {
      if (event instanceof Error) {
        return;
      }
      this.idleService?.setCharacteristic(this.platform.Characteristic.MotionDetected, event.newValue === NodePyATVDeviceState.idle);
      this.loadingService?.setCharacteristic(this.platform.Characteristic.MotionDetected, event.newValue === NodePyATVDeviceState.loading);
      this.pausedService?.setCharacteristic(this.platform.Characteristic.MotionDetected, event.newValue === NodePyATVDeviceState.paused);
      this.playingService?.setCharacteristic(this.platform.Characteristic.MotionDetected, event.newValue === NodePyATVDeviceState.playing);
      this.seekingService?.setCharacteristic(this.platform.Characteristic.MotionDetected, event.newValue === NodePyATVDeviceState.seeking);
      this.stoppedService?.setCharacteristic(this.platform.Characteristic.MotionDetected, event.newValue === NodePyATVDeviceState.stopped);
    });
  }

  /**
   * Handle "SET" requests from HomeKit
   */
  async setOn(value: CharacteristicValue) {
    value ? await this.atv.turnOn() : await this.atv.turnOff();

    this.platform.log.debug('Set Characteristic On ->', value);
  }

}
