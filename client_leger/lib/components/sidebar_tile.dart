import 'package:flutter/material.dart';

class CollapsingListTile extends StatefulWidget {
  final String title;
  final IconData icon;
  final AnimationController? animationController;
  final bool isSelected;
  final bool notifiable;
  final Function()? onTap;

  CollapsingListTile({
    required this.title,
    required this.icon,
    this.animationController,
    this.isSelected = false,
    this.onTap,
    required this.notifiable,
  });

  @override
  _CollapsingListTileState createState() => _CollapsingListTileState();
}

class _CollapsingListTileState extends State<CollapsingListTile> {
  late Tween<double> sizedBoxAnimation;

  @override
  void initState() {
    super.initState();
    sizedBoxAnimation = Tween<double>(begin: 10, end: 0);
  }

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: widget.onTap,
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.all(Radius.circular(16.0)),
          color: widget.isSelected
              ? Colors.transparent
              : Colors.transparent,
        ),
        //width: widthAnimation.value,
        margin: EdgeInsets.symmetric(horizontal: 12.0),
        padding: EdgeInsets.symmetric(horizontal: 8.0, vertical: 8.0),
        child: Row(
          children: <Widget>[
            Stack(children: <Widget>[
              Icon(
                widget.icon,
                color: widget.isSelected ? Colors.white : Colors.white30,
                size: 38.0,
              ),
            ]),
          ],
        ),
      ),
    );
  }
}
