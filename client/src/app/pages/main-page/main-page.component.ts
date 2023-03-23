import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageCommunicationManager } from '@app/classes/communication-manager/page-communication-manager';
import { Room } from '@app/classes/room';
import { Score } from '@app/classes/score';
import { ErrorDialogComponent } from '@app/components/error-dialog/error-dialog.component';
import { LeaderBoardDialogDataComponent } from '@app/components/leaderboard-dialog-data/leaderboard-dialog-data.component';
import { HttpService } from '@app/services/http.service';
import { PlayerService } from '@app/services/player.service';
import { SessionStorageService } from '@app/services/session-storage.service';
import { SocketClientService } from '@app/services/socket-client.service';
import { ThemeService } from '@app/services/theme.service';
import { BehaviorSubject, lastValueFrom } from 'rxjs';
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-var-requires */

export const LEADERBOARD_SIZE = 5;
export const DIALOG_WIDTH = '600px';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss', '../dark-theme.scss'],
})
export class MainPageComponent extends PageCommunicationManager implements OnInit {
    title: string;
    message: BehaviorSubject<string>;
    constructor(
        public playerService: PlayerService,
        private dialog: MatDialog,
        private httpService: HttpService,
        private sessionStorageService: SessionStorageService,
        protected socketService: SocketClientService,
        protected themeService: ThemeService,
    ) {
        super(socketService);
        this.title = 'LOG2990';
        this.message = new BehaviorSubject<string>('');
    }

    get room(): Room {
        return this.playerService.room;
    }

    ngOnInit() {
        this.themeService.verifyTheme();
        this.connectSocket();
        this.playerService.resetPlayerAndRoomInfo();
        this.sessionStorageService.clear();
    }

    setGameType(type: string) {
        this.room.roomInfo.gameType = type;
    }

    async showLeaderboard() {
        const scores = await this.getLeaderboardScores();
        if (this.httpService.anErrorOccurred()) {
            this.showErrorDialog();
            return;
        }
        this.dialog.open(LeaderBoardDialogDataComponent, {
            width: DIALOG_WIDTH,
            autoFocus: true,
            data: scores,
        });
    }

    async showAllScores() {
        const scores = await lastValueFrom(this.httpService.fetchAllScores());
        if (!scores) {
            this.showErrorDialog();
            return;
        }
        this.dialog.open(LeaderBoardDialogDataComponent, {
            width: DIALOG_WIDTH,
            autoFocus: true,
            data: [scores],
        });
    }

    protected configureBaseSocketFeatures(): void {
        return;
    }

    private async getLeaderboardScores(): Promise<Score[][] | undefined> {
        const scores: Score[][] = [];
        for (const gameMode of ['log2990', 'classic']) {
            const score = await lastValueFrom(this.httpService.getNScoresByCategory(gameMode, LEADERBOARD_SIZE));
            if (!score) return undefined;
            scores.push(score);
        }
        return scores;
    }

    private showErrorDialog() {
        this.dialog.open(ErrorDialogComponent, {
            width: DIALOG_WIDTH,
            autoFocus: true,
            data: this.httpService.getErrorMessage(),
        });
    }
}
