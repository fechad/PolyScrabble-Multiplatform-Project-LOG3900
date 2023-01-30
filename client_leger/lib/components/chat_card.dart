import '../pages/chat_page.dart';
import 'chat_model.dart';
import 'package:flutter/material.dart';
import '../config/colors.dart';

class ChatCard extends StatelessWidget {
  const ChatCard({required this.chatModel}) : super();
  final ChatModel chatModel;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () {
        Navigator.push(
            context,
            MaterialPageRoute(
                builder: (context) => GeneralChatWidget()));
      },
      child: Column(
        children: [
          ListTile(
            leading: const CircleAvatar(
              radius: 30,
              backgroundColor: Palette.mainColor,
              child: Icon(Icons.forum_rounded,
                color: Colors.white,),
            ),
            title: Text(
              chatModel.name,
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                overflow: TextOverflow.clip,
              ),
            ),
            subtitle:Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
               Text(
                  chatModel.newMessage,
                  style: const TextStyle(
                    fontSize: 16,
                    overflow: TextOverflow.clip,
                  ),
                ),
                const SizedBox(height: 5),
                Text(
                  chatModel.time.toString(),
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    overflow: TextOverflow.clip,
                  ),
                )
            ]),
            isThreeLine: true,
          ),
          const Padding(
            padding: EdgeInsets.only(right: 20, left: 80),
            child: Divider(
              thickness: 1,
            ),
          ),
        ],
      ),
    );
  }
}
