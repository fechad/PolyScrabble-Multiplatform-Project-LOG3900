import 'dart:async';

import 'package:assets_audio_player/assets_audio_player.dart';
import 'package:audioplayers/audioplayers.dart';
import 'package:client_leger/components/drawer.dart';
import 'package:client_leger/main.dart';
import 'package:client_leger/pages/themed_page.dart';
import 'package:client_leger/services/background_image_service.dart';
import 'package:client_leger/services/chat_service.dart';
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:flutter_gen/gen_l10n/app_localization.dart';

import '../components/sidebar.dart';
import '../components/user_resume.dart';
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
    SchedulerBinding.instance.addPostFrameCallback((_) => {
          languageService.switchLanguage(authenticator
                  .currentUser.userSettings.defaultLanguage
                  .contains('french')
              ? 'fr'
              : 'en'),
        });
    connect();
  }

  @override
  void dispose() {
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // This method is rerun every time setState is called, for instance as done
    // by the _incrementCounter method above.
    //
    // The Flutter framework has been optimized to make rerunning build methods
    // fast, so that you can just rebuild anything that needs updating rather
    // than having to individually change instances of widgets.

    return Scaffold(
      key: scaffoldKey,
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
                Text(AppLocalizations.of(context)!.mainTitle,
                    style: TextStyle(
                      fontFamily: "Nunito",
                      fontSize: 35,
                      decoration: TextDecoration.underline,
                    )),
                SizedBox(height: 60),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: themeManager.themeMode == ThemeMode.light
                        ? Color.fromARGB(255, 125, 175, 107)
                        : Color.fromARGB(255, 121, 101, 220),
                    minimumSize: Size(300, 40),
                    textStyle: const TextStyle(fontSize: 20),
                  ),
                  child: Text(AppLocalizations.of(context)!.mainButtonClassic),
                  onPressed: () {
                    Navigator.of(context).push(MaterialPageRoute(
                        builder: (context) => const MenuPage()));
                  },
                ),
                SizedBox(height: 15),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: themeManager.themeMode == ThemeMode.light
                        ? Color.fromARGB(255, 125, 175, 107)
                        : Color.fromARGB(255, 121, 101, 220),
                    minimumSize: Size(300, 40),
                    textStyle: const TextStyle(fontSize: 20),
                  ),
                  child: Text(AppLocalizations.of(context)!.mainButtonTheme),
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
