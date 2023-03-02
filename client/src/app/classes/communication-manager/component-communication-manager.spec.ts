/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { SocketClientServiceMock } from '@app/classes/socket-client-helper';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { TIMER_TEST_DELAY } from '@app/constants/constants';
import { SocketClientService } from '@app/services/socket-client.service';
import { ComponentCommunicationManager } from './component-communication-manager';

class ConcreteComponentCommunicationManager extends ComponentCommunicationManager {
    constructor(protected socketService: SocketClientService) {
        super(socketService);
    }
    protected configureBaseSocketFeatures(): void {}
}

describe('ComponentCommunicationManager', () => {
    let componentCommunicationManager: any;
    let socketServiceMock: SocketClientServiceMock;
    let socketHelper: SocketTestHelper;
    beforeEach(() => {
        socketHelper = new SocketTestHelper();
        socketServiceMock = new SocketClientServiceMock(socketHelper);
        componentCommunicationManager = new ConcreteComponentCommunicationManager(socketServiceMock);
    });

    describe('connect() tests', () => {
        it('should call configureBaseSocketFeatures if the socket is alive', () => {
            spyOn(socketServiceMock, 'isSocketAlive').and.returnValue(true);
            const spy = spyOn(componentCommunicationManager, 'configureBaseSocketFeatures');
            componentCommunicationManager.connectSocket();
            expect(spy).toHaveBeenCalled();
        });

        it('should try to reconnect if the socket is not alive', () => {
            spyOn(socketServiceMock, 'isSocketAlive').and.returnValue(false);
            const spy = spyOn(componentCommunicationManager, 'configureSocketFeaturesOnPageSocketConnection');
            componentCommunicationManager.connectSocket();
            expect(spy).toHaveBeenCalled();
        });

        it('should call onFirstSocketConnection if the socket is alive', () => {
            spyOn(socketServiceMock, 'isSocketAlive').and.returnValue(true);
            const spy = spyOn(componentCommunicationManager, 'onFirstSocketConnection');
            componentCommunicationManager.connectSocket();
            expect(spy).toHaveBeenCalled();
        });

        it('should reconnect and call onRefresh if the socket is alive', (done) => {
            spyOn(socketServiceMock, 'isSocketAlive').and.returnValue(true);
            const configureBaseSocketFeatureSpy = spyOn(componentCommunicationManager, 'configureBaseSocketFeatures');
            const spy = spyOn(componentCommunicationManager, 'onRefresh');
            componentCommunicationManager.configureSocketFeaturesOnPageSocketConnection();

            setTimeout(() => {
                expect(configureBaseSocketFeatureSpy).toHaveBeenCalled();
                expect(spy).toHaveBeenCalled();
                done();
            }, TIMER_TEST_DELAY);
        });

        it('should reconnect if the socket is alive', (done) => {
            spyOn(socketServiceMock, 'isSocketAlive').and.returnValue(true);
            const spy = spyOn(componentCommunicationManager, 'configureBaseSocketFeatures');
            componentCommunicationManager.configureSocketFeaturesOnPageSocketConnection();

            setTimeout(() => {
                expect(spy).toHaveBeenCalled();
                done();
            }, TIMER_TEST_DELAY);
        });

        // TODO: fake timer
        it('should not reconnect if the socket is not alive after 5 sec', (done) => {
            spyOn(socketServiceMock, 'isSocketAlive').and.returnValue(false);
            const spy = spyOn(componentCommunicationManager, 'configureBaseSocketFeatures');
            componentCommunicationManager.configureSocketFeaturesOnPageSocketConnection();

            setTimeout(() => {
                expect(spy).not.toHaveBeenCalled();
                done();
            }, TIMER_TEST_DELAY);
        });
    });
});
