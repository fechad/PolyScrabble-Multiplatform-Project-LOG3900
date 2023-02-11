import 'package:client_leger/components/user_model.dart';

class AuthService {
  late UserModel currentUser;
  late String username;

  AuthService();

  void setUser(username) {
    currentUser = UserModel(
      username: username,
      email: "xanna@gmail.com",
      avatarURL: '',
      level: Level(rank: "Stone", currentXP: 0, totalXP: 100),
      badges: [],
      highScore: 0,
      gamesWon: 0,
      totalXp: 0,
      gamesPlayed: [],
      bestGames: [],
    );
  }

  UserModel getCurrentUser() {
    return currentUser;
  }
}
