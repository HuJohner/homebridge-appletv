import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig, Service, Characteristic, APIEvent } from 'homebridge';

import { PLATFORM_NAME, PLUGIN_NAME } from './settings';
import { AppleTVAccessory } from './platformAccessory';

/**
 * AppleTVPlatform
 */
export class AppleTVPlatform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;

  public readonly accessories: PlatformAccessory[] = [];

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    this.log.debug('Finished initializing platform: AppleTV');

    this.api.on(APIEvent.DID_FINISH_LAUNCHING, () => {
      log.debug('Executed didFinishLaunching callback');

      this.discoverDevices();
    });
  }

  configureAccessory(accessory: PlatformAccessory) {
    this.log.info('Loading accessory from cache:', accessory.displayName);

    this.accessories.push(accessory);
  }

  discoverDevices() {
    for (const device of this.config.devices) {
      this.setupAccessory(device);
    }
  }


  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setupAccessory(device: any) {
    const uuid = this.api.hap.uuid.generate(device.name);

    const existingAccessory = this.accessories.find(accessory => accessory.UUID === uuid);

    if (existingAccessory) {
      this.log.info('Restoring existing accessory from cache:', existingAccessory.displayName);

      existingAccessory.context.device = device;

      new AppleTVAccessory(this, existingAccessory);
    } else {
      this.log.info('Adding new accessory:', device.name);

      const accessory = new this.api.platformAccessory(device.name, uuid);
      accessory.context.device = device;
      this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);

      new AppleTVAccessory(this, accessory);
    }
  }
}
