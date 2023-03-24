import 'package:client_leger/services/socket_service.dart';
import 'package:socket_io_client/socket_io_client.dart' as Io;
import '../classes/game.dart';
import '../config/environment.dart';
import '../main.dart';
import 'link_service.dart';

Io.Socket socket = Io.io(
    getSocketURL(),
    Io.OptionBuilder()
        .setTransports(['websocket'])
        .setPath('/socket.io')
        .disableAutoConnect()
        .build());

final homeSocketService = SocketService.instance;

bool alreadyConnected = false;

void connect() {
  socket.clearListeners();
  try {
    homeSocketService.connect();
  } catch (e) {
    print(e);
  }

  try {
    print('config');
    print(socket.id);
    gameService.configureSocketFeatures();
  } catch (e) {
    print(e);
  }

  try {
    socket.connect();
    socket.onConnect((data) {
      print('connect');
    });
    socket.on(
        'connect_error',
            (d) =>
        {
          print(socket.io.options),
          print(d),
          print(socket.io.options)
        });

    print(socket.connected);
  } catch (e) {
    print(e);
  }

  gameService.room = Room(
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
  gameService.player = Player(
      socketId: socketService.getSocketID() ?? 'id',
      points: 0,
      isCreator: true,
      isItsTurn: false,
      clientAccountInfo: authenticator.getCurrentUser(),
      rack: Rack(letters: '', indexLetterToReplace: []));

}
