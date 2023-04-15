import { Component, OnInit } from '@angular/core';
import { PageCommunicationManager } from '@app/classes/communication-manager/page-communication-manager';
import { ThemedDifficulty, ThemedTimers } from '@app/constants/themed-mode-constants';
import { SocketClientService } from '@app/services/socket-client.service';
import { ThemeService } from '@app/services/theme.service';

@Component({
    selector: 'app-themed-page',
    templateUrl: './themed-page.component.html',
    styleUrls: ['./themed-page.component.scss'],
})
export class ThemedPageComponent extends PageCommunicationManager implements OnInit {
    constructor(protected socketService: SocketClientService, protected themeService: ThemeService) {
        super(socketService);
    }

    get difficulty() {
        return ThemedDifficulty;
    }

    get time() {
        return ThemedTimers;
    }

    ngOnInit() {
        this.connectSocket();
    }

    protected configureBaseSocketFeatures() {
        return;
    }
}
