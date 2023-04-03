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

    constructor(private playerService: PlayerService) {
        this.objectives = [];
    }

    get gameStat(): PlayerGameStats {
        return this.playerService.stats;
    }

    get account(): ClientAccountInfo {
        return this.playerService.account;
    }

    generateObjectives() {
        this.isEnglish = this.playerService.account.userSettings.defaultLanguage === 'english';
        this.generateThemedObjectives();
        this.generateLevelObjectives();
        this.generateLossObjectives();
        this.generateTimeObjectives();
        this.generatePlayedGameObjectives();
        this.generateWonGameObjectives();
        this.generateScoreObjectives();
    }

    generatePlayedGameObjectives() {
        for (let i = 0; i < NUMBER_OF_OBJECTIVES; i++) {
            const target = GAME_TARGETS[i];
            const progression = this.gameStat.playedGamesCount > target ? target : this.gameStat.playedGamesCount;
            const title = this.isEnglish ? 'Play ' + target + ' games' : 'Jouer ' + target + ' parties';
            this.objectives.push(new Objective(title, progression, target, target));
        }
    }

    generateWonGameObjectives() {
        for (let i = 0; i < NUMBER_OF_OBJECTIVES; i++) {
            const target = GAME_TARGETS[i];
            const progression = this.gameStat.gamesWonCount > target ? target : this.gameStat.gamesWonCount;
            const title = this.isEnglish ? 'Win ' + 5 + 'games' : 'Gagner ' + target + ' parties';
            this.objectives.push(new Objective(title, progression, target, target * 2));
        }
    }

    generateScoreObjectives() {
        let highestScore = 0;
        for (const game of this.gameStat.playedGames) {
            if (game.score > highestScore) highestScore = game.score;
        }
        for (const score of SCORES_OBJECTIVES) {
            const target = score;
            const title = this.isEnglish
                ? 'Score higher than ' + target + ' in Classic mode'
                : 'Scorer plus haut que ' + target + ' en mode classique';
            const progression = highestScore > target ? target : highestScore;
            this.objectives.push(new Objective(title, progression, target, target));
        }
    }

    generateThemedObjectives() {
        const title = this.isEnglish ? 'Beat every themed virtual players' : 'Battre tous les joueurs virtuels à thème';
        const progression = this.account.badges.length === 5 ? 1 : 0;
        const target = 1;
        this.objectives.push(new Objective(title, progression, target, 600));
    }

    generateLevelObjectives() {
        for (const level of GAME_TARGETS) {
            const currentLevel = this.account.progressInfo.currentLevel;
            const target = level;
            const title = (this.isEnglish ? 'Reach level ' : 'Atteindre le niveau ') + target;
            const progression = currentLevel > target ? target : currentLevel;
            this.objectives.push(new Objective(title, progression, target, target * 10));
        }
    }

    generateLossObjectives() {
        let progression = 0;
        for (const game of this.gameStat.playedGames) {
            if (!game.won) {
                progression = 1;
                break;
            }
        }

        const target = 1;
        const title = this.isEnglish ? 'Lose a game' : 'Perdre une partie';
        this.objectives.push(new Objective(title, progression, target, 20));
    }

    generateTimeObjectives() {
        let achieved = 0;
        for (const game of this.gameStat.playedGames) {
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
}
