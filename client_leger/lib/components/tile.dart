import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_shake_animated/flutter_shake_animated.dart';
import 'package:shake/shake.dart';

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

  Tile(
      {super.key,
      required this.letter,
      required this.index,
      this.rebuildController});

  @override
  _TileState createState() => _TileState(
      letter: letter, index: index, rebuildController: rebuildController);
}

class _TileState extends State<Tile> {
  _TileState(
      {required this.letter, required this.index, this.rebuildController});
  final String letter;
  final int index;
  bool wantToExchange = false;
  final RebuildController? rebuildController;
  Color borderColor = Colors.black;
  late ShakeDetector _detector;
  bool shaking = false;
  String myLetters = '';

  @override
  void initState() {
    super.initState();

    _detector = ShakeDetector.autoStart(onPhoneShake: () {
      if (!linkService.getWantToExchange() && placementValidator.letters.isEmpty) {
        setState(() {
          shaking = true;
          myLetters = '';
          for (var tile in linkService.tempRack) {
            myLetters += tile.letter;
          }
          linkService.updateRack((myLetters.split('')
            ..shuffle()).join().toLowerCase());
          Timer(const Duration(seconds: 3), (() =>
              setState(() {
                shaking = false;
              })));
        });
      }// Call setState every time phone shakes.
    });
  }


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
            if (linkService.getMyTurn()) {
              wantToExchange = !wantToExchange;
              linkService.setWantToExchange(true);
              if (wantToExchange) {
                borderColor = themeManager.themeMode == ThemeMode.light
                    ? Color.fromARGB(255, 125, 175, 107)
                    : Color.fromARGB(255, 121, 101, 220);
               TileNotification(index).dispatch(context);
              } else {
                borderColor = Colors.black;
                TileNotification(index).dispatch(context);
              }
            }
          });
        },
        child: linkService.getWantToExchange() || !linkService.getMyTurn()
            ? Container(
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(10),
                  color: const Color(0xFFFFEBCE),
                  border: Border.all(
                    color: linkService.getIndicesToExchange().contains(index) ?
                    (themeManager.themeMode == ThemeMode.light
                        ? Color.fromARGB(255, 125, 175, 107)
                        : Color.fromARGB(255, 121, 101, 220)) : Colors.black,
                    width: linkService.getIndicesToExchange().contains(index) ? 2:1,
                  ),
                ),
                margin: const EdgeInsets.only(left: 2.5, right: 2.5),
                width: 45,
                height: 45,
                child: Stack(
                  children: [
                    Center(
                        child: Text(letter,
                            style: TextStyle(
                                fontSize: 24, color: Colors.black))),
                    Positioned(
                      child: Text('$value',
                          style: const TextStyle(
                              fontSize: 10, color: Colors.black)),
                      bottom: 4.0,
                      right: 4.0,
                    )
                  ],
                ))
            : ShakeWidget(
              duration: const Duration(seconds: 1),
              autoPlay: shaking,
              enableWebMouseHover: true,
              shakeConstant: ShakeCrazyConstant1(),
              child: Draggable<Map>(
                onDragStarted: () {
                  linkService.setFromRack(true);
                },
                  onDragCompleted: () {
                    linkService.setFromRack(false);
                  },
                data: {
                    'letter': letter,
                    'value': value.toString(),
                    'index': index
                  },
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
                            color: borderColor,
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
                    )))
        ));
  }
}
