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

import '../classes/game.dart';
import '../components/board.dart';
import '../components/game_sidebar.dart';
import '../components/tile.dart';
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
  final RebuildController boardController = RebuildController();
  int numberOfLettersSelected = 0;
  List<int> letterIndexesToExchange = [];
  List<Widget> Avatars = [];
  String lettersPlaced = '';
  int drawer = 0;
  String serverMsg = '';
  List<String> hints = [];

  @override
  void initState() {
    super.initState();
    inGameService.configure();
    linkService.setIsInAGame(true);
    _configure();
  }

  _configure() {
    socketService.on(
        "message",
            (msg) => {
          serverMsg = Message.fromJson(msg).text,
          if(serverMsg.contains('Placement invalide')) {
            inGameService.handleBadPlacement(),
            setState(() {
              placementValidator.cancelPlacement();
              lettersPlaced = '';
              linkService.cancelPlacements();
              boardController.rebuild();
              linkService.resetRack();
            })
          }
          else if (serverMsg.contains('a effectué le placement suivant:')) {
            linkService.confirm(),
            linkService.resetRack(),
            lettersPlaced = '',
            placementValidator.cancelPlacement(),
          }
        });

    socketService.on(
        'hint',
            (data) => {
          hints =
              Message.fromJson(data).text.replaceAll("_", "-").split(' '),
          showDialog(
              context: context,
              builder: (context) {
                return Container(
                  width: 200,
                  height: 200,
                  child: AlertDialog(
                      title: Text("Choisissez un indice à prévisualiser: ",
                          style: TextStyle(
                            fontSize: 24,
                          )),
                      content: SizedBox(
                          width: 400,
                          height: 370,
                          child: ListView.builder(
                              itemCount: int.parse(hints[hints.length - 1]),
                              padding: EdgeInsets.fromLTRB(0, 0, 0, 500),
                              itemBuilder: (context, index) {
                                return Padding(
                                    padding: EdgeInsets.only(bottom: 20),
                                    child: SizedBox(
                                        height: 50,
                                        child: ElevatedButton(
                                          style: ElevatedButton.styleFrom(
                                            backgroundColor: Colors.white,
                                            shadowColor: Colors.black,
                                            elevation: 5,
                                            side: BorderSide(
                                                color: Colors.grey,
                                                width: 1.0,
                                                style: BorderStyle.solid),
                                          ),
                                          onPressed: () {
                                            lettersPlaced =
                                            hints[index].split("-")[1];
                                            serverPlacement(
                                                hints[index].split("-")[0],
                                                hints[index].split("-")[1]);
                                            Navigator.pop(context);
                                          },
                                          child: Text(
                                              "${hints[index].split("-")[1]} pour ${hints[index].split("-")[2]} points",
                                              style: TextStyle(
                                                color: Colors.black,
                                                fontSize: 18,
                                              )),
                                        )));
                              }))),
                );
              })
        });
  }

  int getTileScore(String letter) {
    if (letter == '' || letter == null || letter == '*') return 0;
    final normalLetter = letter.toLowerCase();
    if (normalLetter.toLowerCase() != normalLetter) return 0;
    return POINTS[letter.toLowerCase().codeUnits[0] - A_ASCII];
  }

  void addPlacement(int x, int y, String value, String letter, color) {
    placementValidator.addLetter(letter.toLowerCase(), x, y);
    if (!placementValidator.validPlacement) return;

    Container newSquare = Container(
        decoration: BoxDecoration(
          color: Color(0xFFFFEBCE),
          border: Border.all(
            color: const Color(0xFFFFFFFF),
            width: 1,
          ),
        ),
        child: Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(10),
              color: const Color(0xFFFFEBCE),
              border: Border.all(
                color: const Color(0xAA000000),
                width: 1,
              ),
            ),
            width: 43,
            height: 43,
            child: Stack(
              children: [
                Center(
                    child: Text(letter, style: const TextStyle(fontSize: 24))),
                Positioned(
                  child: Text(value, style: const TextStyle(fontSize: 10)),
                  bottom: 4.0,
                  right: 4.0,
                )
              ],
            )));
    setState(() {
      linkService.setRows(x, y, newSquare);
      linkService.removeLetter(Tile(letter: letter.toLowerCase(), index: getIndex(letter)));
    });
  }

  getIndex(String letter) {
    for (Tile tile in linkService.getRack()) {
      if (tile.letter == letter) return tile.index;
    }
  }

  void serverPlacement(String position, String word) {
    int y = (position[0].codeUnitAt(0) - 97);
    int x = -1;

    String direction = position[position.length - 1];
    if (position.length == 3)
      x = int.parse(position[1]) - 1;
    else
      x = int.parse(position.substring(1, 3)) - 1;
    List<String> letters = word.toUpperCase().split('');

    addPlacement(x, y, getTileScore(letters[0]).toString(), letters[0],
        Color(0xFFFFEBCE));
    letters.removeAt(0);

    if (letters.isEmpty) return;

    if (direction == 'h') {
      x = x + 1;
      for (int i = x; i < 15; i++) {
        final square = (linkService.getRows()[y] as Row).children[x];

        if (square.runtimeType.toString().contains('DragTarget')) {
          addPlacement(x, y, getTileScore(letters[0]).toString(), letters[0],
              Color(0xFFFFEBCE));
          letters.removeAt(0);
        }
        if (letters.isEmpty) break;
        x = x + 1;
      }
    } else if (direction == 'v') {
      y = y + 1;
      for (int i = y; i < 15; i++) {
        final square = (linkService.getRows()[y] as Row).children[x];

        if (square.runtimeType.toString().contains('DragTarget')) {
          addPlacement(x, y, getTileScore(letters[0]).toString(), letters[0],
              Color(0xFFFFEBCE));
          letters.removeAt(0);
        }
        if (letters.isEmpty) break;
        y = y + 1;
      }
    }
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
                    alertGamePage: updateLettersPlaced,
                  )),
            )
          ]),
          Column(children: [
            SizedBox(height: 10),
            FutureBuilder(
                future: gameService.getOpponentsInfo(),
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return GameHeaderWidget(
                      opponentsInfo: [],
                      resetLetters: resetLettersPlaced,
                    );
                  } else {
                    return GameHeaderWidget(
                      opponentsInfo: gameService.opponentsInfo,
                      resetLetters: resetLettersPlaced,
                    );
                  }
                }),
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
                        linkService.setWantToExchange(false);
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
                        print(command.letterIndexes);
                        linkService.resetRack();
                        letterIndexesToExchange.clear();
                        linkService.setWantToExchange(false);
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
                      linkService.cancelPlacements();
                      if (linkService.getMyTurn()) {
                        final PlacementCommand command = PlacementCommand(
                            position:
                            '${placementValidator.getRowLetter(
                                placementValidator
                                    .firstLetterPosition[1])}${placementValidator
                                .firstLetterPosition[0] + 1}',
                            direction: placementValidator.isHorizontal
                                ? 'h'
                                : 'v',
                            letter:
                            placementValidator.letters);

                        gameCommandService
                            .constructPlacementCommand(command);
                        setState(() {
                          linkService.resetRack();
                          lettersPlaced = '';
                          placementValidator.cancelPlacement();
                        });
                      }
                      else {
                        placementValidator.cancelPlacement();
                        linkService.resetRack();
                        lettersPlaced = '';
                      }
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

  resetLettersPlaced() {
    placementValidator.cancelPlacement();
    lettersPlaced = '';
    linkService.cancelPlacements();
    boardController.rebuild();
    linkService.resetRack();
  }
}

