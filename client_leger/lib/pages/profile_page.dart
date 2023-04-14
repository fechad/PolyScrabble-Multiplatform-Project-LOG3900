import 'package:client_leger/components/achievement.dart';
import 'package:client_leger/components/highscores.dart';
import 'package:client_leger/components/level.dart';
import 'package:client_leger/components/outgame_objectives.dart';
import 'package:client_leger/components/sidebar.dart';
import 'package:client_leger/main.dart';
import 'package:client_leger/services/border_service.dart';
import 'package:client_leger/services/objectives_service.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../classes/game.dart';
import '../classes/objective.dart';
import '../components/drawer.dart';
import 'game_page.dart';

class UserPage extends StatefulWidget {
  @override
  _UserPageState createState() => _UserPageState();
}

class _UserPageState extends State<UserPage> {

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
    objService.generateObjectives(authenticator.stats, authenticator.currentUser);
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
                                  authenticator.currentUser.userSettings.avatarUrl,
                                )),
                            borderService.border(path)
                          ]
                      ),
                      Container(
                          padding: EdgeInsets.all(20),
                          child: Text(authenticator.currentUser.username,
                              style: GoogleFonts.nunito(
                                textStyle: TextStyle(
                                    fontSize: 32, fontWeight: FontWeight.bold),
                              ))),
                      Level(),
                      HighScores(highScore: objService.highScore, victories: authenticator.currentUser.gamesWon),
                      OutObj(),
                    ],
                  ),
                )),
          ],
        ));
  }
}
