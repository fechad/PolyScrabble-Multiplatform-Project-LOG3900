import 'package:client_leger/components/outgame_objectives.dart';
import 'package:client_leger/components/sidebar.dart';
import 'package:client_leger/pages/game_page.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../components/drawer.dart';
import '../components/user_highscores.dart';
import '../components/user_level.dart';

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
                    child: Text(linkService.getPlayerToShow().username,
                        style: GoogleFonts.nunito(
                          textStyle: TextStyle(
                              fontSize: 32, fontWeight: FontWeight.bold),
                        ))),
                UserLevel(),
                UserHighScores(),
                OutObj(),
              ],
            )),
          ],
        ));
  }
}
