import 'dart:async';

import 'package:client_leger/components/drawer.dart';
import 'package:client_leger/main.dart';
import 'package:client_leger/pages/themed_page.dart';
import 'package:client_leger/services/background_image_service.dart';
import 'package:client_leger/services/chat_service.dart';
import 'package:flutter/material.dart';

import '../components/sidebar.dart';
import '../components/user_resume.dart';
import '../config/colors.dart';
import '../services/init_service.dart';
import 'menu_page.dart';

final chatService = ChatService();
final backgroundService = BackgroundService();

class MyHomePage extends StatefulWidget {
  const MyHomePage({super.key, required this.title});

  // This widget is the home page of your application. It is stateful, meaning
  // that it has a State object (defined below) that contains fields that affect
  // how it looks.

  // This class is the configuration for the state. It holds the values (in this
  // case the title) provided by the parent (in this case the App widget) and
  // used by the build method of the State. Fields in a Widget subclass are
  // always marked "final".

  final String title;

  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  final scaffoldKey = GlobalKey<ScaffoldState>();
  static const bool isProduction = bool.fromEnvironment('dart.vm.product');
  int page = 0;
  int currentSelected = 0;
  @override
  void initState() {
    super.initState();
    connect();
  }

  @override
  void dispose() {
    super.dispose();
  }

  verifyInfo() {
    if (authenticator.loggedInEmail.isNotEmpty)
      authenticator.setUser(authenticator.currentUser.email);
    backgroundService.setBackground('');
    authenticator.setStats(authenticator.currentUser.email);
  }

  @override
  Widget build(BuildContext context) {
    // This method is rerun every time setState is called, for instance as done
    // by the _incrementCounter method above.
    //
    // The Flutter framework has been optimized to make rerunning build methods
    // fast, so that you can just rebuild anything that needs updating rather
    // than having to individually change instances of widgets.
    verifyInfo();
    return Scaffold(
      key: scaffoldKey,
      backgroundColor: Colors.white,
      drawer: Drawer(
        child: ChatDrawer(),
        // other drawer controller properties here
      ),
      onDrawerChanged: (isOpen) {
        // write your callback implementation here
        if (!isOpen)
          Timer(Duration(milliseconds: 250), () {
            setState(() {
              page = 0;
            });
          });
      },
      endDrawer: UserResume(),
      body: Stack(children: <Widget>[
        Container(
          child: Center(
            // Center is a layout widget. It takes a single child and positions it
            // in the middle of the parent.
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: <Widget>[
                Align(
                  alignment: Alignment.topCenter,
                  child: Image.asset(
                    "assets/images/scrabble_hero.png",
                  ),
                ),
                SizedBox(height: 130),
                Text("Modes de jeu",
                    style: TextStyle(
                      fontFamily: "Nunito",
                      fontSize: 35,
                      decoration: TextDecoration.underline,
                    )),
                SizedBox(height: 60),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Palette.mainColor,
                    minimumSize: Size(300, 40),
                    textStyle: const TextStyle(fontSize: 20),
                  ),
                  child: const Text('Scrabble Classique'),
                  onPressed: () {
                    Navigator.of(context).push(MaterialPageRoute(
                        builder: (context) => const MenuPage()));
                  },
                ),
                SizedBox(height: 15),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Palette.mainColor,
                    minimumSize: Size(300, 40),
                    textStyle: const TextStyle(fontSize: 20),
                  ),
                  child: const Text('Scrabble Thème'),
                  onPressed: () {
                    Navigator.push(context,
                        MaterialPageRoute(builder: ((context) {
                      return ThemedPage();
                    })));
                    //setState(() {
                    //page = 1;
                    //scaffoldKey.currentState?.openEndDrawer();
                    //});
                  },
                ),
                SizedBox(height: 200),
              ],
            ),
          ),
        ),
        CollapsingNavigationDrawer(),
      ]),
    );
  }
}
