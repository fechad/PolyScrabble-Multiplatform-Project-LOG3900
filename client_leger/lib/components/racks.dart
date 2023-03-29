import 'package:client_leger/components/othersRack.dart';
import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';

import '../classes/game.dart';
import '../services/link_service.dart';

class Racks extends StatefulWidget {
  Racks({super.key, required this.isObserver, required this.updateLetters});
  final bool isObserver;
  final VoidCallback updateLetters;


  @override
  RacksState createState() => RacksState(isObserver: isObserver);
}

class RacksState extends State<Racks> {
  RacksState({required this.isObserver});
  bool isObserver;

  @override
  void initState() {
    super.initState();
  }

  @override
  void dispose() {
    super.dispose();
  }


  @override
  Widget build(BuildContext context) {
    return Container(
        color: Colors.transparent,
        padding: EdgeInsets.only(left: 7.5, right: 5),
        child: Column(children: [
          Container(
            height: 320,
            width: 300,
            child:
          ListView.builder(
              itemCount: gameService.room.players.length,
              padding: EdgeInsets.zero,
              itemBuilder: (context, index) {
                  return OthersRack(isObserver: isObserver,
                      player: gameService.room.players[index],
                      playerInfo: gameService.playersRack,
                    updateLetters: updateLetters,);
              })
    )
        ]));
  }

  updateLetters() {
    setState(() {});
  }
}
