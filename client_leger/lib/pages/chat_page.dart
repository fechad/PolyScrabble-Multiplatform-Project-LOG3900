import 'dart:async';

import 'package:client_leger/components/drawer.dart';
import 'package:client_leger/components/sender_message.dart';
import 'package:client_leger/main.dart';
import 'package:client_leger/pages/game_page.dart';
import 'package:client_leger/pages/home_page.dart';
import 'package:flutter/material.dart';
import 'package:flutter_ringtone_player/flutter_ringtone_player.dart';

import '../components/chat_model.dart';
import '../components/receiver_message.dart';
import '../components/system_message.dart';
import '../config/flutter_flow/flutter_flow_theme.dart';
import '../services/init_service.dart';

class GeneralChatWidget extends StatefulWidget {
  final ChatModel chat;
  GeneralChatWidget({super.key, required this.chat});
  @override
  _GeneralChatWidgetState createState() => _GeneralChatWidgetState(chat: chat);
}

class _GeneralChatWidgetState extends State<GeneralChatWidget> {
  _GeneralChatWidgetState({required this.chat});
  final scaffoldKey = GlobalKey<ScaffoldState>();
  final TextEditingController textController = TextEditingController();
  final ScrollController _controller = ScrollController();
  final ChatModel chat;
  bool isWriting = false;
  late List<ChatMessage> messages;

