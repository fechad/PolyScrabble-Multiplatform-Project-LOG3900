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
import { Game } from '@app/interfaces/game';
import { ClientAccountInfo } from '@app/interfaces/serveur info exchange/client-account-info';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class HttpService {
    private readonly scoresBaseUrl: string;
    private readonly botBaseUrl: string;
    private readonly gameBaseUrl: string;
    private readonly authUrl: string;
    private readonly userInfoUrl: string;
    private readonly avatarUrl: string;
    private readonly badgeUrl: string;
    private baseUrl: string;
    private errorMessage: string;
    constructor(private http: HttpClient) {
        this.scoresBaseUrl = 'scores';
        this.gameBaseUrl = 'games';
        this.botBaseUrl = 'bots';
        this.authUrl = 'auth';
        this.userInfoUrl = 'userInfo';
        this.avatarUrl = 'images/avatars';
        this.badgeUrl = 'images/badges';
        this.baseUrl = environment.serverUrl;
        this.errorMessage = '';
    }

    getUsernames() {
        this.clearError();
        return this.http.get<string[]>(`${this.baseUrl}/${this.authUrl}/usernames`).pipe(catchError(this.handleError<string[]>('getUsers')));
    }
    getUserInfo(email: string) {
        this.clearError();
        return this.http.get<ClientAccountInfo>(`${this.baseUrl}/${this.userInfoUrl}/${email}`);
    }
    getAvatarURL(imageId: string) {
        this.clearError();
        return `${this.baseUrl}/${this.avatarUrl}/${imageId}`;
    }
    getBadgeURL(badgeId: string) {
        this.clearError();
        return `${this.baseUrl}/${this.badgeUrl}/${badgeId}`;
    }
    loginUser(email: string) {
        this.clearError();
        return this.http.get<unknown[]>(`${this.baseUrl}/${this.authUrl}/user/${email}`).pipe(catchError(this.handleError<string[]>('loginUser')));
    }

    resetUserPassword(email: string) {
        this.clearError();
        return this.http
            .post<{ email: string }>(
                `${this.baseUrl}/${this.authUrl}/user/reset/${email}`,
                { email },
                { headers: this.createCacheHeaders(), observe: 'response' },
            )
            .pipe(catchError(this.handleError<HttpResponse<string[]>>('resetUserPassword')));
    }

    signUpUser(email: string, username?: string) {
        this.clearError();
        // TODO: Connect to server user creation route
        return this.http
            .post<{ email: string; username: string }>(
                `${this.baseUrl}/${this.authUrl}/user`,
                { email, username },
                {
                    headers: this.createCacheHeaders(),
                    observe: 'response',
                },
            )
            .pipe(catchError(this.handleError<HttpResponse<{ email: string; username: string }>>('SignUp User')));
    }

    logoutUser(username: string) {
        this.clearError();
        const logoutUrl = `${this.baseUrl}/${this.authUrl}/logout`;
        return this.http
            .put<string>(logoutUrl, { username }, { headers: this.createCacheHeaders(), observe: 'response' })
            .pipe(catchError(this.handleError<HttpResponse<string>>('logoutUser')));
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

    getAllGames() {
        this.clearError();
        const httpHeaders = new HttpHeaders().set('Cache-Control', 'no-cache').set('Expires', '0');
        const gameUrl = `${this.baseUrl}/${this.gameBaseUrl}`;
        return this.http.get<Game[]>(gameUrl, { headers: httpHeaders }).pipe(catchError(this.handleError<Game[]>('getAllGames')));
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
