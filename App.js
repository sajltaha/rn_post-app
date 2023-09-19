import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
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
import { useState } from "react";

const appDatabase = AppDatabase;

const Stack = createNativeStackNavigator();

const pages = {
  signUpP: "Sign Up",
  signInP: "Sign In",
};

const SignUpPage = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

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
          value={password}
          onChangeText={(text) => setPassword(text)}
          style={styles.signBlock_input}
          placeholder="Password"
        />
        <Button title="Sign Up" disabled={!username || !password} />
      </View>
    </View>
  );
};

const SignInPage = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

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
        <Button title="Sign In" disabled={!username || !password} />
      </View>
    </View>
  );
};

export default function App() {
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
