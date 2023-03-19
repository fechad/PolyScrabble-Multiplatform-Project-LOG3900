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
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsetsDirectional.fromSTEB(10, 0, 0, 0),
      child: GestureDetector(
        onTap: () {
          setState(() {
            Scaffold.of(context).openEndDrawer();
          });
        },
        child: Container(
          width: 65,
          clipBehavior: Clip.antiAlias,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
          ),
          child: Image.network(
            widget.url,
            fit: BoxFit.cover,
          ),
        ),
      ),
    );
  }
}
