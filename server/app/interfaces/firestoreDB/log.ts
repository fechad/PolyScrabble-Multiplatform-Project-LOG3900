import { firestore } from 'firebase-admin';

export interface Log {
    time: firestore.Timestamp;
    message: string;
}
