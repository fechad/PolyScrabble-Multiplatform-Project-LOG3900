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
