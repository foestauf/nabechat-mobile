import { StyleSheet } from 'react-native';

import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { Threads } from '@/components/Threads';
import { useNavigation } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';

export default function TabOneScreen() {
  const [location, setLocation] = useState<null | Location.LocationObject>(null);
  const [errorMsg, setErrorMsg] = useState<null | string>(null);
  const focus = useIsFocused();

  const getLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Permission to access location was denied');
      return;
    }
    setLocation(await Location.getCurrentPositionAsync({}));
  };

  useEffect(() => {
    if (focus) {
      getLocation();
    }
  }, [focus]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tab One</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      {location ? <Threads location={location} /> : <Text>Loading...</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
