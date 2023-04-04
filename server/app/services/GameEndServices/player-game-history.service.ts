/* eslint-disable @typescript-eslint/no-magic-numbers */
import { EINSTEIN_BADGE, MOZART_BADGE, SANTA_BADGE, SERENA_BADGE, ThemedBadge, TRUMP_BADGE } from '@app/constants/bot-badges';
import { THEMED_VP_IDS } from '@app/constants/themed-mode-constants';
import { PlayerGameStats, PlayerGameSummary } from '@app/interfaces/client-exchange/player-stats';
import { Account } from '@app/interfaces/firestoreDB/account';
import { Game } from '@app/interfaces/firestoreDB/game';
import { GameHeader } from '@app/interfaces/firestoreDB/game-header';
import { DatabaseService } from '@app/services/database.service';
import { firestore } from 'firebase-admin';
import { Service } from 'typedi';

const DATABASE_COLLECTION = 'accounts';
const XP_GAIN_ON_VICTORY = 100;
const XP_GAIN_ON_LOSS = 50;
@Service()
export class PlayerGameHistoryService {
    constructor(private databaseService: DatabaseService) {}

    async getUserGameStats(playerEmail: string): Promise<PlayerGameStats> {
        const player: Account | null = await this.databaseService.getDocumentByID('accounts', playerEmail);
        if (!player) throw new Error('Not an actual player');
        return this.bundlePlayerStats(player);
    }
    async getUserStatsByUsername(userName: string): Promise<PlayerGameStats | null> {
        const userNameEmailLink: { email: string } | null = await this.databaseService.getDocumentByID('usedUsernames', userName);
        if (!userNameEmailLink) return null;
        return this.getUserGameStats((userNameEmailLink as { email: string }).email);
    }
    async updatePlayersGameHistories(game: Game) {
        const themedOpponent = this.hadThemedOpponent(game);
        const winnerUsernames = this.getWinners(game);
        game.results.forEach(async (entry) => {
            if (entry.playerID.startsWith('Bot')) return;
            const player = await this.databaseService.getDocumentByField(DATABASE_COLLECTION, 'username', entry.playerID);

            if (player === null) return;
            const gameHeader: GameHeader = {
                type: game.gameType,
                score: entry.score,
                gameID: game.startDatetime,
                endDateTime: game.endDatetime,
                won: winnerUsernames.includes(player.username),
            };
            player.gamesPlayed.push(gameHeader);

            const previousBestGameIndex = player.bestGames.findIndex((bestGame) => bestGame.type === game.gameType);

            player.totalXP += winnerUsernames.includes(player.username) ? XP_GAIN_ON_VICTORY : XP_GAIN_ON_LOSS;
            player.gamesWon += winnerUsernames.includes(player.username) ? 1 : 0;
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            if (previousBestGameIndex === -1) {
                player.bestGames.push(gameHeader);
            } else if (player.bestGames[previousBestGameIndex].score < entry.score) {
                player.bestGames[previousBestGameIndex] = gameHeader;
            }
            if (themedOpponent && winnerUsernames.includes(player.username)) this.awardThemedBadge(player, themedOpponent);
            this.databaseService.updateDocumentByID(DATABASE_COLLECTION, player.email, player);
        });
    }
    private async bundlePlayerStats(player: Account): Promise<PlayerGameStats> {
        const playedGamesCount = player.gamesPlayed.length;
        const gamesWonCount = player.gamesWon;

        const totalPoints = player.gamesPlayed.reduce((accumulator, game) => {
            return accumulator + game.score;
        }, 0);

        const averagePointsByGame = Math.round(playedGamesCount > 0 ? totalPoints / playedGamesCount : 0);

        // Calculate the total duration of all played games
        const totalDuration = player.gamesPlayed.reduce((acc, game) => {
            return acc + (game.endDateTime.seconds - game.gameID.seconds);
        }, 0);

        // Calculate the average duration of all played games
        const averageGameDuration = playedGamesCount > 0 ? totalDuration / playedGamesCount : 0;

        const playedGames: PlayerGameSummary[] = player.gamesPlayed.reverse().map((game) => ({
            score: game.score,
            startDateTime: game.gameID.toDate().toLocaleString('fr-CA', { timeZone: 'America/Montreal' }),
            duration: this.secondsToTimeString(game.endDateTime.seconds - game.gameID.seconds),
            won: game.won,
        }));
        let logs = await this.databaseService.getUserLogs(player.email);
        logs.forEach((entry) => {
            entry.message = player.userSettings.defaultLanguage === 'english' ? entry.message.split('/')[0] : entry.message.split('/')[1];
            if (!(entry.time instanceof firestore.Timestamp)) return;
            entry.time = (entry.time as firestore.Timestamp).toDate().toLocaleString('fr-CA', { timeZone: 'America/Montreal' });
        });

        if (!logs) logs = [];
        return {
            playedGamesCount,
            gamesWonCount,
            averagePointsByGame,
            averageGameDuration: this.secondsToTimeString(averageGameDuration),
            playedGames,
            logs,
        };
    }
    private secondsToTimeString(secondsCount: number) {
        const hours = Math.floor(secondsCount / 3600);
        const minutes = Math.floor((secondsCount % 3600) / 60);
        const seconds = Math.floor(secondsCount % 60);
        let formated = hours === 0 ? '' : `${hours}h `;
        formated += minutes === 0 ? '' : `${minutes}min `;
        formated += seconds === 0 ? '' : `${seconds}s`;
        return formated;
    }
    private getWinners(game: Game) {
        const highestScore = Math.max(...game.results.map((player) => player.score));

        const winners = game.results.filter((player) => player.score === highestScore && !player.unfairQuit);

        return winners.map((player) => player.playerID);
    }
    private hadThemedOpponent(game: Game): string | undefined {
        return game.results.find((entry) => THEMED_VP_IDS.includes(entry.playerID.split('Bot')[1]))?.playerID.split('Bot')[1];
    }
    private awardThemedBadge(player: Account, badgeID: string) {
        const alreadyHasBadge = player.badges.find((badge) => badge.id === badgeID);
        if (alreadyHasBadge) return;
        switch (badgeID) {
            case ThemedBadge.SANTA:
                player.badges.push(SANTA_BADGE);
                break;
            case ThemedBadge.EINSTEIN:
                player.badges.push(EINSTEIN_BADGE);
                break;
            case ThemedBadge.TRUMP:
                player.badges.push(TRUMP_BADGE);
                break;
            case ThemedBadge.MOZART:
                player.badges.push(MOZART_BADGE);
                break;
            case ThemedBadge.SERENA:
                player.badges.push(SERENA_BADGE);
                break;
            default:
                break;
        }
    }
}
