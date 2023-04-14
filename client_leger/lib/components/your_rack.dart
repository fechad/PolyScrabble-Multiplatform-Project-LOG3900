import 'dart:async';

import 'package:client_leger/components/tile.dart';
import 'package:client_leger/pages/game_page.dart';
import 'package:client_leger/services/link_service.dart';
import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_mobx/flutter_mobx.dart';
import 'package:shake/shake.dart';

import '../main.dart';
import '../pages/home_page.dart';

typedef IntCallback = void Function(int i);

class YourRack extends StatefulWidget {
  final IntCallback tileChange;

  YourRack({required this.tileChange});

  @override
  _YourRackState createState() => _YourRackState(tileChange: tileChange);
}

class _YourRackState extends State<YourRack> {
  List<Widget> buildRack() {
    setState(() {
      linkService.getRack();
    });
    return linkService.getRack();
  }

  final IntCallback tileChange;
  late ShakeDetector _detector;
  int noLetters = 7;

  _YourRackState({required this.tileChange});

  @override
  void initState() {
    super.initState();
    socketService.on(
        'drawRack',
            (letters) => {
              letters = letters.replaceAll(' ', ''),
              noLetters = letters.length,
          setState(() {
            linkService.resetRack();
            linkService.getRack();
          }),
        });

    _detector = ShakeDetector.autoStart(onPhoneShake: () {
      if (!linkService.getWantToExchange() && placementValidator.letters.isEmpty) {
        Timer(const Duration(seconds: 3), (() => setState(() {})));
      }
    });
  }



  @override
  Widget build(BuildContext context) {
    return DragTarget<Map>(
    builder: (BuildContext context, List<Object?> candidateData, List<dynamic> rejectedData) {
        return Container(
        key: GlobalKey<ScaffoldState>(),
        height: 60,
        width: 352,
        decoration: BoxDecoration(
          color: themeManager.themeMode == ThemeMode.light
              ? Colors.white
              : Color.fromARGB(255, 53, 53, 52),
          borderRadius: BorderRadius.circular(4),
          border: Border.all(
            color: Color(0x44000000),
            width: 1,
          ),
        ),
        child: NotificationListener<TileNotification>(
            onNotification: (notification) {
              tileChange(notification.data);
              return true;
            },
            child: Observer(
                builder: (context) => Row(children: linkService.getRack()))));
    },
    onAccept: (data) {
    setState(() {
      if (linkService.tempRack.length + 1 > noLetters) return;
        linkService.tempRack.add(
            Tile(letter: data['letter'], index: data['index']));
    });
      });
  }
}
