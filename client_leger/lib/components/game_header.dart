import 'dart:async';

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

import '../config/colors.dart';
import '../pages/game_page.dart';
import '../services/link_service.dart';
import 'avatar.dart';

class GameHeaderWidget extends StatefulWidget {
  const GameHeaderWidget({Key? key}) : super(key: key);

  @override
  _GameHeaderWidgetState createState() => _GameHeaderWidgetState();
}

class _GameHeaderWidgetState extends State<GameHeaderWidget> {
  final scaffoldKey = GlobalKey<ScaffoldState>();
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
        "playerTurnChanged",
        (currentPlayerTurnPseudo) => {
              inGameService.player.isItsTurn =
                  inGameService.player.pseudo == currentPlayerTurnPseudo,
              linkService.setTurn(inGameService.player.isItsTurn),
              _timer.cancel(),
              setTimer(),
            });
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
    // TODO: implement build
    timeChosen = int.parse(gameService.gameData.timerPerTurn);
    const oneSec = const Duration(seconds: 1);
    return Column(children: [
      Row(mainAxisAlignment: MainAxisAlignment.center, children: [
        Icon(Icons.filter_none, size: 32),
        Text(' ${linkService.getLetterBankCount()}',
            style: TextStyle(
              color: Colors.black,
              fontFamily: 'Nunito',
              fontSize: 24,
            )),
        SizedBox(
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
                      style: TextStyle(fontSize: 24, color: Colors.black)))),
        ),
        SizedBox(
          width: 40,
        ),
        //TODO : put number of observers
        Text("10",
            style: TextStyle(
              fontSize: 20,
            )),
        SizedBox(width: 10),
        Icon(Icons.remove_red_eye_rounded, size: 40)
      ]),
      SizedBox(height: 20),
      Row(children: [
        Column(crossAxisAlignment: CrossAxisAlignment.center, children: [
          GestureDetector(
            onTap: () {
              setState(() => {
                    scaffoldKey.currentState?.openEndDrawer(),
                  });
            },
            child: Avatar(),
          ),
          SizedBox(height: 10),
          //TODO get scores
          Text("251", style: TextStyle(fontSize: 14, color: Colors.black)),
          SizedBox(width: 10),
        ]),
        Column(crossAxisAlignment: CrossAxisAlignment.center, children: [
          GestureDetector(
            onTap: () {
              setState(() => {
                    scaffoldKey.currentState?.openEndDrawer(),
                  });
            },
            child: Avatar(),
          ),
          SizedBox(height: 10),
          Text("251", style: TextStyle(fontSize: 14, color: Colors.black)),
          SizedBox(width: 10),
        ]),
        Column(crossAxisAlignment: CrossAxisAlignment.center, children: [
          GestureDetector(
            onTap: () {
              setState(() => {
                    scaffoldKey.currentState?.openEndDrawer(),
                  });
            },
            child: Avatar(),
          ),
          SizedBox(height: 10),
          Text("251", style: TextStyle(fontSize: 14, color: Colors.black)),
          SizedBox(width: 10),
        ]),
        Column(crossAxisAlignment: CrossAxisAlignment.center, children: [
          GestureDetector(
            onTap: () {
              setState(() => {
                    scaffoldKey.currentState?.openEndDrawer(),
                  });
            },
            child: Avatar(),
          ),
          SizedBox(height: 10),
          Text("251", style: TextStyle(fontSize: 14, color: Colors.black)),
          SizedBox(width: 10),
        ]),
        IconButton(
            color: Palette.mainColor,
            disabledColor: Colors.grey,
            icon: Icon(
              Icons.double_arrow_rounded,
              size: 50,
            ),
            padding: EdgeInsets.fromLTRB(10, 0, 0, 45),
            onPressed: linkService.getMyTurn()
                ? () {
                    setState(() {
                      inGameService.changePlayerTurn();
                      linkService.changeTurn();
                      //setTimer();
                    });
                  }
                : null)
      ]),
    ]);
  }
}
