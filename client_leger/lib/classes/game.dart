import '../pages/chat_page.dart';

class GameData {
  String pseudo;
  String timerPerTurn;
  String? dictionary;
  String botName;
  bool isExpertLevel;

  GameData(
      {required this.pseudo,
      required this.timerPerTurn,
      this.dictionary,
      required this.botName,
      required this.isExpertLevel});
}

class Player {
  String pseudo;
  String socketId;
  int points;
  bool isCreator;
  bool isItsTurn;

  Player(
      {required this.pseudo,
      required this.socketId,
      required this.points,
      required this.isCreator,
      required this.isItsTurn});

  Player.fromJson(dynamic json)
      : pseudo = json['pseudo'],
        socketId = json['socketId'],
        points = json['points'],
        isCreator = json['isCreator'],
        isItsTurn = json['isItsTurn'];

  Map<String, dynamic> toJson() => {
        'pseudo': pseudo,
        'socketId': socketId,
        'points': points,
        'isCreator': isCreator,
        'isItsTurn': isItsTurn,
      };
}

class RoomInfo {
  String name;
  String creatorName;
  String timerPerTurn;
  String? dictionary;
  String gameType;
  int maxPlayers;
  bool? isSolo;
  bool? isGameOver;
  bool isPublic;
  String password;

  RoomInfo(
      {required this.name,
      required this.creatorName,
      required this.timerPerTurn,
      this.dictionary,
      required this.gameType,
      required this.maxPlayers,
      this.isSolo,
      this.isGameOver,
      required this.isPublic,
      required this.password});

  RoomInfo.fromJson(dynamic json)
      : name = json['name'],
        creatorName = json['creatorName'],
        timerPerTurn = json['timerPerTurn'],
        dictionary = json['dictionary'],
        gameType = json['gameType'],
        maxPlayers = json['maxPlayers'],
        isSolo = json['isSolo'],
        isGameOver = json['isGameOver'],
        isPublic = json['isPublic'],
        password = json['password'];

  Map<String, dynamic> toJson() => {
        'name': name,
        'creatorName': creatorName,
        'timerPerTurn': timerPerTurn,
        'dictionary': dictionary,
        'gameType': gameType,
        'maxPlayers': maxPlayers,
        'isSolo': isSolo,
        'isGameOver': isGameOver,
        'isPublic': isPublic,
        'password': password,
      };
}

class Room {
  int elapsedTime;
  List<Player> players;
  RoomInfo roomInfo;
  bool? isBankUsable;

  Room(
      {required this.elapsedTime,
      required this.players,
      required this.roomInfo,
      required this.isBankUsable});

  Room.fromJson(dynamic json, jsonPlayers, jsonRoomInfo)
      : elapsedTime = json['elapsedTime'],
        players = jsonPlayers,
        roomInfo = jsonRoomInfo;

  Map<String, dynamic> toJson() => {
        'elapsedTime': elapsedTime,
        'players': players,
        'roomInfo': roomInfo,
      };
}

class Account {
  String username;
  String email;
  String defaultLanguage;
  String defaultTheme;
  int highscore;
  int totalXP;
  List<String> badges;
  String avatarUrl;
  List<GameHeader> bestGames;
  List<GameHeader> gamesPlayed;
  int gamesWon;

  Account({required this.username, required this.email, required this.defaultLanguage,
  required this.defaultTheme, required this.highscore, required this.totalXP,
  required this.badges, required this.avatarUrl, required this.bestGames,
  required this.gamesPlayed, required this.gamesWon});

  Account.fromJson(dynamic json, jsonGameHeader)
      : username = json['username'],
        email = json['email'],
        defaultLanguage = json['defaultLanguage'],
        defaultTheme = json['defaultTheme'],
        highscore = json['highscore'],
        totalXP = json['totalXP'],
        badges = json['badges'],
        avatarUrl = json['avatarUrl'],
        bestGames = jsonGameHeader,
        gamesPlayed = jsonGameHeader,
        gamesWon = json['gamesWon'];

  Map<String, dynamic> toJson() => {
    'username': username,
    'email': email,
    'defaultLanguage': defaultLanguage,
    'defaultTheme': defaultTheme,
    'highscore': highscore,
    'totalXP': totalXP,
    'badges': badges,
    'avatarUrl': avatarUrl,
    'bestGames': bestGames,
    'gamesPlayed': gamesPlayed,
    'gamesWon': gamesWon,
  };
}

class GameHeader {
  String type;
  int score;
  String gameID;

  GameHeader({required this.type, required this.score, required this.gameID});

  GameHeader.fromJson(dynamic json)
      : type = json['type'],
        score = json['score'],
        gameID = json['gameID'];

  Map<String, dynamic> toJson() => {
    'type': type,
    'score': score,
    'gameID': gameID,
  };

}

class DiscussionChannel {
  String name;
  Account? owner;
  List<String> activeUsers;
  List<ChatMessage> messages;

  DiscussionChannel({required this.name, this.owner, required this.activeUsers,
  required this.messages});

  DiscussionChannel.fromJson(dynamic json, jsonAccount, jsonMessages)
      : name = json['name'],
        owner = jsonAccount,
        activeUsers = json['activeUsers'],
        messages = jsonMessages;

  Map<String, dynamic> toJson() => {
    'name': name,
    'owner': owner,
    'activeUsers': activeUsers,
    'messages': messages,
  };

}
