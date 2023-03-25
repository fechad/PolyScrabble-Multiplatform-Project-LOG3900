import { firestore } from 'firebase-admin';

export interface GameHeader {
    type: string;
    score: number;
    gameID: firestore.Timestamp;
    endDateTime: firestore.Timestamp;
    won: boolean;
}
