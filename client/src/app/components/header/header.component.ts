import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SocketEvent } from '@app/enums/socket-event';
import { HttpService } from '@app/services/http.service';
import { PlayerService } from '@app/services/player.service';
import { SocketClientService } from '@app/services/socket-client.service';
import { lastValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-hearder',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
    constructor(
        private playerService: PlayerService,
        private httpService: HttpService,
        private router: Router,
        private socketService: SocketClientService,
    ) {}

    async logOut() {
        if (!environment.production) return;
        await lastValueFrom(this.httpService.logoutUser(this.playerService.player.pseudo));
        this.socketService.send(SocketEvent.LeaveChatChannel, { channel: 'General Chat', username: this.playerService.player.pseudo });
        this.playerService.player.pseudo = '';
        this.router.navigate(['/home']);
    }
}
