import { Account } from '@app/interfaces/firestoreDB/account';
import { Game } from '@app/interfaces/firestoreDB/game';
import { GameHeader } from '@app/interfaces/firestoreDB/game-header';
import { DatabaseService } from '@app/services/database.service';
import { Service } from 'typedi';

const DATABASE_COLLECTION = 'accounts';
@Service()
export class PlayerGameHistoryService {
    constructor(private databaseService: DatabaseService) {}

    async updatePlayersGameHistories(game: Game) {
        game.results.forEach(async (entry) => {
            const player = await this.databaseService.getDocumentByID<Account>(DATABASE_COLLECTION, entry.playerID);

            if (player === null) return;
            const gameHeader: GameHeader = { type: game.gameType, score: entry.score, gameID: game.startDatetime };
            player.gamesPlayed.push(gameHeader);

            const previousBestGameIndex = player.bestGames.findIndex((bestGame) => bestGame.type === game.gameType);

            // TODO: Update with correct xp gain instead of place holder 20
            player.totalXP += 20;
            if (player.highscore < entry.score) player.highscore = entry.score;

            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            if (previousBestGameIndex === -1) {
                player.bestGames.push(gameHeader);
            } else if (player.bestGames[previousBestGameIndex].score < entry.score) {
                player.bestGames[previousBestGameIndex] = gameHeader;
            }

            this.databaseService.updateDocumentByID(DATABASE_COLLECTION, entry.playerID, player);
        });
    }
}
