import { Authentificator } from '@app/services/auth.service';
import { DatabaseService } from '@app/services/database.service';
import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';

@Service()
export class AuthController {
    router: Router;

    constructor(private authentificator: Authentificator, private databaseService: DatabaseService) {
        this.configureRouter();
    }

    private configureRouter() {
        this.router = Router();

        this.router.get('/usernames', async (req: Request, res: Response) => {
            try {
                res.json(this.authentificator.userNames);
            } catch (error) {
                res.status(StatusCodes.NOT_FOUND).send(error.message);
            }
        });

        this.router.get('/user/:email', async (req: Request, res: Response) => {
            try {
                await this.databaseService
                    .getDocumentByID('accounts', req.params.email)
                    .then((data) => res.json(data))
                    // eslint-disable-next-line no-console
                    .catch((e) => console.log(e));
            } catch (error) {
                res.status(StatusCodes.NOT_FOUND).send(error.message);
            }
        });

        this.router.put('/login', async (req: Request, res: Response) => {
            try {
                if (this.authentificator.userExists(req.body.username)) {
                    res.status(StatusCodes.BAD_REQUEST).send(`Le nom ${req.body.username} existe déja`);
                    return;
                }
                this.authentificator.loginUser(req.body.username);
                res.send();
            } catch (error) {
                res.status(StatusCodes.SERVICE_UNAVAILABLE).send(error.message);
            }
        });
        this.router.put('/logout', async (req: Request, res: Response) => {
            try {
                this.authentificator.logoutUser(req.body.username);
                res.send();
            } catch (error) {
                res.status(StatusCodes.SERVICE_UNAVAILABLE).send(error.message);
            }
        });
    }
}
