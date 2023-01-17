import { HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse, HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Score } from '@app/classes/score';
import {
    DEFAULT_MESSAGE,
    FORBIDDEN_MESSAGE,
    GONE_RESSOURCE_MESSAGE,
    UNREACHABLE_SERVER_MESSAGE,
    UNREACHABLE_SERVER_STATUS_CDOE,
} from '@app/constants/http-constants';
import { Bot } from '@app/interfaces/bot';
import { Dictionary } from '@app/interfaces/dictionary';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Game } from './interfaces/game';
@Injectable({
    providedIn: 'root',
})
export class HttpService {
    private readonly scoresBaseUrl: string;
    private readonly dictionaryBaseUrl: string;
    private readonly botBaseUrl: string;
    private readonly gameBaseUrl: string;
    private baseUrl: string;
    private errorMessage: string;
    constructor(private http: HttpClient) {
        this.scoresBaseUrl = 'scores';
        this.dictionaryBaseUrl = 'dictionaries';
        this.gameBaseUrl = 'games';
        this.botBaseUrl = 'bots';
        this.baseUrl = environment.serverUrl;
        this.errorMessage = '';
    }

    fetchAllScores(): Observable<Score[]> {
        return this.http.get<Score[]>(`${this.baseUrl}/${this.scoresBaseUrl}`).pipe(catchError(this.handleError<Score[]>('fetchAllScores')));
    }

    getNScoresByCategory(gameType: string, quantity: number): Observable<Score[]> {
        this.clearError();
        const scoresUrl = `${this.baseUrl}/${this.scoresBaseUrl}/game-type/${gameType}?quantity=${quantity}`;
        return this.http
            .get<Score[]>(scoresUrl, { headers: this.createCacheHeaders() })
            .pipe(catchError(this.handleError<Score[]>('getNScoresByCategory')));
    }
    getAllScoresByCategory(gameType: string): Observable<Score[]> {
        this.clearError();
        const scoresUrl = `${this.baseUrl}/${this.scoresBaseUrl}/game-type/${gameType}`;
        return this.http
            .get<Score[]>(scoresUrl, { headers: this.createCacheHeaders() })
            .pipe(catchError(this.handleError<Score[]>('getAllScoresByCategory')));
    }
    reinitializeScores(): Observable<void> {
        this.clearError();
        const scoresUrl = `${this.baseUrl}/${this.scoresBaseUrl}`;
        return this.http
            .delete<void>(scoresUrl, { headers: this.createCacheHeaders() })
            .pipe(catchError(this.handleError<void>('reinitializeScores')));
    }
    reinitializeHistory(): Observable<void> {
        this.clearError();
        const gamesUrl = `${this.baseUrl}/${this.gameBaseUrl}`;
        return this.http.delete<void>(gamesUrl, { headers: this.createCacheHeaders() }).pipe(catchError(this.handleError<void>('deleteGames')));
    }
    getAllDictionaries(): Observable<Dictionary[]> {
        this.clearError();
        const dictionariesUrl = `${this.baseUrl}/${this.dictionaryBaseUrl}`;
        return this.http
            .get<Dictionary[]>(dictionariesUrl, { headers: this.createCacheHeaders() })
            .pipe(catchError(this.handleError<Dictionary[]>('getAllDictionaries')));
    }
    getAllGames() {
        this.clearError();
        const httpHeaders = new HttpHeaders().set('Cache-Control', 'no-cache').set('Expires', '0');
        const gameUrl = `${this.baseUrl}/${this.gameBaseUrl}`;
        return this.http.get<Game[]>(gameUrl, { headers: httpHeaders }).pipe(catchError(this.handleError<Game[]>('getAllGames')));
    }
    getDictionary(title: string, includeWords: boolean): Observable<Dictionary> {
        this.clearError();
        const dictionariesUrl = `${this.baseUrl}/${this.dictionaryBaseUrl}/${encodeURIComponent(title)}?includeWords=${includeWords}`;
        return this.http
            .get<Dictionary>(dictionariesUrl, { headers: this.createCacheHeaders() })
            .pipe(catchError(this.handleError<Dictionary>('getDictionary')));
    }
    deleteDictionary(title: string): Observable<Dictionary> {
        this.clearError();
        const dictionariesUrl = `${this.baseUrl}/${this.dictionaryBaseUrl}/${encodeURIComponent(title)}`;
        return this.http
            .delete<Dictionary>(dictionariesUrl, { headers: this.createCacheHeaders() })
            .pipe(catchError(this.handleError<Dictionary>('deleteDictionary')));
    }

