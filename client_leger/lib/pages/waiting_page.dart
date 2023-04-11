import 'dart:async';

import 'package:client_leger/components/drawer.dart';
import 'package:client_leger/components/user_resume.dart';
import 'package:client_leger/config/flutter_flow/flutter_flow_util.dart';
import 'package:client_leger/main.dart';
import 'package:client_leger/pages/game_page.dart';
import 'package:client_leger/pages/home_page.dart';
import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localization.dart';

import '../classes/game.dart';
import '../components/avatar.dart';
import '../services/init_service.dart';
import '../services/link_service.dart';
import 'chat_page.dart';

class WaitingPage extends StatefulWidget {
  const WaitingPage(
      {super.key,
      required this.isObserver,
      required this.roomName,
      required this.timer,
      this.botsLevel,
      required this.players});
  final String roomName;
  final String timer;
  final String? botsLevel;
  final List<Player> players;
  final bool isObserver;
  @override
  _WaitingPageState createState() => _WaitingPageState(
      isObserver: isObserver,
      roomName: roomName,
      timer: timer,
      botsLevel: botsLevel,
      players: players);
}

class _WaitingPageState extends State<WaitingPage> {
  _WaitingPageState(
      {required this.isObserver,
      required this.roomName,
      required this.timer,
      this.botsLevel,
      required this.players});
  final scaffoldKey = GlobalKey<ScaffoldState>();
  final TextEditingController textController = TextEditingController();
  final ScrollController _controller = ScrollController();
  final String roomName;
  final String timer;
  final String? botsLevel;
  final List<Player> players;
  final bool isObserver;

  Room myRoom = gameService.room;
  bool isWriting = false;
  bool canStart = false;
  int noPlayers = 1;
  late List<ChatMessage> messages;

  @override
  void initState() {
    super.initState();
    messages = chatService.getRoomChannel().messages;
    connect();
    gameService.configureBaseSocketFeatures();
    linkService.setCurrentOpenedChat(gameService.room.roomInfo.name);
    linkService.popChannel(chatService.getRoomChannel().name);
    Timer(
        Duration(milliseconds: 0),
        () =>
            {_controller.jumpTo(_controller.position.maxScrollExtent + 300.0)});
  }

  connect() {
    socket.on(
        'channelMessage',
        (data) => {
              if (mounted)
                {
                  setState((() => {
                        if ((data as List<dynamic>)[0]['channelName'] ==
                            chatService.getRoomChannel().name)
                          {
                            messages = [],
                            if (linkService.getCurrentOpenedChat() !=
                                gameService.room.roomInfo.name)
                              {
                                linkService.pushNewChannel(
                                    gameService.room.roomInfo.name),
                              },
                            (data as List<dynamic>).forEach((message) => {
                                  messages.add(ChatMessage(
                                      channelName: message['channelName'],
                                      system: message['system'],
                                      sender: message['sender'],
                                      time: message['time'],
                                      avatarUrl: message['avatarUrl'],
                                      account: message['system'] ||
                                              message['avatarUrl']
                                                  .toString()
                                                  .contains('robot-avatar') ||
                                              message['avatarUrl']
                                                  .toString()
                                                  .contains('assets')
                                          ? null
                                          : Account.fromJson(
                                              message['account']),
                                      message: message['message'])),
                                }),
                            _scrollDown()
                          }
                      })),
                }
            });

    socketService.on(
        "roomCreated",
        (serverRoom) => {
              gameService.room = gameService.decodeModel(serverRoom),
              if (mounted)
                {
                  setState(() => gameService.room.roomInfo.name),
                  linkService
                      .setCurrentOpenedChat(gameService.room.roomInfo.name),
                }
            });

    socketService.on(
        "playerFound",
        (data) => {
              myRoom = gameService.decodeModel(data['room']),
              gameService.room.players
                  .add(gameService.decodePlayer(data['player'])),
              showDialog(
                  barrierDismissible: false,
                  context: context,
                  builder: (context) {
                    return AlertDialog(
                      title: Text(AppLocalizations.of(context)!.accessRequest),
                      content: Text(
                          "${AppLocalizations.of(context)!.accessMessagePartOne} ${gameService.room.players[gameService.room.players.length - 1].clientAccountInfo!.username} ${AppLocalizations.of(context)!.accessMessagePartTwo}"),
                      actions: [
                        ElevatedButton(
                            onPressed: () => {
                                  gameService.rejectPlayer(gameService
                                      .room
                                      .players[
                                          gameService.room.players.length - 1]
                                      .clientAccountInfo!
                                      .username),
                                  Navigator.pop(context)
                                },
                            child: Text(AppLocalizations.of(context)!.no),
                            style: ElevatedButton.styleFrom(
                              backgroundColor:
                                  themeManager.themeMode == ThemeMode.light
                                      ? Color.fromARGB(255, 125, 175, 107)
                                      : Color.fromARGB(255, 121, 101, 220),
                              textStyle: const TextStyle(fontSize: 20),
                            )),
                        ElevatedButton(
                            onPressed: () => {
                                  Navigator.pop(context),
                                  gameService.acceptPlayer(gameService
                                      .room
                                      .players[
                                          gameService.room.players.length - 1]
                                      .clientAccountInfo!
                                      .username),
                                  noPlayers++,
                                  if (noPlayers > 1) canStart = true,
                                },
                            child: Text(AppLocalizations.of(context)!.yes),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.red,
                              textStyle: const TextStyle(fontSize: 20),
                            ))
                      ],
                    );
                  })
            });

