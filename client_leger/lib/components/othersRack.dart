import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'package:google_fonts/google_fonts.dart';
import '../classes/game.dart';
import '../main.dart';
import '../services/link_service.dart';

class OthersRack extends StatefulWidget {
  const OthersRack(
      {super.key,
        required this.player,
        required this.playerInfo,
      required this.isObserver,
        required this.updateLetters});
  final List<PlayerRack> playerInfo;
  final Player player;
  final bool isObserver;
  final VoidCallback updateLetters;

  @override
  OthersRackState createState() => OthersRackState(isObserver: isObserver, player: player, playerInfo: playerInfo);
}

class OthersRackState extends State<OthersRack> {
  OthersRackState(
  {required this.isObserver, required this.player, required this.playerInfo});
  final List<PlayerRack> playerInfo;
  final Player player;
  late PlayerRack rightPlayer =
  PlayerRack(player:
  Player(socketId: '',
      points: 0,
      isCreator: false,
      isItsTurn: false,
      clientAccountInfo: authenticator.getCurrentUser()),
      rackLetters: '');
  final bool isObserver;
  late Player p;

  @override
  void initState() {
    super.initState();

    socketService.on(
        "playersRackUpdated",
            (data) => {
          if (mounted) {
            setState(() {
              for (var playerInfo in data) {
                p = gameService.decodePlayer(playerInfo['player']);
                gameService.playersRack.add(PlayerRack(
                    player: p, rackLetters: playerInfo['rackLetters']));
              }
            })
          }
        });

    for (PlayerRack p in playerInfo) {
      if (p.player.clientAccountInfo!.username == player.clientAccountInfo!.username){
        rightPlayer = p;
      }
    }

  }


  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
         Row(children: [
           Container(
             margin: EdgeInsets.only(right: 8),
              width: 30,
              height: 30,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.grey,
              ),
            ),
           Text(player.clientAccountInfo!.username, style: GoogleFonts.nunito(
             textStyle: TextStyle(
               fontSize: 18,
             ),
           ),)
         ]),
          SizedBox(height: 8),
          // A rack

          Container(
              child: Row(
                  children: [
                    Container(
                        height: 40,
                        width: 300,
                    child:
                    ListView.builder(
                        scrollDirection: Axis.horizontal,
                        itemCount: rightPlayer.rackLetters.length,
                        padding: EdgeInsets.zero,
                        itemBuilder: (context, index) {
                          return
                            Container(
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(10),
                                  color: Color(0xFFFFEBCE),
                                  border: Border.all(
                                    color: Color(0x11000000),
                                    width: 1,
                                  ),
                                ),
                                margin: EdgeInsets.only(left:2.5, right: 2.5),
                                width: 35,
                                height: 35,
                                child: Center(
                                    child: Text( isObserver ?
                                        rightPlayer.rackLetters[index].toUpperCase() : '',
                                        style: TextStyle(
                                            fontSize: 24
                                        )
                                    ))
                            );
                        })),
                  ]
              )
          )
        ]
    );
  }
}
