import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../pages/chat_page.dart';
import '../pages/waiting_page.dart';
import '../services/link_service.dart';
import 'chat_model.dart';

class ChatCard extends StatelessWidget {
  const ChatCard({required this.chatModel}) : super();
  final ChatModel chatModel;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () {
        if (chatModel.name.startsWith("Room")){
          Navigator.push(context,
              MaterialPageRoute(builder: (context) => WaitingPage(
                  timer:
                  gameService.gameData.timerPerTurn,
                  isExpertLevel:
                  gameService.gameData.isExpertLevel,
                  players: gameService.room.players),
              ));
        }
        else {
          //TODO: Join chat channel because by default we only join the general chat
          Navigator.push(context,
              MaterialPageRoute(builder: (context) => GeneralChatWidget(chatName: chatModel.name)));
        }
      },
      child: Column(
        children: [
          ListTile(
              title: Padding(
                  padding: EdgeInsets.only(top: 0, left: 20, right: 20),
                  child: Text(
                    chatModel.name,
                    style: GoogleFonts.nunito(
                        fontSize: 20, fontWeight: FontWeight.bold),
                  ))),
        ],
      ),
    );
  }
}
