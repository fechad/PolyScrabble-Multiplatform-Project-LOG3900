import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';

import '../main.dart';

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

class Tile extends StatelessWidget {
  final String letter;
  final int index;
  bool wantToExchange = false;
  final RebuildController? rebuildController;

  Tile(
      {super.key,
      required this.letter,
      required this.index,
      this.rebuildController});

  int getTileScore() {
    if (letter == '' || letter == null || letter == '*') return 0;
    final normalLetter = letter.toLowerCase();
    if (normalLetter.toLowerCase() != normalLetter) return 0;
    return POINTS[letter.toLowerCase().codeUnits[0] - A_ASCII];
  }

  @override
  Widget build(BuildContext context) {
    final int value = getTileScore();

    return GestureDetector(
        onDoubleTap: () {
          wantToExchange = !wantToExchange;
          if (wantToExchange) {
            TileNotification(index).dispatch(context);
          } else {
            TileNotification(index).dispatch(context);
          }
          return rebuildController?.rebuild();
        },
        child: Draggable<Map>(
            data: {'letter': letter, 'value': value.toString(), 'index': index},
            childWhenDragging: Container(
              color: Color(0x00000000),
            ),
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
                    color: wantToExchange
                        ? Color.fromARGB(170, 22, 235, 82)
                        : const Color(0xAA000000),
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
                ))));
  }
}


/*

import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';

class TileNotification extends Notification {
  final String data;
  TileNotification(this.data);
}

class Tile extends StatefulWidget {
  final String letter;
  final String value;

  const Tile({super.key, required this.letter, required this.value});

  @override
  // ignore: library_private_types_in_public_api, no_logic_in_create_state
  _TileState createState() => _TileState(letter: letter, value: value);
}

class _TileState extends State<Tile> {
  final String letter;
  final String value;
  bool wantToExchange = false;

  _TileState({required this.letter, required this.value});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
        onDoubleTap: () {
          wantToExchange = !wantToExchange;
          if (wantToExchange) {
            TileNotification('increment').dispatch(context);
          } else {
            TileNotification('decrement').dispatch(context);
          }
        },
        child: Draggable<Map>(
            data: {'letter': letter, 'value': value},
            childWhenDragging: Container(
              color: Color(0x00000000),
            ),
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
                          child: Text(value,
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
                    color: wantToExchange
                        ? Color.fromARGB(170, 22, 235, 82)
                        : const Color(0xAA000000),
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
                      child: Text(value, style: const TextStyle(fontSize: 10)),
                      bottom: 4.0,
                      right: 4.0,
                    )
                  ],
                ))));
  }
}


*/