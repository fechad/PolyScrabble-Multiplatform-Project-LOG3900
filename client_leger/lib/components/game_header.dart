import 'dart:async';

import 'package:audioplayers/audioplayers.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

import '../classes/game.dart';
import '../main.dart';
import '../pages/game_page.dart';
import '../pages/home_page.dart';
import '../services/link_service.dart';
import 'avatar.dart';

class GameHeaderWidget extends StatefulWidget {
  final List<Player> opponentsInfo;
  final VoidCallback resetLetters;
  const GameHeaderWidget(
      {Key? key, required this.resetLetters, required this.opponentsInfo})
      : super(key: key);

  @override
  _GameHeaderWidgetState createState() => _GameHeaderWidgetState();
}

class _GameHeaderWidgetState extends State<GameHeaderWidget> {
  final scaffoldKey = GlobalKey<ScaffoldState>();
  String timerFormat = '00:00';
  int timeChosen = 0;
  late Timer _timer;
  late int minutes;
  late int seconds;
  bool alreadyReceived = false;
  String currentPlayer = '';

  @override
  void initState() {
    super.initState();
    setTimer();
    configure();
  }

  configure() {
    socketService.on(
        "playerTurnChanged",
        (currentPlayerTurnPseudo) => {
              inGameService.player.isItsTurn = inGameService
                      .player.clientAccountInfo!.username
                      .compareTo(currentPlayerTurnPseudo) ==
                  0,
              linkService.setTurn(inGameService.player.isItsTurn),
              widget.resetLetters(),
              _timer.cancel(),
              currentPlayer = currentPlayerTurnPseudo,
              setTimer(),

            });

    socketService.on(
        "gameIsOver",
            (players) => {
          gameService.room.roomInfo.isGameOver = true,
            currentPlayer = '',
              _timer.cancel(),
          linkService.setTurn(false),
          inGameService.findWinner(gameService.decodePlayers(players)),
          print('GAME OVER'),
              //TODO : play music of winner from settings + stop VP music
           //musicPlayer.loop()
          //TODO find winner ? see players-infos.components.ts in heavy client
        });

    socketService.on(
        "timeUpdated",
        (room) => {
              gameService.room = gameService.decodeModel(room),
              timeChosen = int.parse(gameService.room.roomInfo.timerPerTurn) -
                  gameService.room.elapsedTime,
              if (!alreadyReceived)
                socketService.send(
                    'getRackInfos', gameService.room.roomInfo.name),
              alreadyReceived = true,
            });
  }

  setTimer() {
    placementValidator.cancelPlacement();
    linkService.cancelPlacements();
    linkService.resetRack();
    timeChosen = int.parse(gameService.room.roomInfo.timerPerTurn);
    const oneSec = const Duration(seconds: 1);
    _timer = Timer.periodic(
      oneSec,
      (Timer timer) {
        if (timeChosen == 0) {
          setState(() {
            seconds = timeChosen % 60;
            //check if timer reaches 0 and its my turn, then skip turn
            timerFormat = Duration(seconds: seconds).toString().substring(2, 7);
            timer.cancel();
            if (linkService.getMyTurn()) inGameService.changePlayerTurn();
            setTimer();
          });
        } else {
          setState(() {
            minutes = timeChosen ~/ 60;
            seconds = timeChosen % 60;
            //only keep minutes and seconds
            timerFormat = Duration(minutes: minutes, seconds: seconds)
                .toString()
                .substring(2, 7);
          });
        }
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Column(children: [
      Row(mainAxisAlignment: MainAxisAlignment.center, children: [
        const Icon(Icons.filter_none, size: 32),
        Text(' ${linkService.getLetterBankCount()}',
            style: const TextStyle(
              fontFamily: 'Nunito',
              fontSize: 24,
            )),
        const SizedBox(
          width: 85,
        ),
        Container(
          decoration: BoxDecoration(
            border: Border.all(
              color: themeManager.themeMode == ThemeMode.light
                  ? Colors.black
                  : Colors.white,
              width: 2,
            ),
          ),
          child: SizedBox(
              width: 100,
              height: 40,
              child: Center(
                  child: Text("$timerFormat",
                      style: const TextStyle(fontSize: 24)))),
        ),
        const SizedBox(
          width: 40,
        ),
        Text("${gameService.room.observers!.length}",
            style: const TextStyle(
              fontSize: 20,
            )),
        const Icon(Icons.remove_red_eye_rounded, size: 40)
      ]),
      const SizedBox(height: 10),
      Container(
          width: MediaQuery.of(context).size.width * 0.25,
          height: MediaQuery.of(context).size.height * 0.11,
          child: Row(
            children: [
              Flexible(
                  child: ListView.builder(
                scrollDirection: Axis.horizontal,
                itemBuilder: (BuildContext context, int index) {
                  if (widget.opponentsInfo.isEmpty) {
                    return const CircularProgressIndicator(); // display a loading indicator
                  } else {
                    return Column(
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          Container(
                            decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                border: Border.all(
                                    strokeAlign: StrokeAlign.center,
                                    width: 5,
                                    color: currentPlayer ==
                                            gameService.room.players[index]
                                                .clientAccountInfo!.username
                                        ? themeManager.themeMode ==
                                                ThemeMode.light
                                            ? Color.fromARGB(255, 125, 175, 107)
                                            : Color.fromARGB(255, 121, 101, 220)
                                        : Colors.transparent)),
                            child: Avatar(
                                url: widget.opponentsInfo[index]
                                    .clientAccountInfo!.userSettings.avatarUrl),
                          ),
                          const SizedBox(height: 10),
                          Text('${gameService.room.players[index].points}',
                              style: const TextStyle(fontSize: 14)),
                          const SizedBox(width: 70),
                        ]);
                  }
                },
                itemCount: gameService.room.players.length,
                reverse: false,
                padding: const EdgeInsets.fromLTRB(0, 0, 0, 0),
              )),
              IconButton(
                  color: themeManager.themeMode == ThemeMode.light
                      ? Color.fromARGB(255, 125, 175, 107)
                      : Color.fromARGB(255, 121, 101, 220),
                  disabledColor: Colors.grey,
                  icon: const Icon(
                    Icons.double_arrow_rounded,
                    size: 50,
                  ),
                  padding: const EdgeInsets.fromLTRB(10, 0, 0, 45),
                  onPressed: linkService.getMyTurn()
                      ? () {
                          setState(() {
                            inGameService.changePlayerTurn();
                            linkService.changeTurn();
                          });
                        }
                      : null)
            ],
          ))
    ]);
  }
}
