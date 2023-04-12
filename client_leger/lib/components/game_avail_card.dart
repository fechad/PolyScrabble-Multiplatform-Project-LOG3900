import 'package:client_leger/main.dart';
import 'package:client_leger/pages/game_page.dart';
import 'package:client_leger/services/link_service.dart';
import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localization.dart';

import '../classes/game.dart';
import '../config/flutter_flow/flutter_flow_theme.dart';
import '../services/init_service.dart';
import 'avatar.dart';

class GameCard extends StatefulWidget {
  GameCard(
      {super.key,
      required this.players,
      required this.difficulty,
      required this.time,
      required this.password,
      required this.roomName,
      this.observersCount,
      required this.isObserver});

  final String difficulty;
  final String time;
  final String password;
  final String roomName;
  final bool isObserver;
  final List<Player> players;
  final int? observersCount;

  @override
  _GameCardState createState() => _GameCardState(
      difficulty: difficulty,
      time: time,
      password: password,
      roomName: roomName,
      isObserver: isObserver,
      players: players,
      observersCount: observersCount);
}

class _GameCardState extends State<GameCard> {
  _GameCardState(
      {required this.difficulty,
      required this.time,
      required this.password,
      required this.roomName,
      required this.isObserver,
      this.observersCount,
      required this.players});
  final String difficulty;
  final String time;
  final String password;
  final String roomName;
  final bool isObserver;
  final int? observersCount;

  final Player player = Player(
    socketId: homeSocketService.getSocketID()!,
    isCreator: false,
    points: 0,
    isItsTurn: false,
    clientAccountInfo: authenticator.getCurrentUser(),
    rack: Rack(letters: '', indexLetterToReplace: []),
  );
  TextEditingController _pswdController = TextEditingController();
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();
  late String btnText;
  final List<Player> players;

