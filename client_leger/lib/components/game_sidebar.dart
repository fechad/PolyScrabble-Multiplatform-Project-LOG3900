import 'package:client_leger/pages/game_page.dart';
import 'package:client_leger/pages/home_page.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

import '../config/colors.dart';

class GameSidebar extends StatefulWidget {
  @override
  _GameSidebar createState() => _GameSidebar();
}

class _GameSidebar extends State<GameSidebar> {
  final globalKey = GlobalKey<ScaffoldState>();

  @override
  Widget build(BuildContext context) {
    return Material(
      child: Container(
        width: 70,
        color: Color.fromRGBO(249, 255, 246, 1),
        child: OverflowBox(
          maxWidth: 80,
          child: Column(
            children: <Widget>[
              SizedBox(height: 25),
              IconButton(
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
                icon:
                    const Icon(Icons.chat, size: 50, color: Palette.mainColor),
                onPressed: () {
                  Scaffold.of(context).openDrawer();
                },
              ),
              SizedBox(height: 435),
              IconButton(
                icon:
                    const Icon(Icons.flag_rounded, size: 50, color: Colors.red),
                onPressed: () {
                  showDialog(
                      context: context,
                      builder: (context) {
                        return Container(
                          child: AlertDialog(
                            title: Text(
                                "Voulez-vous vraiment abandonner la partie ?"),
                            content: Text(
                                "Vous ne serez pas dans le tableau des meilleurs scores."),
                            actions: [
                              ElevatedButton(
                                  child: Text('Non',
                                      style: TextStyle(
                                        color: Colors.black,
                                      )),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: Colors.white,
                                    textStyle: const TextStyle(fontSize: 20),
                                  ),
                                  onPressed: () => {
                                        Navigator.pop(context),
                                      }),
                              ElevatedButton(
                                child: Text('Oui'),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.red,
                                  textStyle: const TextStyle(fontSize: 20),
                                ),
                                onPressed: () {
                                  inGameService.confirmLeaving();
                                  linkService.setIsInAGame(false);
                                  Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                          builder: (context) => MyHomePage(
                                              title: "PolyScrabble")));
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
}
