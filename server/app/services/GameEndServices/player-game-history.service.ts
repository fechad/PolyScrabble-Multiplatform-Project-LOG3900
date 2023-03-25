import { EINSTEIN_BADGE, MOZART_BADGE, SANTA_BADGE, SERENA_BADGE, ThemedBadge, TRUMP_BADGE } from '@app/constants/bot-badges';
import { THEMED_VP_IDS } from '@app/constants/themed-mode-constants';
import { Account } from '@app/interfaces/firestoreDB/account';
import { Game } from '@app/interfaces/firestoreDB/game';
import { GameHeader } from '@app/interfaces/firestoreDB/game-header';
import { DatabaseService } from '@app/services/database.service';
import { Service } from 'typedi';

const DATABASE_COLLECTION = 'accounts';
const XP_GAIN_ON_VICTORY = 200;
const XP_GAIN_ON_LOSS = 50;
@Service()
export class PlayerGameHistoryService {
    constructor(private databaseService: DatabaseService) {}

    async updatePlayersGameHistories(game: Game) {
        const themedOpponent = this.hadThemedOpponent(game);
        const winnerUsernames = this.getWinners(game);

        game.results.forEach(async (entry) => {
            if (entry.playerID.startsWith('Bot')) return;
            const player = await this.databaseService.getDocumentByField(DATABASE_COLLECTION, 'username', entry.playerID);

            if (player === null) return;
            const gameHeader: GameHeader = { type: game.gameType, score: entry.score, gameID: game.startDatetime };
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
