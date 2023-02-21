import 'dart:async';

import 'package:client_leger/components/drawer.dart';
import 'package:client_leger/components/sender_message.dart';
import 'package:client_leger/config/flutter_flow/flutter_flow_util.dart';
import 'package:client_leger/main.dart';
import 'package:client_leger/pages/home_page.dart';
import 'package:flutter/material.dart';
import '../components/receiver_message.dart';
import '../components/system_message.dart';
import '../config/flutter_flow/flutter_flow_theme.dart';
import 'package:flutter_ringtone_player/flutter_ringtone_player.dart';

class GeneralChatWidget extends StatefulWidget {
  @override
  _GeneralChatWidgetState createState() => _GeneralChatWidgetState();
}

class _GeneralChatWidgetState extends State<GeneralChatWidget> {
  final scaffoldKey = GlobalKey<ScaffoldState>();
  final TextEditingController textController = TextEditingController();
  final ScrollController _controller = ScrollController();
  bool isWriting = false;
  List<ChatMessage> messages = chatService.getDiscussions()[0].messages;



  @override
  void initState() {
    super.initState();
    connect();
    Timer(Duration(milliseconds: 0), () => {_controller.jumpTo(_controller.position.maxScrollExtent+300.0)});
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
        if(messages[messages.length-1].sender != authenticator.currentUser.username){
          FlutterRingtonePlayer.play(
          android: AndroidSounds.notification,
          ios: IosSounds.receivedMessage,
          looping: false, // Android only - API >= 28
          volume: 0.5, // Android only - API >= 28
          asAlarm: false, // Android only - all APIs
        ),},
          _scrollDown()
            }
            );
  }
  
  void _scrollDown() {
    _controller.jumpTo(_controller.position.maxScrollExtent+200.0);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: scaffoldKey,
      backgroundColor: FlutterFlowTheme.of(context).primaryBackground,
      drawer: ChatDrawer(),
      appBar: PreferredSize(
        preferredSize: Size.fromHeight(100),
        child: AppBar(
          backgroundColor: FlutterFlowTheme.of(context).primaryBtnText,
          automaticallyImplyLeading: false,
          leading: Align(
            alignment: AlignmentDirectional(0, 0),
            child: InkWell(
              onTap: () async {
                scaffoldKey.currentState!.openDrawer();
              },
              child: Icon(
                Icons.list_rounded,
                color: Colors.black,
                size: 60,
              ),
            ),
          ),
          title: Align(
              alignment: const AlignmentDirectional(0, 1),
              child: Container(
                child: (Text(
                  'General Chat',
                  textAlign: TextAlign.center,
                  style: FlutterFlowTheme.of(context).title1.override(
                        fontFamily: 'Poppins',
                        fontSize: 40,
                      ),
                )),
              )),
          actions: [
            InkWell(
              onTap: () {
                Navigator.push(context, MaterialPageRoute(builder: ((context) {
                  return const MyHomePage(title: 'PolyScrabble');
                })));
              },
              child: Icon(
                Icons.close_rounded,
                color: Colors.black,
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
    if(textController.text.trim().isEmpty) return;
    textController.clear();

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
