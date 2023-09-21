import * as React from "react";
import { NavigationContainer, useFocusEffect } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  Button,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AppDatabase from "./components/AppDatabase";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import jwt_decode from "jwt-decode";

const appDatabase = AppDatabase;

const Stack = createNativeStackNavigator();

const pages = {
  signUpP: "Sign Up",
  signInP: "Sign In",
  postP: "Posts Page",
};

const SignUpPage = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [allGood, setAllGood] = useState(false);

  const onPressSignUp = async () => {
    try {
      await appDatabase.signUp(username, email, password);
      setEmail("");
      setPassword("");
      setUsername("");
      setAllGood(true);
      setTimeout(() => {
        setAllGood(false);
      }, 2000);
    } catch (error) {
      setEmail("");
      setPassword("");
      setUsername("");
      setErrorMessage(error.message);
      setHasError(true);
      setTimeout(() => {
        setHasError(false);
      }, 2000);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.signBlock}>
        <View style={{ flexDirection: "row", gap: 3, marginBottom: 15 }}>
          <Text style={{}}>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate(pages.signInP)}>
            <Text style={{ color: "blue" }}>Sign In</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          value={username}
          onChangeText={(text) => setUsername(text)}
          style={styles.signBlock_input}
          placeholder="Username"
        />
        <TextInput
          value={email}
          onChangeText={(text) => setEmail(text)}
          style={styles.signBlock_input}
          placeholder="Email"
        />
        <TextInput
          value={password}
          onChangeText={(text) => setPassword(text)}
          style={styles.signBlock_input}
          placeholder="Password"
        />
        <Button
          title="Sign Up"
          disabled={!username || !password}
          onPress={onPressSignUp}
        />
        {hasError && (
          <View style={{ marginTop: 15 }}>
            <Text style={{ color: "red" }}>{errorMessage}</Text>
          </View>
        )}
        {allGood && (
          <View style={{ marginTop: 15 }}>
            <Text style={{ color: "green" }}>You signed up!</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const SignInPage = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const onPressSignIn = async (navigation) => {
    try {
      await appDatabase.signIn(username, password);
      setPassword("");
      setUsername("");
      navigation.navigate(pages.postP);
    } catch (error) {
      setUsername("");
      setPassword("");
      setErrorMessage(error.message);
      setHasError(true);
      setTimeout(() => {
        setHasError(false);
      }, 2000);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.signBlock}>
        <View style={{ flexDirection: "row", gap: 3, marginBottom: 15 }}>
          <Text style={{}}>Do not have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate(pages.signUpP)}>
            <Text style={{ color: "blue" }}>Sign Up</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          value={username}
          onChangeText={(text) => setUsername(text)}
          style={styles.signBlock_input}
          placeholder="Username"
        />
        <TextInput
          value={password}
          onChangeText={(text) => setPassword(text)}
          style={styles.signBlock_input}
          placeholder="Password"
        />
        <Button
          title="Sign In"
          disabled={!username || !password}
          onPress={() => onPressSignIn(navigation)}
        />
        {hasError && (
          <View style={{ marginTop: 15 }}>
            <Text style={{ color: "red" }}>{errorMessage}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const PostPage = () => {
  return (
    <View>
      <Text>asd</Text>
    </View>
  );
};

export default function App() {
  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        const convertedToken = jwt_decode(token);
        const duration = convertedToken.duration;
        const start = convertedToken.start;
        const gap = (new Date(start) - new Date()) / 1000;
        if (gap >= duration) {
          console.log(false);
        } else {
          console.log(true);
        }
      }
    })();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={pages.signUpP}
        screenOptions={{
          headerBackVisible: false,
        }}
      >
        <Stack.Screen name={pages.signUpP} component={SignUpPage} />
        <Stack.Screen name={pages.signInP} component={SignInPage} />
        <Stack.Screen name={pages.postP} component={PostPage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  signBlock: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "silver",
    borderRadius: 15,
  },
  signBlock_input: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    width: 120,
    marginBottom: 15,
    backgroundColor: "whitesmoke",
    borderRadius: 15,
  },
});
