import 'package:socket_io_client/socket_io_client.dart' as Io;

import '../config/environment.dart';

class SocketService {
  late Io.Socket socket;

  SocketService() {
    socket = Io.io(
        getSocketURL(),
        Io.OptionBuilder()
            .setTransports(['websocket'])
            .setPath('/socket.io')
            .disableAutoConnect()
            .build());
  }

  bool isSocketAlive() {
    return socket.connected;
  }

  connect() {
    socket.connect();
  }

  disconnect() {
    socket.disconnect();
  }

  // action should be of type (data: T) => void
  // ex:
  // 1. define a variable like int plusOne(int i) => i + 1;
  // 2. on("event", plusOne)

  on<T>(String event, Function action) {
    socket.on(event, action as dynamic);
  }

  send<T>(String event, [T? data]) {
    if (data != null) {
      socket.emit(event, data);
    } else {
      socket.emit(event);
    }
  }
}
