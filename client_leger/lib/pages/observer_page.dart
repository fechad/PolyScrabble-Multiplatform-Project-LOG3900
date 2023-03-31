import 'package:client_leger/components/drawer.dart';
import 'package:client_leger/pages/waiting_page.dart';
import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localization.dart';

import '../classes/game.dart';
import '../components/game_avail_card.dart';
import '../components/sidebar.dart';
import '../config/flutter_flow/flutter_flow_theme.dart';
import '../main.dart';
import '../services/link_service.dart';
import 'game_page.dart';

class ObserverPage extends StatefulWidget {
  const ObserverPage({super.key});

  @override
  State<ObserverPage> createState() => ObserverPageState();
}

class ObserverPageState extends State<ObserverPage> {
  final scaffoldKey = GlobalKey<ScaffoldState>();
  List<Room> publicRooms = gameService.allPublicRooms;

  @override
  void initState() {
    super.initState();
    connect();
    gameService.configureSocketFeatures();
  }

  connect() {
    socketService.on(
      "updatePublicRooms",
      (rooms) => {
        gameService.allPublicRooms = [],
        for (var r in rooms)
          {
            gameService.allPublicRooms.add(gameService.decodeModel(r)),
            publicRooms = gameService.allPublicRooms,
          },
        if (mounted)
          {
            setState(() {
              publicRooms;
            }),
          }
      },
    );

    socketService.on(
      "observerAccepted",
      (room) => {
        gameService.room = gameService.decodeModel(room),
        gameService.room.placementsData = [],
        for (var placements in room['placementsData'])
          {
            gameService.room.placementsData
                ?.add(PlacementData.fromJson(placements)),
          },
        socketService.send("joinChatChannel", {
          'name': gameService.room.roomInfo.name,
          'user': authenticator.getCurrentUser().username,
          'isRoomChannel': true,
        }),
        if (gameService.room.elapsedTime > 0)
          {
            Navigator.push(context, MaterialPageRoute(builder: ((context) {
              return GamePageWidget();
            })))
          }
        else
          {
            Navigator.push(context, MaterialPageRoute(builder: ((context) {
              return WaitingPage(
                  roomName: gameService.room.roomInfo.name,
                  timer: gameService.room.roomInfo.timerPerTurn.toString(),
                  botsLevel: gameService.room.botsLevel!,
                  players: gameService.room.players);
            }))),
          }
      },
    );
  }

  @override
  dispose() {
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        key: scaffoldKey,
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
                AppLocalizations.of(context)!.classicJoinMultiTitle,
                style: FlutterFlowTheme.of(context).bodyText1.override(
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
                      itemCount: publicRooms.length,
                      itemBuilder: (_, index) {
                        return GameCard(
                          players: publicRooms[index].players,
                          difficulty: publicRooms[index].botsLevel!,
                          time: publicRooms[index].roomInfo.timerPerTurn,
                          password: publicRooms[index].roomInfo.password,
                          roomName: publicRooms[index].roomInfo.name,
                          isObserver: true,
                        );
                      })),
            ])),
          ),
          CollapsingNavigationDrawer(),
        ]));
  }
}
