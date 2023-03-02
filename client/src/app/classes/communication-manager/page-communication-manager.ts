import { SocketClientService } from '@app/services/socket-client.service';
import { CommunicationManager } from './communication-manager';

export abstract class PageCommunicationManager extends CommunicationManager {
    protected socketService: SocketClientService;
    constructor(socketService: SocketClientService) {
        super();
        this.socketService = socketService;
    }

    protected connectSocket() {
        this.socketService.refreshConnection();
        this.configureBaseSocketFeatures();
        this.onFirstSocketConnection();
    }

    protected onFirstSocketConnection(): void {
        return;
    }

    protected abstract configureBaseSocketFeatures(): void;
}
