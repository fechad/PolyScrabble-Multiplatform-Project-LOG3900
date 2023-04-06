import 'package:audioplayers/audioplayers.dart';
import 'package:client_leger/pages/game_page.dart';
import 'package:client_leger/pages/home_page.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localization.dart';
import 'package:flutter_ringtone_player/flutter_ringtone_player.dart';

import '../classes/game.dart';
import '../main.dart';
import '../pages/change_password_page.dart';
import '../services/link_service.dart';

class GameSidebar extends StatefulWidget {
  GameSidebar({super.key, required this.isObserver});
  final bool isObserver;
  @override
  _GameSidebarState createState() => _GameSidebarState(isObserver: isObserver);
}

class _GameSidebarState extends State<GameSidebar> {
  _GameSidebarState({required this.isObserver});
  bool isObserver;
  final globalKey = GlobalKey<ScaffoldState>();
  final audioPlayer = AudioPlayer();
  AudioCache musicPlayer = AudioCache();

  @override
  void initState() {
    super.initState();
    gameService.room.roomInfo.isGameOver = false;
    _configure();
    musicPlayer = AudioCache(fixedPlayer: audioPlayer);
    if (backgroundService.currentVP != '') {
      String name = backgroundService.currentVP.replaceFirst(
          backgroundService.currentVP[0],
          backgroundService.currentVP[0].toUpperCase());
      musicPlayer.loop("audios/$name.mp3");
    }
  }

  _configure() {
    socketService.on(
        'channelMessage',
            (data) => {

                      FlutterRingtonePlayer.play(
                        android: AndroidSounds.notification,
                        ios: IosSounds.receivedMessage,
                        looping: false, // Android only - API >= 28
                        volume: 0.5, // Android only - API >= 28
                        asAlarm: false, // Android only - all APIs
                      ),

        });

    socketService.on(
        "toggleAngryBotAvatar",
        (botName) => {
              if (gameService.room.players
                  .firstWhere((Player player) =>
                      player.clientAccountInfo!.username == botName)
                  .toString()
                  .isNotEmpty)
                {
                  // TODO: this.toggleAvatar(bot.clientAccountInfo),
                  // TODO: this.toggleBotMusic(bot.clientAccountInfo),
                  backgroundService.switchToAngry(),
                },
              musicPlayer.loop("audios/Better.mp3"),
            });

    socketService.on(
        "gameIsOver",
        (players) => {
              setState(() {
                gameService.room.roomInfo.isGameOver = true;
                inGameService.findWinner(gameService.decodePlayers(players));
                for (Player p in gameService.room.players) {
                  if (p.clientAccountInfo!.username ==
                      inGameService.winnerPseudo) {
                    musicPlayer.loop(
                        "audios/${p.clientAccountInfo!.userSettings.victoryMusic}");
                  }
                }
              }),
            });

    socketService.on(
        "playerTurnChanged",
        (pseudo) => {
              setState(() {}),
            });
  }

  @override
  void dispose() {
    super.dispose();
    audioPlayer.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Material(
      child: Container(
        width: 70,
        color: themeManager.themeMode == ThemeMode.light
            ? Color.fromRGBO(249, 255, 246, 1)
            : Color.fromARGB(255, 62, 62, 62),
        child: OverflowBox(
          maxWidth: 85,
          child: Column(
            children: <Widget>[
              SizedBox(height: 25),
              isObserver ||
                      (gameService.room.roomInfo.isGameOver != null &&
                          gameService.room.roomInfo.isGameOver!)
                  ? Container()
                  : IconButton(
                      disabledColor: Colors.grey,
                      color: Color(0xFFF5C610),
                      icon:
                          const Icon(Icons.lightbulb_outline_rounded, size: 50),
                      onPressed: linkService.getMyTurn() &&
                              placementValidator.letters.isEmpty &&
                              !linkService.getWantToExchange()
                          ? () {
                              inGameService.helpCommand();
                            }
                          : null,
                    ),
              SizedBox(height: 100),
              IconButton(
                icon: Icon(Icons.chat,
                    size: 50,
                    color: themeManager.themeMode == ThemeMode.light
                        ? Color.fromARGB(255, 125, 175, 107)
                        : Color.fromARGB(255, 121, 101, 220)),
                onPressed: () {
                  Scaffold.of(context).openDrawer();
                },
              ),
              SizedBox(height: 435),
              isObserver ||
                      (gameService.room.roomInfo.isGameOver != null &&
                          gameService.room.roomInfo.isGameOver!)
                  ? IconButton(
                      icon:
                          const Icon(Icons.logout, size: 50, color: Colors.red),
                      onPressed: () {
                        if (!isObserver) {
                          authenticator.setStats(
                            authenticator.currentUser.email);
                        }
                        audioPlayer.stop();
                        backgroundService.setBackground('');
                        gameService.reinitializeRoom();
                        leaveGame();
                        linkService.setIsInAGame(false);
                        Navigator.push(context,
                            MaterialPageRoute(builder: ((context) {
                          return const MyHomePage(title: 'PolyScrabble');
                        })));
                        httpService.getUserInfo(authenticator.getCurrentUser().email);
                      },
                    )
                  : IconButton(
                      icon: const Icon(Icons.flag_rounded,
                          size: 50, color: Colors.red),
                      onPressed: () {
                        showDialog(
                            context: context,
                            builder: (context) {
                              return Container(
                                child: AlertDialog(
                                  title: Text(AppLocalizations.of(context)!
                                      .leaveGameTitle),
                                  content: Text(AppLocalizations.of(context)!
                                      .leaveGameBody),
                                  actions: [
                                    ElevatedButton(
                                        child: Text(
                                            AppLocalizations.of(context)!.no,
                                            style: TextStyle(
                                              color: Colors.white,
                                            )),
                                        style: ElevatedButton.styleFrom(
                                          backgroundColor:
                                              themeManager.themeMode ==
                                                      ThemeMode.light
                                                  ? Color.fromARGB(
                                                      255, 125, 175, 107)
                                                  : Color.fromARGB(
                                                      255, 121, 101, 220),
                                          textStyle:
                                              const TextStyle(fontSize: 20),
                                        ),
                                        onPressed: () => {
                                              Navigator.pop(context),
                                            }),
                                    ElevatedButton(
                                      child: Text(
                                          AppLocalizations.of(context)!.yes),
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: Colors.red,
                                        textStyle:
                                            const TextStyle(fontSize: 20),
                                      ),
                                      onPressed: () {
                                        audioPlayer.stop();
                                        backgroundService.setBackground('');
                                        authenticator.setStats(
                                            authenticator.currentUser.email);
                                        inGameService.confirmLeaving();
                                        linkService.setIsInAGame(false);
                                        linkService.getRows().clear();
                                        Navigator.push(
                                            context,
                                            MaterialPageRoute(
                                                builder: (context) =>
                                                    MyHomePage(
                                                        title:
                                                            "PolyScrabble")));
                                        httpService.getUserInfo(authenticator.getCurrentUser().email);
                                      },
                                    ),
                                  ],
                                ),
                              );
                            });
                      },
                    ),
            ],
          ),
        ),
      ),
    );
  }

  leaveGame() {
    socketService.send("leaveGame");
    authenticator.setStats(authenticator.currentUser.email);
  }
}
