import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { SocketEvent } from '@app/enums/socket-event';
import { HttpService } from '@app/services/http.service';
import { PlayerService } from '@app/services/player.service';
import { SocketClientService } from '@app/services/socket-client.service';
import { ThemeService } from '@app/services/theme.service';
import { lastValueFrom } from 'rxjs/internal/lastValueFrom';

@Component({
    selector: 'app-password-changer-popup',
    templateUrl: './password-changer-popup.component.html',
    styleUrls: ['./password-changer-popup.component.scss'],
})
export class PasswordChangerPopupComponent {
    constructor(
        private dialogRef: MatDialogRef<PasswordChangerPopupComponent>,
        private playerService: PlayerService,
        private httpService: HttpService,
        private router: Router,
        protected socketService: SocketClientService,
        protected themeService: ThemeService,
    ) {}

    async submitChangePasswordRequest() {
        await lastValueFrom(this.httpService.logoutUser(this.playerService.player.clientAccountInfo.username));
        this.socketService.send(SocketEvent.LogOut);
        this.playerService.resetPlayerAndRoomInfo();
        this.themeService.currentTheme = 'light-theme';
        this.themeService.darkThemeSelected = false;
        this.themeService.setTheme();
        this.dialogRef.close();
        this.router.navigate(['/reset-password']);
    }

    setPlaceholderAsLabel(labelElement: HTMLLabelElement) {
        labelElement.classList.remove('placeholder');
    }

    focusInput(inputElement: HTMLInputElement) {
        inputElement.focus();
    }

    closeDialog() {
        this.dialogRef.close();
    }
}
