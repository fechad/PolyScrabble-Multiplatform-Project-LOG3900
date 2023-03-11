import { ClientAccountInfo } from '@app/interfaces/client-exchange/client-account-info';
import { Account } from '@app/interfaces/firestoreDB/account';
import { ProgressInfo } from '@app/interfaces/progress-info';
import { DatabaseService } from '@app/services/database.service';
import { LevelService } from '@app/services/LevelServices/level.service';
import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';

import { Service } from 'typedi';

@Service()
export class UserInfoController {
    router: Router;

    constructor(private databaseService: DatabaseService) {
        this.configureRouter();
    }

    private configureRouter() {
        this.router = Router();
        this.router.get('/:email', async (req: Request, res: Response) => {
            try {
                await this.databaseService.getDocumentByID('accounts', req.params.email).then((data: Account) => {
                    const level = LevelService.getLevel(data.totalXP);
                    const progressInfo: ProgressInfo = {
                        currentLevel: level,
                        currentLevelXp: LevelService.getTotalXpForLevel(level),
                        totalXP: data.totalXP,
                        xpForNextLevel: LevelService.getRemainingNeededXp(data.totalXP),
                        victoriesCount: 69,
                    };
                    // TODO: Add a service to fetch the real highscores
                    const clientAccountInfo: ClientAccountInfo = { ...data, progressInfo, highscores: {} };
                    res.json(clientAccountInfo);
                });
            } catch (error) {
                res.status(StatusCodes.NOT_FOUND).send(error.message);
            }
        });
    }
}
