import 'package:client_leger/components/outgame_objectives.dart';
import 'package:client_leger/components/sidebar.dart';
import 'package:client_leger/main.dart';
import 'package:client_leger/pages/game_page.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../classes/game.dart';
import '../components/drawer.dart';
import '../components/highscores.dart';
import '../components/user_highscores.dart';
import '../components/user_level.dart';
import '../services/border_service.dart';
import '../services/objectives_service.dart';

class OtherUserPage extends StatefulWidget {
  @override
  _OtherUserPageState createState() => _OtherUserPageState();
}

class _OtherUserPageState extends State<OtherUserPage> {
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
    ObjectivesService objService = new ObjectivesService();
    BorderService borderService = new BorderService();
    Account player = linkService.getPlayerToShow();
    authenticator.getOtherStats(player.email);
    objService.generateObjectives(authenticator.otherStats, player);
    String path = borderService.getBorder(objService.currentLevel);

    return Scaffold(
        drawer: const ChatDrawer(),
        body: Row(
          children: [
            CollapsingNavigationDrawer(),
            Expanded(
                child: SingleChildScrollView(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      Stack(
                          alignment: Alignment.center,
                          children: [
                            CircleAvatar(
                                radius: 60,
                                backgroundImage: NetworkImage(
                                  linkService.getPlayerToShow().userSettings.avatarUrl,
                                )),
                            borderService.border(path)
                          ]
                      ),
                      Container(
                          padding: EdgeInsets.all(20),
                          child: Text(linkService.getPlayerToShow().username,
                              style: GoogleFonts.nunito(
                                textStyle: TextStyle(
                                    fontSize: 32, fontWeight: FontWeight.bold),
                              ))),
                      UserLevel(),
                      HighScores(highScore: objService.highScore, victories: player.gamesWon),
                      OutObj(),
                    ],
                  ),
                )),
          ],
        ));
  }
}
