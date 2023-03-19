import 'dart:async';

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

import '../classes/game.dart';
import '../config/colors.dart';
import '../pages/game_page.dart';
import '../services/link_service.dart';
import 'avatar.dart';

class GameHeaderWidget extends StatefulWidget {
  final List<Account> opponentsInfo;
  final VoidCallback resetLetters;
  const GameHeaderWidget(
      {Key? key, required this.resetLetters, required this.opponentsInfo})
      : super(key: key);

  @override
  _GameHeaderWidgetState createState() => _GameHeaderWidgetState();
}

class _GameHeaderWidgetState extends State<GameHeaderWidget> {
  final scaffoldKey = GlobalKey<ScaffoldState>();
  int timeChosen = int.parse(gameService.room.roomInfo.timerPerTurn);
  String timerFormat = '00:00';
  late Timer _timer;
  late int minutes;
  late int seconds;
  bool alreadyReceived = false;

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
              inGameService.player.isItsTurn = inGameService.player.pseudo
                      .compareTo(currentPlayerTurnPseudo) ==
                  0,
              linkService.setTurn(inGameService.player.isItsTurn),
              widget.resetLetters(),
              _timer.cancel(),
              setTimer(),
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
            Timer(const Duration(milliseconds: 500), (() => setTimer()));
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
              color: Colors.black,
              fontFamily: 'Nunito',
              fontSize: 24,
            )),
        const SizedBox(
          width: 85,
        ),
        Container(
          decoration: BoxDecoration(
            border: Border.all(
              color: Colors.black,
              width: 2,
            ),
          ),
          child: SizedBox(
              width: 100,
              height: 40,
              child: Center(
                  child: Text("$timerFormat",
                      style:
                          const TextStyle(fontSize: 24, color: Colors.black)))),
        ),
        const SizedBox(
          width: 40,
        ),
        //TODO : put number of observers
        const Text("10",
            style: TextStyle(
              fontSize: 20,
            )),
        const Icon(Icons.remove_red_eye_rounded, size: 40)
      ]),
      const SizedBox(height: 10),
      // TODO: Check if sizedbox is better
      Container(
          width: MediaQuery.of(context).size.width * 0.2,
          height: MediaQuery.of(context).size.height * 0.125,
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
                          Avatar(
                              url: widget
                                  .opponentsInfo[index].userSettings.avatarUrl),
                          const SizedBox(height: 10),
                          Text('${gameService.room.players[index].points}',
                              style: const TextStyle(
                                  fontSize: 14, color: Colors.black)),
                          const SizedBox(width: 10),
                        ]);
                  }
                },
                itemCount: gameService.room.players.length,
                reverse: false,
                padding: const EdgeInsets.all(6.0),
              )),
              IconButton(
                  color: Palette.mainColor,
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
