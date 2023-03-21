import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';

import '../config/colors.dart';
import '../main.dart';
import '../pages/game_page.dart';

final List<int> POINTS = [
  1,
  3,
  3,
  2,
  1,
  4,
  2,
  4,
  1,
  8,
  10,
  1,
  2,
  1,
  1,
  3,
  8,
  1,
  1,
  1,
  1,
  4,
  10,
  10,
  10,
  10
];
final A_ASCII = 97;

class TileNotification extends Notification {
  final int data;
  TileNotification(this.data);
}

class Tile extends StatefulWidget {
  final String letter;
  final int index;
  bool wantToExchange = false;
  final RebuildController? rebuildController;

  Tile({super.key,
    required this.letter,
    required this.index,
    this.rebuildController});


  @override
  _TileState createState() => _TileState(letter: letter, index: index, rebuildController : rebuildController);
}


class _TileState extends State<Tile> {
  _TileState({required this.letter, required this.index, this.rebuildController});
  final String letter;
  final int index;
  bool wantToExchange = false;
  final RebuildController? rebuildController;
  Color borderColor = Colors.black;

  int getTileScore() {
    if (letter == ' ' || letter == null || letter == '*') return 0;
    final normalLetter = letter.toLowerCase();
    if (normalLetter.toLowerCase() != normalLetter) return 0;
    return POINTS[letter.toLowerCase().codeUnits[0] - A_ASCII];
  }

  @override
  Widget build(BuildContext context) {
    final int value = getTileScore();
    return GestureDetector(
        key: GlobalKey<ScaffoldState>(),
        onDoubleTap: () {
          setState(() {
            print(borderColor);
            if (linkService.getMyTurn()) {
              wantToExchange = !wantToExchange;
              linkService.setWantToExchange(true);
              if (wantToExchange) {
                borderColor = Color.fromARGB(170, 22, 235, 82);
                print(borderColor);
                TileNotification(index).dispatch(context);
              } else {
                borderColor = Colors.black;
                TileNotification(index).dispatch(context);
              }
            }
          });
          //return rebuildController?.rebuild();
        },
        child: linkService.getWantToExchange()
            ? Container(
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(10),
                  color: const Color(0xFFFFEBCE),
                  border: Border.all(
                    color: borderColor,
                    width: 1,
                  ),
                ),
                margin: const EdgeInsets.only(left: 2.5, right: 2.5),
                width: 45,
                height: 45,
                child: Stack(
                  children: [
                    Center(
                        child:
                            Text(letter, style: const TextStyle(fontSize: 24))),
                    Positioned(
                      child:
                          Text('$value', style: const TextStyle(fontSize: 10)),
                      bottom: 4.0,
                      right: 4.0,
                    )
                  ],
                ))
            : Draggable<Map>(
                data: {
                    'letter': letter,
                    'value': value.toString(),
                    'index': index
                  },
                childWhenDragging: Container(
                  color: Color(0x00000000),
                ),
                //maxSimultaneousDrags: linkService.getWantToExchange() ? 0 : 1,
                feedback: Material(
                    color: Color(0x00000000),
                    child: Container(
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(10),
                          color: const Color(0xFFFFEBCE),
                          border: Border.all(
                            color: const Color(0xAA000000),
                            width: 1,
                          ),
                        ),
                        margin: const EdgeInsets.only(left: 2.5, right: 2.5),
                        width: 50,
                        height: 50,
                        child: Stack(
                          children: [
                            Center(
                                child: Text(letter,
                                    style: const TextStyle(
                                        fontSize: 24, color: Colors.black))),
                            Positioned(
                              child: Text('$value',
                                  style: const TextStyle(
                                      fontSize: 10, color: Colors.black)),
                              bottom: 4.0,
                              right: 4.0,
                            )
                          ],
                        ))),
                child: Container(
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(10),
                      color: const Color(0xFFFFEBCE),
                      border: Border.all(
                        color: borderColor,
                        width: 1,
                      ),
                    ),
                    margin: const EdgeInsets.only(left: 2.5, right: 2.5),
                    width: 45,
                    height: 45,
                    child: Stack(
                      children: [
                        Center(
                            child: Text(letter,
                                style: const TextStyle(fontSize: 24))),
                        Positioned(
                          child: Text('$value',
                              style: const TextStyle(fontSize: 10)),
                          bottom: 4.0,
                          right: 4.0,
                        )
                      ],
                    ))));
  }
}
