import 'dart:async';
import 'package:client_leger/classes/command.dart';
import 'package:client_leger/components/drawer.dart';
import 'package:client_leger/components/objective_box.dart';
import 'package:client_leger/components/your_rack.dart';
import 'package:client_leger/main.dart';
import 'package:client_leger/services/link_service.dart';
import 'package:client_leger/services/multiplayer_game_service.dart';
import 'package:client_leger/services/placement_validator_service.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import '../components/avatar.dart';
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
  final scaffoldKey = GlobalKey<ScaffoldState>();
  final pageKey = GlobalKey<ScaffoldState>();
  final _unfocusNode = FocusNode();
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
    _configureSocket();
    setTimer();
    }

    _configureSocket() {
      socketService.on("playerTurnChanged", (currentPlayerTurnPseudo) =>
      {
        inGameService.player.isItsTurn = inGameService.player.pseudo == currentPlayerTurnPseudo,
        linkService.setTurn(inGameService.player.isItsTurn),
        _timer.cancel(),
        setTimer(),
      });

      socketService.on("timeUpdated", (room) => {
        gameService.room = gameService.decodeModel(room),
        timeChosen = int.parse(gameService.room.roomInfo.timerPerTurn) - gameService.room.elapsedTime,
      });
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

  setTimer() {
    timeChosen = int.parse(gameService.gameData.timerPerTurn);
    const oneSec = const Duration(seconds: 1);
    _timer = Timer.periodic(
      oneSec,
          (Timer timer) {
        if (timeChosen == 0) {
          setState(() {
            seconds = timeChosen%60;
            //check if timer reaches 0 and its my turn, then skip turn
            timerFormat = Duration(seconds: seconds).toString().substring(2,7);
            timer.cancel();
            if(linkService.getMyTurn()) inGameService.changePlayerTurn();
            Timer(const Duration(milliseconds: 500),
                (() =>  setTimer()));
          });
        } else {
          setState(() {
            minutes = timeChosen~/60;
            seconds = timeChosen%60;
            //only keep minutes and seconds
            timerFormat = Duration(minutes: minutes, seconds: seconds).toString().substring(2,7);
          });
        }
      },
    );
  }

  changeTurn() {
    setState(() {
      linkService.setTurn(!linkService.getMyTurn());
    });
  }

  @override
  void dispose() {
    _unfocusNode.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final mediaQuery = MediaQuery.of(context);
    final screenWidth = mediaQuery.size.width;
    final screenHeight = mediaQuery.size.height;
    return Scaffold(
        key: pageKey,
        backgroundColor: Color.fromRGBO(249, 255, 246, 1),
        drawer: drawer == 0 ? ChatDrawer() : UserResume(),
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
                        child:
                        Text("$timerFormat",
                            style:
                                TextStyle(fontSize: 24, color: Colors.black))
                    )
                ),
              ),
              SizedBox(
                width: 40,
              ),
              //TODO : put number of observers
              Text("10",
                style: TextStyle(
                  fontSize: 20,
                )
              ),
              SizedBox(width: 10),
              Icon(Icons.remove_red_eye_rounded, size: 40)
            ]),
            SizedBox(height: 20),
            Row(
              children:[
                Column(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      GestureDetector(
                        onTap: () {
                          setState(() =>
                          {
                            drawer = 1,
                            pageKey.currentState?.openDrawer(),
                          });
                        },
                        child:
                        Avatar(),
                      ),
                      SizedBox(height: 10),
                      //TODO get scores
                      Text("${inGameService.getPlayer(authenticator.getCurrentUser().username).points}", style: TextStyle(fontSize: 14, color: Colors.black)),
                      SizedBox(width: 10),
                    ]
                ),
                Column(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      GestureDetector(
                        onTap: () {
                          setState(() =>
                          {
                            drawer = 1,
                            pageKey.currentState?.openDrawer(),
                          });
                        },
                        child:
                        Avatar(),
                      ),
                      SizedBox(height: 10),
                      Text("251", style: TextStyle(fontSize: 14, color: Colors.black)),
                      SizedBox(width: 10),
                    ]
                ),
                Column(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      GestureDetector(
                        onTap: () {
                          setState(() =>
                          {
                            drawer = 1,
                            pageKey.currentState?.openDrawer(),
                          });
                        },
                        child:
                        Avatar(),
                      ),
                      SizedBox(height: 10),
                      Text("251", style: TextStyle(fontSize: 14, color: Colors.black)),
                      SizedBox(width: 10),
                    ]
                ),
                Column(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      GestureDetector(
                        onTap: () {
                          setState(() =>
                          {
                            drawer = 1,
                            pageKey.currentState?.openDrawer(),
                          });
                        },
                        child:
                        Avatar(),
                      ),
                      SizedBox(height: 10),
                      Text("251", style: TextStyle(fontSize: 14, color: Colors.black)),
                      SizedBox(width: 10),
                    ]
                ),
        IconButton(
            color: Palette.mainColor,
            disabledColor: Colors.grey,
            icon: Icon(
              Icons.double_arrow_rounded,
              size: 50,
            ),
            padding: EdgeInsets.fromLTRB(10, 0, 0, 45),
            onPressed: linkService.getMyTurn() ?
                () {
              setState(() {
                inGameService.changePlayerTurn();
                linkService.changeTurn();
                setTimer();
              });
            }
                : null
        )
              ]
                ),
            SizedBox(height: 10),
            ObjectiveBox(),
            SizedBox(height: 32),
            YourRack(tileChange: tileChange),
            SizedBox(height: 16),
            if (letterIndexesToExchange.length != 0)
              Row(
                children: [
                  ElevatedButton(
                    onPressed: () => {
                      setState(() {
                        letterIndexesToExchange.clear();
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
                    onPressed: () {
                      setState(() {
                        final PlacementCommand command = PlacementCommand(
                            position:
                                '${placementValidator.firstLetterPosition[0]}${placementValidator.firstLetterPosition[1]}',
                            direction:
                                placementValidator.isHorizontal ? 'h' : 'v',
                            letter: placementValidator.letters);
                        gameCommandService.constructPlacementCommand(command);
                        linkService.resetRack();
                        lettersPlaced = '';
                        placementValidator.cancelPlacement();
                        linkService.confirm();
                      });
                    },
                    style: ButtonStyle(
                        backgroundColor: const MaterialStatePropertyAll<Color>(
                            Palette.mainColor)),
                    child: Text('Confirmer le placement'),
                  )
                ],
              )
          ])
        ]));
  }
}
