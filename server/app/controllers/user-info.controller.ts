import { DefaultAccountGenerator } from '@app/classes/default-acount-generator';
import { ClientAccountInfo } from '@app/interfaces/client-exchange/client-account-info';
import { Account } from '@app/interfaces/firestoreDB/account';
import { ProgressInfo } from '@app/interfaces/progress-info';
import { DatabaseService } from '@app/services/database.service';
import { LevelService } from '@app/services/LevelServices/level.service';
import { SocketManager } from '@app/services/socket-manager.service';
import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';

@Service()
export class UserInfoController {
    router: Router;

    constructor(private databaseService: DatabaseService) {
        this.configureRouter();
    }
    private buildClientAccountInfo(data: Account): ClientAccountInfo {
        const level = LevelService.getLevel(data.totalXP);
        const progressInfo: ProgressInfo = {
            currentLevel: level,
            currentLevelXp: LevelService.getTotalXpForLevel(level),
            totalXP: data.totalXP,
            xpForNextLevel: LevelService.getRemainingNeededXp(data.totalXP),
            victoriesCount: data.gamesWon,
        };
        const clientAccountInfo: ClientAccountInfo = {
            ...data,
            progressInfo,
            highScores: { classic: data.bestGames[0] ? data.bestGames[0].score : 0 },
        };
        return clientAccountInfo;
    }
    private async reduceClientAccountInfo(clientAccount: ClientAccountInfo): Promise<Account> {
        const promiseResult = await this.databaseService.getDocumentByID<Account>('accounts', clientAccount.email);
        if (!promiseResult)
            return {
                username: clientAccount.username,
                email: clientAccount.email,
                badges: clientAccount.badges,
                gamesWon: clientAccount.gamesWon,
                userSettings: clientAccount.userSettings,
                totalXP: clientAccount.progressInfo.totalXP,
                highScores: clientAccount.highScores,
                gamesPlayed: clientAccount.gamesPlayed,
                bestGames: clientAccount.bestGames,
            };
        const currentData = promiseResult as Account;
        return {
            username: clientAccount.username,
            email: currentData.email,
            badges: currentData.badges,
            gamesWon: currentData.gamesWon,
            userSettings: clientAccount.userSettings,
            totalXP: currentData.totalXP,
            highScores: currentData.highScores,
            gamesPlayed: currentData.gamesPlayed,
            bestGames: currentData.bestGames,
        };
    }
    private configureRouter() {
        this.router = Router();
        this.router.get('/:email', async (req: Request, res: Response) => {
            try {
                await this.databaseService
                    .getDocumentByID('accounts', req.params.email)
                    .then((data: Account) => {
                        if (!data) res.status(StatusCodes.NOT_FOUND).send('No such account');
                        res.json(this.buildClientAccountInfo(data));
                    })
                    .catch(() => res.json(DefaultAccountGenerator.generate()));
            } catch (error) {
                res.json(DefaultAccountGenerator.generate());
            }
        });
        this.router.get('/opponentInfo/:username', async (req: Request, res: Response) => {
            try {
                await this.databaseService
                    .getDocumentByField('accounts', 'username', req.params.username)
                    .then((data: Account) => {
                        if (!data) res.status(StatusCodes.NOT_FOUND).send('No such account');
                        res.json(this.buildClientAccountInfo(data));
                    })
                    .catch(() => res.json(DefaultAccountGenerator.generate()));
            } catch (error) {
                res.json(DefaultAccountGenerator.generate());
            }
        });
        this.router.patch('/:email', async (req: Request, res: Response) => {
            try {
                await this.databaseService.updateDocumentByID('accounts', req.params.email, await this.reduceClientAccountInfo(req.body));
                await this.databaseService
                    .getDocumentByID('accounts', req.params.email)
                    .then((newData: Account) => res.json(this.buildClientAccountInfo(newData)))
                    .catch((error) => res.status(StatusCodes.NOT_FOUND).send(error.message));
                SocketManager.instance.discussionChannelService.updatePlayerAccount(req.body.username, req.body);
            } catch (error) {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error.message);
            }
        });
    }
}
