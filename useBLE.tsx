/* eslint-disable no-bitwise */
import {useState} from 'react';
import {PermissionsAndroid, Platform} from 'react-native';
import {
  BleError,
  BleManager,
  Characteristic,
  Device,
} from 'react-native-ble-plx';
import {PERMISSIONS, requestMultiple} from 'react-native-permissions';
import DeviceInfo from 'react-native-device-info';

import {atob, btoa} from 'react-native-quick-base64';

const POKEMON_SERVICE_UUID = 'D78A31FE-E14F-4F6A-A107-790AB0D58F27';
const POKEMON_SERVICE_CHARACTERISTIC = 'EBE6204C-C1EE-4D09-97B8-F77F360F7372';

const bleManager = new BleManager();

type VoidCallback = (result: boolean) => void;

interface BluetoothLowEnergyApi {
  requestPermissions(cb: VoidCallback): Promise<void>;
  scanForPeripherals(): void;
  connectToDevice: (deviceId: Device) => Promise<void>;
  disconnectFromDevice: () => void;
  connectedDevice: Device | null;
  allDevices: Device[];
  yourParty: Pokemon[];
  billsPC: Pokemon[];

  exchangeError: BleError | null;
}

export interface Pokemon {
  opCode: BigInt;
  pokemonIndex: BigInt;
}

export enum POKEMON_STATE {
  TRAINER = 1,
  PC = 2,
}

const startingParty: Pokemon[] = [
  {
    opCode: BigInt(POKEMON_STATE.TRAINER),
    pokemonIndex: BigInt(151),
  },
  {
    opCode: BigInt(POKEMON_STATE.TRAINER),
    pokemonIndex: BigInt(150),
  },
  {
    opCode: BigInt(POKEMON_STATE.TRAINER),
    pokemonIndex: BigInt(149),
  },
  {
    opCode: BigInt(POKEMON_STATE.TRAINER),
    pokemonIndex: BigInt(145),
  },
  {
    opCode: BigInt(POKEMON_STATE.TRAINER),
    pokemonIndex: BigInt(143),
  },
  {
    opCode: BigInt(POKEMON_STATE.TRAINER),
    pokemonIndex: BigInt(130),
  },
];

function useBLE(): BluetoothLowEnergyApi {
  const [allDevices, setAllDevices] = useState<Device[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [yourParty, setYourParty] = useState<Pokemon[]>(startingParty);
  const [billsPC, setBillsPc] = useState<Pokemon[]>([]);
  const [exchangeError, setExchangeError] = useState<BleError | null>(null);

  const requestPermissions = async (cb: VoidCallback) => {
    if (Platform.OS === 'android') {
      const apiLevel = await DeviceInfo.getApiLevel();

      if (apiLevel < 31) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'Bluetooth Low Energy requires Location',
            buttonNeutral: 'Ask Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        cb(granted === PermissionsAndroid.RESULTS.GRANTED);
      } else {
        const result = await requestMultiple([
          PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
          PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
          PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        ]);

        const isGranted =
          result['android.permission.BLUETOOTH_CONNECT'] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          result['android.permission.BLUETOOTH_SCAN'] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          result['android.permission.ACCESS_FINE_LOCATION'] ===
            PermissionsAndroid.RESULTS.GRANTED;

        cb(isGranted);
      }
    } else {
      cb(true);
    }
  };

  const isDuplicateDevice = (devices: Device[], nextDevice: Device) =>
    devices.findIndex(device => nextDevice.localName === device.localName) > -1;

  const scanForPeripherals = () =>
    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.log(error);
      }
      if (
        device &&
        (device.name?.includes("Bill's PC") ||
          device.localName?.includes("Bill's PC"))
      ) {
        setAllDevices((prevState: Device[]) => {
          if (!isDuplicateDevice(prevState, device)) {
            return [...prevState, device];
          }
          return prevState;
        });
      }
    });

  const connectToDevice = async (device: Device) => {
    try {
      const deviceConnection = await bleManager.connectToDevice(device.id);
      setConnectedDevice(deviceConnection);
      await deviceConnection.discoverAllServicesAndCharacteristics();
      bleManager.stopDeviceScan();
      startStreamingData(deviceConnection);
    } catch (e) {
      console.log('FAILED TO CONNECT', e);
    }
  };

  const disconnectFromDevice = () => {
    if (connectedDevice) {
      bleManager.cancelDeviceConnection(connectedDevice.id);
      setConnectedDevice(null);
    }
  };

  const startStreamingData = async (device: Device) => {
    if (device) {
      device.monitorCharacteristicForService(
        POKEMON_SERVICE_UUID,
        POKEMON_SERVICE_CHARACTERISTIC,
        () => {},
      );
    } else {
      console.log('No Device Connected');
    }
  };

  // Tutorial Methods Start ====

  return {
    scanForPeripherals,
    requestPermissions,
    connectToDevice,
    allDevices,
    connectedDevice,
    disconnectFromDevice,
    billsPC,
    yourParty,
    exchangeError,
  };
}

export default useBLE;
