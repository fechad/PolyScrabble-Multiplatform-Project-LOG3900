import 'dart:convert';

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
  String socketId;
  int points;
  bool isCreator;
  bool isItsTurn;
  Account? clientAccountInfo;
  Rack? rack;

  Player(
      {required this.socketId,
      required this.points,
      required this.isCreator,
      required this.isItsTurn,
      this.clientAccountInfo,
      this.rack});

  Player.fromJson(dynamic json)
      : socketId = json['socketId'],
        points = json['points'],
        isCreator = json['isCreator'],
        isItsTurn = json['isItsTurn'],
        clientAccountInfo = Account.fromJson(json['clientAccountInfo']),
        rack = Rack.fromJson(json['rack']);

  Map<String, dynamic> toJson() => {
        'socketId': socketId,
        'points': points,
        'isCreator': isCreator,
        'isItsTurn': isItsTurn,
        'clientAccountInfo': clientAccountInfo,
        'rack': rack,
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
  String? botLanguage;

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
      required this.password,
      this.botLanguage});

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
        password = json['password'],
        botLanguage = json['botLanguage'];

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
        'botLanguage': botLanguage,
      };
}

class Room {
  int elapsedTime;
  List<Player> players;
  List<RoomObserver>? observers;
  List<PlacementData>? placementsData;
  String? startDate;
  List<String>? fillerNamesUsed;
  String? botsLevel;
  List<Player>? bots;
  RoomInfo roomInfo;
  bool? isBankUsable;

  Room(
      {required this.elapsedTime,
      required this.players,
      required this.observers,
      required this.placementsData,
      required this.startDate,
      required this.fillerNamesUsed,
      required this.botsLevel,
      required this.bots,
      required this.roomInfo,
      required this.isBankUsable});

  Room.fromJson(dynamic json, jsonPlayers, jsonRoomInfo,
      [jsonObservers, jsonPlacements, jsonFillers, jsonBots])
      : elapsedTime = json['elapsedTime'],
        players = jsonPlayers,
        observers = jsonObservers,
        placementsData = jsonPlacements,
        startDate = json['startDate'].toString(),
        fillerNamesUsed = jsonFillers,
        botsLevel = json['botsLevel'],
        bots = jsonBots,
        roomInfo = jsonRoomInfo,
        isBankUsable = json['isBankUsable'];

  Map<String, dynamic> toJson() => {
        'elapsedTime': elapsedTime,
        'players': players,
        'roomInfo': roomInfo,
      };
}

class UserSettings {
  String avatarUrl;
  String defaultLanguage;
  String defaultTheme;
  String victoryMusic;

  UserSettings(
      {required this.avatarUrl,
      required this.defaultLanguage,
      required this.defaultTheme,
      required this.victoryMusic});

  UserSettings.fromJson(dynamic json)
      : avatarUrl = json['avatarUrl'],
        defaultLanguage = json['defaultLanguage'],
        defaultTheme = json['defaultTheme'],
        victoryMusic = json['victoryMusic'];

  Map<String, dynamic> toJson() => {
        'avatarUrl': avatarUrl,
        'defaultLanguage': defaultLanguage,
        'defaultTheme': defaultTheme,
        'victoryMusic': victoryMusic,
      };
}

class ProgressInfo {
  int? totalXP;
  int? currentLevel;
  int? currentLevelXp;
  int? xpForNextLevel;
  int? victoriesCount;

  ProgressInfo(
      {required this.totalXP,
      required this.currentLevel,
      required this.currentLevelXp,
      required this.xpForNextLevel,
      required this.victoriesCount});

  ProgressInfo.fromJson(dynamic json)
      : totalXP = json?['totalXP'],
        currentLevel = json?['currentLevel'],
        currentLevelXp = json?['currentLevelXp'],
        xpForNextLevel = json?['xpForNextLevel'],
        victoriesCount = json?['victoriesCount'];

  Map<String, dynamic> toJson() => {
        'totalXP': totalXP,
        'currentLevel': currentLevel,
        'currentLevelXp': currentLevelXp,
        'xpForNextLevel': xpForNextLevel,
        'victoriesCount': victoriesCount
      };
}

class Badge {
  String imageURL;
  String description;
  String id;

  Badge({required this.imageURL, required this.description, required this.id});

  Badge.fromJson(dynamic json)
      : imageURL = json['imageURL'],
        description = json['description'],
        id = json['id'];

  Map toJson() => {
        'imageURL': imageURL,
        'description': description,
        'id': id,
      };
}

List<Badge> parseJsonBadges(String responseBody) {
  final parsed = jsonDecode(responseBody).cast<Map<String, dynamic>>();
  return parsed.map<Badge>((json) => Badge.fromJson(json)).toList();
}

