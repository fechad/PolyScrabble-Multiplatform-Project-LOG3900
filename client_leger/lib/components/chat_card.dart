import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../pages/chat_page.dart';
import 'chat_model.dart';

class ChatCard extends StatelessWidget {
  const ChatCard({required this.chatModel}) : super();
  final ChatModel chatModel;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () {
        //TODO: Join chat channel because by default we only join the general chat
        Navigator.push(context,
            MaterialPageRoute(builder: (context) => GeneralChatWidget()));
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