  @override
  void initState() {
    super.initState();
    btnText = isObserver
        ? languageService.currentLanguage.languageCode == 'en'
            ? 'Observe'
            : 'Observer'
        : languageService.currentLanguage.languageCode == 'en'
            ? 'Join'
            : 'Joindre';
    isObserver ? linkService.setButtonPressed(false) : null;
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
        color: themeManager.themeMode == ThemeMode.light
            ? Colors.white
            : Color.fromARGB(255, 62, 61, 61),
        borderRadius: BorderRadius.circular(8),
        boxShadow: [
          BoxShadow(
            color: themeManager.themeMode == ThemeMode.light
                ? Colors.grey.withOpacity(0.5)
                : Color.fromARGB(255, 36, 36, 36),
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
            Column(children: [
              Padding(
                padding: EdgeInsetsDirectional.fromSTEB(16, 0, 0, 0),
                child: Text(
                  roomName,
                  style: FlutterFlowTheme.of(context).bodyText1.override(
                        fontFamily: 'Nunito',
                        fontSize: 20,
                      ),
                  textAlign: TextAlign.start,
                ),
              ),
              Padding(
                padding: EdgeInsetsDirectional.fromSTEB(25, 0, 0, 0),
                child: Text(
                  "🤖 $difficulty",
                  style: FlutterFlowTheme.of(context).bodyText1.override(
                        fontFamily: 'Nunito',
                        fontSize: 20,
                      ),
                  textAlign: TextAlign.start,
                ),
              )
            ]),
            Spacer(),
            Row(children: [
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
              Icon(Icons.remove_red_eye_rounded),
              Padding(
                padding: EdgeInsetsDirectional.fromSTEB(5, 0, 16, 0),
                child: Text(
                  observersCount != null ? "$observersCount" : "0",
                  style: FlutterFlowTheme.of(context).bodyText1.override(
                        fontFamily: 'Nunito',
                        fontSize: 20,
                      ),
                  textAlign: TextAlign.end,
                ),
              ),
            ]),
          ]),
          Spacer(),
          Row(
            children: [
              Padding(
                padding: EdgeInsetsDirectional.fromSTEB(25, 10, 0, 0),
                child: Row(
                  children: [
                    Container(
                        height: 90,
                        width: 200,
                        child: ListView.builder(
                            scrollDirection: Axis.horizontal,
                            itemCount: players.length,
                            itemBuilder: (BuildContext context, int index) {
                              return Column(children: [
                                Text(players[index].isCreator
                                    ? (languageService
                                                .currentLanguage.languageCode ==
                                            'en'
                                        ? "Creator"
                                        : "Créateur")
                                    : ''),
                                SizedBox(height: 5),
                                Container(
                                    decoration: BoxDecoration(
                                        shape: BoxShape.circle,
                                        border: Border.all(
                                            strokeAlign: StrokeAlign.center,
                                            width: 4,
                                            color: players[index].isCreator
                                                ? Colors.orange
                                                : Colors.transparent)),
                                    child: Avatar(
                                        insideChat: false,
                                        url: players[index]
                                            .clientAccountInfo!
                                            .userSettings
                                            .avatarUrl))
                              ]);
                            })),
                    Padding(
                      padding: EdgeInsetsDirectional.fromSTEB(80, 0, 16, 0),
                      child: ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor:
                                themeManager.themeMode == ThemeMode.light
                                    ? Color.fromARGB(255, 125, 175, 107)
                                    : Color.fromARGB(255, 121, 101, 220),
                            minimumSize: Size(45, 35),
                            textStyle: const TextStyle(fontSize: 20),
                          ),
                          child: this.password != ''
                              ? Text('${btnText} 🔑')
                              : Text(btnText),
                          onPressed: linkService.getJoinButtonPressed()
                              ? null
                              : () {
                                  if (password.isEmpty) {
                                    if (isObserver) {
                                      sendObserveRequest();
                                    } else {
                                      sendJoinRequest();
                                      buttonChange();
                                    }
                                  } else {
                                    showDialog(
                                        barrierDismissible: false,
                                        context: context,
                                        builder: (context) {
                                          return Container(
                                            child: AlertDialog(
                                              title: Text(AppLocalizations.of(
                                                      context)!
                                                  .classicJoinMultiPopupTitle),
                                              content: Container(
                                                  height: 55,
                                                  width: 350,
                                                  child: Form(
                                                      key: _formKey,
                                                      child: Column(children: [
                                                        TextFormField(
                                                          controller:
                                                              _pswdController,
                                                          decoration:
                                                              InputDecoration(
                                                            hintText: AppLocalizations
                                                                    .of(context)!
                                                                .classicJoinMultiPopupInput,
                                                          ),
                                                          obscureText: true,
                                                          validator: (value) {
                                                            if (value!
                                                                .isEmpty) {
                                                              return languageService
                                                                          .currentLanguage
                                                                          .languageCode ==
                                                                      'en'
                                                                  ? 'Password required'
                                                                  : 'Mot de passe requis';
                                                            }
                                                            if (value ==
                                                                password) {
                                                              _pswdController
                                                                  .text = value;
                                                            } else
                                                              return languageService
                                                                          .currentLanguage
                                                                          .languageCode ==
                                                                      'en'
                                                                  ? 'Wrong password'
                                                                  : 'Mot de passe invalide';
                                                          },
                                                        ),
                                                      ]))),
                                              actions: [
                                                ElevatedButton(
                                                    child: Text(
                                                        AppLocalizations.of(
                                                                context)!
                                                            .quit),
                                                    style: ElevatedButton
                                                        .styleFrom(
                                                      backgroundColor:
                                                          Colors.red,
                                                      textStyle:
                                                          const TextStyle(
                                                              fontSize: 20),
                                                    ),
                                                    onPressed: () => {
                                                          _pswdController
                                                              .clear(),
                                                          Navigator.pop(
                                                              context),
                                                        }),
                                                ElevatedButton(
                                                  child: Text(
                                                      AppLocalizations.of(
                                                              context)!
                                                          .join),
                                                  style:
                                                      ElevatedButton.styleFrom(
                                                    backgroundColor: themeManager
                                                                .themeMode ==
                                                            ThemeMode.light
                                                        ? Color.fromARGB(
                                                            255, 125, 175, 107)
                                                        : Color.fromARGB(
                                                            255, 121, 101, 220),
                                                    textStyle: const TextStyle(
                                                        fontSize: 20),
                                                  ),
                                                  onPressed: () {
                                                    if (_pswdController.text ==
                                                        password) {
                                                      if (isObserver) {
                                                        sendObserveRequest();
                                                      } else {
                                                        sendJoinRequest();
                                                      }
                                                    }
                                                  },
                                                ),
                                              ],
                                            ),
                                          );
                                        });
                                  }
                                }),
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

  sendObserveRequest() {
    homeSocketService.send('observeRoomRequest', {
      "roomName": roomName,
      "observer": RoomObserver(
          socketId: socketService.getSocketID(),
          username: authenticator.getCurrentUser().username),
      "password": password
    });
  }

  sendJoinRequest() {
    homeSocketService.send('joinRoomRequest',
        {"roomName": roomName, "player": player, "password": password});

    if (password.isNotEmpty) {
      homeSocketService.send("joinChatChannel", {
        'name': roomName,
        'user': authenticator.currentUser?.username,
        'isRoomChannel': true,
      });
    }
  }
}
