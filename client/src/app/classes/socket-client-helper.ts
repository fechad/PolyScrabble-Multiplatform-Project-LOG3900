/* eslint-disable @typescript-eslint/no-empty-function */
import { SocketClientService } from '@app/services/socket-client.service';
import { Socket } from 'socket.io-client';
import { SocketTestHelper } from './socket-test-helper';

export class SocketClientServiceMock extends SocketClientService {
    constructor(socketHelper: SocketTestHelper) {
        super();
        this.socket = socketHelper as unknown as Socket;
    }

    override isSocketAlive(): boolean {
        return true;
    }

    override connect() {}

    override removeAllPreviousListeners() {}

    override refreshConnection() {}
}
