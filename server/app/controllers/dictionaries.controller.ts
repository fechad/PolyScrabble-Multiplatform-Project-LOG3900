import { ScoreMapper } from '@app/classes/virtual-placement-logic/score-mapper';
import { DEFAULT_DICTIONARY_TITLE } from '@app/constants/constants';
import { DICTIONARY_READER } from '@app/constants/reader-constant';
import { Dictionary } from '@app/interfaces/dictionary';
import { DictionariesFileService } from '@app/services/dictionaries-files.service';
import { DictionariesService } from '@app/services/dictionaries.service';
import { JsonReader } from '@app/services/json-reader.service';
import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';

const DEFAULT_DICTIONARY_PATH = 'dictionnaire-par-defaut.json';
@Service()
export class DictionariesController {
    router: Router;
    fileService: DictionariesFileService;
    constructor(private dictionariesService: DictionariesService) {
        this.configureRouter();
        this.fileService = new DictionariesFileService();
    }
    private configureRouter() {
        this.router = Router();

        this.router.get('/', async (_req: Request, res: Response) => {
            try {
                const dictionary = new JsonReader().getData(DEFAULT_DICTIONARY_PATH);
                dictionary.title = DEFAULT_DICTIONARY_TITLE;
                res.json([dictionary]);
            } catch (error) {
                res.status(StatusCodes.NOT_FOUND).send(error.message);
            }
        });
        this.router.delete('/', async (_req: Request, res: Response) => {
            try {
                const dictionariesToDelete = await this.dictionariesService.getAllDictionaries();
                await this.dictionariesService.deleteAllDictionariesExceptDefault();
                this.fileService.deleteAllDictionariesExceptDefault(dictionariesToDelete);
                res.send();
            } catch (error) {
                res.status(StatusCodes.NOT_FOUND).send(error.message);
            }
        });
        this.router.get('/:title', async (req: Request, res: Response) => {
            const title = decodeURIComponent(req.params.title);
            try {
                const reader = DICTIONARY_READER;
                let dictionary: Dictionary = { title: DEFAULT_DICTIONARY_TITLE, description: 'standard dict', words: [...reader.getWords().keys()] };
                if (!dictionary) {
                    res.status(StatusCodes.GONE).send({});
                    return;
                }
                if (req.query.includeWords === 'true') {
                    const wordsArray = await this.fileService.getDictionaryWords(title);
                    if (!wordsArray) {
                        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({});
                        return;
                    }
                    dictionary = { title: dictionary.title, description: dictionary.description, words: wordsArray };
                    res.json(dictionary);
                    return;
                }
                res.json(dictionary);
            } catch (error) {
                res.status(StatusCodes.NOT_FOUND).send(error.message);
            }
        });

        this.router.delete('/:title', async (req: Request, res: Response) => {
            const title = decodeURIComponent(req.params.title);
            if (this.isDefaultDictionary(title)) {
                res.status(StatusCodes.FORBIDDEN).send({});
                return;
            }
            try {
                await this.fileService.deleteDictionary(title);
                const dictionary = await this.dictionariesService.deleteDictionary(title);
                res.json(dictionary);
            } catch (error) {
                res.status(StatusCodes.NOT_FOUND).send(error.message);
            }
        });
        this.router.post('/:title', async (req: Request, res: Response) => {
            try {
                await this.dictionariesService.addDictionary(req.body);
                // TODO: Check if we can keep this safeguard with firestore
                // if (result.upsertedCount <= 0) {
                //    res.status(StatusCodes.CONFLICT).send();
                //    return;
                // }
                const mappedWords = ScoreMapper.createMap(ScoreMapper.formWordsMap(req.body.words));
                await this.fileService.createDictionaryFile(req.body, mappedWords);
                res.status(StatusCodes.CREATED).send();
            } catch (error) {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error.message);
            }
        });
        this.router.patch('/:title', async (req: Request, res: Response) => {
            const title = decodeURIComponent(req.params.title);
            if (this.isDefaultDictionary(title)) {
                res.status(StatusCodes.FORBIDDEN).send({});
                return;
            }
            try {
                const newDictionaryContent: Dictionary = req.body;
                // Check if a dictionary with the same title already exists
                if (await this.dictionariesService.getDictionary(newDictionaryContent.title)) {
                    res.status(StatusCodes.FORBIDDEN).send();
                    return;
                }
                const updateResult = await this.dictionariesService.updateDictionary(title, req.body);
                if (updateResult.writeTime) {
                    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
                    return;
                }
                await this.fileService.renameDictionaryFile(title, req.body.title);
                res.json(updateResult);
            } catch (error) {
                res.status(StatusCodes.NOT_FOUND).send(error.message);
            }
        });
    }
    private isDefaultDictionary(title: string): boolean {
        return title === DEFAULT_DICTIONARY_TITLE;
    }
}
