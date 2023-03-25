import { PlayerGameStats } from '@app/interfaces/client-exchange/player-stats';
import { PlayerGameHistoryService } from '@app/services/GameEndServices/player-game-history.service';
import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';

@Service()
export class PlayerStatsController {
    router: Router;
    route: string;
    constructor(private gamesHistoryService: PlayerGameHistoryService) {
        this.configureRouter();
    }

    private configureRouter() {
        this.router = Router();
        this.router.get('/:email', async (req: Request, res: Response) => {
            this.gamesHistoryService
                .getUserGameStats(req.params.email)
                .then((data: PlayerGameStats) => res.json(data))
                .catch((error) => res.status(StatusCodes.NOT_FOUND).send(error.message));
        });
    }
}
