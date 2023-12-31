import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PageCommunicationManager } from '@app/classes/communication-manager/page-communication-manager';
import { Room } from '@app/classes/room';
import { PlayerService } from '@app/services/player.service';
import { SocketClientService } from '@app/services/socket-client.service';
import { ThemeService } from '@app/services/theme.service';

@Component({
    selector: 'app-game-option-page',
    templateUrl: './game-option-page.component.html',
    styleUrls: ['./game-option-page.component.scss', '../dark-theme.scss'],
})
export class GameOptionPageComponent extends PageCommunicationManager implements OnInit {
    constructor(
        public playerService: PlayerService,
        protected socketService: SocketClientService,
        protected themeService: ThemeService,
        private router: Router,
    ) {
        super(socketService);
    }

    get room(): Room {
        return this.playerService.room;
    }

    ngOnInit() {
        this.connectSocket();
    }

    setSoloMode(value: boolean) {
        this.playerService.room.roomInfo.isSolo = value;
    }

    navigateObserveRoomPage() {
        this.playerService.isObserver = true;
        this.room.roomInfo.gameType = 'classic';
        this.router.navigate(['game/multiplayer/join']);
    }

    protected configureBaseSocketFeatures(): void {
        return;
    }
}
