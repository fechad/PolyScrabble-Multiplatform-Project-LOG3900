/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { DEFAULT_USER_SETTINGS } from '@app/constants/default-user-settings';
import { PlayerGameStats } from '@app/interfaces/client-exchange/player-stats';
import { Account } from '@app/interfaces/firestoreDB/account';
import { expect } from 'chai';
import { firestore } from 'firebase-admin';
import { PlayerGameHistoryService } from './player-game-history.service';

describe('PlayerGameHistoryService tests', () => {
    let historyService: PlayerGameHistoryService;
    let playerAccount: Account;
    beforeEach(() => {
        historyService = new PlayerGameHistoryService({} as any);
        playerAccount = {
            username: 'WickedTester',
            email: 'test@test.test',
            userSettings: DEFAULT_USER_SETTINGS,
            highScores: {},
            bestGames: [],
            gamesWon: 2,
            gamesPlayed: [
                {
                    won: true,
                    score: 100,
                    gameID: firestore.Timestamp.fromMillis(0),
                    endDateTime: firestore.Timestamp.fromMillis(5000),
                    type: 'test',
                },
                {
                    won: true,
                    score: 200,
                    gameID: firestore.Timestamp.fromMillis(0),
                    endDateTime: firestore.Timestamp.fromMillis(5000),
                    type: 'test',
                },
            ],
            totalXP: 400,
            badges: [],
        };
    });
    it('should correctly bundle player Info', async () => {
        const gamesStats = await (historyService as any).bundlePlayerStats(playerAccount);
        const expected: PlayerGameStats = {
            averageGameDuration: '5s',
            gamesWonCount: 2,
            averagePointsByGame: 150,
            playedGamesCount: 2,
            playedGames: [
                {
                    score: 100,
                    duration: '5s',
                    startDateTime: firestore.Timestamp.fromMillis(0).toDate().toLocaleString('fr-CA', { timeZone: 'America/Montreal' }),
                    won: true,
                },
                {
                    score: 200,
                    duration: '5s',
                    startDateTime: firestore.Timestamp.fromMillis(0).toDate().toLocaleString('fr-CA', { timeZone: 'America/Montreal' }),
                    won: true,
                },
            ],
        };
        expect(gamesStats).to.be.deep.equal(expected);
    });
});
