import { DEFAULT_STATS } from '@app/constants/default-user-settings';
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
            try {
                this.gamesHistoryService
                    .getUserGameStats(req.params.email)
                    .then((data: PlayerGameStats) => {
                        if (!data) res.status(StatusCodes.NOT_FOUND).send('Not an actual player');
                        res.json(data);
                    })
                    .catch(() => res.json(DEFAULT_STATS));
            } catch (error) {
                res.json(DEFAULT_STATS);
            }
        });
        this.router.get('/byUserName/:username', async (req: Request, res: Response) => {
            try {
                this.gamesHistoryService
                    .getUserStatsByUsername(req.params.username)
                    .then((data: PlayerGameStats) => {
                        if (!data) res.status(StatusCodes.NOT_FOUND).send('Not an actual player');
                        res.json(data);
                    })
                    .catch(() => res.json(DEFAULT_STATS));
            } catch (error) {
                res.json(DEFAULT_STATS);
            }
        });
    }
}
