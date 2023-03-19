import 'dart:convert';

import 'package:client_leger/pages/game_page.dart';
import 'package:client_leger/services/solo_game_service.dart';

import '../classes/game.dart';
import '../components/chat_model.dart';
import '../main.dart';
import '../pages/connexion_page.dart';
import '../pages/home_page.dart';
import 'link_service.dart';

class MultiplayerGameService extends SoloGameService {
  List<Room> availableRooms = [];
  List<ChatModel> availableChannels = [];
  List<Account> opponentsInfo = [];

  MultiplayerGameService({required super.gameData}) {
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
            isPublic: false, //by default games are private
            password: ''),
        isBankUsable: false);
    player = Player(
        pseudo: authenticator.currentUser.username,
        socketId: socketService.getSocketID() ?? 'id',
        points: 0,
        isCreator: true,
        isItsTurn: false);
  }
  Future<List<Account>> getOpponentsInfo() async {
    if (opponentsInfo.isNotEmpty) return opponentsInfo;
    await Future.delayed(Duration(seconds: 1));

    for (Player p in gameService.room.players) {
      final res = await httpService.getOpponentInfo(p.pseudo);
      print('entered in loop');
      opponentsInfo.add(Account.fromJson(jsonDecode(res.body)));
    }
    print(opponentsInfo.length);
    return opponentsInfo;
  }

  configureSocketFeatures() {
    socketService.send("availableRooms");
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
              await getOpponentsInfo(),
              socketService.send("createChatChannel", {
                "channel": room.roomInfo.name,
                "username": authenticator.currentUser.username,
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

  setRoomInfoMultiplayer(bool isPublic, String pswd) {
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

  joinRoomMultiplayer(bool isPublic, String pswd) {
    String pseudo = gameData.pseudo;
    setRoomInfoMultiplayer(isPublic, pswd);
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
    room.roomInfo.name = '';
    room.roomInfo.timerPerTurn = '';
    room.roomInfo.gameType = '';
    room.roomInfo.isPublic = true;
    room.roomInfo.password = '';
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
  }
}
