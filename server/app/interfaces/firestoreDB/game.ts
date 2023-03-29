import { firestore } from 'firebase-admin';

export interface Game {
    startDatetime: firestore.Timestamp;
    endDatetime: firestore.Timestamp;
    results: { playerID: string; score: number; unfairQuit: boolean }[];
    gameType: string;
}
