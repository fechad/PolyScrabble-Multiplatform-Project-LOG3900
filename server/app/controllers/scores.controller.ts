import { ScoresService } from '@app/services/score.service';
import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';

@Service()
export class ScoresController {
    router: Router;

    constructor(private scoresService: ScoresService) {
        this.configureRouter();
    }

    private configureRouter() {
        this.router = Router();

        this.router.get('/', async (_req: Request, res: Response) => {
            try {
                const courses = await this.scoresService.getAllScores();
                res.json(courses);
            } catch (error) {
                res.status(StatusCodes.NOT_FOUND).send(error.message);
            }
        });

        this.router.get('/game-type/:gameType', async (req: Request, res: Response) => {
            try {
                let courses;
                if (req.query.quantity) {
                    const quantity = parseInt(req.query.quantity as string, 10);
                    courses = await this.scoresService.getBestScoresByGameType(req.params.gameType, quantity);
                } else {
                    courses = await this.scoresService.getBestScoresByGameType(req.params.gameType);
                }
                res.json(courses);
            } catch (error) {
                res.status(StatusCodes.NOT_FOUND).send(error.message);
            }
        });

        this.router.delete('/', async (_req: Request, res: Response) => {
            try {
                await this.scoresService.reinitializeScores();
                res.send();
            } catch (error) {
                res.status(StatusCodes.NOT_FOUND).send(error.message);
            }
        });
    }
}
