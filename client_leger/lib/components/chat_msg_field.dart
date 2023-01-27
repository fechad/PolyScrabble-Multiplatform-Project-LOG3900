import 'package:flutter/material.dart';
import '../config/colors.dart';


class ChatMessageField extends StatefulWidget {
  ChatMessageField({required Key key}) : super(key: key);

  @override
  _ChatMessageFieldState createState() => _ChatMessageFieldState();
}

class _ChatMessageFieldState extends State<ChatMessageField> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(
        title: Text("Chat Field"),
    ),
      body:Container(
        margin: EdgeInsets.all(15.0),
        height: 61,
        child: Row(
          children: [
            Expanded(
              child: Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(35.0),
                  boxShadow: [
                    BoxShadow(
                        offset: Offset(0, 3),
                        blurRadius: 5,
                        color: Colors.grey)
                  ],
                ),
                child: Row(
                  children: [
                    IconButton(
                        icon: Icon(Icons.face , color: Colors.blueAccent,), onPressed: () {}),
                    Expanded(
                      child: TextField(
                        decoration: InputDecoration(
                            hintText: "Type Something...",
                            hintStyle: TextStyle( color:     Colors.blueAccent),
                            border: InputBorder.none),
                      ),
                    ),
                    IconButton(
                      icon: Icon(Icons.photo_camera ,  color: Colors.blueAccent),
                      onPressed: () {},
                    ),
                    IconButton(
                      icon: Icon(Icons.attach_file ,  color: Colors.blueAccent),
                      onPressed: () {},
                    )
                  ],
                ),
              ),
            ),
            SizedBox(width: 15),
            Container(
              padding: const EdgeInsets.all(15.0),
              decoration: BoxDecoration(
                  color: Palette.mainColor, shape: BoxShape.circle),
              child: InkWell(
                child: Icon(
                  Icons.keyboard_voice,
                  color: Colors.white,
                ),
                onLongPress: () {
                },
              ),
            )
          ],
        ),
      ) ,
    );
  }
}
