import 'package:client_leger/main.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:google_fonts/google_fonts.dart';

class GameCards extends StatefulWidget {
  const GameCards({Key? key}) : super(key: key);

  @override
  _GameCardsState createState() => _GameCardsState();
}

class _GameCardsState extends State<GameCards> {
  var BDgames = authenticator.stats.playedGames;
  List<Widget> games = [];

  @override
  void initState() {
    super.initState();
    for (var game in BDgames!) {
      games.add(
        Container(
            decoration: BoxDecoration(
                border: Border.all(
                  color: Color.fromRGBO(0, 0, 0, 0.2),
                  width: 1,
                ),
                borderRadius: BorderRadius.circular(8)),
            width: 420,
            height: 72,
            padding: EdgeInsets.all(8),
            margin: EdgeInsets.only(bottom: 8),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(game.startDateTime!),
                    FaIcon(
                      FontAwesomeIcons.crown,
                      size: 32,
                      color: game.won! ? Colors.yellow : Color(0x09000000),
                    )
                  ],
                ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text("Durée: " + game.duration!),
                    Text("Score: " + game.score.toString()),
                  ],
                )
              ],
            )),
      );
    }
    if (BDgames!.length == 0)
      games.add(Container(
        margin: EdgeInsets.only(bottom: 8),
        child: Text("Aucune information pour le moment",
            style: GoogleFonts.nunito(
              textStyle:
                  const TextStyle(fontSize: 20, fontStyle: FontStyle.italic),
            )),
      ));
  }

  @override
  Widget build(BuildContext context) {
    // TODO: implement build
    return Container(
        padding: EdgeInsets.only(top: 16),
        child: SingleChildScrollView(
          child: Column(
            children: games,
          ),
        ));
  }
}
