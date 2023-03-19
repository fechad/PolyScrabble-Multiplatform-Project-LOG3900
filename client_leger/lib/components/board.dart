import 'package:client_leger/classes/game.dart';
import 'package:client_leger/components/tile.dart';
import 'package:client_leger/pages/game_page.dart';
import 'package:flutter/material.dart';

import '../services/link_service.dart';

typedef StringCallback = void Function(String);

class Board extends StatefulWidget {
  final StringCallback alertGamePage;

  Board({Key? key, required this.alertGamePage}) : super(key: key);
  @override
  _BoardState createState() => _BoardState(alertGamePage: alertGamePage);
}

class _BoardState extends State<Board> {
  final StringCallback alertGamePage;
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

  _BoardState({required this.alertGamePage});
  @override
  void initState() {
    super.initState();
    constructBoard();
    _configureSocket();
  }

  @override
  void dispose() {
    super.dispose();
  }

  _configureSocket() {
    socketService.on(
        "drawBoard",
        (data) => {
              placementData = PlacementData.fromJson(data),
              serverPlacement(placementData)
            });
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
    if (letter == '' || letter == null || letter == '*') return 0;
    final normalLetter = letter.toLowerCase();
    if (normalLetter.toLowerCase() != normalLetter) return 0;
    return POINTS[letter.toLowerCase().codeUnits[0] - A_ASCII];
  }

  void addPlacement(int x, int y, String value, String letter, color) {
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
      (linkService.getRows()[y] as Row).children[x] = newSquare;
    });
  }

  void serverPlacement(PlacementData placement) {
    int y = (placement.row.codeUnitAt(0) - 97);
    int x = placement.column - 1;
    List<String> letters = placement.word.split('');

    addPlacement(x, y, getTileScore(letters[0]).toString(), letters[0],
        Color(0xFFFFEBCE));
    letters.removeAt(0);

    if (letters.isEmpty) return;

    if (placement.direction == 'h') {
      x = x + 1;
      for (int i = x; i < 15; i++) {
        final square = (linkService.getRows()[y] as Row).children[x];

        if (square.runtimeType.toString().contains('DragTarget')) {
          addPlacement(x, y, getTileScore(letters[0]).toString(), letters[0],
              Color(0xFFFFEBCE));
          x = x + 1;
          letters.removeAt(0);
        }
        if (letters.isEmpty) break;
      }
    } else if (placement.direction == 'v') {
      y = y + 1;
      for (int i = y; i < 15; i++) {
        final square = (linkService.getRows()[y] as Row).children[x];

        if (square.runtimeType.toString().contains('DragTarget')) {
          addPlacement(x, y, getTileScore(letters[0]).toString(), letters[0],
              Color(0xFFFFEBCE));
          y = y + 1;
          letters.removeAt(0);
        }
        if (letters.isEmpty) break;
      }
    }
  }

  void placeTile(
      int x, int y, String? value, String? letter, int? index, color) {
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
                    child: Text(letter!, style: const TextStyle(fontSize: 24))),
                Positioned(
                  child: Text(value!, style: const TextStyle(fontSize: 10)),
                  bottom: 4.0,
                  right: 4.0,
                )
              ],
            )));
    setState(() {
      linkService.setRows(x, y, square);
      linkService.removeLetter(Tile(letter: letter, index: index!));
      alertGamePage(placementValidator.letters);
    });
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
                    ? Color(0xFFE8A1A1)
                    : Color(0xCCCCB89B),
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
            placeTile(x, y, data["value"], data["letter"], data['index'],
                Color(0xFFE8A1A1));
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
                    ? Color(0xFFFFC7C7)
                    : Color(0xCCCCB89B),
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
            placeTile(x, y, data["value"], data["letter"], data['index'],
                Color(0xFFFFC7C7));
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
                    ? Color(0xFFA8BBFF)
                    : Color(0xCCCCB89B),
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
            placeTile(x, y, data["value"], data["letter"], data['index'],
                Color(0xFFA8BBFF));
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
                    ? Color(0xFFBBBECA)
                    : Color(0xCCCCB89B),
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
            placeTile(x, y, data["value"], data["letter"], data['index'],
                Color(0xFFBBBECA));
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
              color:
                  candidateData.isEmpty ? Color(0xFFFFEBCE) : Color(0xCCCCB89B),
              border: Border.all(
                color: Color(0xFFFFFFFF),
                width: 0.5,
              ),
            ),
          );
        },
        onAccept: (data) {
          setState(() {
            placeTile(x, y, data["value"], data["letter"], data['index'],
                Color(0xFFFFEBCE));
          });
        },
      );
  }

  //(rows[0] as Row).children[0] to access a children
  @override
  Widget build(BuildContext context) {
    return Column(
        key: GlobalKey<ScaffoldState>(),
        mainAxisAlignment: MainAxisAlignment.center,
        children: linkService.getRows());
  }
}
