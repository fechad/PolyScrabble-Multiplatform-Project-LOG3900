import 'dart:math';

import 'package:client_leger/classes/game.dart';
import 'package:client_leger/components/tile.dart';
import 'package:client_leger/pages/game_page.dart';
import 'package:confetti/confetti.dart';
import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localization.dart';
import '../main.dart';
import '../services/link_service.dart';

typedef StringCallback = void Function(String);

class Board extends StatefulWidget {
  final StringCallback alertGamePage;
  final bool isObserver;

  Board({Key? key, required this.alertGamePage, required this.isObserver}) : super(key: key);
  @override
  _BoardState createState() => _BoardState(isObserver: isObserver, alertGamePage: alertGamePage);
}

class _BoardState extends State<Board> {
  _BoardState({required this.isObserver, required this.alertGamePage});
  final StringCallback alertGamePage;
  final bool isObserver;
  bool dropped = false;
  List<Widget> tiles = [];
  List<Widget> rows = [];
  List<String> word_3x = [
    "0-0",
    "7-0",
    "14-0",
    "0-7",
    "14-7",
    "0-14",
    "7-14",
    "14-14"
  ];
  List<String> word_2x = [
    "7-7",
    "1-1",
    "2-2",
    "3-3",
    "4-4",
    "10-10",
    "11-11",
    "12-12",
    "13-13",
    "1-13",
    "2-12",
    "3-11",
    "4-10",
    "13-1",
    "12-2",
    "11-3",
    "10-4"
  ];
  List<String> letter_3x = [
    "1-5",
    "1-9",
    "5-1",
    "5-5",
    "5-9",
    "5-13",
    "9-1",
    "9-5",
    "9-9",
    "9-13",
    "13-5",
    "13-9"
  ];
  List<String> letter_2x = [
    "3-0",
    "11-0",
    "6-2",
    "8-2",
    "0-3",
    "7-3",
    "14-3",
    "2-6",
    "6-6",
    "8-6",
    "12-6",
    "3-7",
    "11-7",
    "2-8",
    "6-8",
    "8-8",
    "12-8",
    "0-11",
    "7-11",
    "14-11",
    "6-12",
    "8-12",
    "3-14",
    "11-14"
  ];

  late PlacementData placementData;
  ConfettiController _controllerCenter = ConfettiController(duration: const Duration(seconds: 10));

  @override
  void initState() {
    super.initState();
    constructBoard();
    _configureSocket();
  }

  @override
  void dispose() {
    _controllerCenter.dispose();
    super.dispose();
  }

  _configureSocket() {
    socketService.on(
        "drawBoard",
        (data) => {
              placementData = PlacementData.fromJson(data),
              serverPlacement(placementData)
            });

    socketService.on(
        "gameIsOver",
            (data) => {
            inGameService.findWinner(gameService.decodePlayers(data)),
            if (inGameService.winnerPseudo == authenticator.getCurrentUser().username){
              _controllerCenter.play(),
            }
            else {
              showDialog(
                  barrierDismissible: true,
                  context: context,
                  builder: (context) {
                    return AlertDialog(
                      title: Text(AppLocalizations.of(context)!.endGame),
                      content: Text(
                          "${AppLocalizations.of(context)!.endGameText}${inGameService.winnerPseudo}"),
                      actions: [
                        ElevatedButton(
                            onPressed: () => {
                              Navigator.pop(context)
                            },
                            child: Text("OK"),
                            style: ElevatedButton.styleFrom(
                              backgroundColor:
                              themeManager.themeMode == ThemeMode.light
                                  ? Color.fromARGB(255, 125, 175, 107)
                                  : Color.fromARGB(255, 121, 101, 220),
                              textStyle: const TextStyle(fontSize: 20),
                            )),
                      ],
                    );
                  })
            }
        });

    if (gameService.room.placementsData != null && isObserver) {
      for (var placement in gameService.room.placementsData!) {
        serverPlacement(PlacementData(word: placement.word, row: placement.row, column: placement.column, direction: placement.direction, ));
      }
    }
  }

