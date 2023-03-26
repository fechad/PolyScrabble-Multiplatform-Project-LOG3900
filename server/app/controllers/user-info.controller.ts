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
    private reduceClientAccountInfo(clientAccount: ClientAccountInfo): Account {
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
    }
    private configureRouter() {
        this.router = Router();
        this.router.get('/:email', async (req: Request, res: Response) => {
            try {
                await this.databaseService.getDocumentByID('accounts', req.params.email).then((data: Account) => {
                    res.json(this.buildClientAccountInfo(data));
                });
            } catch (error) {
                res.status(StatusCodes.NOT_FOUND).send(error.message);
            }
        });
        this.router.get('/opponentInfo/:username', async (req: Request, res: Response) => {
            try {
                await this.databaseService.getDocumentByField('accounts', 'username', req.params.username).then((data: Account) => {
                    res.json(this.buildClientAccountInfo(data));
                });
            } catch (error) {
                res.status(StatusCodes.NOT_FOUND).send(error.message);
            }
        });
        this.router.patch('/:email', async (req: Request, res: Response) => {
            try {
                await this.databaseService.updateDocumentByID('accounts', req.params.email, this.reduceClientAccountInfo(req.body));
                await this.databaseService
                    .getDocumentByID('accounts', req.params.email)
                    .then((newData: Account) => res.json(this.buildClientAccountInfo(newData)));
                SocketManager.instance.discussionChannelService.updatePlayerAvatar(req.body.username, req.body.userSettings.avatarUrl);
            } catch (error) {
                res.status(StatusCodes.NOT_FOUND).send(error.message);
            }
        });
    }
}
