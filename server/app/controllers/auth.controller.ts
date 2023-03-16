import { DEFAULT_USER_SETTINGS } from '@app/constants/default-user-settings';
import { Account } from '@app/interfaces/firestoreDB/account';
import { Authentificator } from '@app/services/auth.service';
import { DatabaseService } from '@app/services/database.service';
import { EmailService } from '@app/services/email-service';
import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';

import { Service } from 'typedi';

@Service()
export class AuthController {
    router: Router;

    constructor(private authentificator: Authentificator, private databaseService: DatabaseService, private emailService: EmailService) {
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

        this.router.post('/user', async (req: Request, res: Response) => {
            try {
                const account: Account = {
                    email: req.body.email,
                    username: req.body?.username,
                    userSettings: DEFAULT_USER_SETTINGS,
                    badges: [],
                    bestGames: [],
                    gamesPlayed: [],
                    gamesWon: 0,
                    totalXP: 0,
                };
                await this.databaseService
                    .batchSave('accounts', [account], (entry: Account) => entry.email)
                    .then(async () => {
                        res.status(StatusCodes.CREATED).send();
                    })
                    // eslint-disable-next-line no-console
                    .catch((e) => console.log(e));
            } catch (error) {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error.message);
            }
        });
        this.router.post('/user/reset/:email', async (req: Request, res: Response) => {
            try {
                this.authentificator
                    .findUserByEmail(req.body.email)
                    .then(async (userRecord) => {
                        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
                        const newPassword = `poly${Date.now().toString().substring(8)}`;
                        // See the UserRecord reference doc for the contents of userRecord.
                        this.authentificator.auth
                            .updateUser(userRecord.uid, {
                                password: newPassword,
                            })
                            .then(() => {
                                res.status(StatusCodes.ACCEPTED).send();
                                // sends email to person
                                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                                this.emailService.sendNewPasswordEmailToUser(userRecord.email!, newPassword);
                            })
                            // eslint-disable-next-line no-console
                            .catch((e) => console.log(e));
                    })
                    .catch((error) => {
                        // eslint-disable-next-line no-console
                        console.log('Error fetching user data:', error);
                        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error.message);
                    });
            } catch (error) {
                res.status(StatusCodes.NOT_FOUND).send(error.message);
            }
        });
    }
}
