import 'package:client_leger/main.dart';
import 'package:client_leger/pages/game_page.dart';
import 'package:client_leger/pages/home_page.dart';
import 'package:client_leger/services/link_service.dart';
import 'package:flutter/material.dart';

import '../classes/game.dart';
import '../config/colors.dart';
import '../config/flutter_flow/flutter_flow_theme.dart';
import '../services/init_service.dart';
import '../services/solo_game_service.dart';
import 'avatar.dart';

class GameCard extends StatefulWidget {
  GameCard({super.key,
    required this.difficulty,
    required this.time,
    required this.password,
    required this.roomName});

  final String difficulty;
  final String time;
  final String password;
  final String roomName;

  @override
  _GameCardState createState() => _GameCardState(difficulty: difficulty, time: time, password: password, roomName: roomName);
}

class _GameCardState extends State<GameCard> {
  _GameCardState({required this.difficulty, required this.time, required this.password, required this.roomName});
  final String difficulty;
  final String time;
  final String password;
  final String roomName;
  final Player player = Player(
    pseudo: authenticator.currentUser.username,
    socketId: homeSocketService.getSocketID()!,
    isCreator: false,
    points: 0,
    isItsTurn: false,
  );
  TextEditingController _pswdController = TextEditingController();

  @override
  void initState() {
    super.initState();
  }

  void buttonChange() {
    linkService.buttonChange();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 500,
      padding: EdgeInsets.fromLTRB(0, 8, 0, 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.5),
            spreadRadius: 5,
            blurRadius: 7,
            offset: Offset(0, 3), // changes position of shadow
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.max,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(children: [
            Padding(
              padding: EdgeInsetsDirectional.fromSTEB(16, 0, 0, 0),
              child: Text(
                "🤖 $difficulty",
                style: FlutterFlowTheme.of(context).bodyText1.override(
                  fontFamily: 'Nunito',
                  fontSize: 20,
                ),
                textAlign: TextAlign.start,
              ),
            ),
            Spacer(),
            Padding(
              padding: EdgeInsetsDirectional.fromSTEB(16, 0, 16, 0),
              child: Text(
                "⏱ $time",
                style: FlutterFlowTheme.of(context).bodyText1.override(
                  fontFamily: 'Nunito',
                  fontSize: 20,
                ),
                textAlign: TextAlign.end,
              ),
            ),
          ]),
          Spacer(),
          Row(
            children: [
              Padding(
                padding: EdgeInsetsDirectional.fromSTEB(0, 0, 0, 0),
                child: Row(
                  children: [
                    Avatar(),
                    Avatar(),
                    Avatar(),
                    Avatar(),
                    Padding(
                      padding: EdgeInsetsDirectional.fromSTEB(40, 0, 16, 0),
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Palette.mainColor,
                          minimumSize: Size(50, 40),
                          textStyle: const TextStyle(fontSize: 20),
                        ),
                        child: this.password != ''
                            ? const Text('Joindre 🔑')
                            : const Text('Joindre'),
                        onPressed:
                        linkService.getJoinButtonPressed() ? null : () {
                          if(password.isEmpty) {
                            sendJoinRequest();
                            buttonChange();
                          }
                          else {
                            showDialog(
                            barrierDismissible: false,
                            context: context,
                            builder: (context) {
                              return
                              Container(
                              child:
                            AlertDialog(
                                title: Text("Partie privée"),
                                content: TextFormField(
                                controller: _pswdController,
                                decoration: const InputDecoration(
                                    hintText: 'Veuillez entrer le mot de passe pour joindre la partie',
                                ),
                                obscureText: true,
                                  validator: (value) {
                                  if (value!.isEmpty){
                                    return 'Mot de passe requis';
                                  }
                                  if (value == password) {
                                    _pswdController.text = value;
                                  }
                                  else return 'Mot de passe invalide';
                            },
                                ),
                              actions: [
                                ElevatedButton(
                                  child: Text('Quitter'),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: Colors.red,
                                    textStyle: const TextStyle(fontSize: 20),
                                  ),
                                  onPressed: () => {
                                    _pswdController.clear(),
                                    Navigator.pop(context),}
                                ),
                                ElevatedButton(
                                  child: Text('Joindre'),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: Palette.mainColor,
                                    textStyle: const TextStyle(fontSize: 20),
                                  ),
                                  onPressed: () {
                                    if(_pswdController.text == password) {
                                      sendJoinRequest();
                                    }
                                  },
                                ),
                              ],
                            ),
                              );
                            }
                            );
                          }
                        }
                      ),
                    ),
                  ],
                ),
              ),
            ],
          )
        ],
      ),
    );
  }

  sendJoinRequest() {
    homeSocketService.send('joinRoomRequest', {
      "roomName": roomName,
      //TODO : isItsTurn?? should be determined by server??
      "player": player,
      "password": password
    });

    if(password.isNotEmpty) {
      homeSocketService.send("joinChatChannel", {
                  'name': roomName,
                  'user': authenticator.currentUser.username,
                  'isRoomChannel': true,
                });
    }
  }
}


