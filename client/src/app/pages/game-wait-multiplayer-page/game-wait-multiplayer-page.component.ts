import { Component, OnInit } from '@angular/core';
import { PageCommunicationManager } from '@app/classes/communication-manager/page-communication-manager';
import { SocketClientService } from '@app/services/socket-client.service';

@Component({
    selector: 'app-game-wait-multiplayer-page',
    templateUrl: './game-wait-multiplayer-page.component.html',
    styleUrls: ['./game-wait-multiplayer-page.component.scss'],
    providers: [],
})
export class GameWaitMultiplayerPageComponent extends PageCommunicationManager implements OnInit {
    constructor(protected socketService: SocketClientService) {
        super(socketService);
    }

    ngOnInit() {
        this.connectSocket();
    }

    protected configureBaseSocketFeatures(): void {
        return;
    }
}
