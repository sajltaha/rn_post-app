import * as React from "react";
import { NavigationContainer, useRoute } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import uuid from "react-native-uuid";
import {
  Button,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  Modal,
} from "react-native";
import AppDatabase from "./components/AppDatabase";
import { useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import jwt_decode from "jwt-decode";
import Svg, { Path } from "react-native-svg";

// AsyncStorage.clear()

const appDatabase = AppDatabase;

const Stack = createNativeStackNavigator();

const ParentContext = React.createContext({});

const pages = {
  signUpP: "Sign Up",
  signInP: "Sign In",
  postP: "Posts",
  postInP: "Post In",
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

const PostPage = ({ navigation }) => {
  const [posts, setPosts] = useState([]);
  const { currentUser, setIsAuth } = useContext(ParentContext);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    navigation.addListener("focus", () => {
      (async () => {
        const posts = await AsyncStorage.getItem("posts");
        const postsConverted = JSON.parse(posts);
        if (postsConverted) {
          setPosts(postsConverted);
        }
      })();
    });

    navigation.addListener("blur", () => {
      setPosts([]);
    });
  }, []);

  const openPost = (info) => {
    navigation.navigate(pages.postInP, { info: info });
  };

  const onPressAddPost = async () => {
    const post = {
      postID: uuid.v4(),
      username: currentUser.username,
      title: title,
      description: description,
    };

    await AsyncStorage.setItem("posts", JSON.stringify([...posts, post]));
    setPosts([...posts, post]);

    setTitle("");
    setDescription("");
    setModalVisible(false);
  };

  return (
    <View style={{ padding: 15, flex: 1 }}>
      <FlatList
        data={posts}
        keyExtractor={(post) => post.postID}
        renderItem={({ item }) => {
          return (
            <TouchableOpacity
              key={item.postID}
              onPress={() => openPost(item)}
              style={{
                backgroundColor: "wheat",
                marginBottom: 15,
                paddingVertical: 10,
                paddingHorizontal: 40,
                borderWidth: 1,
                borderRadius: 15,
                elevation: 5,
              }}
            >
              <View>
                <Text
                  style={{
                    textAlign: "center",
                    fontSize: 18,
                    color: "brown",
                    fontWeight: 600,
                  }}
                >
                  {item.title}
                </Text>
                <Text style={{ textAlign: "center", paddingTop: 15 }}>
                  {item.description}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
      <Modal animationType="fade" visible={modalVisible}>
        <View
          style={{
            backgroundColor: "#9EDDFF",
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <TextInput
            placeholder="Title"
            style={{
              borderWidth: 2,
              backgroundColor: "#fff",
              width: 200,
              padding: 10,
              borderRadius: 15,
              marginBottom: 15,
            }}
            value={title}
            onChangeText={(text) => setTitle(text)}
          />
          <TextInput
            placeholder="Description"
            style={{
              borderWidth: 2,
              backgroundColor: "#fff",
              width: 200,
              padding: 10,
              borderRadius: 15,
              marginBottom: 15,
            }}
            value={description}
            onChangeText={(text) => setDescription(text)}
          />
          <View style={{ width: 90, marginBottom: 15 }}>
            <Button
              disabled={!title || !description}
              title="add"
              onPress={onPressAddPost}
            />
          </View>
          <View style={{ width: 90 }}>
            <Button
              title="close"
              onPress={() => {
                setModalVisible(false);
                setTitle("");
                setDescription("");
              }}
            />
          </View>
        </View>
      </Modal>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={{
          position: "absolute",
          right: 40,
          bottom: 40,
        }}
      >
        <Svg
          xmlns="http://www.w3.org/2000/svg"
          height="70"
          viewBox="0 -960 960 960"
          width="70"
        >
          <Path d="M440-280h80v-160h160v-80H520v-160h-80v160H280v80h160v160Zm40 200q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
        </Svg>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={async () => {
          await AsyncStorage.removeItem("token");
          setIsAuth(false);
        }}
        style={{
          position: "absolute",
          left: 40,
          bottom: 40,
        }}
      >
        <Svg
          xmlns="http://www.w3.org/2000/svg"
          height="70"
          viewBox="0 -960 960 960"
          width="70"
        >
          <Path d="M806-440H320v-80h486l-62-62 56-58 160 160-160 160-56-58 62-62ZM600-600v-160H200v560h400v-160h80v160q0 33-23.5 56.5T600-120H200q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h400q33 0 56.5 23.5T680-760v160h-80Z" />
        </Svg>
      </TouchableOpacity>
    </View>
  );
};

const PostInPage = ({ navigation }) => {
  const [postInfo, setPostInfo] = useState("");
  const { params } = useRoute();

  useEffect(() => {
    if (params) {
      setPostInfo(params.info);
    } else {
      setPostInfo(params);
    }
  }, [params]);

  const deletePost = async () => {
    const posts = await AsyncStorage.getItem("posts");
    const postsParsed = JSON.parse(posts);
    const remainedPosts = postsParsed.filter((post) => {
      if (post.postID !== postInfo.postID) {
        return post;
      }
    });
    await AsyncStorage.setItem("posts", JSON.stringify(remainedPosts));
    navigation.navigate(pages.postP);
  };

  return (
    <View style={{ padding: 15 }}>
      <View
        style={{
          backgroundColor: "wheat",
          marginBottom: 15,
          paddingVertical: 10,
          paddingHorizontal: 40,
          borderWidth: 1,
          borderRadius: 15,
          elevation: 5,
          alignItems: "center",
        }}
      >
        <Text
          style={{
            textAlign: "center",
            fontSize: 18,
            color: "brown",
            fontWeight: 600,
          }}
        >
          {postInfo.title}
        </Text>
        <Text style={{ textAlign: "center", paddingTop: 15 }}>
          {postInfo.description}
        </Text>
        <Text style={{ textAlign: "center", paddingTop: 15, fontWeight: 600 }}>
          Created by {postInfo.username}
        </Text>
        <TouchableOpacity onPress={deletePost} style={{ marginTop: 15 }}>
          <Svg
            xmlns="http://www.w3.org/2000/svg"
            height="70"
            viewBox="0 -960 960 960"
            width="70"
          >
            <Path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" />
          </Svg>
        </TouchableOpacity>
        <View style={{ width: 90, marginTop: 15 }}>
          <Button
            title="Go Back"
            onPress={() => {
              navigation.navigate(pages.postP);
            }}
          />
        </View>
      </View>
    </View>
  );
};

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
                name={pages.signInP}
                component={SignInPage}
                options={{ title: pages.signInP }}
              />
              <Stack.Screen
                name={pages.signUpP}
                component={SignUpPage}
                options={{ title: pages.signUpP }}
              />
            </>
          )}
          {isAuth && (
            <>
              <Stack.Screen
                name={pages.postP}
                component={PostPage}
                options={{ title: pages.postP }}
              />
              <Stack.Screen
                name={pages.postInP}
                component={PostInPage}
                options={{ title: pages.postInP }}
              />
            </>
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
