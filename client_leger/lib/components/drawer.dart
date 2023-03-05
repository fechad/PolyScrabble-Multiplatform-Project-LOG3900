// ignore_for_file: unnecessary_new

import 'package:flutter/material.dart';

import '../config/flutter_flow/flutter_flow_widgets.dart';
import '../pages/home_page.dart';
import 'chat_card.dart';

class ChatDrawer extends StatefulWidget {
  const ChatDrawer({super.key});

  @override
  _ChatDrawerWidgetState createState() => _ChatDrawerWidgetState();
}

class _ChatDrawerWidgetState extends State<ChatDrawer> {
  final TextEditingController textController = TextEditingController();
  bool isSearching = false;

  @override
  void initState() {
    super.initState();
    // On page load action.
  }

  @override
  Widget build(BuildContext context) {
    // TODO: implement build
    return (Drawer(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.start,
        children: <Widget>[
          const SizedBox(
            height: 20,
          ),
          Container(
            decoration: BoxDecoration(
                border: Border.all(color: Colors.black),
                borderRadius: BorderRadius.circular(8)),
            margin: const EdgeInsets.symmetric(horizontal: 20.0),
            child: new Row(
              children: <Widget>[
                SizedBox(
                  width: 10,
                ),
                new Flexible(
                  child: new TextField(
                    controller: textController,
                    onChanged: (String txt) {
                      setState(() {
                        isSearching = txt.isNotEmpty;
                      });
                    },
                    onSubmitted: submitMsg,
                    decoration: InputDecoration(
                      hintText: 'Search',
                      enabledBorder: UnderlineInputBorder(
                        borderSide: BorderSide(
                          color: Color(0x00000000),
                          width: 1,
                        ),
                        borderRadius: const BorderRadius.only(
                          topLeft: Radius.circular(4.0),
                          topRight: Radius.circular(4.0),
                        ),
                      ),
                      focusedBorder: UnderlineInputBorder(
                        borderSide: BorderSide(
                          color: Color(0x00000000),
                          width: 1,
                        ),
                        borderRadius: const BorderRadius.only(
                          topLeft: Radius.circular(4.0),
                          topRight: Radius.circular(4.0),
                        ),
                      ),
                      errorBorder: UnderlineInputBorder(
                        borderSide: BorderSide(
                          color: Color(0x00000000),
                          width: 1,
                        ),
                        borderRadius: const BorderRadius.only(
                          topLeft: Radius.circular(4.0),
                          topRight: Radius.circular(4.0),
                        ),
                      ),
                      focusedErrorBorder: UnderlineInputBorder(
                        borderSide: BorderSide(
                          color: Color(0x00000000),
                          width: 1,
                        ),
                        borderRadius: const BorderRadius.only(
                          topLeft: Radius.circular(4.0),
                          topRight: Radius.circular(4.0),
                        ),
                      ),
                    ),
                  ),
                ),
                new Container(
                    margin: const EdgeInsets.symmetric(horizontal: 10.0),
                    child: const Icon(Icons.search)),
              ],
            ),
          ),
          const SizedBox(height: 20),
          ChatCard(chatModel: chatService.getRoomChannel()),
          ChatCard(chatModel: chatService.getDiscussions()[0]),
          const Padding(
            padding: EdgeInsets.only(right: 20, left: 20),
            child: Divider(
              thickness: 1,
            ),
          ),
          Expanded(
              child: ListView.builder(
                  itemCount: chatService.getDiscussions().length,
                  padding: EdgeInsets.zero,
                  itemBuilder: (context, index) {
                    if (index != 0) {
                      return ChatCard(
                          chatModel: chatService.getDiscussions()[index]);
                    } else {
                      return const SizedBox(height: 5);
                    }
                  })),
          FFButtonWidget(
            onPressed: () {
              chatService.addDiscussion('Nouveau canal');
              setState(() {});
            },
            text: 'New Chat',
            options: FFButtonOptions(
              width: 240,
              height: 50,
              color: Color(0xFF7DAF6B),
              textStyle: TextStyle(
                fontFamily: 'Poppins',
                color: Colors.white,
                fontSize: 24,
              ),
              borderSide: BorderSide(
                color: Colors.transparent,
                width: 1,
              ),
              borderRadius: 2,
            ),
          ),
          SizedBox(
            height: 80,
          )
        ],
      ),
    ));
  }

  void submitMsg(String txt) {
    textController.clear();
    setState(() {
      isSearching = false;
    });
  }
}
