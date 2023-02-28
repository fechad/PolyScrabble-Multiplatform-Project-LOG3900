import { Component, OnInit } from '@angular/core';
import { Room } from '@app/classes/room';
import { SocketClientService } from '@app/services/socket-client.service';

@Component({
    selector: 'app-game-option-page',
    templateUrl: './game-option-page.component.html',
    styleUrls: ['./game-option-page.component.scss', '../dark-theme.scss'],
})
export class GameOptionPageComponent implements OnInit {
    constructor(public room: Room, private socketService: SocketClientService) {}

    ngOnInit() {
        this.connect();
    }

    private connect() {
        this.socketService.refreshConnection();
    }
}
