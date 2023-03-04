import 'dart:async';

import 'package:client_leger/components/drawer.dart';
import 'package:client_leger/config/flutter_flow/flutter_flow_util.dart';
import 'package:client_leger/main.dart';
import 'package:client_leger/pages/home_page.dart';
import 'package:flutter/material.dart';
import 'package:flutter_ringtone_player/flutter_ringtone_player.dart';
import 'package:quickalert/quickalert.dart';

import '../classes/game.dart';
import '../components/avatar.dart';
import '../components/sidebar.dart';
import '../config/colors.dart';
import 'chat_page.dart';
import 'multiplayer_page.dart';

class WaitingPage extends StatefulWidget {
  const WaitingPage(
      {super.key,
      required this.timer,
      required this.isExpertLevel,
      required this.players,
      required this.roomName});
  final String timer;
  final bool isExpertLevel;
  final List<Player> players;
  final String roomName;
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
  late Room myRoom;
  bool isWriting = false;
  bool canStart = false;
  bool showingAlert = false;
  //TODO: get the right room for chat
  List<ChatMessage> messages = [];

  @override
  void initState() {
    super.initState();
    connect();
    gameService.configureBaseSocketFeatures();
    Timer(
        Duration(milliseconds: 0),
        () =>
            {_controller.jumpTo(_controller.position.maxScrollExtent + 300.0)});
  }

  connect() {
    socket.on(
        'channelMessage',
        (data) => {
              setState((() => {
                    messages = [],
                    (data as List<dynamic>).forEach((message) => {
                          messages.add(ChatMessage(
                              channelName: message['channelName'],
                              system: message['system'],
                              sender: message['sender'],
                              time: message['time'],
                              message: message['message'])),
                        })
                  })),
              if (messages[messages.length - 1].sender !=
                  authenticator.currentUser.username)
                {
                  FlutterRingtonePlayer.play(
                    android: AndroidSounds.notification,
                    ios: IosSounds.receivedMessage,
                    looping: false, // Android only - API >= 28
                    volume: 0.5, // Android only - API >= 28
                    asAlarm: false, // Android only - all APIs
                  ),
                },
              _scrollDown()
            });

    //by default GAMES ARE PRIVATE...
    socketService.on(
        "playerFound",
        (data) => {
              print('player found'),
              myRoom = gameService.decodeModel(data['room']),
              gameService.room.players
                  .add(gameService.decodePlayer(data['player'])),
              if (!showingAlert) {showAlert(), showingAlert = true}
            });

    //for public games
    socketService.on(
        "playerAccepted",
        (serverRoom) => {
              print('received PLAYER'),
              gameService.room = gameService.decodeModel(serverRoom),
              //socketService.send("joinChatChannel", {'name': gameService.room.roomInfo.name, 'user': authenticator.currentUser.username}),
              setState(
                () => canStart = true,
              )
            });
  }

  void _scrollDown() {
    _controller.jumpTo(_controller.position.maxScrollExtent + 200.0);
  }

  void showAlert() {
    QuickAlert.show(
        context: context,
        type: QuickAlertType.confirm,
        title: "Demande d'accès à la partie",
        text:
            "Voulez-vous accepter ${gameService.room.players[gameService.room.players.length - 1].pseudo} dans la salle de jeu?",
        confirmBtnText: 'Oui',
        cancelBtnText: 'Non',
        confirmBtnColor: Colors.red,
        onConfirmBtnTap: () => {
              gameService.acceptPlayer(gameService
                  .room.players[gameService.room.players.length - 1].pseudo),
              Navigator.pop(context),
            });
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
                      child: Row(children: const [
                        Avatar(),
                        Avatar(),
                        Avatar(),
                        Avatar(),
                      ])),
                  Padding(
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
                            gameService.leaveRoom();
                            Navigator.push(context,
                                MaterialPageRoute(builder: ((context) {
                              return const MyHomePage(title: "PolyScrabble");
                            })));
                          },
                        ),
                        SizedBox(width: 40),
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
                                      Navigator.push(context, MaterialPageRoute(
                                          builder: ((context) {
                                        return const MultiplayerPage();
                                      })))
                                    }
                                : null),
                      ])),
                ]),
              ),
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
        channelName: 'General Chat',
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
