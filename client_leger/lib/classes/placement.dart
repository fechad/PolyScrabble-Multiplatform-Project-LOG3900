import 'package:flutter/material.dart';

class Placement {
  int x;
  int y;
  Container currentSquare;
  DragTarget<Map<dynamic, dynamic>> previousSquare;

  Placement(
      {required this.x,
      required this.y,
      required this.currentSquare,
      required this.previousSquare});
}
