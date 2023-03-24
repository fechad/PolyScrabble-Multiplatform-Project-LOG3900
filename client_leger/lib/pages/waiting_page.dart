import 'dart:async';

import 'package:client_leger/components/drawer.dart';
import 'package:client_leger/config/flutter_flow/flutter_flow_util.dart';
import 'package:client_leger/main.dart';
import 'package:client_leger/pages/game_page.dart';
import 'package:client_leger/pages/home_page.dart';
import 'package:flutter/material.dart';
import 'package:flutter_ringtone_player/flutter_ringtone_player.dart';

import '../classes/game.dart';
import '../components/avatar.dart';
import '../components/sidebar.dart';
import '../config/colors.dart';
import '../services/init_service.dart';
import '../services/link_service.dart';
import 'chat_page.dart';

class WaitingPage extends StatefulWidget {
  const WaitingPage(
      {super.key,
      required this.timer,
      required this.isExpertLevel,
      required this.players});
  final String timer;
  final bool isExpertLevel;
  final List<Player> players;
  @override
  _WaitingPageState createState() => _WaitingPageState(
      timer: timer, isExpertLevel: isExpertLevel, players: players);
}

class _WaitingPageState extends State<WaitingPage> {
  _WaitingPageState(
      {required this.timer,
      required this.isExpertLevel,
      required this.players});
  final scaffoldKey = GlobalKey<ScaffoldState>();
  final TextEditingController textController = TextEditingController();
  final ScrollController _controller = ScrollController();
  final String timer;
  final bool isExpertLevel;
  final List<Player> players;
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
          if (mounted){
              setState((() => {
                    if ((data as List<dynamic>)[0]['channelName'] ==
                        chatService.getRoomChannel().name)
                      {
                        messages = [],
                        if (linkService.getCurrentOpenedChat() !=
                            gameService.room.roomInfo.name) {
                          linkService
                              .pushNewChannel(gameService.room.roomInfo.name),
                          if (messages.isNotEmpty &&
                              messages[messages.length - 1].sender !=
                                  authenticator.currentUser.username)
                            {
                              FlutterRingtonePlayer.play(
                                android: AndroidSounds.notification,
                                ios: IosSounds.receivedMessage,
                                looping: false, // Android only - API >= 28
                                volume: 0.5, // Android only - API >= 28
                                asAlarm: false, // Android only - all APIs
                              ),
                            },},
                        (data as List<dynamic>).forEach((message) => {
                              messages.add(ChatMessage(
                                  channelName: message['channelName'],
                                  system: message['system'],
                                  sender: message['sender'],
                                  time: message['time'],
                                  message: message['message'])),
                            }),
                        _scrollDown()
                      }
                  })), }
            });

    socketService.on(
        "roomCreated",
        (serverRoom) => {
              gameService.room = gameService.decodeModel(serverRoom),
              setState(() => gameService.room.roomInfo.name),
              linkService.setCurrentOpenedChat(gameService.room.roomInfo.name),
            });

    //by default games are private
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
                      title: Text("Demande d'accès à la partie"),
                      content: Text(
                          "Voulez-vous accepter ${gameService.room.players[gameService.room.players.length - 1].clientAccountInfo.username} dans la salle de jeu?"),
                      actions: [
                        TextButton(
                            onPressed: () => {
                                  gameService.rejectPlayer(gameService
                                      .room
                                      .players[
                                          gameService.room.players.length - 1]
                                      .clientAccountInfo.username),
                                  Navigator.pop(context)
                                },
                            child: Text("Non")),
                        TextButton(
                            onPressed: () => {
                                  Navigator.pop(context),
                                  gameService.acceptPlayer(gameService
                                      .room
                                      .players[
                                          gameService.room.players.length - 1]
                                      .clientAccountInfo.username),
                                  noPlayers++,
                                  if (noPlayers > 1) canStart = true,
                                },
                            child: Text("Oui")),
                      ],
                    );
                  })
            });

    socketService.on(
        "playerAccepted",
        (serverRoom) => {
              gameService.room = gameService.decodeModel(serverRoom),
              setState(() => {
                    canStart = true,
                    noPlayers++,
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
              noPlayers = myRoom.players.length -= 1,
              setState(() => {
                    if (noPlayers <= 1) canStart = false,
                  })
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
    return Scaffold(
      key: scaffoldKey,
      backgroundColor: Colors.white,
      drawer: ChatDrawer(),
      body: Row(children: <Widget>[
        CollapsingNavigationDrawer(),
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
                            isExpertLevel
                                ? Text("🤖 Expert",
                                    style: TextStyle(
                                      fontSize: 14,
                                    ))
                                : Text("🤖 Débutant",
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
                        Avatar(url: 'https://picsum.photos/seed/540/600'),
                        Avatar(url: 'https://picsum.photos/seed/540/600'),
                        Avatar(url: 'https://picsum.photos/seed/540/600'),
                        Avatar(url: 'https://picsum.photos/seed/540/600'),
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
                              child: const Text('Quitter'),
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
                                  backgroundColor: Palette.mainColor,
                                  minimumSize: Size(50, 40),
                                  textStyle: const TextStyle(fontSize: 20),
                                ),
                                child: const Text('Démarrer'),
                                onPressed: canStart
                                    ? () => {
                                          gameService.requestGameStart(),
                                          linkService.setCurrentOpenedChat(''),
                                          Navigator.push(context,
                                              MaterialPageRoute(
                                                  builder: ((context) {
                                            return const GamePageWidget();
                                          })))
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
                decoration: BoxDecoration(color: Theme.of(context).cardColor),
              ),
            ],
          ),
        ),
      ]),
    );
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
                      hintText: "Enter some text to send a message"),
                ),
              ),
              Container(
                  margin: EdgeInsets.symmetric(horizontal: 3.0),
                  child: IconButton(
                    onPressed: textController.text.trim().isNotEmpty
                        ? () => {submitMsg(textController.text)}
                        : null,
                    icon: const Icon(Icons.send),
                  ))
            ],
          ),
        ));
  }

  void submitMsg(String txt) {
    if (textController.text.trim().isEmpty) return;
    textController.clear();

    //TODO : time should not be sent from client
    ChatMessage msg = ChatMessage(
        channelName: myRoom.roomInfo.name,
        sender: authenticator.getCurrentUser().username,
        system: false,
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
