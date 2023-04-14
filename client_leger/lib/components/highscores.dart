import 'package:client_leger/main.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class HighScores extends StatefulWidget {
  final int highScore;
  final int victories;
  HighScores({required this.highScore, required this.victories});
  @override
  _HighScoresState createState() => _HighScoresState();
}

class _HighScoresState extends State<HighScores> {

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
              width: 160,
              child: Column(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Text('${languageService.currentLanguage.languageCode == 'en' ? 'victories' : 'victoire(s)'}',
                        style: GoogleFonts.nunito(
                          textStyle: TextStyle(
                              fontSize: 20, fontWeight: FontWeight.bold),
                        )),
                    Text(widget.victories.toString(),
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
              width: 160,
              child: Column(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Text('${languageService.currentLanguage.languageCode == 'en' ? 'highest score' : 'meilleur score'}',
                        style: GoogleFonts.nunito(
                          textStyle: TextStyle(
                              fontSize: 20, fontWeight: FontWeight.bold),
                        )),
                    Text(widget.highScore.toString(),
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
      ],
    );
  }
}
