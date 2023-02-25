import 'package:font_awesome_flutter/font_awesome_flutter.dart';

import '../config/colors.dart';

import 'package:flutter/material.dart';



class CollapsingListTile extends StatefulWidget {
  final String title;
  final IconData icon;
  final AnimationController? animationController;
  final bool isSelected;
  final Function()? onTap;

  CollapsingListTile(
      {required this.title,
        required this.icon,
        this.animationController,
        this.isSelected = false, this.onTap,
        });

  @override
  _CollapsingListTileState createState() => _CollapsingListTileState();
}

class _CollapsingListTileState extends State<CollapsingListTile> {
  late Tween<double> sizedBoxAnimation;

  @override
  void initState() {
    super.initState();
    sizedBoxAnimation =
        Tween<double>(begin: 10, end: 0);

  }

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: widget.onTap,
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.all(Radius.circular(16.0)),
          color: widget.isSelected
              ? Colors.transparent.withOpacity(0.3)
              : Colors.transparent,
        ),
        //width: widthAnimation.value,
        margin: EdgeInsets.symmetric(horizontal: 8.0),
        padding: EdgeInsets.symmetric(horizontal: 8.0, vertical: 8.0),
        child: Row(
          children: <Widget>[
            Icon(
              widget.icon,
              color: widget.isSelected ? Colors.white : Colors.white30,
              size: 38.0,
            ),
            SizedBox(width: 10),
            // (widthAnimation.value >= 190)
            //     ? Text(widget.title,
            //     style: widget.isSelected
            //         ? TextStyle(color: Colors.white, fontSize: 20.0, fontWeight: FontWeight.w600)
            //         : TextStyle(color: Colors.white70, fontSize: 20.0, fontWeight: FontWeight.w600))
            //     : Container()
          ],
        ),
      ),
    );
  }
}
