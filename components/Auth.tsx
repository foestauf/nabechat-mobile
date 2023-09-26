import * as AuthSession from "expo-auth-session";
import jwtDecode from "jwt-decode";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { Alert, Button, StyleSheet, Text, View } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { Authorizer } from "@authorizerdev/authorizer-js";

// You need to swap out the Authorizer client id and domain with the one from your Authorizer client.
// In your Authorizer client, you need to also add a url to your authorized redirect urls.

const useProxy = false;
const redirectUri = AuthSession.makeRedirectUri();
console.log(redirectUri);

const authorizerClientID = "c5900696-fd41-4c22-bf99-b267a26ca6c4";
const authorizerURL = "https://authorizer-production-f05a.up.railway.app";
const authorizationEndpoint = `${authorizerURL}/authorize`;
const authorizerRef = new Authorizer({
  clientID: authorizerClientID,
  authorizerURL: authorizerURL,
  redirectURL: redirectUri,
});

const authorizerRefreshTokenKey = `authorizer_refresh_token`;

export const AuthComponent = () => {
  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(true);

  const [request, result, promptAsync] = AuthSession.useAuthRequest(
    {
      redirectUri,
      clientId: authorizerClientID,
      // id_token will return a JWT token
      responseType: "token",
      // use offline access to get a refresh token and perform silent refresh in background
      scopes: ["openid", "profile", "email", "offline_access"],
      extraParams: {
        // ideally, this will be a random value
        nonce: "nonce",
      },
    },
    { authorizationEndpoint }
  );

  // on init silently refresh token if it exists
  useEffect(() => {
    async function silentRefresh() {
      try {
        const refreshToken = await SecureStore.getItemAsync(authorizerRefreshTokenKey);
        console.log(refreshToken);
        if (refreshToken) {
          try {
            const res = await authorizerRef.getToken({
              grant_type: "refresh_token",
              refresh_token: refreshToken,
            });
            if (res.refresh_token === undefined) {
              throw new Error("No access token found in refresh response");
            }
            console.log({ res });
            await SecureStore.setItemAsync("authorizer_refresh_token", res.refresh_token);

            // Should probably fix this any one day
            setEmail(jwtDecode<any>(res.id_token).email);
          } catch (err) {
            console.error(JSON.stringify(err));
            await SecureStore.deleteItemAsync(authorizerRefreshTokenKey);
          }
        }
      } catch (error) {
        setEmail(null);
        await SecureStore.deleteItemAsync(authorizerRefreshTokenKey);
      } finally {
        setLoading(false);
      }
    }
    silentRefresh();
  }, []);

  useEffect(() => {
    async function setResult() {
      if (result?.type === "success") {
        if (result.params.refresh_token) {
          await SecureStore.setItemAsync(authorizerRefreshTokenKey, result.params.refresh_token);
        }

        if (result.error) {
          Alert.alert("Authentication error", result.params.error_description || "something went wrong");
          return;
        }

        if (result.type === "success") {
          // Retrieve the JWT token and decode it
          const jwtToken = result.params.id_token;
          // Also fix this any
          const decoded = jwtDecode<any>(jwtToken);

          const { email } = decoded;
          setEmail(email);
        }
      }
    }
    setResult();
  }, [result]);

  const handleLogout = async () => {
    setLoading(true);
    setEmail(null);

    try {
      const refreshToken = await SecureStore.getItemAsync(authorizerRefreshTokenKey);
      if (!refreshToken) {
        throw new Error("No refresh token found");
      }
      await authorizerRef.revokeToken({
        refresh_token: refreshToken,
      });
      await SecureStore.deleteItemAsync(authorizerRefreshTokenKey);
      await WebBrowser.openAuthSessionAsync(`${authorizerURL}/logout?redirect_uri=${redirectUri}`, "redirectUrl");
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <View>
          {email ? (
            <>
              <Text style={styles.title}>You are logged in, {email}!</Text>
              <Button title="Log out" onPress={handleLogout} />
            </>
          ) : (
            <Button disabled={!request} title="Log in with Authorizer" onPress={() => promptAsync({})} />
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    textAlign: "center",
    marginTop: 40,
  },
});
