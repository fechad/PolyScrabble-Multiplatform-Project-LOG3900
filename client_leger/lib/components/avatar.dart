import 'dart:io';

import 'package:flutter/material.dart';

import '../classes/game.dart';

class Avatar extends StatefulWidget {
  final String url;
  final Account? previewData;
  const Avatar({Key? key, required this.url, this.previewData})
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
              image: AssetImage(widget.url)
              as ImageProvider,
              fit: BoxFit.fill,
            ),
            shape: BoxShape.circle),
      );
    else return Image.network(
      widget.url,
      fit: BoxFit.cover,
    );
  }

  @override
  Widget build(BuildContext context) {

    return Padding(
      padding: EdgeInsetsDirectional.fromSTEB(0, 0, 0, 0),
      child: GestureDetector(
        onTap: () {
          setState(() {
            Scaffold.of(context).openEndDrawer();
          });
        },
        child: Container(
          width: 55,
          height: 55,
          clipBehavior: Clip.antiAlias,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
          ),
          child: rightImageFormat()

        ),
      ),
    );
  }
}
