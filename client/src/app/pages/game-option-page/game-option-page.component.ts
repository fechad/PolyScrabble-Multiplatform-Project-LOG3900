import { Component, OnInit } from '@angular/core';
import { PageCommunicationManager } from '@app/classes/communication-manager/page-communication-manager';
import { Room } from '@app/classes/room';
import { SocketClientService } from '@app/services/socket-client.service';

@Component({
    selector: 'app-game-option-page',
    templateUrl: './game-option-page.component.html',
    styleUrls: ['./game-option-page.component.scss', '../dark-theme.scss'],
})
export class GameOptionPageComponent extends PageCommunicationManager implements OnInit {
    constructor(public room: Room, protected socketService: SocketClientService) {
        super(socketService);
    }

    ngOnInit() {
        this.connectSocket();
    }

    protected configureBaseSocketFeatures(): void {
        return;
    }
}
