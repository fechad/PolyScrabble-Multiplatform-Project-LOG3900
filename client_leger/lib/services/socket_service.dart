import 'package:socket_io_client/socket_io_client.dart' as Io;

import '../config/environment.dart';

class SocketService {
  late Io.Socket _socket;

  SocketService._() {
    _socket = Io.io(
        getSocketURL(),
        Io.OptionBuilder()
            .setTransports(['websocket'])
            .setPath('/socket.io')
            .disableAutoConnect()
            .build());
  }
  static final instance = SocketService._();
  bool isSocketAlive() {
    return _socket.connected;
  }

  SocketService getInstance() {
    return instance;
  }

  connect() {
    if(!_socket.connected) _socket.connect();
  }

  disconnect() {
    _socket.disconnect();
  }

  // action should be of type (data: T) => void
  // ex:
  // 1. define a variable like int plusOne(int i) => i + 1;
  // 2. on("event", plusOne)

  on<T>(String event, Function action) {
    _socket.on(event, action as dynamic);
  }

  send<T>(String event, [T? data]) {
    if (data != null) {
      _socket.emit(event, data);
    } else {
      _socket.emit(event);
    }
  }

  getSocketID() {
    return _socket.id;
  }
}
