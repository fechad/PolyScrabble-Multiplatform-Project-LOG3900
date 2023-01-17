import { GamesHistoryService } from '@app/services/games.history.service';
import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';

export const DEFAULT_BOT_NAME = 'BOT A';
@Service()
export class GamesHistoryController {
    router: Router;

    constructor(private gamesHistoryService: GamesHistoryService) {
        this.configureRouter();
    }

    private configureRouter() {
        this.router = Router();

        this.router.get('/', async (_req: Request, res: Response) => {
            try {
                const games = await this.gamesHistoryService.getGamesHistory();
                res.json(games);
            } catch (error) {
                res.status(StatusCodes.NOT_FOUND).send(error.message);
            }
        });
        this.router.delete('/', async (_req: Request, res: Response) => {
            try {
                const games = await this.gamesHistoryService.deleteGames();
                res.json(games);
            } catch (error) {
                res.status(StatusCodes.NOT_FOUND).send(error.message);
            }
        });
    }
}
