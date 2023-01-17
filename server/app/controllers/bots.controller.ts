import { DEFAULT_BOTS_NAME } from '@app/constants/virtual-player-constants';
import { BotsService } from '@app/services/bot.service';
import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';
@Service()
export class BotsController {
    router: Router;

    constructor(private botService: BotsService) {
        this.configureRouter();
    }

    private configureRouter() {
        this.router = Router();

        this.router.get('/', async (_req: Request, res: Response) => {
            try {
                const bots = await this.botService.getAllBots();
                res.json(bots);
            } catch (error) {
                res.status(StatusCodes.NOT_FOUND).send(error.message);
            }
        });

        this.router.delete('/:name', async (req: Request, res: Response) => {
            const name = decodeURIComponent(req.params.name);
            if (DEFAULT_BOTS_NAME.includes(name)) {
                res.status(StatusCodes.FORBIDDEN).send({});
                return;
            }
            try {
                const bot = await this.botService.deleteBot(name);
                res.json(bot);
            } catch (error) {
                res.status(StatusCodes.NOT_FOUND).send(error.message);
            }
        });
        this.router.delete('/', async (req: Request, res: Response) => {
            try {
                const bot = await this.botService.deleteAllBots();
                res.json(bot);
            } catch (error) {
                res.status(StatusCodes.NOT_FOUND).send(error.message);
            }
        });
        this.router.patch('/:name', async (req: Request, res: Response) => {
            const name = decodeURIComponent(req.params.name);
            if (DEFAULT_BOTS_NAME.includes(name)) {
                res.status(StatusCodes.FORBIDDEN).send({});
                return;
            }
            try {
                const bot = await this.botService.updateBot(name, req.body);
                res.json(bot);
            } catch (error) {
                res.status(StatusCodes.NOT_FOUND).send(error.message);
            }
        });
    }
}
