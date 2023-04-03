import 'package:client_leger/main.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../pages/game_page.dart';

class UserHighScores extends StatefulWidget {
  @override
  _UserHighScoresState createState() => _UserHighScoresState();
}

class _UserHighScoresState extends State<UserHighScores> {
  @override
  void initState() {}
  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 116,
              child: Column(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Text(
                        languageService.currentLanguage.languageCode == 'en'
                            ? 'Classic'
                            : "Classique",
                        style: GoogleFonts.nunito(
                          textStyle: TextStyle(
                              fontSize: 20, fontWeight: FontWeight.bold),
                        )),
                    Text("360",
                        style: GoogleFonts.nunito(
                          textStyle: TextStyle(
                              fontSize: 16, fontWeight: FontWeight.bold),
                        )),
                  ]),
            ),
            Icon(
              Icons.emoji_events_rounded,
              size: 72,
            ),
            Container(
              width: 116,
              child: Column(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Text(
                        languageService.currentLanguage.languageCode == 'en'
                            ? 'Themed'
                            : "Thème",
                        style: GoogleFonts.nunito(
                          textStyle: TextStyle(
                              fontSize: 20, fontWeight: FontWeight.bold),
                        )),
                    Text("360",
                        style: GoogleFonts.nunito(
                          textStyle: TextStyle(
                              fontSize: 16, fontWeight: FontWeight.bold),
                        )),
                  ]),
            ),
          ],
        ),
        SizedBox(
          height: 8,
        ),
        Text(
            '${linkService.getPlayerToShow().gamesWon} ${languageService.currentLanguage.languageCode == 'en' ? 'victories' : 'victoire(s)'}',
            style: GoogleFonts.nunito(
              textStyle: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            )),
      ],
    );
  }
}
