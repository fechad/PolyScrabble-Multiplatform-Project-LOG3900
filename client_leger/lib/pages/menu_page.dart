import 'package:client_leger/components/drawer.dart';
import 'package:client_leger/pages/games_room.dart';
import 'package:client_leger/pages/multiplayer_page.dart';
import 'package:client_leger/pages/solo_page.dart';
import 'package:flutter/material.dart';
import '../components/sidebar.dart';
import '../config/colors.dart';





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
  Widget build(BuildContext context) {
    // This method is rerun every time setState is called, for instance as done
    // by the _incrementCounter method above.
    //
    // The Flutter framework has been optimized to make rerunning build methods
    // fast, so that you can just rebuild anything that needs updating rather
    // than having to individually change instances of widgets.
    return Scaffold(
      key: scaffoldKey,
      backgroundColor: Colors.white,
      drawer: const ChatDrawer(),
      body: Stack(
          children: <Widget>[
            Container(
              child: Center(
                // Center is a layout widget. It takes a single child and positions it
                // in the middle of the parent.
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: <Widget>[Align(
                    alignment: Alignment.topCenter,
                    child: Image.asset(
                      "assets/images/scrabble_hero.png",
                    ),
                  ),
                    SizedBox(height: 130),
                    Text("Classique",
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
                      child: const Text('Jouer une partie solo'),
                      onPressed: () {
                        Navigator.push(context,
                            MaterialPageRoute(builder: ((context) {
                              return const SoloPage();
                            })));
                      },
                    ),
                    SizedBox(height: 15),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Palette.mainColor,
                        minimumSize: Size(300, 40),
                        textStyle: const TextStyle(fontSize: 20),
                      ),
                      child: const Text('Créer une partie multijoueur'),
                      onPressed: () {
                        Navigator.push(context,
                            MaterialPageRoute(builder: ((context) {
                              return const MultiplayerPage();
                            })));
                      },
                    ),
                    SizedBox(height: 15),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Palette.mainColor,
                        minimumSize: Size(300, 40),
                        textStyle: const TextStyle(fontSize: 20),
                      ),
                      child: const Text('Joindre une partie multijoueur'),
                      onPressed: () {
                        Navigator.push(context,
                            MaterialPageRoute(builder: ((context) {
                              return GamesRoomPage();
                            })));
                      },
                    ),
                    SizedBox(height: 200),
                  ],
                ),
              ),
            ),
            CollapsingNavigationDrawer(),
          ]

      ),
    );
  }
}