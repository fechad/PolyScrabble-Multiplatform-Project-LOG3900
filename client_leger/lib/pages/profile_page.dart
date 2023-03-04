import 'package:client_leger/components/highscores.dart';
import 'package:client_leger/components/level.dart';
import 'package:client_leger/components/outgame_objectives.dart';
import 'package:client_leger/components/sidebar.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../components/drawer.dart';
import '../components/user_resume.dart';

class UserPage extends StatefulWidget {
  @override
  _UserPageState createState() => _UserPageState();
}

class _UserPageState extends State<UserPage> {

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
                  padding: EdgeInsets.all(20) ,
                    child:Text(
                        "Top G",
                        style: GoogleFonts.nunito(
                            textStyle: TextStyle(
                              fontSize: 32,
                              fontWeight: FontWeight.bold
                            ),
                    ))
                ),
                Level(),
                HighScores(),
                OutObj(),
              ],
            )
          ),

        ],
      )
    );
  }
}
