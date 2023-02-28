import { Component, OnInit } from '@angular/core';
import { SocketClientService } from '@app/services/socket-client.service';

@Component({
    selector: 'app-game-wait-multiplayer-page',
    templateUrl: './game-wait-multiplayer-page.component.html',
    styleUrls: ['./game-wait-multiplayer-page.component.scss'],
    providers: [],
})
export class GameWaitMultiplayerPageComponent implements OnInit {
    constructor(private socketService: SocketClientService) {}

    ngOnInit() {
        this.connect();
    }

    private connect() {
        this.socketService.refreshConnection();
    }
}