  @override
  void initState() {
    super.initState();
    messages = chatService.getDiscussionChannelByName(chat.name).messages;
    linkService.setCurrentOpenedChat(chat.name);
    linkService.popChannel(chat.name);
    connect();
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
                        messages = [],
                        (data as List<dynamic>).forEach((message) => {
                              messages.add(ChatMessage(
                                  channelName: message['channelName'],
                                  system: message['system'],
                                  sender: message['sender'],
                                  time: message['time'],
                                  message: message['message'])),
                            })
                      }))
                },
              if (messages[messages.length - 1].sender !=
                      authenticator.currentUser.username &&
                  linkService.currentOpenedChat != chat.name)
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
  }

  void _scrollDown() {
    if (_controller.hasClients)
      _controller.jumpTo(_controller.position.maxScrollExtent + 200.0);
  }

  @override
  void dispose() {
    linkService.setCurrentOpenedChat('');
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: scaffoldKey,
      drawer: ChatDrawer(),
      appBar: PreferredSize(
        preferredSize: Size.fromHeight(100),
        child: AppBar(
          backgroundColor:
              themeManager.themeMode == ThemeMode.light ? Colors.white : null,
          automaticallyImplyLeading: false,
          leading: Align(
            alignment: AlignmentDirectional(0, 0),
            child: InkWell(
              onTap: () async {
                scaffoldKey.currentState!.openDrawer();
              },
              child: Icon(
                Icons.list_rounded,
                color: themeManager.themeMode == ThemeMode.light
                    ? Colors.black
                    : Colors.white,
                size: 60,
              ),
            ),
          ),
          title: Align(
              alignment: const AlignmentDirectional(0, 1),
              child: Container(
                child:
                    Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                  Text(
                    chat.name,
                    textAlign: TextAlign.center,
                    style: FlutterFlowTheme.of(context).title1.override(
                          fontFamily: 'Poppins',
                          fontSize: 40,
                        ),
                  ),
                  SizedBox(width: 50),
                  chat.name != 'General Chat' &&
                          (chat.activeUsers.contains(
                                  authenticator.currentUser.username) ||
                              chat.owner?.username ==
                                  authenticator.currentUser.username)
                      ? SizedBox(
                          height: 50,
                          width: 120,
                          child: ElevatedButton(
                              child: Text(
                                  chat.owner?.username ==
                                          authenticator.currentUser.username
                                      ? 'Supprimer'
                                      : 'Quitter',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 18,
                                  )),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.red,
                              ),
                              onPressed: () => {
                                    showDialog(
                                        context: context,
                                        builder: (context) {
                                          return Container(
                                            child: AlertDialog(
                                              title: Text(chat
                                                          .owner?.username ==
                                                      authenticator
                                                          .currentUser.username
                                                  ? "Supprimer la conversation"
                                                  : "Quitter la conversation"),
                                              content: Text(chat
                                                          .owner?.username ==
                                                      authenticator
                                                          .currentUser.username
                                                  ? "Êtes-vous sûr de vouloir supprimer la conversation ?"
                                                  : "Êtes-vous sûr de vouloir quitter la conversation ?"),
                                              actions: [
                                                ElevatedButton(
                                                    child: Text('Non',
                                                        style: TextStyle(
                                                          color: Colors.black,
                                                        )),
                                                    style: ElevatedButton
                                                        .styleFrom(
                                                      backgroundColor:
                                                          Colors.white,
                                                      textStyle:
                                                          const TextStyle(
                                                              fontSize: 20),
                                                    ),
                                                    onPressed: () => {
                                                          Navigator.pop(
                                                              context),
                                                        }),
                                                ElevatedButton(
                                                  child: Text('Oui'),
                                                  style:
                                                      ElevatedButton.styleFrom(
                                                    backgroundColor: Colors.red,
                                                    textStyle: const TextStyle(
                                                        fontSize: 20),
                                                  ),
                                                  onPressed: () {
                                                    leaveChannel();
                                                    Navigator.pop(context);
                                                    Navigator.pop(context);
                                                  },
                                                ),
                                              ],
                                            ),
                                          );
                                        }),
                                  }))
                      : Container(),
                ]),
              )),
          actions: [
            InkWell(
              onTap: () {
                Navigator.pop(context);
                linkService.setCurrentOpenedChat('');
              },
              child: Icon(
                Icons.close_rounded,
                color: themeManager.themeMode == ThemeMode.light
                    ? Colors.black
                    : Colors.white,
                size: 60,
              ),
            ),
          ],
          centerTitle: false,
          toolbarHeight: 100,
          elevation: 2,
        ),
      ),
      body: Column(children: <Widget>[
        Flexible(
            child: ListView.builder(
          controller: _controller,
          itemBuilder: (BuildContext context, int index) => messages[index],
          itemCount: messages.length,
          reverse: false,
          padding: EdgeInsets.all(6.0),
        )),
        Divider(height: 1.0),
        Container(
          child: _buildComposer(),
          decoration: BoxDecoration(color: Theme.of(context).cardColor),
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
                      hintText: !chat.activeUsers.contains(
                                  authenticator.getCurrentUser().username) &&
                              chat.owner?.username !=
                                  authenticator.getCurrentUser().username &&
                              chat.name != 'General Chat'
                          ? "Envoyez un premier message pour rejoindre le canal"
                          : "Aa"),
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
          )),
    );
  }

  void submitMsg(String txt) {
    if (textController.text.trim().isEmpty) return;
    textController.clear();
    if (!chat.activeUsers.contains(authenticator.getCurrentUser().username) &&
        chat.owner?.username != authenticator.getCurrentUser().username) {
      chatService.joinDiscussion(chat.name);
    }
    ChatMessage msg = ChatMessage(
        channelName: chat.name,
        sender: authenticator.getCurrentUser().username,
        system: false,
        time: '',
        message: txt.trim());

    chatService.addMessage(message: msg, channelName: msg.channelName);

    setState(() {
      isWriting = false;
      messages;
      _scrollDown();
    });
  }

  void leaveChannel() {
    if (authenticator.getCurrentUser().username == chat.owner?.username) {
      chatService.creatorLeaveDiscussion(chat.name);
    } else
      chatService.leaveDiscussion(
          chat.name, authenticator.getCurrentUser().username);
  }
}

class ChatMessage extends StatelessWidget {
  String channelName;
  String? sender;
  bool system;
  String time;
  String message;
  ChatMessage(
      {required this.channelName,
      this.sender,
      required this.system,
      required this.time,
      required this.message});

  ChatMessage.fromJson(dynamic json)
      : channelName = json['channelName'],
        sender = json['sender'],
        system = json['system'],
        time = json['time'],
        message = json['message'];

  Map<String, dynamic> toJson() => {
        'channelName': channelName,
        'sender': sender,
        'system': system,
        'time': time,
        'message': message
      };

  @override
  Widget build(BuildContext context) {
    // TODO add condition and see who sends msg to use different layout of msg -- system vs sender vs receiver
    if (system)
      return (SystemMessage(txt: message, time: time));
    else if (sender == authenticator.currentUser.username)
      return (SenderMessage(txt: message, time: time));
    else
      return (OtherMessage(username: sender!, txt: message, time: time));
  }
}
