import 'package:client_leger/main.dart';

import '../classes/game.dart';
import '../config/flutter_flow/flutter_flow_util.dart';
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
            timerPerTurn: '60',
            gameType: 'classic',
            dictionary: 'dictionnaire par défaut',
            maxPlayers: 4,
            creatorName: authenticator.currentUser.username,
            isPublic: true,
            password: '',
            botLanguage: languageService.currentLanguage.languageCode == 'en' ? 'english' : 'french'),
        isBankUsable: false,
        observers: [],
        placementsData: [],
        startDate: DateFormat('HH:mm:ss').format(DateTime.now()),
        fillerNamesUsed: [],
        botsLevel: '',
        bots: []);

    player = Player(
        socketId: socketService.getSocketID() ?? 'id',
        points: 0,
        isCreator: true,
        isItsTurn: false,
        clientAccountInfo: authenticator.getCurrentUser(),
        rack: Rack(letters: '', indexLetterToReplace: []));
  }

  configureBaseSocketFeatures() {
    socketService.on("botInfos", (bot) => {room.players[1] = bot});

  }

  setRoomInfo(String pseudo, String desiredLevel, String botLanguage) {
    room.botsLevel = desiredLevel;
    room.roomInfo.timerPerTurn = gameService.gameData.timerPerTurn;
    room.roomInfo.dictionary = gameService.gameData.dictionary;
    room.roomInfo.isSolo = true;
    room.roomInfo.isGameOver = false;
    room.roomInfo.botLanguage = botLanguage;
  }

  setPlayerInfo(String pseudo) {
    player.isCreator = true;
    player.socketId = socketService.getSocketID()!;
    room.players = [player];
  }

  joinRoom(String botName, String desiredLevel, String botLanguage) {
    String pseudo = gameService.gameData.pseudo;
    setRoomInfo(pseudo, desiredLevel, botLanguage);
    setPlayerInfo(pseudo);
    onProcess = true;
    socketService.send("createSoloRoom",
        {'room': room, 'botName': botName, 'desiredLevel': desiredLevel});
  }

  Room decodeModel(dynamic data) {
    List<Player> players = decodePlayers(data['players']);

    RoomInfo roomInfo = RoomInfo.fromJson(data['roomInfo']);

    Room ourRoom = Room.fromJson(data, players, roomInfo);

    ourRoom.observers = decodeObservers(data['observers']);

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

  List<RoomObserver> decodeObservers(dynamic data) {
    List<RoomObserver> observers = [];
    for (var o in data) {
      observers.add(RoomObserver.fromJson(o));
    }
    return observers;
  }
}
