import 'package:client_leger/main.dart';
import 'package:client_leger/services/socket_service.dart';

import '../classes/game.dart';

SocketService socketService = SocketService();
SocketService socketServiceBot = SocketService();

class SoloGameService {
  GameData gameData;
  late Room room;
  late Player player;
  bool onProcess = false;
  SoloGameService({required this.gameData}) {
    room = Room(
        elapsedTime: 0,
        players: [],
        roomInfo: RoomInfo(
            name: '',
            timerPerTurn: '',
            gameType: 'classic',
            dictionary: 'dictionnaire par défaut',
            maxPlayers: 4,
            creatorName: authenticator.currentUser.username,
            isPublic: true,
            password: ''),
        isBankUsable: false);

    player = Player(
        pseudo: authenticator.currentUser.username,
        socketId: socketService.socket.id ?? 'id',
        points: 0,
        isCreator: true,
        isItsTurn: false);
  }

  configureBaseSocketFeatures() {
    socketService.on(
        "joinRoomSoloStatus",
        (serverRoomName) => {
              onProcess = false,
              room.roomInfo.name = serverRoomName,
              socketServiceBot.send("joinRoomSoloBot", {
                "roomName": serverRoomName,
                "botName": gameData.botName,
                "isExpertLevel": gameData.isExpertLevel,
              })
            });
    socketService.on(
        "botInfos",
        (bot) => {
              room.players[1] = bot,
              //TODO : navigate to game page from flutter widget
            });
  }

  setRoomInfo(String pseudo) {
    room.roomInfo.timerPerTurn = gameData.timerPerTurn;
    room.roomInfo.dictionary = gameData.dictionary;
    room.roomInfo.isSolo = true;
    room.roomInfo.isGameOver = false;
  }

  setPlayerInfo(String pseudo) {
    player.pseudo = pseudo;
    player.isCreator = true;
    player.socketId = socketService.socket.id!;
    room.players = [player];
  }

  joinRoom() {
    String pseudo = gameData.pseudo;
    setRoomInfo(pseudo);
    setPlayerInfo(pseudo);
    onProcess = true;
    socketService.send("joinRoomSolo", room);
  }

  Room decodeModel(dynamic data) {
    List<Player> players = decodePlayers(data['players']);

    RoomInfo roomInfo = RoomInfo.fromJson(data['roomInfo']);

    Room ourRoom = Room.fromJson(data, players, roomInfo);

    return ourRoom;
  }

  List<Player> decodePlayers(dynamic data) {
    List<Player> players = [];
    for (var j in data) {
      players.add(decodePlayer(j));
    }
    return players;
  }

  Player decodePlayer(dynamic data) {
    Player res = Player.fromJson(data);
    return res;
  }
}