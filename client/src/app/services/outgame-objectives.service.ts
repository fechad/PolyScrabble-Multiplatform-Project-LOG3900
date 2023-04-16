import { Injectable } from '@angular/core';
import { Objective } from '@app/classes/objective';
import { PlayerGameStats } from '@app/constants/player-stats';
import { ClientAccountInfo } from '@app/interfaces/serveur info exchange/client-account-info';
import { PlayerService } from './player.service';

/* eslint-disable @typescript-eslint/no-magic-numbers */
const GAME_TARGETS = [5, 10, 25, 50, 100];
const NUMBER_OF_OBJECTIVES = 5;
const SCORES_OBJECTIVES = [200, 300, 500];

@Injectable({
    providedIn: 'root',
})
export class OutgameObjectivesService {
    objectives: Objective[];
    isEnglish: boolean;
    highScore: number;
    currentLevel: number;
    totalXP: number;
    currentLevelXp: number;
    xpForNextLevel: number;

    constructor(private playerService: PlayerService) {
        this.objectives = [];
        this.currentLevel = this.playerService.account.progressInfo.currentLevel;
        this.totalXP = this.playerService.account.progressInfo.totalXP;
        this.currentLevelXp = this.playerService.account.progressInfo.currentLevelXp;
        this.xpForNextLevel = this.playerService.account.progressInfo.xpForNextLevel;
    }

    generateObjectives(stats: PlayerGameStats, player: ClientAccountInfo) {
        this.isEnglish = this.playerService.player.clientAccountInfo.userSettings.defaultLanguage === 'english';
        this.generateThemedObjectives(player);
        this.generateLossObjectives(stats);
        this.generateTimeObjectives(stats);
        this.generatePlayedGameObjectives(stats);
        this.generateWonGameObjectives(stats);
        this.generateScoreObjectives(stats);
        this.recalculateExp(player);
    }

    generatePlayedGameObjectives(stats: PlayerGameStats) {
        for (let i = 0; i < NUMBER_OF_OBJECTIVES; i++) {
            const target = GAME_TARGETS[i];
            const progression = stats.playedGamesCount > target ? target : stats.playedGamesCount;
            const title = this.isEnglish ? 'Play ' + target + ' games' : 'Jouer ' + target + ' parties';
            this.objectives.push(new Objective(title, progression, target, target));
        }
    }

    generateWonGameObjectives(stats: PlayerGameStats) {
        for (let i = 0; i < NUMBER_OF_OBJECTIVES; i++) {
            const target = GAME_TARGETS[i];
            const progression = stats.gamesWonCount > target ? target : stats.gamesWonCount;
            const title = this.isEnglish ? 'Win ' + 5 + 'games' : 'Gagner ' + target + ' parties';
            this.objectives.push(new Objective(title, progression, target, target * 2));
        }
    }

    generateScoreObjectives(stats: PlayerGameStats) {
        let highestScore = 0;
        for (const game of stats.playedGames) {
            if (game.score > highestScore) highestScore = game.score;
        }
        this.highScore = highestScore;
        for (const score of SCORES_OBJECTIVES) {
            const target = score;
            const title = this.isEnglish
                ? 'Score higher than ' + target + ' in Classic mode'
                : 'Scorer plus haut que ' + target + ' en mode classique';
            const progression = highestScore > target ? target : highestScore;
            this.objectives.push(new Objective(title, progression, target, target));
        }
    }

    generateThemedObjectives(player: ClientAccountInfo) {
        const title = this.isEnglish ? 'Beat every themed virtual players' : 'Battre tous les joueurs virtuels à thème';
        const progression = player.badges.length === 5 ? 1 : 0;
        const target = 1;
        this.objectives.push(new Objective(title, progression, target, 600));
    }

    generateLossObjectives(stats: PlayerGameStats) {
        let progression = 0;
        for (const game of stats.playedGames) {
            if (!game.won) {
                progression = 1;
                break;
            }
        }

        const target = 1;
        const title = this.isEnglish ? 'Lose a game' : 'Perdre une partie';
        this.objectives.push(new Objective(title, progression, target, 20));
    }

    generateTimeObjectives(stats: PlayerGameStats) {
        let achieved = 0;
        for (const game of stats.playedGames) {
            const minutes = parseFloat(game.duration.split(' ')[0]);
            if (minutes > 15 && game.won) {
                achieved = 1;
                break;
            }
        }
        const title = this.isEnglish ? 'Win a game in more than 15 minutes' : 'Gagner une partie en plus de 15 minutes';
        const progression = achieved;
        const target = 1;
        this.objectives.push(new Objective(title, progression, target, 100));
    }

    recalculateExp(player: ClientAccountInfo) {
        let addedExp = 0;
        for (const objective of this.objectives) {
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            if (objective.progression === objective.target) addedExp += objective.exp;
        }
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        const totalXP = player.progressInfo.totalXP + addedExp;
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
