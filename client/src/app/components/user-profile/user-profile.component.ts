import { Component } from '@angular/core';
import { HttpService } from '@app/services/http.service';
import { OutgameObjectivesService } from '@app/services/outgame-objectives.service';
import { PlayerService } from '@app/services/player.service';
import { ThemeService } from '@app/services/theme.service';

@Component({
    selector: 'app-user-profile',
    templateUrl: './user-profile.component.html',
    styleUrls: ['./user-profile.component.scss'],
})
export class UserProfileComponent {
    checked = false;
    badgeUrls: string[];
    currentLevel: number;
    totalXP: number;
    currentLevelXp: number;
    xpForNextLevel: number;
    constructor(
        public httpService: HttpService,
        private playerService: PlayerService,
        protected themeService: ThemeService,
        private objService: OutgameObjectivesService,
    ) {
        this.currentLevel = this.playerService.account.progressInfo.currentLevel;
        this.totalXP = this.playerService.account.progressInfo.totalXP;
        this.currentLevelXp = this.playerService.account.progressInfo.currentLevelXp;
        this.xpForNextLevel = this.playerService.account.progressInfo.xpForNextLevel;
        this.objService.objectives = [];
        this.recalculateExp();
        this.objService.generateObjectives();
    }
    get userInfo() {
        return this.playerService.account;
    }
    get progressInfo() {
        return this.playerService.account.progressInfo;
    }

    get objectives() {
        return this.objService.objectives;
    }

    recalculateExp() {
        let addedExp = 0;
        for (const objective of this.objectives) {
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            if (objective.progression === objective.target) addedExp += objective.exp;
        }
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        const totalXP = this.playerService.account.progressInfo.totalXP + addedExp;
        const level = this.getLevel(totalXP);
        this.currentLevel = level;
        this.totalXP = totalXP;
        this.currentLevelXp = this.getTotalXpForLevel(level);
        this.xpForNextLevel = this.getRemainingNeededXp(totalXP);
    }

    getTotalXpForLevel(targetLevel: number) {
        const base = 200;
        const ratio = 1.05;
        return Math.floor((base * (1 - Math.pow(ratio, targetLevel))) / (1 - ratio));
    }
    getLevel(totalXP: number) {
        let left = 1;
        let right = 100;
        while (left < right) {
            const mid = Math.floor((left + right) / 2);
            const seriesSum = this.getTotalXpForLevel(mid);
            if (seriesSum > totalXP) right = mid;
            else left = mid + 1;
        }
        return left - 1;
    }
    getRemainingNeededXp(totalXP: number) {
        const currentLevel = this.getLevel(totalXP);
        return this.getTotalXpForLevel(currentLevel + 1) - totalXP;
    }
}
