import 'package:client_leger/pages/game_page.dart';
import 'package:client_leger/pages/home_page.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localization.dart';

import '../main.dart';
import '../services/link_service.dart';

class GameSidebar extends StatefulWidget {
  GameSidebar({super.key, required this.isObserver});
  final bool isObserver;
  @override
  _GameSidebarState createState() => _GameSidebarState(isObserver: isObserver);
}

class _GameSidebarState extends State<GameSidebar> {
  _GameSidebarState({required this.isObserver});
  bool isObserver;
  final globalKey = GlobalKey<ScaffoldState>();

  @override
  Widget build(BuildContext context) {
    return Material(
      child: Container(
        width: 70,
        color: themeManager.themeMode == ThemeMode.light
            ? Color.fromRGBO(249, 255, 246, 1)
            : Color.fromARGB(255, 62, 62, 62),
        child: OverflowBox(
          maxWidth: 80,
          child: Column(
            children: <Widget>[
              SizedBox(height: 25),
              isObserver
                  ? Container()
                  : IconButton(
                      icon: const Icon(Icons.lightbulb_outline_rounded,
                          size: 50, color: Color(0xFFF5C610)),
                      //TODO cannot ask for hints if placing or trying to exchange
                      onPressed: linkService.getMyTurn() &&
                              placementValidator.letters.isEmpty &&
                              !linkService.getWantToExchange()
                          ? () {
                              inGameService.helpCommand();
                            }
                          : null,
                    ),
              SizedBox(height: 100),
              IconButton(
                icon: Icon(Icons.chat,
                    size: 50,
                    color: themeManager.themeMode == ThemeMode.light
                        ? Color.fromARGB(255, 125, 175, 107)
                        : Color.fromARGB(255, 121, 101, 220)),
                onPressed: () {
                  Scaffold.of(context).openDrawer();
                },
              ),
              SizedBox(height: 435),
              isObserver
                  ? IconButton(
                      icon:
                          const Icon(Icons.logout, size: 50, color: Colors.red),
                      onPressed: () {
                        gameService.reinitializeRoom();
                        leaveGame();
                        linkService.setIsInAGame(false);
                        Navigator.push(context,
                            MaterialPageRoute(builder: ((context) {
                          return const MyHomePage(title: 'PolyScrabble');
                        })));
                      },
                    )
                  : IconButton(
                      icon: const Icon(Icons.flag_rounded,
                          size: 50, color: Colors.red),
                      onPressed: () {
                        showDialog(
                            context: context,
                            builder: (context) {
                              return Container(
                                child: AlertDialog(
                                  title: Text(AppLocalizations.of(context)!
                                      .leaveGameTitle),
                                  content: Text(AppLocalizations.of(context)!
                                      .leaveGameBody),
                                  actions: [
                                    ElevatedButton(
                                        child: Text(
                                            AppLocalizations.of(context)!.no,
                                            style: TextStyle(
                                              color: Colors.black,
                                            )),
                                        style: ElevatedButton.styleFrom(
                                          backgroundColor:
                                              themeManager.themeMode ==
                                                      ThemeMode.light
                                                  ? Color.fromARGB(
                                                      255, 125, 175, 107)
                                                  : Color.fromARGB(
                                                      255, 121, 101, 220),
                                          textStyle:
                                              const TextStyle(fontSize: 20),
                                        ),
                                        onPressed: () => {
                                              Navigator.pop(context),
                                            }),
                                    ElevatedButton(
                                      child: Text(
                                          AppLocalizations.of(context)!.yes),
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: Colors.red,
                                        textStyle:
                                            const TextStyle(fontSize: 20),
                                      ),
                                      onPressed: () {
                                        inGameService.confirmLeaving();
                                        linkService.setIsInAGame(false);
                                        linkService.getRows().clear();
                                        Navigator.push(
                                            context,
                                            MaterialPageRoute(
                                                builder: (context) =>
                                                    MyHomePage(
                                                        title:
                                                            "PolyScrabble")));
                                      },
                                    ),
                                  ],
                                ),
                              );
                            });
                      },
                    ),
            ],
          ),
        ),
      ),
    );
  }

  leaveGame() {
    socketService.send("leaveGame");
    authenticator.setStats(authenticator.currentUser.email);
  }
}
