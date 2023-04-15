import 'package:client_leger/components/drawer.dart';
import 'package:client_leger/pages/games_room.dart';
import 'package:client_leger/pages/multiplayer_page.dart';
import 'package:client_leger/pages/solo_page.dart';
import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localization.dart';

import '../components/sidebar.dart';
import '../main.dart';
import 'observer_page.dart';

class MenuPage extends StatefulWidget {
  const MenuPage({super.key});

  @override
  State<MenuPage> createState() => _MenuPageState();
}

class _MenuPageState extends State<MenuPage> {
  final scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  void initState() {
    super.initState();
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
      drawer: const ChatDrawer(),
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
                SizedBox(height: 100),
                Text(AppLocalizations.of(context)!.mainButtonClassic,
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
                    minimumSize: Size(310, 40),
                    textStyle: const TextStyle(fontSize: 20),
                  ),
                  child:
                      Text(AppLocalizations.of(context)!.classicButtonSoloGame),
                  onPressed: () {
                    Navigator.pop(context);
                    Navigator.push(context,
                        MaterialPageRoute(builder: ((context) {
                      return const SoloPage();
                    })));
                  },
                ),
                SizedBox(height: 15),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: themeManager.themeMode == ThemeMode.light
                        ? Color.fromARGB(255, 125, 175, 107)
                        : Color.fromARGB(255, 121, 101, 220),
                    minimumSize: Size(310, 40),
                    textStyle: const TextStyle(fontSize: 20),
                  ),
                  child: Text(
                      AppLocalizations.of(context)!.classicButtonMultiGame),
                  onPressed: () {
                    Navigator.pop(context);
                    Navigator.push(context,
                        MaterialPageRoute(builder: ((context) {
                      return const MultiplayerPage();
                    })));
                  },
                ),
                SizedBox(height: 15),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: themeManager.themeMode == ThemeMode.light
                        ? Color.fromARGB(255, 125, 175, 107)
                        : Color.fromARGB(255, 121, 101, 220),
                    minimumSize: Size(310, 40),
                    textStyle: const TextStyle(fontSize: 20),
                  ),
                  child: Text(AppLocalizations.of(context)!.classicButtonJoin),
                  onPressed: () {
                    Navigator.pop(context);
                    Navigator.push(context,
                        MaterialPageRoute(builder: ((context) {
                      return GamesRoomPage();
                    })));
                  },
                ),
                SizedBox(height: 15),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: themeManager.themeMode == ThemeMode.light
                        ? Color.fromARGB(255, 125, 175, 107)
                        : Color.fromARGB(255, 121, 101, 220),
                    minimumSize: Size(310, 40),
                    textStyle: const TextStyle(fontSize: 20),
                  ),
                  child:
                      Text(AppLocalizations.of(context)!.classicButtonObserve),
                  onPressed: () {
                    Navigator.pop(context);
                    Navigator.push(context,
                        MaterialPageRoute(builder: ((context) {
                      return ObserverPage();
                    })));
                  },
                ),
                SizedBox(height: 100),
              ],
            ),
          ),
        ),
        CollapsingNavigationDrawer(),
      ]),
    );
  }
}
