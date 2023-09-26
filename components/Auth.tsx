import { View, Button, Text, StyleSheet } from 'react-native';
import { useAuth0 } from 'react-native-auth0';

export const AuthComponent = () => {
  const { authorize, clearSession, user, error, isLoading, getCredentials } = useAuth0();

  const onLogin = async () => {
    try {
      await authorize();
      const creds = await getCredentials();
    } catch (e) {
      console.log(e);
    }
  };

  const onLogout = async () => {
    try {
      await clearSession();
    } catch (e) {
      console.log('Log out cancelled');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading</Text>
      </View>
    );
  }

  const loggedIn = user !== undefined && user !== null;

  return (
    <View style={styles.container}>
      {loggedIn && <Text>You are logged in as {user.name}</Text>}
      {!loggedIn && <Text>You are not logged in</Text>}
      {error && <Text>{error.message}</Text>}

      <Button onPress={loggedIn ? onLogout : onLogin} title={loggedIn ? 'Log Out' : 'Log In'} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
});
