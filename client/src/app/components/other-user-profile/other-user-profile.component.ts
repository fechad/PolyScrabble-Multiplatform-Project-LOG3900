/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Component } from '@angular/core';
import { ClientAccountInfo } from '@app/interfaces/serveur info exchange/client-account-info';
import { HttpService } from '@app/services/http.service';
import { OutgameObjectivesService } from '@app/services/outgame-objectives.service';
import { PlayerService } from '@app/services/player.service';
import { ThemeService } from '@app/services/theme.service';
// eslint-disable-next-line no-restricted-imports
import { UserProfileComponent } from '../user-profile/user-profile.component';

@Component({
    selector: 'app-other-user-profile',
    templateUrl: './other-user-profile.component.html',
    styleUrls: ['./other-user-profile.component.scss'],
})
export class OtherUserProfileComponent extends UserProfileComponent {
    playerToShow: ClientAccountInfo | undefined;
    constructor(httpService: HttpService, playerService: PlayerService, themeService: ThemeService, objService: OutgameObjectivesService) {
        super(httpService, playerService, themeService, objService);
        this.playerToShow = playerService.playerToShow;
        this.currentLevel = this.playerToShow?.progressInfo.currentLevel!;
        this.totalXP = this.playerToShow?.progressInfo.totalXP!;
        this.currentLevelXp = this.playerToShow?.progressInfo.currentLevelXp!;
        this.xpForNextLevel = this.playerToShow?.progressInfo.xpForNextLevel!;
        objService.objectives = [];
        this.recalculateExp();
        objService.generateObjectives();
    }

    recalculateExp() {
        let addedExp = 0;
        for (const objective of this.objectives) {
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            if (objective.progression === objective.target) addedExp += objective.exp;
        }
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        const totalXP = this.playerToShow?.progressInfo.totalXP! + addedExp;
        const level = this.getLevel(totalXP);
        this.currentLevel = level;
        this.totalXP = totalXP;
        this.currentLevelXp = this.getTotalXpForLevel(level);
        this.xpForNextLevel = this.getRemainingNeededXp(totalXP);
    }
}
