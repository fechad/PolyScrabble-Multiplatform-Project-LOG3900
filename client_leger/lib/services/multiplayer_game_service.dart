import 'package:client_leger/pages/game_page.dart';
import 'package:client_leger/services/solo_game_service.dart';

import '../classes/game.dart';
import '../components/chat_model.dart';
import '../config/flutter_flow/flutter_flow_util.dart';
import '../main.dart';
import '../pages/home_page.dart';
import 'link_service.dart';

class MultiplayerGameService extends SoloGameService {
  List<Room> availableRooms = [];
  List<Room> allPublicRooms = [];
  List<ChatModel> availableChannels = [];
  List<Account> opponentsInfo = [];
  List<Goal> goals = [];
  List<PlayerRack> playersRack = [];

  MultiplayerGameService({required super.gameData}) {
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
            isPublic: false, //by default games are private
            password: ''),
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

  configureSocketFeatures() {
    socketService.send("availableRooms");
    socketService.send("publicRooms");
    socketService.send("getDiscussionChannels");

    socketService.on(
      "updateAvailableRoom",
      (rooms) => {
        availableRooms = [],
        for (var r in rooms)
          {
            availableRooms.add(decodeModel(r)),
          },
      },
    );

    socketService.on(
        "roomCreated",
        (serverRoom) async => {
              room = decodeModel(serverRoom),
              //await getOpponentsInfo(),
              socketService.send("createChatChannel", {
                "channel": room.roomInfo.name,
                "username": authenticator.getCurrentUser(),
                'isRoomChannel': true,
              })
            });

    socketService.on(
      "availableChannels",
      (channels) => {
        availableChannels = [],
        for (var channel in channels)
          {availableChannels.add(chatService.decodeModel(channel))},
        if (room.roomInfo.name != '')
          {chatService.getDiscussionChannelByName(room.roomInfo.name)}
      },
    );

    socketService.on(
        "roomChannelUpdated",
        (channel) => {
              chatService.setRoomChannel(chatService.decodeModel(channel)),
            });

    socketService.on(
        "playerAccepted",
        (room) => {
              room = decodeModel(room),
              if (room.roomInfo.creatorName !=
                  authenticator.getCurrentUser().username)
                socketService.send("joinChatChannel", {
                  'name': room.roomInfo.name,
                  'user': authenticator.currentUser.username,
                  'isRoomChannel': true
                }),
            });

    socketService.on(
        "playerRejected",
        (room) => {
              room = decodeModel(room),
              leaveRoomOther(),
            });

    socketService.on(
      "lettersBankCountUpdated",
      (count) => {linkService.setLetterBankCount(count as int)},
    );

    socketService.on(
      "drawRack",
      (rack) => {linkService.updateRack(rack as String)},
    );
  }

  setRoomInfoMultiplayer(bool isPublic, String pswd, String difficulty) {
    room.botsLevel = difficulty.toLowerCase();
    room.roomInfo.timerPerTurn = gameData.timerPerTurn;
    room.roomInfo.dictionary = gameData.dictionary;
    room.roomInfo.gameType = 'classic'; //TODO get variable for game type
    room.roomInfo.isGameOver = false;
    room.roomInfo.isSolo = false;
    room.roomInfo.isPublic = isPublic;
    if (isPublic) {
      room.roomInfo.password = pswd;
    }
  }

  joinRoomMultiplayer(bool isPublic, String pswd, String difficulty) {
    String pseudo = gameData.pseudo;
    setRoomInfoMultiplayer(isPublic, pswd, difficulty);
    setPlayerInfo(pseudo);
    onProcess = true;
    socketService.send("createRoom", room);
  }

  leaveRoomCreator() {
    socketService.send("leaveRoomCreator", room.roomInfo.name);
    reinitializeRoom();
  }

  leaveRoomOther() {
    socketService.send("leaveRoomOther", room.roomInfo.name);
    reinitializeRoom();
  }

  reinitializeRoom() {
    chatService
        .setRoomChannel(ChatModel(name: '', activeUsers: [], messages: []));

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
            password: ''),
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

  requestGameStart() {
    socketService.send("startGameRequest", room.roomInfo.name);
  }

  acceptPlayer(String playerName) {
    socketService.send("acceptPlayer",
        {'roomName': room.roomInfo.name, 'playerName': playerName});
  }

  rejectPlayer(String playerName) {
    socketService.send("rejectPlayer",
        {'roomName': room.roomInfo.name, 'playerName': playerName});
  }

  leave() {
    if (room.roomInfo.creatorName == authenticator.currentUser.username) {
      leaveRoomCreator();
    } else {
      leaveRoomOther();
    }
    linkService.buttonChange();
    linkService.setCurrentOpenedChat('');
    reinitializeRoom();
  }
}
