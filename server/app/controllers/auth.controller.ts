import { Authentificator } from '@app/services/auth.service';
import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';

@Service()
export class AuthController {
    router: Router;

    constructor(private authentificator: Authentificator) {
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
