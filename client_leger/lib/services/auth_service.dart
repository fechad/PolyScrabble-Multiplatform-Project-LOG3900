import 'dart:convert';

import 'package:client_leger/classes/game.dart';
import 'package:client_leger/classes/game_stats.dart';
import 'package:client_leger/pages/connexion_page.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/cupertino.dart';
import 'package:http/http.dart';

import '../classes/constants.dart';
import '../firebase_options.dart';

class AuthService {
  late FirebaseApp app;
  late FirebaseAuth firebase;
  bool accountSet = false;
  late Account currentUser;
  late Stats stats;
  final bool isProduction = bool.fromEnvironment('dart.vm.product');


  AuthService();

  AuthService._create() {
    initializeApp().then((value) =>
        {firebase = FirebaseAuth.instanceFor(app: app), setDefaultUser()});
  }

  static Future<AuthService> create() async {
    var auth = AuthService._create();
    return auth;
  }

  Future<void> initializeApp() async {
    WidgetsFlutterBinding.ensureInitialized();
    app = await Firebase.initializeApp(
      options: DefaultFirebaseOptions.currentPlatform,
    );
  }

  Future<void> signUpUser(
      String emailAddress, String password, String username) async {
    try {
      print('fake firebase');
      final res = await createUser(emailAddress, username);
      print('fake firebase done');
      if (res.statusCode == 409) {
        throw ("The account already exists for that email.");
      }
    } catch (e) {
      if (e == "The account already exists for that email.") {
        throw ("The account already exists for that email.");
      }
    }
    try {
      print('real firebase');
      final credential = await firebase.createUserWithEmailAndPassword(
        email: emailAddress,
        password: password,
      );
      setStats(credential.user!.email!);
      setUser(credential.user!.email!);
    } on FirebaseAuthException catch (e) {
      if (e.code == 'invalid-email') {
        throw ('This email is not valid');
      } else if (e.code == 'weak-password') {
        throw ('The password provided is too weak.');
      } else if (e.code == 'email-already-in-use') {
        throw ('The account already exists for that email.');
      } else
        throw ('Credentials refused, try again with a different email');
    } catch (e) {
      print(e);
    }
  }

  Future<void> signInUser(String emailAddress, String password) async {
    if (!isProduction) return;
    try {
      final credential = await firebase.signInWithEmailAndPassword(
          email: emailAddress, password: password);

      setStats(credential.user!.email!);
      setUser(credential.user!.email!);

    } on FirebaseAuthException catch (e) {
      if (e.code == 'user-not-found') {
        throw ('No user found for that email.');
      } else if (e.code == 'wrong-password') {
        throw ('Wrong password provided for that user.');
        //return () => 'Wrong password provided for that user.';
      } else
        throw ('Connexion could not be fulfilled, try again later');
    }
  }

  Future<void> changeUserPassword(
      String emailAddress, String password, String newPassword) async {
    try {
      await signInUser(emailAddress, password);
      firebase.currentUser
          ?.updatePassword(newPassword)
          .then((value) => firebase.signOut());
    } catch (e) {
      print(e);
    }
  }

  Future<void> signOutUser() async {
    if (!isProduction) return;
    await FirebaseAuth.instance.signOut();
  }

  Future<Response> createUser(String email, String username) async {
    // TODO: demander au serveur les autres infos du user: le serveur vérifie si le user est bel et bien signed in puis renvois les infos

    return await httpService.createUser(email, username);
  }

  Future<void> setUser(String email) async {
    // TODO: demander au serveur les autres infos du user: le serveur vérifie si le user est bel et bien signed in puis renvois les infos
    await httpService.getUserInfo(email).then((value) => {
          currentUser = Account(
            username: '${jsonDecode(value.body)['username']}',
            email: '${jsonDecode(value.body)['email']}',
            userSettings:
                UserSettings.fromJson(jsonDecode(value.body)['userSettings']),
            progressInfo:
                ProgressInfo.fromJson(jsonDecode(value.body)['progressInfo']),
            highScores: jsonDecode(value.body)['highScores'],
            badges: [],
            gamesWon: 0,
            gamesPlayed: [],
            bestGames: [],
          ),
        });
  }

  Future<void> setStats(String email) async {
    late List<dynamic> playedGamesJson;
    late List<dynamic> logsJson;
    List<PlayedGame> playedGames = [];
    List<Log> logs = [];
    await httpService.getStatsInfo(email).then((value) => {
      playedGamesJson = jsonDecode(value.body)['playedGames'],
      playedGames = playedGamesJson.map((gameJson) => PlayedGame.fromJson(gameJson)).toList(),
      logsJson = jsonDecode(value.body)['logs'],
      logs = logsJson.map((logJson) => Log.fromJson(logJson)).toList(),
      stats = Stats(
        playedGamesCount: int.parse('${jsonDecode(value.body)['playedGamesCount']}'),
        gamesWonCount: int.parse('${jsonDecode(value.body)['gamesWonCount']}'),
        averagePointsByGame: double.parse('${jsonDecode(value.body)['averagePointsByGame']}'),
        averageGameDuration: '${jsonDecode(value.body)['averageGameDuration']}',
        playedGames: playedGames,
        logs: logs,
      ),
    });
  }

  void setDefaultUser() {
    if (accountSet) return;
    currentUser = Account(
      username: 'kurama',
      email: 'kurama@polyscrabble.ca',
      userSettings: DEFAULT_USER_SETTINGS,
      progressInfo: ProgressInfo(
          currentLevel: 0,
          totalXP: 0,
          currentLevelXp: 100,
          victoriesCount: 0,
          xpForNextLevel: 100),
      highScores: {},
      badges: [],
      gamesWon: 0,
      gamesPlayed: [],
      bestGames: [],
    );
    accountSet = true;
  }

  Account getCurrentUser() {
    return currentUser;
  }
}
