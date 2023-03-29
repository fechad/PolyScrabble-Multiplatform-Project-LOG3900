import 'dart:async';

import 'package:client_leger/main.dart';
import 'package:client_leger/services/auth_service.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../pages/game_page.dart';
import '../services/link_service.dart';


class Stats extends StatefulWidget {
  const Stats({Key? key}) : super(key: key);

  @override
  _StatsState createState() => _StatsState();
}

class _StatsState extends State<Stats> {


  @override
  void initState() {
    super.initState();
  }


  @override
  Widget build(BuildContext context) {
    // TODO: implement build
    return Container(
      child: Column(
        children: [
          Text("Statistique",
              style: GoogleFonts.nunito(
                textStyle: const TextStyle(
                    fontSize: 32, fontWeight: FontWeight.bold),
              )
          ),
          SizedBox(height: 30,),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                  width: 272,
              height: 64,
              margin: EdgeInsets.all(8),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text("Parties jouées",
                      style: GoogleFonts.nunito(
                        textStyle: const TextStyle(
                            fontSize: 24, fontWeight: FontWeight.w600),
                      )
                    ),
                    Text(authenticator.stats.playedGamesCount.toString(),
                        style: GoogleFonts.nunito(
                          textStyle: const TextStyle(
                              fontSize: 20, fontWeight: FontWeight.bold),
                        )
                    )
                  ],
              )
            ),
              Container(
                  width: 272,
                  height: 64,
                  margin: EdgeInsets.all(8),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text("Parties gagnées",
                          style: GoogleFonts.nunito(
                            textStyle: const TextStyle(
                                fontSize: 24, fontWeight: FontWeight.w600),
                          )
                      ),
                      Text(authenticator.stats.gamesWonCount.toString(),
                          style: GoogleFonts.nunito(
                            textStyle: const TextStyle(
                                fontSize: 20, fontWeight: FontWeight.bold),
                          )
                      )
                    ],
                  )),
              Container(
                  width: 272,
                  height: 64,
                  margin: EdgeInsets.all(8),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text("Score moyen",
                          style: GoogleFonts.nunito(
                            textStyle: const TextStyle(
                                fontSize: 24, fontWeight: FontWeight.w600),
                          )
                      ),
                      Text(authenticator.stats.averagePointsByGame.toString(),
                          style: GoogleFonts.nunito(
                            textStyle: const TextStyle(
                                fontSize: 20, fontWeight: FontWeight.bold),
                          )
                      )
                    ],
                  )),
              Container(
                  width: 272,
                  height: 64,
                  margin: EdgeInsets.all(8),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text("Temp moyen par parties",
                          style: GoogleFonts.nunito(
                            textStyle: const TextStyle(
                                fontSize: 24, fontWeight: FontWeight.w600),
                          )
                      ),
                      Text(authenticator.stats.averageGameDuration,
                          style: GoogleFonts.nunito(
                            textStyle: const TextStyle(
                                fontSize: 20, fontWeight: FontWeight.bold),
                          )
                      )
                    ],
                  )),
            ],
          )
        ]
      ),
    );
  }
}
