import 'package:client_leger/components/highscores.dart';
import 'package:client_leger/components/level.dart';
import 'package:client_leger/components/outgame_objectives.dart';
import 'package:client_leger/components/sidebar.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../components/drawer.dart';

class LeaderBoardPage extends StatefulWidget {
  @override
  _LeaderBoardPageState createState() => _LeaderBoardPageState();
}

class _LeaderBoardPageState extends State<LeaderBoardPage> {
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
    return Scaffold(
        drawer: const ChatDrawer(),
        body: Row(
          children: [
            CollapsingNavigationDrawer(),
            Expanded(
                child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Container(
                    padding: EdgeInsets.all(20),
                    child: Text("Leaderbord",
                        style: GoogleFonts.nunito(
                          textStyle: TextStyle(
                              fontSize: 32, fontWeight: FontWeight.bold),
                        ))),
                Level(),
                HighScores(),
                OutObj(),
              ],
            )),
          ],
        ));
  }
}
