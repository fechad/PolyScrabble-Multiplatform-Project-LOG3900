/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/naming-convention */
import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import path from 'path';
import { Service } from 'typedi';

const cloudinary = require('cloudinary').v2;

const cloudinaryConfig = cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

@Service()
export class ImageController {
    router: Router;
    private root = './assets/images';
    constructor() {
        this.configureRouter();
    }

    private configureRouter() {
        this.router = Router();

        this.router.get('/signature', (req, res) => {
            const divider = 1000;
            const timestamp = Math.round(new Date().getTime() / divider);
            const signature = cloudinary.utils.api_sign_request({ timestamp }, cloudinaryConfig.api_secret);
            res.json({ timestamp, signature, apiKey: process.env.CLOUDINARY_API_KEY });
        });

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
