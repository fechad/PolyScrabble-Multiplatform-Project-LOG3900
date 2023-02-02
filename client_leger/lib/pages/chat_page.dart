import 'package:client_leger/components/sender_message.dart';
import 'package:client_leger/config/flutter_flow/flutter_flow_util.dart';
import 'package:client_leger/main.dart';
import 'package:client_leger/pages/home_page.dart';
import 'package:client_leger/services/chat_service.dart';
//import 'package:socket_io_client/socket_io_client.dart';
import 'package:flutter/material.dart';

import '../components/chat_card.dart';
import '../components/chat_model.dart';
import '../components/user_model.dart';
import '../config/flutter_flow/flutter_flow_theme.dart';

class GeneralChatWidget extends StatefulWidget {
  @override
  _GeneralChatWidgetState createState() => _GeneralChatWidgetState();
}

class _GeneralChatWidgetState extends State<GeneralChatWidget> {
  final _unfocusNode = FocusNode();
  final scaffoldKey = GlobalKey<ScaffoldState>();
  final List<ChatMessage> messages = ChatService.discussionChannels[0].messages;
  final TextEditingController textController = TextEditingController();
  late ChatModel MyChat = ChatService.discussionChannels[0];
  bool isWriting = false;

  @override
  void initState() {
    super.initState();
    ChatService();
    // On page load action.
  }

  @override
  void dispose() {
    _unfocusNode.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: scaffoldKey,
      backgroundColor: FlutterFlowTheme.of(context).primaryBackground,
      drawer: Drawer(
        child: ListView.builder(
            itemCount: ChatService.discussionChannels.length,
            itemBuilder: (context, index) =>
                ChatCard(chatModel: ChatService.discussionChannels[index])),
      ),
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
                Icons.chat,
                color: Colors.black,
                size: 60,
              ),
            ),
          ),
          title: Align(
              alignment: const AlignmentDirectional(0, 1),
              child: Flexible(
                child: (Text(
                  'General Chat',
                  textAlign: TextAlign.center,
                  style: FlutterFlowTheme.of(context).title1.override(
                        fontFamily: 'Poppins',
                        fontSize: 56,
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
      body: new Column(children: <Widget>[
        new Flexible(
            child: new ListView.builder(
          itemBuilder: (_, int index) => messages[index],
          itemCount: messages.length,
          reverse: true,
          padding: new EdgeInsets.all(6.0),
        )),
        new Divider(height: 1.0),
        new Container(
          child: _buildComposer(),
          decoration: new BoxDecoration(color: Theme.of(context).cardColor),
        ),
      ]),
    );
  }

  Widget _buildComposer() {
    return new IconTheme(
        data: new IconThemeData(),
        child: new Container(
          margin: const EdgeInsets.symmetric(horizontal: 9.0),
          child: new Row(
            children: <Widget>[
              new Flexible(
                child: new TextField(
                  controller: textController,
                  onChanged: (String txt) {
                    setState(() {
                      isWriting = txt.length > 0;
                    });
                  },
                  onSubmitted: submitMsg,
                  decoration: new InputDecoration.collapsed(
                      hintText: "Enter some text to send a message"),
                ),
              ),
              new Container(
                  margin: new EdgeInsets.symmetric(horizontal: 3.0),
                  child: new IconButton(
                    onPressed:
                        isWriting ? () => submitMsg(textController.text) : null,
                    icon: new Icon(Icons.send),
                  ))
            ],
          ),
        ));
  }

  void submitMsg(String txt) {
    textController.clear();
    setState(() {
      isWriting = false;
    });

    ChatMessage msg = ChatMessage(
        sender: authenticator.getCurrentUser(),
        system: false,
        time: DateFormat('yy-MM-dd hh:mm').format(DateTime.now()),
        message: txt);

    setState(() {
      messages.insert(0, msg);
    });
  }
}

class ChatMessage extends StatelessWidget {
  UserModel? sender;
  bool system;
  String time;
  String message;
  ChatMessage(
      {required this.sender,
      required this.system,
      required this.time,
      required this.message});

  @override
  Widget build(BuildContext context) {
    // TODO add condition and see who sends msg to use different layout of msg -- system vs sender vs receiver
    return (SenderMessage(
        txt: message,
        time: DateFormat('yy-MM-dd hh:mm').format(DateTime.now())));
  }
}