    socketService.on(
        "playerAccepted",
        (serverRoom) => {
              gameService.room = gameService.decodeModel(serverRoom),
              noPlayers = gameService.room.players.length,
              setState(() => {
                    if (!isObserver && noPlayers > 1)
                      {
                        canStart = true,
                      }
                  })
            });

    socketService.on(
        "playerRejected",
        (room) => {
              room = gameService.decodeModel(room),
              gameService.leaveRoomOther(),
              linkService.setCurrentOpenedChat(''),
              Navigator.push(context, MaterialPageRoute(builder: ((context) {
                return MyHomePage(title: "polyscrabble");
              }))),
            });

    socketService.on(
        "playerLeft",
        (player) => {
              noPlayers = gameService.room.players.length -= 1,
              if (mounted)
                {
                  setState(() => {
                        gameService.room.players.removeWhere((element) =>
                            element.clientAccountInfo!.username ==
                            player['clientAccountInfo']['username']),
                        if (noPlayers <= 1) canStart = false,
                      })
                }
            });

    socketService.on(
        "gameStarted",
        (data) => {
              Navigator.push(context, MaterialPageRoute(builder: ((context) {
                return const GamePageWidget();
              })))
            });

    socketService.on(
        "roomCreatorLeft",
        (data) => {
              socketService.send(
                  "leaveRoomOther", gameService.room.roomInfo.name),
              gameService.reinitializeRoom(),
              Navigator.push(context, MaterialPageRoute(builder: ((context) {
                return MyHomePage(title: 'PolyScrabble');
              })))
            });
  }

  void _scrollDown() {
    _controller.jumpTo(_controller.position.maxScrollExtent + 200.0);
  }

  @override
  dispose() {
    linkService.setCurrentOpenedChat('');
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
        onWillPop: () async {
          return false;
        },
        child: Scaffold(
          key: scaffoldKey,
          drawer: ChatDrawer(),
          endDrawer: UserResume(),
          body: Row(children: <Widget>[
            //CollapsingNavigationDrawer(),
            SizedBox(width: 40),
            Container(
              width: MediaQuery.of(context).size.width * 0.937,
              height: MediaQuery.of(context).size.height,
              child: Column(
                children: [
                  Container(
                    width: MediaQuery.of(context).size.width * 0.937,
                    height: MediaQuery.of(context).size.height * 0.1,
                    child: Row(children: [
                      Padding(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 15.0, vertical: 15.0),
                          child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text("🤖 $botsLevel",
                                    style: TextStyle(
                                      fontSize: 14,
                                    )),
                                SizedBox(height: 8),
                                Text("🕓 ${this.timer}",
                                    style: TextStyle(
                                      fontSize: 14,
                                    )),
                              ])),
                      Padding(
                          padding: const EdgeInsets.fromLTRB(350, 15, 0, 0),
                          child: Row(children: [
                            Container(
                                height: 70,
                                width: 300,
                                child: ListView.builder(
                                    scrollDirection: Axis.horizontal,
                                    itemCount: gameService.room.players.length,
                                    itemBuilder:
                                        (BuildContext context, int index) {
                                      return Avatar(
                                          insideChat: false,
                                          url: gameService
                                              .room
                                              .players[index]
                                              .clientAccountInfo!
                                              .userSettings
                                              .avatarUrl);
                                    }))
                          ])),
                      linkService.getIsInAGame()
                          ? Padding(
                              padding: const EdgeInsets.fromLTRB(350, 15, 0, 0),
                              child: InkWell(
                                onTap: () {
                                  linkService.setCurrentOpenedChat('');
                                  Navigator.pop(context);
                                },
                                child: Icon(
                                  Icons.close_rounded,
                                  color: Colors.black,
                                  size: 60,
                                ),
                              ))
                          : Padding(
                              padding: const EdgeInsets.fromLTRB(180, 15, 0, 0),
                              child: Row(children: [
                                ElevatedButton(
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: Colors.red,
                                    minimumSize: Size(50, 40),
                                    textStyle: const TextStyle(fontSize: 20),
                                  ),
                                  child:
                                      Text(AppLocalizations.of(context)!.quit),
                                  onPressed: () {
                                    gameService.leave();
                                    Navigator.push(context,
                                        MaterialPageRoute(builder: ((context) {
                                      return MyHomePage(title: "polyscrabble");
                                    })));
                                  },
                                ),
                                SizedBox(width: 30),
                                ElevatedButton(
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: themeManager.themeMode ==
                                              ThemeMode.light
                                          ? Color.fromARGB(255, 125, 175, 107)
                                          : Color.fromARGB(255, 121, 101, 220),
                                      minimumSize: Size(50, 40),
                                      textStyle: const TextStyle(fontSize: 20),
                                    ),
                                    child: Text(
                                        AppLocalizations.of(context)!.start),
                                    onPressed: canStart
                                        ? () => {
                                              gameService.requestGameStart(),
                                              linkService
                                                  .setCurrentOpenedChat(''),
                                            }
                                        : null),
                              ])),
                    ]),
                  ),
                  Column(children: [
                    Text(gameService.room.roomInfo.name,
                        style: TextStyle(
                          fontSize: 40,
                        )),
                  ]),
                  Flexible(
                      fit: FlexFit.tight,
                      child: ListView.builder(
                        controller: _controller,
                        itemBuilder: (BuildContext context, int index) =>
                            messages[index],
                        itemCount: messages.length,
                        reverse: false,
                        padding: EdgeInsets.all(6.0),
                      )),
                  Divider(height: 1.0),
                  Container(
                    child: _buildComposer(),
                    decoration:
                        BoxDecoration(color: Theme.of(context).cardColor),
                  ),
                ],
              ),
            ),
          ]),
        ));
  }

  Widget _buildComposer() {
    return IconTheme(
        data: IconThemeData(),
        child: Container(
          margin: const EdgeInsets.symmetric(horizontal: 9.0),
          child: Row(
            children: <Widget>[
              Flexible(
                child: TextField(
                  onEditingComplete: () {},
                  style: TextStyle(height: 2),
                  controller: textController,
                  onChanged: (String txt) {
                    setState(() {
                      isWriting = txt.length > 0;
                    });
                  },
                  onSubmitted: submitMsg,
                  decoration: InputDecoration.collapsed(
                      hintStyle: TextStyle(fontSize: 18),
                      hintText:
                          AppLocalizations.of(context)!.generalPagePlaceholder),
                ),
              ),
              Container(
                  margin: EdgeInsets.symmetric(horizontal: 3.0),
                  child: IconButton(
                    onPressed: textController.text.trim().isNotEmpty
                        ? () => {submitMsg(textController.text)}
                        : null,
                    icon: Icon(Icons.send,
                        color: themeManager.themeMode == ThemeMode.light
                            ? Color.fromARGB(255, 125, 175, 107)
                            : Color.fromARGB(255, 121, 101, 220)),
                  ))
            ],
          ),
        ));
  }

  void submitMsg(String txt) {
    if (textController.text.trim().isEmpty) return;
    textController.clear();

    ChatMessage msg = ChatMessage(
        channelName: gameService.room.roomInfo.name,
        sender: authenticator.getCurrentUser().username,
        system: false,
        account: authenticator.getCurrentUser(),
        time: DateFormat('HH:mm:ss').format(DateTime.now()),
        message: txt.trim());

    chatService.addMessage(message: msg, channelName: msg.channelName);

    setState(() {
      isWriting = false;
      messages;
      _scrollDown();
    });
  }
}
