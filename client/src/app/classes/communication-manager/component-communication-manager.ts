import { MAX_RECONNECTION_DELAY, ONE_SECOND_IN_MS } from '@app/constants/constants';
import { SocketClientService } from '@app/services/socket-client.service';
import { CommunicationManager } from './communication-manager';

export abstract class ComponentCommunicationManager extends CommunicationManager {
    protected socketService: SocketClientService;
    constructor(socketService: SocketClientService) {
        super();
        this.socketService = socketService;
    }

    protected connectSocket() {
        if (this.socketService.isSocketAlive()) {
            this.configureBaseSocketFeatures();
            this.onFirstSocketConnection();
            return;
        }
        this.configureSocketFeaturesOnPageSocketConnection();
    }

    protected onFirstSocketConnection() {
        return;
    }

    protected onRefresh() {
        return;
    }

    private configureSocketFeaturesOnPageSocketConnection() {
        let secondPassed = 0;

        const timerInterval = setInterval(() => {
            if (secondPassed >= MAX_RECONNECTION_DELAY) {
                clearInterval(timerInterval);
            }
            if (this.socketService.isSocketAlive()) {
                this.configureBaseSocketFeatures();
                this.onRefresh();
                clearInterval(timerInterval);
            }
            secondPassed++;
        }, ONE_SECOND_IN_MS);
    }

    protected abstract configureBaseSocketFeatures(): void;
}
