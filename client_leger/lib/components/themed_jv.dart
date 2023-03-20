import 'package:client_leger/components/drawer.dart';
import 'package:client_leger/pages/games_room.dart';
import 'package:client_leger/pages/multiplayer_page.dart';
import 'package:client_leger/pages/solo_page.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../components/sidebar.dart';
import '../config/colors.dart';
import '../pages/game_page.dart';
import '../services/link_service.dart';

class ThemedJV extends StatefulWidget {
  final String name;
  final int difficulty;
  final int time;
  const ThemedJV({super.key, required this.name, required this.difficulty, required this.time});

  @override
  State<ThemedJV> createState() => _ThemedJVState();
}

class _ThemedJVState extends State<ThemedJV> {
  final scaffoldKey = GlobalKey<ScaffoldState>();
  final String path = "assets/images/avatars/";
  List<Widget> hardness = [];
  @override
  void initState() {
    super.initState();
  }

  @override
  void dispose() {
    super.dispose();
  }

  void startGame() {
    soloGameService.configureBaseSocketFeatures();
    gameService.gameData.timerPerTurn = widget.time.toString();
    gameService.room.roomInfo.timerPerTurn = widget.time.toString();
    soloGameService.joinRoom(widget.name, widget.name);
    Navigator.push(context, MaterialPageRoute(builder: ((context) {
      return GamePageWidget();
    })));
  }

  @override
  Widget build(BuildContext context) {
    var min = (widget.time / 60).floor();
    var sec = "0" + (widget.time - min * 60).toString();
    sec = sec.substring(sec.length - 2);
    var chrono = (min).toString() + "m" + sec;

    for (int j = 0; j < widget.difficulty; j++)
      hardness.add(
          Text('💀', style: TextStyle(
            fontSize: 32,
          ))
      );



    return Container(
      width: 600,
      height: 200,
      child: Row(
        children: [
          Container(
            margin: EdgeInsets.only(right: 20),
            decoration: BoxDecoration(
              boxShadow: [
                BoxShadow(
                  color: Colors.grey.withOpacity(0.2),
                  spreadRadius: 2,
                  blurRadius: 7,
                  offset: Offset(0, 0),
                ),
              ],
              borderRadius: BorderRadius.all(Radius.circular(4)),
              border: Border.all(
                color: Color(0x22000000),
                width: 2.0,
                style: BorderStyle.solid,
              ),
            ),
            child: Image.asset(
              path + widget.name + "Avatar.png",
              width: 200,
              height: 200,
            ),
          ),
          Expanded(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  height:26,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(widget.name, style:  GoogleFonts.nunito(
                          textStyle: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
                      ),
                      Container(
                        width: 110,
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            Text(chrono, style:  GoogleFonts.nunito(
                                textStyle: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),),
                            Icon(Icons.access_alarm, size: 32,)
                          ],
                        ),
                      )
                    ],
                  ),
                ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: hardness,
                    ),
                    ElevatedButton(onPressed: ()=>{startGame()},
                        child: Text('Affronter', style: GoogleFonts.nunito(
                          textStyle: TextStyle(
                              fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white),
                        )
                        ),
                        style: ButtonStyle(
                          minimumSize:  MaterialStateProperty.all<Size>(Size(60.0, 50.0)),
                          backgroundColor: MaterialStateProperty.all<Color>(Palette.mainColor),
                        ),
                    )
                  ],
                ),
              ],
            ),
          )
        ],
      )
    );
  }
}
