import AsyncStorage from "@react-native-async-storage/async-storage";

class AppDatabase {
  async signUp() {
    const users = await AsyncStorage.getItem("users");
    const usersObj = JSON.parse(users);
  }
}

const appDatabase = new AppDatabase();

export default appDatabase;
