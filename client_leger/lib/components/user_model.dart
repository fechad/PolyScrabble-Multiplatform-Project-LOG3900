import 'dart:ffi';

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

class UserModel {
  String username;
  String email;
  Icon icon; // TODO: vérifier si le type marche avec le serveur
  Level level;
  List<Badge> badges;
  int highScore;
  int gamesWon;
  UserModel({required this.username, required this.email, required this.icon, required this.level, required this.badges, required this.highScore, required this.gamesWon});
}
