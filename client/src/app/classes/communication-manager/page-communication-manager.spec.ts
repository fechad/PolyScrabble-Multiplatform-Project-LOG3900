/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { PageCommunicationManager } from '@app/classes/communication-manager/page-communication-manager';
import { SocketClientServiceMock } from '@app/classes/socket-client-helper';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { SocketClientService } from '@app/services/socket-client.service';

class ConcretePageCommunicationManager extends PageCommunicationManager {
    constructor(protected socketService: SocketClientService) {
        super(socketService);
    }
    protected configureBaseSocketFeatures(): void {}
}

describe('ComponentCommunicationManager', () => {
    let pageCommunicationManager: any;
    let socketServiceMock: SocketClientServiceMock;
    let socketHelper: SocketTestHelper;
    beforeEach(() => {
        socketHelper = new SocketTestHelper();
        socketServiceMock = new SocketClientServiceMock(socketHelper);
        pageCommunicationManager = new ConcretePageCommunicationManager(socketServiceMock);
    });

    describe('Connection tests', () => {
        it('should call socketServiceMock.refreshConnection on connection', () => {
            socketServiceMock.refreshConnection = jasmine.createSpy();
            pageCommunicationManager.connectSocket();
            expect(socketServiceMock.refreshConnection).toHaveBeenCalled();
        });

        it('should call configureBaseSocketFeatures on connection', () => {
            pageCommunicationManager.configureBaseSocketFeatures = jasmine.createSpy();
            pageCommunicationManager.connectSocket();
            expect(pageCommunicationManager.configureBaseSocketFeatures).toHaveBeenCalled();
        });

        it('should not call socketServiceMock.connect on connection if socket is already connected', () => {
            socketServiceMock.connect = jasmine.createSpy();
            socketServiceMock.socket.connected = true;
            pageCommunicationManager.connectSocket();
            expect(socketServiceMock.connect).not.toHaveBeenCalled();
        });
    });
});