  void constructBoard() {
    for (int j = 0; j < 15; j++) {
      for (int i = 0; i < 15; i++) {
        tiles.add(Container());
      }
      linkService.getRows().add(
          Row(mainAxisAlignment: MainAxisAlignment.center, children: tiles));
      tiles = [];
      for (int i = 0; i < 15; i++) {
        colorTile(i, j);
      }
    }
  }

  int getTileScore(String letter) {
    if (letter == ' ' || letter == null || letter == '*') return 0;
    final normalLetter = letter.toLowerCase();
    if (normalLetter.toLowerCase() != normalLetter) return 0;
    return POINTS[letter.toLowerCase().codeUnits[0] - A_ASCII];
  }

  void addPlacement(int x, int y, String value, String letter, color) {
    Container newSquare = Container(
        decoration: BoxDecoration(
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
                    child: Text(letter,
                        style: const TextStyle(
                            fontSize: 24, color: Colors.black))),
                Positioned(
                  child: Text(value,
                      style:
                          const TextStyle(fontSize: 10, color: Colors.black)),
                  bottom: 4.0,
                  right: 4.0,
                )
              ],
            )));
    setState(() {
      (linkService.getRows()[y] as Row).children[x] = newSquare;
    });
  }

  void serverPlacement(PlacementData placement) {
    int y = (placement.row.codeUnitAt(0) - 97);
    int x = placement.column - 1;
    List<String> letters = placement.word.toUpperCase().split('');

    addPlacement(
        x,
        y,
        getTileScore(letters[0]).toString(),
        letters[0],
        themeManager.themeMode == ThemeMode.light
            ? Color.fromARGB(255, 255, 235, 206)
            : Color.fromARGB(255, 64, 64, 64));
    letters.removeAt(0);

    if (letters.isEmpty) return;

    if (placement.direction == 'h') {
      x = x + 1;
      for (int i = x; i < 15; i++) {
        final square = (linkService.getRows()[y] as Row).children[x];

        if (square.runtimeType.toString().contains('DragTarget')) {
          addPlacement(
              x,
              y,
              getTileScore(letters[0]).toString(),
              letters[0],
              themeManager.themeMode == ThemeMode.light
                  ? Color.fromARGB(255, 255, 235, 206)
                  : Color.fromARGB(255, 64, 64, 64));
          letters.removeAt(0);
        }
        if (letters.isEmpty) break;
        x = x + 1;
      }
    } else if (placement.direction == 'v') {
      y = y + 1;
      for (int i = y; i < 15; i++) {
        final square = (linkService.getRows()[y] as Row).children[x];

        if (square.runtimeType.toString().contains('DragTarget')) {
          addPlacement(
              x,
              y,
              getTileScore(letters[0]).toString(),
              letters[0],
              themeManager.themeMode == ThemeMode.light
                  ? Color.fromARGB(255, 255, 235, 206)
                  : Color.fromARGB(255, 64, 64, 64));
          letters.removeAt(0);
        }
        if (letters.isEmpty) break;
        y = y + 1;
      }
    }
  }

  void placeTile(
      int x, int y, String? value, String? letter, int? index, color) {
    if (letter == '*') {
      showDialog(
          barrierDismissible: false,
          context: context,
          builder: (context) {
            return Container(
              width: 200,
              height: 200,
              child: AlertDialog(
                  title: Text("Choisissez la lettre: ",
                      style: TextStyle(
                        fontSize: 24,
                      )),
                  content: SizedBox(
                      width: 400,
                      height: 370,
                      child: GridView.builder(
                          gridDelegate:
                              SliverGridDelegateWithFixedCrossAxisCount(
                                  crossAxisCount: 5,
                                  mainAxisSpacing: 30,
                                  crossAxisSpacing: 30,
                                  mainAxisExtent: 80),
                          itemCount: 26,
                          padding: EdgeInsets.fromLTRB(0, 0, 0, 500),
                          itemBuilder: (context, index) {
                            return Padding(
                                padding: EdgeInsets.only(bottom: 20),
                                child: SizedBox(
                                    height: 50,
                                    width: 50,
                                    child: ElevatedButton(
                                      style: ElevatedButton.styleFrom(
                                        shape: RoundedRectangleBorder(
                                          borderRadius:
                                              BorderRadius.circular(10),
                                        ),
                                        backgroundColor: Color(0xFFFFEBCE),
                                        side: BorderSide(
                                            color: Colors.black,
                                            width: 1.0,
                                            style: BorderStyle.solid),
                                      ),
                                      onPressed: () {
                                        letter =
                                            String.fromCharCode(index + 65);
                                        placementValidator.addLetter(letter!, x, y);
                                        if (!placementValidator.validPlacement) return;
                                        Container square = Container(
                                            decoration: BoxDecoration(
                                              color: color,
                                              border: Border.all(
                                                color: const Color(0xFFFFFFFF),
                                                width: 1,
                                              ),
                                            ),
                                            child: Container(
                                                decoration: BoxDecoration(
                                                  borderRadius:
                                                      BorderRadius.circular(10),
                                                  color:
                                                      const Color(0xFFFFEBCE),
                                                  border: Border.all(
                                                    color:
                                                        const Color(0xAA000000),
                                                    width: 1,
                                                  ),
                                                ),
                                                width: 43,
                                                height: 43,
                                                child: Stack(
                                                  children: [
                                                    Center(
                                                        child: Text(letter!,
                                                            style: const TextStyle(
                                                                fontSize: 24,
                                                                color: Colors
                                                                    .black))),
                                                    Positioned(
                                                      child: Text(value!,
                                                          style:
                                                              const TextStyle(
                                                                  fontSize: 10,
                                                                  color: Colors
                                                                      .black)),
                                                      bottom: 4.0,
                                                      right: 4.0,
                                                    )
                                                  ],
                                                )));
                                        Navigator.pop(context);

                                        setState(() {
                                          linkService.setRows(x, y, square);
                                          linkService.removeLetter(Tile(
                                              letter: letter!, index: index!));
                                          String confirmedLetters =
                                              placementValidator.letters
                                                  .toLowerCase()
                                                  .replaceFirst('*', letter!);
                                          placementValidator.letters =
                                              confirmedLetters;
                                          alertGamePage(
                                              placementValidator.letters);
                                        });
                                      },
                                      child: Text(
                                          "${String.fromCharCode(index + 65)}",
                                          style: TextStyle(
                                            color: Colors.black,
                                            fontSize: 18,
                                          )),
                                    )));
                          }))),
            );
          });
    } else {
      placementValidator.addLetter(letter!.toLowerCase(), x, y);
      if (!placementValidator.validPlacement) return;
      Container square = Container(
          decoration: BoxDecoration(
            color: color,
            border: Border.all(
              color: placementValidator.letters.length == 1 ? Colors.red : Colors.white,
              width: placementValidator.letters.length == 1 ? 2 : 1,
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
                      child: Text(letter!,
                          style: const TextStyle(
                              fontSize: 24, color: Colors.black))),
                  Positioned(
                    child: Text(value!,
                        style:
                            const TextStyle(fontSize: 10, color: Colors.black)),
                    bottom: 4.0,
                    right: 4.0,
                  )
                ],
              )));

      setState(() {
        linkService.setRows(x, y, square);
        linkService
            .removeLetter(Tile(letter: letter!.toLowerCase(), index: index!));
        alertGamePage(placementValidator.letters);
      });
    }
  }

  void colorTile(int x, int y) {
    if (word_3x.contains(x.toString() + "-" + y.toString()))
      (linkService.getRows()[y] as Row).children[x] = DragTarget<Map>(
        builder: (context, List<Map<dynamic, dynamic>?> candidateData,
            rejectedData) {
          return Container(
              height: 45,
              width: 45,
              decoration: BoxDecoration(
                color: candidateData.isEmpty
                    ? themeManager.themeMode == ThemeMode.light
                        ? Color.fromARGB(255, 232, 161, 161)
                        : Color.fromARGB(255, 255, 100, 100)
                    : themeManager.themeMode == ThemeMode.light
                        ? Color.fromARGB(255, 255, 235, 206)
                        : Color.fromARGB(255, 64, 64, 64),
                border: Border.all(
                  color: Color(0xFFFFFFFF),
                  width: 0.5,
                ),
              ),
              child: Center(
                  child: Text(
                'Mot x3',
                style: TextStyle(fontSize: 10, color: Colors.white),
              )));
        },
        onAccept: (data) {
          setState(() {
            placeTile(
                x,
                y,
                data["value"],
                data["letter"],
                data['index'],
                themeManager.themeMode == ThemeMode.light
                    ? Color.fromARGB(255, 232, 161, 161)
                    : Color.fromARGB(255, 255, 100, 100));
          });
        },
      );
    else if (word_2x.contains(x.toString() + "-" + y.toString()))
      (linkService.getRows()[y] as Row).children[x] = DragTarget<Map>(
        builder: (context, List<Map<dynamic, dynamic>?> candidateData,
            rejectedData) {
          return Container(
              height: 45,
              width: 45,
              decoration: BoxDecoration(
                color: candidateData.isEmpty
                    ? themeManager.themeMode == ThemeMode.light
                        ? Color.fromARGB(255, 255, 199, 199)
                        : Color.fromARGB(255, 255, 131, 131)
                    : themeManager.themeMode == ThemeMode.light
                        ? Color.fromARGB(255, 255, 235, 206)
                        : Color.fromARGB(255, 64, 64, 64),
                border: Border.all(
                  color: Color(0xFFFFFFFF),
                  width: 0.5,
                ),
              ),
              child: Center(
                  child: Text(
                'Mot x2',
                style: TextStyle(fontSize: 10, color: Colors.white),
              )));
        },
        onAccept: (data) {
          setState(() {
            placeTile(
                x,
                y,
                data["value"],
                data["letter"],
                data['index'],
                themeManager.themeMode == ThemeMode.light
                    ? Color.fromARGB(255, 255, 199, 199)
                    : Color.fromARGB(255, 255, 131, 131));
          });
        },
      );
    else if (letter_3x.contains(x.toString() + "-" + y.toString()))
      (linkService.getRows()[y] as Row).children[x] = DragTarget<Map>(
        builder: (context, List<Map<dynamic, dynamic>?> candidateData,
            rejectedData) {
          return Container(
              height: 45,
              width: 45,
              decoration: BoxDecoration(
                color: candidateData.isEmpty
                    ? themeManager.themeMode == ThemeMode.light
                        ? Color.fromARGB(255, 168, 187, 255)
                        : Color.fromARGB(255, 111, 138, 237)
                    : themeManager.themeMode == ThemeMode.light
                        ? Color.fromARGB(255, 255, 235, 206)
                        : Color.fromARGB(255, 64, 64, 64),
                border: Border.all(
                  color: Color(0xFFFFFFFF),
                  width: 0.5,
                ),
              ),
              child: Center(
                  child: Text(
                'Lettre x3',
                style: TextStyle(fontSize: 10, color: Colors.white),
              )));
        },
        onAccept: (data) {
          setState(() {
            placeTile(
                x,
                y,
                data["value"],
                data["letter"],
                data['index'],
                themeManager.themeMode == ThemeMode.light
                    ? Color.fromARGB(255, 168, 187, 255)
                    : Color.fromARGB(255, 111, 138, 237));
          });
        },
      );
    else if (letter_2x.contains(x.toString() + "-" + y.toString()))
      (linkService.getRows()[y] as Row).children[x] = DragTarget<Map>(
        builder: (context, List<Map<dynamic, dynamic>?> candidateData,
            rejectedData) {
          return Container(
              height: 45,
              width: 45,
              decoration: BoxDecoration(
                color: candidateData.isEmpty
                    ? themeManager.themeMode == ThemeMode.light
                        ? Color.fromARGB(255, 187, 190, 202)
                        : Color.fromARGB(255, 189, 192, 255)
                    : themeManager.themeMode == ThemeMode.light
                        ? Color.fromARGB(255, 255, 235, 206)
                        : Color.fromARGB(255, 64, 64, 64),
                border: Border.all(
                  color: Color(0xFFFFFFFF),
                  width: 0.5,
                ),
              ),
              child: Center(
                  child: Text(
                'Lettre x2',
                style: TextStyle(fontSize: 10, color: Colors.white),
              )));
        },
        onAccept: (data) {
          setState(() {
            placeTile(
                x,
                y,
                data["value"],
                data["letter"],
                data['index'],
                themeManager.themeMode == ThemeMode.light
                    ? Color.fromARGB(255, 187, 190, 202)
                    : Color.fromARGB(255, 189, 192, 255));
          });
        },
      );
    else
      (linkService.getRows()[y] as Row).children[x] = DragTarget<Map>(
        builder: (context, List<Map<dynamic, dynamic>?> candidateData,
            rejectedData) {
          return Container(
            height: 45,
            width: 45,
            decoration: BoxDecoration(
              color: candidateData.isEmpty
                  ? themeManager.themeMode == ThemeMode.light
                      ? Color.fromARGB(255, 255, 235, 206)
                      : Color.fromARGB(255, 64, 64, 64)
                  : themeManager.themeMode == ThemeMode.light
                      ? Color.fromARGB(255, 255, 235, 206)
                      : Color.fromARGB(255, 64, 64, 64),
              border: Border.all(
                color: Color(0xFFFFFFFF),
                width: 0.5,
              ),
            ),
          );
        },
        onAccept: (data) {
          setState(() {
            placeTile(
                x,
                y,
                data["value"],
                data["letter"],
                data['index'],
                themeManager.themeMode == ThemeMode.light
                    ? Color.fromARGB(255, 255, 235, 206)
                    : Color.fromARGB(255, 64, 64, 64));
          });
        },
      );
  }

  Path drawStar(Size size) {
    // Method to convert degree to radians
    double degToRad(double deg) => deg * (pi / 180.0);

    const numberOfPoints = 5;
    final halfWidth = size.width / 2;
    final externalRadius = halfWidth;
    final internalRadius = halfWidth / 2.5;
    final degreesPerStep = degToRad(360 / numberOfPoints);
    final halfDegreesPerStep = degreesPerStep / 2;
    final path = Path();
    final fullAngle = degToRad(360);
    path.moveTo(size.width, halfWidth);

    for (double step = 0; step < fullAngle; step += degreesPerStep) {
      path.lineTo(halfWidth + externalRadius * cos(step),
          halfWidth + externalRadius * sin(step));
      path.lineTo(halfWidth + internalRadius * cos(step + halfDegreesPerStep),
          halfWidth + internalRadius * sin(step + halfDegreesPerStep));
    }
    path.close();
    return path;
  }
  //(rows[0] as Row).children[0] to access a children
  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
      Column(
        key: GlobalKey<ScaffoldState>(),
        mainAxisAlignment: MainAxisAlignment.center,
        children: linkService.getRows()),
        Align(
            alignment: Alignment.center,
            child: ConfettiWidget(
              confettiController: _controllerCenter,
              blastDirectionality: BlastDirectionality.explosive,
              shouldLoop: false,
              colors: const [
                Colors.green,
                Colors.blue,
                Colors.pink,
                Colors.orange,
                Colors.purple
              ], // manually specify the colors to be used
              strokeWidth: 1,
              strokeColor: Colors.white,// define a custom shape/path.
            )),
    ]
    );
  }
}