    deleteAllDictionariesExceptDefault(): Observable<Dictionary[]> {
        this.clearError();
        const dictionariesUrl = `${this.baseUrl}/${this.dictionaryBaseUrl}`;
        return this.http
            .delete<Dictionary[]>(dictionariesUrl, { headers: this.createCacheHeaders() })
            .pipe(catchError(this.handleError<Dictionary[]>('deleteAllDictionariesExceptDefault')));
    }

    updateDictionary(title: string, updatedDictionary: Dictionary): Observable<Dictionary> {
        this.clearError();
        const dictionariesUrl = `${this.baseUrl}/${this.dictionaryBaseUrl}/${encodeURIComponent(title)}`;
        return this.http
            .patch<Dictionary>(dictionariesUrl, updatedDictionary, { headers: this.createCacheHeaders() })
            .pipe(catchError(this.handleError<Dictionary>('updateDictionary')));
    }

    addDictionary(dictionary: Dictionary): Observable<HttpResponse<Dictionary>> {
        this.clearError();
        const dictionariesUrl = `${this.baseUrl}/${this.dictionaryBaseUrl}/${encodeURIComponent(dictionary.title)}`;
        return this.http
            .post<Dictionary>(dictionariesUrl, dictionary, { headers: this.createCacheHeaders(), observe: 'response' })
            .pipe(catchError(this.handleError<HttpResponse<Dictionary>>('addDictionary')));
    }

    getAllBots(): Observable<Bot[]> {
        this.clearError();
        const httpHeaders = new HttpHeaders().set('Cache-Control', 'no-cache').set('Expires', '0');
        const botsUrl = `${this.baseUrl}/${this.botBaseUrl}`;
        return this.http.get<Bot[]>(botsUrl, { headers: httpHeaders }).pipe(catchError(this.handleError<Bot[]>('getAllBots')));
    }
    updateBot(name: string, updatedBot: Bot): Observable<Bot> {
        this.clearError();
        const httpHeaders = new HttpHeaders().set('Cache-Control', 'no-cache').set('Expires', '0');
        const botsUrl = `${this.baseUrl}/${this.botBaseUrl}/${encodeURIComponent(name)}`;
        return this.http.patch<Bot>(botsUrl, updatedBot, { headers: httpHeaders }).pipe(catchError(this.handleError<Bot>('updateBot')));
    }
    deleteBot(name: string): Observable<Bot> {
        this.clearError();
        const httpHeaders = new HttpHeaders().set('Cache-Control', 'no-cache').set('Expires', '0');
        const botsUrl = `${this.baseUrl}/${this.botBaseUrl}/${encodeURIComponent(name)}`;
        return this.http.delete<Bot>(botsUrl, { headers: httpHeaders }).pipe(catchError(this.handleError<Bot>('deleteBot')));
    }
    deleteAllBots(): Observable<Bot[]> {
        this.clearError();
        const botsUrl = `${this.baseUrl}/${this.botBaseUrl}`;
        return this.http.delete<Bot[]>(botsUrl, { headers: this.createCacheHeaders() }).pipe(catchError(this.handleError<Bot[]>('deleteAllBots')));
    }

    anErrorOccurred(): boolean {
        return this.errorMessage !== '';
    }
    getErrorMessage(): string {
        return this.errorMessage;
    }
    private createCacheHeaders(): HttpHeaders {
        return new HttpHeaders().set('Cache-Control', 'no-cache').set('Expires', '0');
    }
    private clearError() {
        this.errorMessage = '';
    }
    private handleErrorStatusCode(code: number) {
        switch (code) {
            case UNREACHABLE_SERVER_STATUS_CDOE:
                this.errorMessage = UNREACHABLE_SERVER_MESSAGE;
                break;
            case HttpStatusCode.Gone:
                this.errorMessage = GONE_RESSOURCE_MESSAGE;
                break;
            case HttpStatusCode.Forbidden:
                this.errorMessage = FORBIDDEN_MESSAGE;
                break;
            default:
                this.errorMessage = DEFAULT_MESSAGE;
                break;
        }
    }
    private handleError<T>(request: string, result?: T): (error: HttpErrorResponse) => Observable<T> {
        return (error: HttpErrorResponse): Observable<T> => {
            this.handleErrorStatusCode(error.status);
            return of(result as T);
        };
    }
}
