import 'package:flutter/material.dart';

class Level {
  String rank;
  int currentXP;
  int totalXP;
  Level({required this.rank, required this.currentXP, required this.totalXP});
}

class Badge {
  Icon icon;
  String name;
  String description;
  Badge({required this.icon, required this.name, required this.description});
}

class GamesPlayed {
  String gameID;
  String type;
  int score;
  GamesPlayed({required this.gameID, required this.type, required this.score});
}
