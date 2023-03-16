import 'dart:async';

import 'package:client_leger/classes/command.dart';
import 'package:client_leger/components/drawer.dart';
import 'package:client_leger/components/game_header.dart';
import 'package:client_leger/components/objective_box.dart';
import 'package:client_leger/components/your_rack.dart';
import 'package:client_leger/main.dart';
import 'package:client_leger/services/link_service.dart';
import 'package:client_leger/services/multiplayer_game_service.dart';
import 'package:client_leger/services/placement_validator_service.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

import '../components/board.dart';
import '../components/game_sidebar.dart';
import '../components/user_resume.dart';
import '../config/colors.dart';
import '../services/game_command_service.dart';
import '../services/in_game_service.dart';

final linkService = LinkService();
final gameCommandService = GameCommandService();
final placementValidator = PlacementValidatorService(gameCommandService);
final inGameService = InGameService(gameData: gameService.gameData);
final MultiplayerGameService myService = gameService;

class GamePageWidget extends StatefulWidget {
  const GamePageWidget({Key? key}) : super(key: key);

  @override
  _GamePageWidgetState createState() => _GamePageWidgetState();
}

class _GamePageWidgetState extends State<GamePageWidget> {
  final _unfocusNode = FocusNode();
  final scaffoldKey = GlobalKey<ScaffoldState>();
  int numberOfLettersSelected = 0;
  List<int> letterIndexesToExchange = [];
  List<Widget> Avatars = [];
  String lettersPlaced = '';
  int drawer = 0;
  int timeChosen = int.parse(gameService.gameData.timerPerTurn);
  String timerFormat = '00:00';
  late Timer _timer;
  late int minutes;
  late int seconds;

  @override
  void initState() {
    super.initState();
    inGameService.configure();
  }

  tileChange(int letterIndex) {
    setState(() {
      if (letterIndexesToExchange.contains(letterIndex)) {
        letterIndexesToExchange.remove(letterIndex);
      } else {
        letterIndexesToExchange.add(letterIndex);
      }
    });
  }

  updateLettersPlaced(String letters) {
    setState(() {
      lettersPlaced = letters;
    });
  }

  // setTimer() {
  //   placementValidator.cancelPlacement();
  //   linkService.cancelPlacements();
  //   linkService.resetRack();
  //   timeChosen = int.parse(gameService.gameData.timerPerTurn);
  //   const oneSec = const Duration(seconds: 1);
  //   _timer = Timer.periodic(
  //     oneSec,
  //     (Timer timer) {
  //       if (timeChosen == 0) {
  //         setState(() {
  //           seconds = timeChosen % 60;
  //           //check if timer reaches 0 and its my turn, then skip turn
  //           timerFormat = Duration(seconds: seconds).toString().substring(2, 7);
  //           timer.cancel();
  //           if (linkService.getMyTurn()) inGameService.changePlayerTurn();
  //           Timer(const Duration(milliseconds: 500), (() => setTimer()));
  //         });
  //       } else {
  //         setState(() {
  //           minutes = timeChosen ~/ 60;
  //           seconds = timeChosen % 60;
  //           //only keep minutes and seconds
  //           timerFormat = Duration(minutes: minutes, seconds: seconds)
  //               .toString()
  //               .substring(2, 7);
  //         });
  //       }
  //     },
  //   );
  // }

  changeTurn() {
    setState(() {
      linkService.setTurn(!linkService.getMyTurn());
    });
  }

  @override
  void dispose() {
    _unfocusNode.dispose();
    _timer.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final mediaQuery = MediaQuery.of(context);
    final screenWidth = mediaQuery.size.width;
    final screenHeight = mediaQuery.size.height;
    return Scaffold(
        //key: scaffoldKey,
        backgroundColor: Color.fromRGBO(249, 255, 246, 1),
        drawer: ChatDrawer(),
        endDrawer: UserResume(),
        onDrawerChanged: (isOpen) {
          // write your callback implementation here
          if (!isOpen)
            Timer(Duration(milliseconds: 250), () {
              setState(() {
                drawer = 0;
              });
            });
        },
        body: Row(children: [
          GameSidebar(),
          Column(children: [
            Container(
              width: screenWidth * 0.65,
              height: screenHeight,
              child: RebuildWrapper(
                  controller: boardController,
                  child: Board(
                    key: scaffoldKey,
                    alertGamePage: updateLettersPlaced,
                  )),
            )
          ]),
          Column(children: [
            SizedBox(height: 10),
            GameHeaderWidget(),
            SizedBox(height: 10),
            ObjectiveBox(),
            SizedBox(height: 32),
            YourRack(tileChange: tileChange),
            SizedBox(height: 16),
            if (letterIndexesToExchange.length != 0 && lettersPlaced == '')
              Row(
                children: [
                  ElevatedButton(
                    onPressed: () => {
                      setState(() {
                        letterIndexesToExchange.clear();
                        linkService.resetRack();
                        //linkService.changeExchangeBool();
                      })
                    },
                    style: ButtonStyle(
                        backgroundColor:
                            MaterialStatePropertyAll<Color>(Color(0xFFFF4C4C))),
                    child: Text('Annuler'),
                  ),
                  SizedBox(
                    width: 24,
                  ),
                  ElevatedButton(
                    onPressed: () {
                      setState(() {
                        final ExchangeCommand command = ExchangeCommand(
                            letterIndexes: letterIndexesToExchange);
                        gameCommandService.constructExchangeCommand(command);
                        linkService.resetRack();
                        letterIndexesToExchange.clear();
                      });
                    },
                    style: ButtonStyle(
                        backgroundColor: const MaterialStatePropertyAll<Color>(
                            Palette.mainColor)),
                    child: Text('Échanger'),
                  )
                ],
              ),
            if (lettersPlaced != '')
              Row(
                children: [
                  ElevatedButton(
                    onPressed: () => {
                      setState(() {
                        placementValidator.cancelPlacement();
                        lettersPlaced = '';
                        linkService.cancelPlacements();
                        boardController.rebuild();
                        linkService.resetRack();
                      })
                    },
                    style: ButtonStyle(
                        backgroundColor:
                            MaterialStatePropertyAll<Color>(Color(0xFFFF4C4C))),
                    child: Text('Annuler'),
                  ),
                  SizedBox(
                    width: 24,
                  ),
                  ElevatedButton(
                    onPressed: linkService.getMyTurn()
                        ? () {
                            setState(() {
                              final PlacementCommand command = PlacementCommand(
                                  position:
                                      '${placementValidator.getRowLetter(placementValidator.firstLetterPosition[1])}${placementValidator.firstLetterPosition[0] + 1}',
                                  direction: placementValidator.isHorizontal
                                      ? 'h'
                                      : 'v',
                                  letter:
                                      placementValidator.letters.toLowerCase());
                              gameCommandService
                                  .constructPlacementCommand(command);
                              linkService.resetRack();
                              lettersPlaced = '';
                              placementValidator.cancelPlacement();
                              linkService.confirm();
                            });
                          }
                        : null,
                    style: ElevatedButton.styleFrom(
                        backgroundColor: Palette.mainColor,
                        disabledBackgroundColor: Colors.grey),
                    child: Text('Confirmer le placement'),
                  )
                ],
              )
          ])
        ]));
  }
}
