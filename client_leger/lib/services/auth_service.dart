import 'dart:convert';

import 'package:client_leger/components/user_model.dart';
import 'package:client_leger/pages/connexion_page.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_core/firebase_core.dart';

import '../config/flutter_flow/flutter_flow_util.dart';
import '../firebase_options.dart';

class AuthService {
  late FirebaseApp app;
  late FirebaseAuth firebase;
  late UserModel currentUser;
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
          currentUser = UserModel(
            username: '${jsonDecode(value.body)['username']}',
            email: '${jsonDecode(value.body)['email']}',
            avatarURL: '${jsonDecode(value.body)['avatarURL']}',
            level: Level(rank: "Stone", currentXP: 0, totalXP: 100),
            badges: [],
            highScore: 0,
            gamesWon: 0,
            totalXp: 0,
            gamesPlayed: [],
            bestGames: [],
          ),
        });
  }

  void setDefaultUser() {
    currentUser = UserModel(
      username: 'User ${DateFormat('HH:mm:ss').format(DateTime.now())}',
      email: 'gigaChad@gmail.com',
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
