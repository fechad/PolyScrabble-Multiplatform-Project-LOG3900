import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Room } from '@app/classes/room';
import { Score } from '@app/classes/score';
import { ErrorDialogComponent } from '@app/components/error-dialog/error-dialog.component';
import { GeneralChatComponent } from '@app/components/general-chat/general-chat.component';
import { LeaderBoardDialogDataComponent } from '@app/components/leaderboard-dialog-data/leaderboard-dialog-data.component';
import { AudioService } from '@app/services/audio.service';
import { HttpService } from '@app/services/http.service';
import { SocketClientService } from '@app/services/socket-client.service';
import { BehaviorSubject, lastValueFrom } from 'rxjs';

export const LEADERBOARD_SIZE = 5;
export const DIALOG_WIDTH = '600px';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss', '../dark-theme.scss'],
})
export class MainPageComponent implements OnInit {
    title: string;
    message: BehaviorSubject<string>;
    constructor(
        public room: Room,
        private dialog: MatDialog,
        private httpService: HttpService,
        private socketService: SocketClientService,
        private audioService: AudioService,
    ) {
        this.title = 'LOG2990';
        this.message = new BehaviorSubject<string>('');
    }

    ngOnInit() {
        this.connect();
        this.audioService.playMainTheme();
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

    showGeneralChat() {
        this.dialog.open(GeneralChatComponent, {
            width: '100%',
            maxWidth: '100%',
            height: '100%',
            maxHeight: '100%',
            autoFocus: true,
            panelClass: 'pop-up-chat',
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

    private connect() {
        this.socketService.refreshConnection();
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
