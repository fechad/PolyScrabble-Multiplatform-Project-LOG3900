import { Component, OnInit } from '@angular/core';
import { Room } from '@app/classes/room';
import { SocketClientService } from '@app/services/socket-client.service';

@Component({
    selector: 'app-game-option-page',
    templateUrl: './game-option-page.component.html',
    styleUrls: ['./game-option-page.component.scss', '../dark-theme.scss'],
})
export class GameOptionPageComponent implements OnInit {
    constructor(private socketService: SocketClientService, public room: Room) {}
    ngOnInit() {
        this.disconnect();
    }

    disconnect() {
        if (this.socketService.isSocketAlive()) {
            this.socketService.disconnect();
        }
    }
}
