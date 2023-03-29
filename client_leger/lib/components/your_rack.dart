import 'package:client_leger/components/tile.dart';
import 'package:client_leger/pages/game_page.dart';
import 'package:client_leger/services/link_service.dart';
import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_mobx/flutter_mobx.dart';

import '../main.dart';

typedef IntCallback = void Function(int i);

class YourRack extends StatefulWidget {
  final IntCallback tileChange;
  //final RebuildController rackRebuildController;

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

  _YourRackState({required this.tileChange});

  @override
  void initState() {
    super.initState();
    socketService.on(
        'drawRack',
        (letters) => {
              setState(() {
                linkService.resetRack();
                linkService.getRack();
              }),
            });
  }

  @override
  Widget build(BuildContext context) {
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
  }
}
