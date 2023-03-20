import 'dart:convert';

import 'package:client_leger/classes/game.dart';
import 'package:client_leger/pages/connexion_page.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/cupertino.dart';

import '../classes/constants.dart';
import '../firebase_options.dart';

class AuthService {
  late FirebaseApp app;
  late FirebaseAuth firebase;
  bool accountSet = false;
  late Account currentUser;
  late String loggedInEmail;
  final bool isProduction = bool.fromEnvironment('dart.vm.product');

  AuthService();

  AuthService._create() {
    initializeApp().then(
      (value) => firebase = FirebaseAuth.instanceFor(app: app),
    );
  }

  static Future<AuthService> create() async {
    var auth = AuthService._create();
    // setUser();
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
      final credential = await firebase.createUserWithEmailAndPassword(
        email: emailAddress,
        password: password,
      );
      createUser(credential.user!.email!, username);
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

  void setLoggedInEmail(String email) {
    if (!isProduction) {
      return setDefaultUser();
    }
    loggedInEmail = email;
  }

  Future<void> createUser(String email, String username) async {
    // TODO: demander au serveur les autres infos du user: le serveur vérifie si le user est bel et bien signed in puis renvois les infos
    if (!isProduction) return;
    await httpService
        .createUser(email, username)
        .then((value) => setUser(email));
  }

  Future<void> setUser(String email) async {
    // TODO: demander au serveur les autres infos du user: le serveur vérifie si le user est bel et bien signed in puis renvois les infos
    if (!isProduction) return setDefaultUser();
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
