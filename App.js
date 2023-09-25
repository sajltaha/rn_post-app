import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import uuid from "react-native-uuid";
import {
  Button,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AppDatabase from "./components/AppDatabase";
import { useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import jwt_decode from "jwt-decode";

// AsyncStorage.clear()

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

  const { setIsAuth } = useContext(ParentContext);

  const onPressSignIn = async () => {
    try {
      await appDatabase.signIn(username, password);
      setPassword("");
      setUsername("");
      setIsAuth(true);
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
          onPress={() => onPressSignIn()}
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
  const [posts, setPosts] = useState([]);
  const { currentUser, setIsAuth } = useContext(ParentContext);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    (async () => {
      const posts = await AsyncStorage.getItem("posts");
      const postsConverted = JSON.parse(posts);
      if (postsConverted) {
        setPosts(postsConverted);
      }
    })();
  }, []);

  const onPress = async () => {
    const post = {
      postID: uuid.v4(),
      username: currentUser.username,
      title: title,
      description: description,
    };

    await AsyncStorage.setItem("posts", JSON.stringify([...posts, post]));
    setPosts([...posts, post]);
  };

  return (
    <View style={{ padding: 15 }}>
      <FlatList
        data={posts}
        keyExtractor={(post) => post.postID}
        renderItem={({ item }) => {
          return (
            <View key={item.postID}>
              <Text>{item.title}</Text>
              <Text>{item.description}</Text>
              <Text>created by {item.username}</Text>
            </View>
          );
        }}
      />
      <View>
        <TextInput
          placeholder="Title"
          style={{ borderWidth: 1 }}
          value={title}
          onChangeText={(text) => setTitle(text)}
        />
        <TextInput
          placeholder="Description"
          style={{ borderWidth: 1 }}
          value={description}
          onChangeText={(text) => setDescription(text)}
        />
        <Button title="add" onPress={onPress} />
        <Button
          title="sign out"
          onPress={async () => {
            await AsyncStorage.removeItem("token");
            setIsAuth(false);
          }}
        />
      </View>
    </View>
  );
};

const ParentContext = React.createContext({});

export default function App() {
  const [isAuth, setIsAuth] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [currentUser, setCurrentUser] = useState("");

  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        const convertedToken = jwt_decode(token);
        setCurrentUser(convertedToken);
        const duration = convertedToken.duration;
        const start = convertedToken.start;
        const gap = (new Date() - new Date(start)) / 1000;
        if (gap <= duration) {
          setTimeout(() => {
            setIsAuth(false);
          }, (duration - gap) * 1000);
          setIsAuth(true);
        }
      }
      setLoaded(true);
    })();
  }, [isAuth]);

  if (!loaded) {
    return null;
  }
  return (
    <ParentContext.Provider value={{ setIsAuth, currentUser }}>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerBackVisible: false,
          }}
        >
          {!isAuth && (
            <>
              <Stack.Screen
                name={pages.signUpP}
                component={SignUpPage}
                options={{ title: `Sign Up` }}
              />
              <Stack.Screen
                name={pages.signInP}
                component={SignInPage}
                options={{ title: `Sign In` }}
              />
            </>
          )}
          {isAuth && (
            <Stack.Screen
              name={pages.postP}
              component={PostPage}
              options={{ title: `Posts` }}
            />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </ParentContext.Provider>
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
