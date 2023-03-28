import 'dart:async';

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../classes/game.dart';
import '../services/link_service.dart';

class Objectives extends StatefulWidget {
  const Objectives({super.key});

  @override
  ObjectivesState createState() => ObjectivesState();
}

class ObjectivesState extends State<Objectives> {
  @override
  void initState() {
    super.initState();
    _configure();
  }

  _configure() {
    socketService.send('getAllGoals');

    Map<String, dynamic> res;
    socketService.on(
        'goalsUpdated',
        (receivedGoals) => {
              Timer(const Duration(milliseconds: 500), (() {
                if (mounted) {
                  setState(() {
                    socketService.on(
                        'goalsUpdated',
                        (receivedGoals) => {
                              gameService.goals = [],
                              for (Map<String, dynamic> goal in receivedGoals)
                                {
                                  res = Map<String, dynamic>.from(goal),
                                  gameService.goals.add(Goal(
                                    title: res['title'],
                                    description: res['description'],
                                    reward: res['reward'],
                                    reached: res['reached'],
                                    isPublic: res['isPublic'],
                                    players: [],
                                  )),
                                },
                            });
                  });
                }
              })),
            });
  }

  @override
  void dispose() {
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
        width: 300,
        color: Color(0x00000000),
        child: Column(
          children: [
            SizedBox(height: 16),
            Expanded(
                child: ListView.builder(
                    itemCount: gameService.goals.length,
                    padding: EdgeInsets.zero,
                    itemBuilder: (context, index) {
                      return GestureDetector(
                          onTap: () {
                            showDialog(
                                barrierDismissible: true,
                                context: context,
                                builder: (context) {
                                  return AlertDialog(
                                      title:
                                          Text(gameService.goals[index].title),
                                      content: Container(
                                        width: 300,
                                        height: 60,
                                        child: Text(gameService
                                            .goals[index].description),
                                      ));
                                });
                          },
                          child: gameService.goals[index].reached
                              ? Container(
                                  margin: EdgeInsets.fromLTRB(0, 0, 0, 10),
                                  padding: EdgeInsets.fromLTRB(0, 0, 0, 12),
                                  decoration: BoxDecoration(
                                    color: Color(0x227DAF6B),
                                    borderRadius: BorderRadius.circular(4),
                                    border: Border.all(
                                      color: Color(0xFF7DAF6B),
                                      width: 2,
                                    ),
                                  ),
                                  child: Container(
                                      height: 40,
                                      width: 270,
                                      padding: EdgeInsets.only(
                                          left: 8, right: 8, top: 10),
                                      child: Row(children: [
                                        Container(
                                            width: 210,
                                            margin: EdgeInsets.only(right: 20),
                                            padding: EdgeInsets.fromLTRB(
                                                20, 0, 0, 0),
                                            child: Text(
                                                gameService.goals[index].title,
                                                style: GoogleFonts.nunito(
                                                  textStyle: TextStyle(
                                                      fontSize: 18,
                                                      fontWeight:
                                                          FontWeight.bold,
                                                      color: Color(0xFF7DAF6B)),
                                                ))),
                                        Container(
                                            width: 50,
                                            margin: EdgeInsets.only(right: 8),
                                            child: Text(
                                              gameService.goals[index].reward >
                                                      0
                                                  ? '+${gameService.goals[index].reward}'
                                                  : 'x2',
                                              style: GoogleFonts.nunito(
                                                textStyle: TextStyle(
                                                    fontSize: 20,
                                                    color: Color(0xFF000000)),
                                              ),
                                              textAlign: TextAlign.end,
                                            )),
                                      ])))
                              : Container(
                                  margin: EdgeInsets.fromLTRB(0, 0, 0, 10),
                                  //padding: EdgeInsets.fromLTRB(0, 0, 0, 12),
                                  decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(4),
                                    border: Border.all(
                                      color: Colors.grey,
                                      width: 1,
                                    ),
                                  ),
                                  child: Container(
                                      height: 40,
                                      width: 270,
                                      color: Colors.white,
                                      padding: EdgeInsets.only(
                                          left: 8, right: 8, top: 10),
                                      child: Row(children: [
                                        Container(
                                            width: 210,
                                            margin: EdgeInsets.only(right: 20),
                                            padding: EdgeInsets.fromLTRB(
                                                20, 0, 0, 0),
                                            child: Text(
                                                gameService.goals[index].title,
                                                style: GoogleFonts.nunito(
                                                  textStyle: TextStyle(
                                                      fontSize: 18,
                                                      color: Color(0xFF000000)),
                                                ))),
                                        Container(
                                            width: 50,
                                            margin: EdgeInsets.only(right: 8),
                                            child: Text(
                                              gameService.goals[index].reward >
                                                      0
                                                  ? '+${gameService.goals[index].reward}'
                                                  : 'x2',
                                              style: GoogleFonts.nunito(
                                                textStyle: TextStyle(
                                                    fontSize: 20,
                                                    color: Color(0xFF000000)),
                                              ),
                                              textAlign: TextAlign.end,
                                            )),
                                      ]))));
                    })),
          ],
        ));
  }
}
