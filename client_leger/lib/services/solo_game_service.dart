import 'package:client_leger/main.dart';

import '../classes/game.dart';
import 'link_service.dart';

class SoloGameService {
  GameData gameData;
  late Room room;
  late Player player;
  late Player scorePlayer;
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
        socketId: socketService.getSocketID() ?? 'id',
        points: 0,
        isCreator: true,
        isItsTurn: false,
        clientAccountInfo: authenticator.getCurrentUser(),
        rack: Rack(letters: '', indexLetterToReplace: []));
  }

  configureBaseSocketFeatures() {
    socketService.on(
        "botInfos",
        (bot) => {
              room.players[1] = bot,
              //TODO : navigate to game page from flutter widget
            });
  }

  setRoomInfo(String pseudo) {
    room.roomInfo.timerPerTurn = gameService.gameData.timerPerTurn;
    room.roomInfo.dictionary = gameService.gameData.dictionary;
    room.roomInfo.isSolo = true;
    room.roomInfo.isGameOver = false;
  }

  setPlayerInfo(String pseudo) {
    player.isCreator = true;
    player.socketId = socketService.getSocketID()!;
    room.players = [player];
  }

  joinRoom(String botName, String desiredLevel) {
    String pseudo = gameService.gameData.pseudo;
    setRoomInfo(pseudo);
    setPlayerInfo(pseudo);
    onProcess = true;
    socketService.send("createSoloRoom",
        {'room': room, 'botName': botName, 'desiredLevel': desiredLevel});
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
