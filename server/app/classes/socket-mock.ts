/* eslint-disable no-unused-vars */ // we want to mock the method argument of socketMock
export class SocketMock {
    id = '';
    rooms = [];
    leave(roomName: string) {
        return;
    }
    join(roomName: string) {
        return;
    }
    to(roomName: string): SocketMock {
        return new SocketMock();
    }
    emit(nameEvent: string, dataEvent?: unknown) {
        return;
    }
}
