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

class GamesPlayed {
    String gameID;
    String type;
    int score;
    GamesPlayed({required this.gameID, required this.type, required this.score});
}

class UserModel {
  String username;
  String email;
  String avatarURL; // TODO: vérifier si le type marche avec le serveur
  Level level;
  List<Badge> badges;
  int highScore;
  int gamesWon;
  int totalXp;
  List<GamesPlayed> gamesPlayed;
  List<GamesPlayed>bestGames;
  UserModel({
    required this.username, 
    required this.email, 
    required this.avatarURL, 
    required this.level, 
    required this.badges, 
    required this.highScore, 
    required this.gamesWon,
    required this.totalXp,
    required this.gamesPlayed,
    required this.bestGames
    });
}
