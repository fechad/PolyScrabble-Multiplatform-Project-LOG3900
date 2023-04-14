import 'package:client_leger/main.dart';
import 'package:client_leger/pages/game_page.dart';
import 'package:flutter/material.dart';

import '../classes/game.dart';

class Avatar extends StatefulWidget {
  final String url;
  final Account? previewData;
  final bool insideChat;
  const Avatar(
      {Key? key, required this.url, required this.insideChat, this.previewData})
      : super(key: key);

  @override
  _AvatarWidgetState createState() => _AvatarWidgetState();
}

class _AvatarWidgetState extends State<Avatar> {
  Widget rightImageFormat() {
    if (widget.url.startsWith("assets"))
      return Container(
        width: 78,
        height: 78,
        decoration: BoxDecoration(
            image: DecorationImage(
              image: AssetImage(widget.url) as ImageProvider,
              fit: BoxFit.fill,
            ),
            shape: BoxShape.circle),
      );
    else
      return Image.network(
        widget.url,
        fit: BoxFit.cover,
      );
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsetsDirectional.fromSTEB(0, 0, 0, 0),
      child: GestureDetector(
        onTap: () async {
          if (widget.previewData != null) {
          linkService.setPlayerToShow(widget.previewData);
          await authenticator.getOtherStats(linkService.getPlayerToShow().email);
          setState(() {

              linkService.setInsideChatBoolean(widget.insideChat);
              Scaffold.of(context).openEndDrawer();

          });}
        },
        child: Container(
            width: 45,
            height: 45,
            clipBehavior: Clip.antiAlias,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
            ),
            child: rightImageFormat()),
      ),
    );
  }
}
