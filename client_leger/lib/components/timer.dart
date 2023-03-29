import 'dart:async';

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

import '../pages/game_page.dart';
import '../services/link_service.dart';

class TimerWidget extends StatefulWidget {
  const TimerWidget({Key? key}) : super(key: key);

  @override
  _TimerWidgetState createState() => _TimerWidgetState();
}

class _TimerWidgetState extends State<TimerWidget> {
  int timeChosen = int.parse(gameService.gameData.timerPerTurn);
  String timerFormat = '00:00';
  late Timer _timer;
  late int minutes;
  late int seconds;

  @override
  void initState() {
    super.initState();
    configure();
    setTimer();
  }

  configure() {
    socketService.on(
        "timeUpdated",
        (room) => {
              gameService.room = gameService.decodeModel(room),
              timeChosen = int.parse(gameService.room.roomInfo.timerPerTurn) -
                  gameService.room.elapsedTime,
            });
  }

  setTimer() {
    placementValidator.cancelPlacement();
    linkService.cancelPlacements();
    linkService.resetRack();
    timeChosen = int.parse(gameService.gameData.timerPerTurn);
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
    // TODO: implement build
    timeChosen = int.parse(gameService.gameData.timerPerTurn);
    const oneSec = const Duration(seconds: 1);
    return SizedBox(
        width: 100,
        height: 40,
        child: Center(
            child: Text("$timerFormat",
                style: TextStyle(fontSize: 24, color: Colors.black))));
  }
}
