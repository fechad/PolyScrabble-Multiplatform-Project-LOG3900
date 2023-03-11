import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';

import path from 'path';
import { Service } from 'typedi';

@Service()
export class ImageController {
    router: Router;
    private root = './assets/images';
    constructor() {
        this.configureRouter();
    }

    private configureRouter() {
        this.router = Router();
        this.router.get('/badges/:id', async (req: Request, res: Response) => {
            try {
                const absolutePath = path.resolve(this.root);
                const filePath = path.join(absolutePath, 'botBadges', req.params.id);
                res.sendFile(filePath);
            } catch (error) {
                res.status(StatusCodes.NOT_FOUND).send(error.message);
            }
        });
    }
}
