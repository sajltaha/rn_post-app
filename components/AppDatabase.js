import AsyncStorage from "@react-native-async-storage/async-storage";
import uuid from "react-native-uuid";
import sign from "jwt-encode";

// AsyncStorage.clear()

class AppDatabase {
  async signUp(username, email, password) {
    const user = {
      userID: uuid.v4(),
      username: username,
      email: email,
      password: password,
    };

    const users = await AsyncStorage.getItem("users");
    const usersArr = JSON.parse(users);
    if (users === null) {
      await AsyncStorage.setItem("users", JSON.stringify([user]));
    } else {
      const candidate = usersArr.find((user) => {
        if (user.email == email || user.username == username) {
          return user;
        }
      });

      if (candidate) {
        throw new Error("User already exists!");
      } else {
        await AsyncStorage.setItem(
          "users",
          JSON.stringify([...usersArr, user])
        );
      }
    }
  }

  async signIn(username, password) {
    const users = await AsyncStorage.getItem("users");
    const usersArr = JSON.parse(users);
    if (users === null) {
      throw new Error("User doesn't exist!");
    } else {
      const candidate = usersArr.find((user) => {
        if (user.username == username) {
          return user;
        }
      });

      if (candidate) {
        if (candidate.password === password) {
          const token = sign(
            {
              username: candidate.username,
              email: candidate.email,
              userID: candidate.userID,
              duration: 600,
              start: new Date(),
            },
            "secret"
          );
          await AsyncStorage.setItem("token", token);
        } else {
          throw new Error("Wrong username or password!");
        }
      } else {
        throw new Error("User doesn't exist!");
      }
    }
  }
}

const appDatabase = new AppDatabase();

export default appDatabase;
