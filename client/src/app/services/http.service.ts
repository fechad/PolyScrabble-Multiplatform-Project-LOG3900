import { HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse, HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Score } from '@app/classes/score';
import {
    DEFAULT_MESSAGE,
    FORBIDDEN_MESSAGE,
    GONE_RESSOURCE_MESSAGE,
    UNREACHABLE_SERVER_MESSAGE,
    // eslint-disable-next-line prettier/prettier
    UNREACHABLE_SERVER_STATUS_CDOE,
} from '@app/constants/http-constants';
import { PlayerGameStats } from '@app/constants/player-stats';
import { Game } from '@app/interfaces/game';
import { ClientAccountInfo } from '@app/interfaces/serveur info exchange/client-account-info';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

const CLOUD_NAME = 'dejrgre8q';

@Injectable({
    providedIn: 'root',
})
export class HttpService {
    private readonly scoresBaseUrl: string;
    private readonly gameBaseUrl: string;
    private readonly authUrl: string;
    private readonly userInfoUrl: string;
    private readonly opponentInfoUrl: string;
    private readonly avatarUrl: string;
    private readonly badgeUrl: string;
    private readonly statsUrl: string;
    private baseUrl: string;
    private errorMessage: string;
    constructor(private http: HttpClient) {
        this.scoresBaseUrl = 'scores';
        this.gameBaseUrl = 'games';
        this.authUrl = 'auth';
        this.userInfoUrl = 'userInfo';
        this.opponentInfoUrl = 'opponentInfo';
        this.avatarUrl = 'images/avatars';
        this.badgeUrl = 'images/badges';
        this.statsUrl = 'stats';
        this.baseUrl = environment.serverUrl;
        this.errorMessage = '';
    }
    getPlayerStats(playerEmail: string): Observable<PlayerGameStats> {
        return this.http
            .get<PlayerGameStats>(`${this.baseUrl}/${this.statsUrl}/${playerEmail}`)
            .pipe(catchError(this.handleError<PlayerGameStats>('Could not get stats')));
    }
    getCloudinarySignature(): Observable<{ timestamp: string; signature: string; apiKey: string }> {
        return this.http
            .get<{ timestamp: string; signature: string; apiKey: string }>(`${this.baseUrl}/images/signature`)
            .pipe(catchError(this.handleError<{ timestamp: string; signature: string; apiKey: string }>('getPredefinedAvatarsURL')));
    }

    getOpponentInfo(username: string): Observable<ClientAccountInfo> {
        // this.clearError();
        return this.http.get<ClientAccountInfo>(`${this.baseUrl}/${this.userInfoUrl}/${this.opponentInfoUrl}/${username}`);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    uploadFile(data: FormData): Observable<any> {
        return this.http.post(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, data);
    }
    updateUserSettings(userEmail: string, newClientAccountInfo: ClientAccountInfo): Observable<ClientAccountInfo> {
        this.clearError();

        return this.http.patch<ClientAccountInfo>(`${this.baseUrl}/${this.userInfoUrl}/${userEmail}`, newClientAccountInfo);
    }
    getUsernames() {
        this.clearError();
        return this.http.get<string[]>(`${this.baseUrl}/${this.authUrl}/usernames`).pipe(catchError(this.handleError<string[]>('getUsers')));
    }
    getUserInfo(email: string) {
        this.clearError();
        return this.http.get<ClientAccountInfo>(`${this.baseUrl}/${this.userInfoUrl}/${email}`);
    }

    getPredefinedAvatarsURL(): Observable<string[]> {
        this.clearError();
        return this.http.get<string[]>(`${this.baseUrl}/${this.avatarUrl}`).pipe(catchError(this.handleError<string[]>('getPredefinedAvatarsURL')));
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
