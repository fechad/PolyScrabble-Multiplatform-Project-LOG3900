import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';

class MockSocket {
  late bool alive;
  late bool connected;
  List<String> events = [];

  MockSocket();

  on<T>(String event, Function action) {
    events.add(event);
  }

  connect() {
    alive = true;
    connected = true;
  }

  disconnect() {
    alive = false;
    connected = false;
  }

  bool emit<T>(String event, [T? data]) {
    return true;
  }
}

class SocketServiceMock extends Mock {
  late MockSocket socket;

  SocketServiceMock() {
    socket = MockSocket();
  }

  bool isAlive() {
    return socket.alive;
  }

  void connect() {
    socket.connect();
  }

  void disconnect() {
    socket.disconnect();
  }

  on<T>(String event, Function action) {
    socket.on(event, action as dynamic);
  }

  bool send<T>(String event, [T? data]) {
    if (data != null) {
      return socket.emit(event, data);
    } else {
      return socket.emit(event);
    }
  }
}

void main() {
  late SocketServiceMock socket_service;

  setUpAll(() {
    socket_service = SocketServiceMock();
    socket_service.connect();
  });
  tearDownAll(() => null);
  test('Socket should connect', () {
    expect(socket_service.socket.connected, true);
  });

  test('Socket should disconnect', () {
    socket_service.disconnect();
    expect(socket_service.socket.connected, false);
  });

  test('Socket should register event', () {
    String event = 'newEvent';
    socket_service.on(event, () => null);
    expect(socket_service.socket.events.contains(event), true);
  });

  test('Socket should send event', () {
    String event = 'newEvent';
    expect(socket_service.send(event, () => null), true);
  });
}
