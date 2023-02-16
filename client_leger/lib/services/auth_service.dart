import 'dart:convert';

import 'package:client_leger/components/user_model.dart';
import 'package:client_leger/pages/connexion_page.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_core/firebase_core.dart';

import '../firebase_options.dart';

class AuthService {
  late FirebaseApp app;
  late FirebaseAuth firebase;
  late UserModel currentUser;
  late String loggedInEmail;

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

  Future<void> signUpUser(String emailAddress, String password) async {
    try {
      final credential = await firebase.createUserWithEmailAndPassword(
        email: emailAddress,
        password: password,
      );
      createUser(credential.user!.email!);
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
    print(emailAddress);
    print(password);
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
    await FirebaseAuth.instance.signOut();
  }

  void setLoggedInEmail(String email) {
    loggedInEmail = email;
  }

  Future<void> createUser(String email) async {
    // TODO: demander au serveur les autres infos du user: le serveur vérifie si le user est bel et bien signed in puis renvois les infos

    await httpService.getUserInfo(email).then((value) => {
<<<<<<< HEAD
=======
          print(value),
>>>>>>> dev
          currentUser = UserModel(
            username: "Anna",
            email: "xanna@gmail.com",
            avatarURL: '',
            level: Level(rank: "Stone", currentXP: 0, totalXP: 100),
            badges: [],
            highScore: 0,
            gamesWon: 0,
            totalXp: 0,
            gamesPlayed: [],
            bestGames: [],
          )
        });
  }

  Future<void> setUser(String email) async {
    // TODO: demander au serveur les autres infos du user: le serveur vérifie si le user est bel et bien signed in puis renvois les infos

    await httpService.getUserInfo(email).then((value) => {
<<<<<<< HEAD
=======
          print(jsonDecode(value.body)['username']),
>>>>>>> dev
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
<<<<<<< HEAD
=======
          print(currentUser.username)
>>>>>>> dev
        });
  }

  UserModel getCurrentUser() {
    return currentUser;
  }
}
