import { DefaultAccountGenerator } from '@app/classes/default-acount-generator';
import { DEFAULT_USER_SETTINGS } from '@app/constants/default-user-settings';
import { Account } from '@app/interfaces/firestoreDB/account';
import { Authentificator } from '@app/services/auth.service';
import { DatabaseService, USED_USERNAMES_COLLECTION } from '@app/services/database.service';
import { EmailService } from '@app/services/email-service';
import { Request, Response, Router } from 'express';
import { firestore } from 'firebase-admin';
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
                    .then((data) => {
                        if (!data) res.status(StatusCodes.NOT_FOUND).send('No such account');
                        this.databaseService.log('userActions', req.params.email, { message: 'login/connexion', time: firestore.Timestamp.now() });
                        res.json(data);
                    })
                    // eslint-disable-next-line no-console
                    .catch((e) => console.log(e));
            } catch (error) {
                res.json(DefaultAccountGenerator.generate());
            }
        });
        this.router.put('/logout', async (req: Request, res: Response) => {
            try {
                this.authentificator.logoutUser(req.body.username);
                const userEmailInfo: { email: string } | null = await this.databaseService.getDocumentByID(
                    USED_USERNAMES_COLLECTION,
                    req.body.username,
                );
                if (!userEmailInfo) throw new Error('Username was not linked to an email');
                this.databaseService.log('userActions', (userEmailInfo as { email: string }).email, {
                    message: 'logout/déconnexion',
                    time: firestore.Timestamp.now(),
                });
                res.send();
            } catch (error) {
                res.status(StatusCodes.BAD_REQUEST).send(error.message);
            }
        });

        this.router.post('/user', async (req: Request, res: Response) => {
            try {
                const account: Account = {
                    email: req.body.email,
                    username: req.body?.username,
                    userSettings: { ...DEFAULT_USER_SETTINGS },
                    badges: [],
                    bestGames: [],
                    gamesPlayed: [],
                    gamesWon: 0,
                    totalXP: 200,
                    highScores: {},
                };
                await this.databaseService
                    .addAccount(account)
                    .then(async () => {
                        res.status(StatusCodes.CREATED).send();
                    })
                    .catch((error) => res.status(StatusCodes.CONFLICT).send(error.message));
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
