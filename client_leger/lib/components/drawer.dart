// ignore_for_file: unnecessary_new

import 'package:flutter/material.dart';

import '../config/colors.dart';
import '../config/flutter_flow/flutter_flow_widgets.dart';
import '../pages/home_page.dart';
import '../services/link_service.dart';
import 'chat_card.dart';
import 'chat_model.dart';

class ChatDrawer extends StatefulWidget {
  const ChatDrawer({super.key});

  @override
  _ChatDrawerWidgetState createState() => _ChatDrawerWidgetState();
}

class _ChatDrawerWidgetState extends State<ChatDrawer> {
  final TextEditingController textController = TextEditingController();
  final TextEditingController _channelNameController = TextEditingController();
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();
  bool isSearching = false;

  @override
  void initState() {
    super.initState();
    _configure();
    chatService.discussionChannels = gameService.availableChannels;
  }

  _configure() {
    socketService.on(
      "availableChannels",
          (channels) => {
        if (mounted) {
          setState(() {
            gameService.availableChannels = [];
            for (var channel in channels) {
              gameService.availableChannels.add(
                  chatService.decodeModel(channel));
            }
            if (gameService.room.roomInfo.name != '') {
              chatService.getDiscussionChannelByName(
                  gameService.room.roomInfo.name);
            }
          }),
        }
      },
    );
  }

  @override
  void dispose() {
    super.dispose();
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

                        if (txt.isEmpty) chatService.discussionChannels = gameService.availableChannels;
                        if (textController.text.isNotEmpty) {
                          chatService.discussionChannels = [chatService.discussionChannels[0]];
                          for (ChatModel channel in gameService.availableChannels) {
                            if (channel.name.startsWith(textController.text)) {
                              chatService.discussionChannels.add(channel);
                            }
                          }
                        }

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
                Container(
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
              showDialog(
                  barrierDismissible: false,
                  context: context,
                  builder: (context) {
                    return Container(
                      child: AlertDialog(
                        title: Text("Création d'un canal"),
                        content:
                        Container(
                            height: 55,
                            width: 350,
                            child: Form(
                            key: _formKey,
                            child: Column(
                            children: [
                            TextFormField(
                              controller: _channelNameController,
                              decoration:
                          const InputDecoration(
                            hintText:
                            'Veuillez entrer le nom du canal',
                          ),
                          validator: (value) {
                            for (ChatModel channel in chatService.getDiscussions()){
                              if (channel.name.toLowerCase().trim().replaceAll(' ', '') == value?.toLowerCase().trim().replaceAll(' ', '')) return 'Un canal a déjà ce nom';
                            }

                            if (value!.isEmpty) {
                              return 'Le nom ne peut être vide';
                            }
                            if (value.toLowerCase().trim().startsWith('room')) {
                              return "Le nom ne peut commencer par 'room'";
                            }
                            return null;
                          },
                          ),
                            ]))
                        ),
                        actions: [
                          ElevatedButton(
                              child: Text('Annuler'),
                              style: ElevatedButton
                                  .styleFrom(
                                backgroundColor:
                                Colors.red,
                                textStyle:
                                const TextStyle(
                                    fontSize: 15),
                              ),
                              onPressed: () => {
                                _channelNameController
                                    .clear(),
                                Navigator.pop(
                                    context),
                              }),
                          ElevatedButton(
                            child: Text('Créer'),
                            style:
                            ElevatedButton.styleFrom(
                              backgroundColor:
                              Palette.mainColor,
                              textStyle: const TextStyle(
                                  fontSize: 15),
                            ),
                            onPressed: () {
                              if (_formKey.currentState!.validate()) {
                                setState(() {
                                  chatService.addDiscussion(
                                      _channelNameController.text);
                                  Navigator
                                .pop(
                                    context);
                                _channelNameController
                                    .clear();
                    });
                              }
                            }
                          ),
                        ],
                      ),
                    );
                  });
              setState(() {});
            },
            text: 'Nouveau canal',
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