List<Badge> parseBadges(dynamic responseBody) {
  if (responseBody.toString().contains('{"imageURL"'))
    return parseJsonBadges(responseBody);
  List<Badge> badges = [];
  if (!responseBody.toString().contains('Santa')) return badges;
  for (int i = 0; i < (responseBody as List<dynamic>).length; i++) {
    badges.add(Badge(
        imageURL: responseBody[i]['imageURL'],
        description: responseBody[i]['description'],
        id: responseBody[i]['id']));
  }
  return badges;
}

class Account {
  String username;
  String email;
  UserSettings userSettings;
  ProgressInfo progressInfo;
  String? highScores;
  List<Badge> badges;
  List<dynamic> bestGames;
  List<dynamic> gamesPlayed;
  int gamesWon;

  Account(
      {required this.username,
      required this.email,
      required this.userSettings,
      required this.progressInfo,
      required this.highScores,
      required this.badges,
      required this.bestGames,
      required this.gamesPlayed,
      required this.gamesWon});

  Account.fromJson(dynamic json)
      : username = json['username'],
        email = json['email'],
        userSettings = UserSettings.fromJson(json['userSettings']),
        progressInfo = ProgressInfo.fromJson(json['progressInfo']),
        highScores = json['highScores'].toString(),
        badges = parseBadges(json['badges']),
        bestGames = json['bestGames']
            .toString()
            .replaceAll('[', '')
            .replaceAll(']', '')
            .split(','),
        gamesPlayed = json['gamesPlayed']
            .toString()
            .replaceAll('[', '')
            .replaceAll(']', '')
            .split(','),
        gamesWon = json['gamesWon'];

  Map toJson() => {
        'username': username,
        'email': email,
        'userSettings': userSettings.toJson(),
        'progressInfo': progressInfo.toJson(),
        'highScores': jsonEncode(highScores),
        'badges': jsonEncode(badges),
        'bestGames': jsonEncode(bestGames),
        'gamesPlayed': jsonEncode(gamesPlayed),
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

class Letter {
  String letter;
  int x;
  int y;
  Letter({required this.letter, required this.x, required this.y});
}

class PlacementData {
  String word;
  String row;
  int column;
  String direction;

  PlacementData(
      {required this.word,
      required this.row,
      required this.column,
      required this.direction});

  PlacementData.fromJson(dynamic json)
      : word = json['word'],
        row = json['row'],
        column = json['column'],
        direction = json['direction'];

  Map<String, dynamic> toJson() => {
        'row': row,
        'word': word,
        'column': column,
        'direction': direction,
      };
}

class DiscussionChannel {
  String name;
  Account? owner;
  List<String> activeUsers;
  List<ChatMessage> messages;

  DiscussionChannel(
      {required this.name,
      this.owner,
      required this.activeUsers,
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

class Message {
  String text;
  String? sender;

  Message({required this.text, this.sender});

  Message.fromJson(dynamic json)
      : text = json['text'],
        sender = json['sender'];

  Map<String, dynamic> toJson() => {
        'text': text,
        'sender': sender,
      };
}

class Rack {
  String? letters;
  List<int>? indexLetterToReplace;

  Rack({this.letters, this.indexLetterToReplace});

  Rack.fromJson(dynamic json)
      : letters = json['letters'],
        indexLetterToReplace = json['indexLetterToReplace'];

  Map<String, dynamic> toJson() => {
        'letters': letters,
        'indexLetterToReplace': indexLetterToReplace,
      };
}

class Goal {
  String title;
  String description;
  int reward;
  bool reached;
  bool isPublic;
  List<Player> players;

  Goal(
      {required this.title,
      required this.description,
      required this.reward,
      required this.reached,
      required this.isPublic,
      required this.players});

  Goal.fromJson(dynamic json, jsonPlayers)
      : title = json['title'],
        description = json['description'],
        reward = json['reward'],
        reached = json['reached'],
        isPublic = json['isPublic'],
        players = jsonPlayers;

  Map<String, dynamic> toJson() => {
        'title': title,
        'description': description,
        'reward': reward,
        'reached': reached,
        'isPublic': isPublic,
        'players': players,
      };
}

class RoomObserver {
  String socketId;
  String username;

  RoomObserver({required this.socketId, required this.username});

  RoomObserver.fromJson(dynamic json)
      : socketId = json['socketId'],
        username = json['username'];

  Map<String, dynamic> toJson() => {
        'socketId': socketId,
        'username': username,
      };
}

class PlayerRack {
  Player player;
  String rackLetters;

  PlayerRack({required this.player, required this.rackLetters});

  PlayerRack.fromJson(dynamic json)
      : player = json['player'],
        rackLetters = json['rackLetters'];

  Map<String, dynamic> toJson() => {
        'player': player,
        'rackLetters': rackLetters,
      };
}

class Position {
  int x;
  int y;

  Position({required this.x, required this.y});

  Position.fromJson(dynamic json)
      : x = json['x'],
        y = json['y'];

  Map<String, dynamic> toJson() => {
    'x': x,
    'y': y,
  };
}


