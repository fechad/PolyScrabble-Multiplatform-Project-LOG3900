import 'package:client_leger/pages/game_page.dart';
import 'package:client_leger/services/solo_game_service.dart';

import '../classes/game.dart';
import '../main.dart';

class MultiplayerGameService extends SoloGameService {
  List<Room> availableRooms = [];
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
        socketId: socketService.socket.id ?? 'id',
        points: 0,
        isCreator: true,
        isItsTurn: false);
  }

  configureSocketFeatures() {
    socketService.send("availableRooms");

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
        (roomName) => {
              room.roomInfo.name = roomName,
            });

    socketService.on(
        "playerAccepted",
        (room) => {
              room = decodeModel(room),
              //socketService.send("joinChatChannel", {'name': room.roomInfo.name, 'user': authenticator.currentUser.username}),
            });

    socketService.on(
        "playerRejected",
        (room) => {
              room = decodeModel(room),
              leaveRoomOther(room),
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

  leaveRoom() {
    socketService.send("leaveRoomCreator", room.roomInfo.name);
    reinitializeRoom();
  }

  leaveRoomOther(Room room) {
    socketService.send("leaveRoomOther", room.roomInfo.name);
    reinitializeRoom();
  }

  reinitializeRoom() {
    room.roomInfo.name = '';
    room.roomInfo.creatorName = '';
    room.roomInfo.timerPerTurn = '';
    room.roomInfo.gameType = '';
    room.roomInfo.isPublic = true;
    room.roomInfo.password = '';
  }

  requestGameStart() {
    socketService.send("startGameRequest", room.roomInfo.name);
  }

  acceptPlayer(String playerName) {
    print('accepting');
    socketService.send("acceptPlayer",
        {'roomName': room.roomInfo.name, 'playerName': playerName});
    print('accepted');
  }
}
