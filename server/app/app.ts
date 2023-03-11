import { HttpException } from '@app/classes/http.exception';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { StatusCodes } from 'http-status-codes';
import logger from 'morgan';
import { Service } from 'typedi';
import { AuthController } from './controllers/auth.controller';
import { BotsController } from './controllers/bots.controller';
import { DictionariesController } from './controllers/dictionaries.controller';
import { GamesHistoryController } from './controllers/game.history.controller';
import { ImageController } from './controllers/image.controllet';
import { ScoresController } from './controllers/scores.controller';
import { UserInfoController } from './controllers/user-info.controller';

@Service()
export class Application {
    app: express.Application;
    private internalError: number;

    constructor(
        private scoresController: ScoresController,
        private dictionariesController: DictionariesController,
        private botsController: BotsController,
        private gamesHistoryController: GamesHistoryController,
        private authController: AuthController,
        private userInfoController: UserInfoController,
        private imageController: ImageController,
    ) {
        this.internalError = StatusCodes.INTERNAL_SERVER_ERROR;
        this.app = express();

        this.config();

        this.bindRoutes();
    }

    bindRoutes() {
        this.app.use('/api/scores', this.scoresController.router);
        this.app.use('/api/dictionaries', this.dictionariesController.router);
        this.app.use('/api/bots', this.botsController.router);
        this.app.use('/api/games', this.gamesHistoryController.router);
        this.app.use('/api/auth', this.authController.router);
        this.app.use('/api/userInfo', this.userInfoController.router);
        this.app.use('/api/images', this.imageController.router);
        this.errorHandling();
    }

    private config() {
        // Middlewares configuration
        this.app.use(logger('dev'));
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ limit: '10mb', extended: true }));
        this.app.use(cookieParser());
        this.app.use(cors());
    }

    private errorHandling() {
        // When previous handlers have not served a request: path wasn't found
        this.app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            if (req.url === '/favicon.ico') return res.writeHead(204).end('No icon');

            const err: HttpException = new HttpException('Not Found');
            return next(err);
        });

        // development error handler
        // will print stacktrace
        if (this.app.get('env') === 'development') {
            this.app.use((err: HttpException, req: express.Request, res: express.Response) => {
                res.status(err.status || this.internalError);
                res.send({
                    message: err.message,
                    error: err,
                });
            });
        }

        // production error handler
        // no stacktraces leaked to user (in production env only)
        this.app.use((err: HttpException, req: express.Request, res: express.Response) => {
            res.status(err.status || this.internalError);
            res.send({
                message: err.message,
                error: {},
            });
        });
    }
}
