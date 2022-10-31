import React, {useState} from 'react';
import {
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Animated, {
  LightSpeedInLeft,
  LightSpeedOutRight,
} from 'react-native-reanimated';
import DeviceModal from './DeviceConnectionModal';
import useBLE, {POKEMON_STATE} from './useBLE';

const pokemonImages = {
  '151': {
    image: require('./img/151.png'),
    name: 'MEW',
  },
  '150': {
    image: require('./img/150.png'),
    name: 'MEWTWO',
  },
  '145': {
    image: require('./img/145.png'),
    name: 'ZAPDOS',
  },
  '149': {
    image: require('./img/149.png'),
    name: 'DRAGONITE',
  },
  '130': {
    image: require('./img/130.png'),
    name: 'GYRADOS',
  },
  '143': {
    image: require('./img/143.png'),
    name: 'SNORLAX',
  },
};

const App = () => {
  const {
    yourParty,
    connectedDevice,
    requestPermissions,
    scanForPeripherals,
    connectToDevice,
    allDevices,
    billsPC,
    exchangePokemon,
  } = useBLE();

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const hideModal = () => {
    setIsModalVisible(false);
  };

  const showModal = async () => {
    scanForDevices();
    setIsModalVisible(true);
  };

  const scanForDevices = () => {
    requestPermissions(isGranted => {
      if (isGranted) {
        scanForPeripherals();
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {connectedDevice ? (
        <>
          <Text style={styles.heartRateTitleText}>Your Party</Text>
          <View style={styles.yourParty}>
            {yourParty.map(item => {
              // @ts-ignore
              const image = pokemonImages[item.pokemonIndex.toString()].image;
              // @ts-ignore
              const name = pokemonImages[item.pokemonIndex.toString()].name;
              return (
                <Animated.View
                  style={styles.ctaButton}
                  key={item.pokemonIndex.toString()}
                  entering={LightSpeedInLeft.duration(1000)}
                  exiting={LightSpeedOutRight.duration(1000)}>
                  <Pressable
                    onPress={() => {
                      // exchangePokemon(
                      //   connectedDevice,
                      //   item.pokemonIndex,
                      //   POKEMON_STATE.PC,
                      // );
                    }}
                    style={styles.pokemonButtonRow}>
                    <Image
                      style={styles.pokemonAvatar}
                      resizeMode="contain"
                      source={image}
                    />
                    <Text
                      style={styles.ctaButtonText}
                      key={item.pokemonIndex.toString()}>
                      {name}
                    </Text>
                  </Pressable>
                </Animated.View>
              );
            })}
          </View>
          <Text style={styles.heartRateTitleText}>Bill's PC</Text>
          <View style={styles.billsPc}>
            {billsPC.map(item => {
              // @ts-ignore
              const image = pokemonImages[item.pokemonIndex.toString()].image;
              // @ts-ignore
              const name = pokemonImages[item.pokemonIndex.toString()].name;
              return (
                <Animated.View
                  style={styles.ctaButton}
                  key={item.pokemonIndex.toString()}
                  entering={LightSpeedInLeft.duration(1000)}
                  exiting={LightSpeedOutRight.duration(1000)}>
                  <Pressable
                    onPress={() => {
                      // exchangePokemon(
                      //   connectedDevice,
                      //   item.pokemonIndex,
                      //   POKEMON_STATE.TRAINER,
                      // );
                    }}
                    style={styles.pokemonButtonRow}>
                    <Image
                      style={styles.pokemonAvatar}
                      resizeMode="contain"
                      source={image}
                    />
                    <Text
                      style={styles.ctaButtonText}
                      key={item.pokemonIndex.toString()}>
                      {name}
                    </Text>
                  </Pressable>
                </Animated.View>
              );
            })}
          </View>
        </>
      ) : (
        <View style={styles.connectContainer}>
          <View style={styles.pcConnectTextContainer}>
            <Text style={styles.blankTextTitle}>
              Please Connect to Bill's PC, Pokemon Storage System to Continue
            </Text>
          </View>
          <Pressable style={styles.ctaButton} onPress={showModal}>
            <Text style={styles.connectButton}>Connect</Text>
          </Pressable>
        </View>
      )}
      <DeviceModal
        closeModal={hideModal}
        visible={isModalVisible}
        connectToPeripheral={connectToDevice}
        devices={allDevices}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  heartRateTitleText: {
    fontSize: 25,
    fontWeight: 'bold',
    textAlign: 'center',
    marginHorizontal: 20,
    marginVertical: 5,
    color: 'black',
  },
  ctaButton: {
    flexDirection: 'row',
    backgroundColor: 'purple',
    height: 48,
    marginHorizontal: 20,
    marginBottom: 5,
    borderRadius: 8,
    justifyContent: 'center',
  },
  ctaButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    width: '75%',
    marginLeft: 12,
  },
  yourParty: {
    marginTop: 10,
    marginBottom: 50,
  },
  billsPc: {
    marginVertical: 10,
    height: '30%',
  },
  pokemonAvatar: {
    height: '80%',
    width: 50,
    marginLeft: 5,
  },
  pokemonButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  blankTextTitle: {
    marginHorizontal: 22,
    color: 'black',
    fontSize: 25,
    fontWeight: 'bold',
  },
  connectButton: {
    color: 'white',
    textAlign: 'center',
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 9,
  },
  connectContainer: {
    flex: 1,
  },
  pcConnectTextContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;
