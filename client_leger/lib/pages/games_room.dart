import 'package:client_leger/components/drawer.dart';
import 'package:client_leger/pages/home_page.dart';
import 'package:flutter/material.dart';

import '../classes/game.dart';
import '../components/game_avail_card.dart';
import '../components/sidebar.dart';
import '../config/flutter_flow/flutter_flow_theme.dart';
import '../main.dart';

const List<String> virtualPlayers = <String>['One', 'Two', 'Three', 'Four'];
const List<String> difficulty = <String>['Novice', 'Expert'];
const List<String> time = <String>['0', '1'];

class GamesRoomPage extends StatefulWidget {
  const GamesRoomPage({super.key});

  @override
  State<GamesRoomPage> createState() => _GamesRoomPageState();
}

class _GamesRoomPageState extends State<GamesRoomPage> {
  final scaffoldKey = GlobalKey<ScaffoldState>();
  List<Room> availableRooms = gameService.availableRooms;
  late Room myRoom;

  @override
  void initState() {
    super.initState();
    connect();
    gameService.configureSocketFeatures();
  }

  connect() {
    socketService.on(
      "updateAvailableRoom",
          (rooms) => {
        availableRooms = [],
        for (var r in rooms)
          {
            availableRooms.add(gameService.decodeModel(r)),
          },
            if(mounted){
              setState(() =>
              availableRooms
              ),
            }
      },
    );
  }

  @override dispose(){
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        key: scaffoldKey,
        backgroundColor: Colors.white,
        drawer: const ChatDrawer(),
        body: Stack(children: <Widget>[
          SingleChildScrollView(
            child: Center(
                child: Column(children: [
              SizedBox(height: 40),
              Align(
                alignment: Alignment.topCenter,
                child: Image.asset(
                  "assets/images/scrabble_hero.png",
                ),
              ),
              SizedBox(height: 30),
              Text(
                'Parties Disponibles',
                style: FlutterFlowTheme.of(context).bodyText1.override(
                      color: Colors.black,
                      fontFamily: 'Nunito',
                      fontSize: 24,
                      decoration: TextDecoration.underline,
                    ),
              ),
              Container(
                  padding: const EdgeInsets.fromLTRB(0, 30, 0, 0),
                  height: MediaQuery.of(context).size.height * 0.90,
                  width: MediaQuery.of(context).size.width * 0.75,
                  child: GridView.builder(
                      padding: const EdgeInsets.all(20),
                      shrinkWrap: true,
                      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 2,
                          mainAxisSpacing: 30,
                          crossAxisSpacing: 30,
                          mainAxisExtent: 130),
                      itemCount: availableRooms.length,
                      itemBuilder: (_, index) {
                        print('object rooms');
                        print(gameService.availableRooms[index]);
                        return GameCard(
                          //TODO : get difficulty and not gameType
                          difficulty: availableRooms[index].roomInfo.gameType,
                          time: availableRooms[index].roomInfo.timerPerTurn,
                          password: availableRooms[index].roomInfo.password,
                          roomName:
                              availableRooms[index].roomInfo.name,
                        );
                      })),
            ])),
          ),
          CollapsingNavigationDrawer(),
        ]));
  }
}