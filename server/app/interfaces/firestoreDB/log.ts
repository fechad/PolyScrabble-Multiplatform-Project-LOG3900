import { firestore } from 'firebase-admin';

export interface Log {
    time: firestore.Timestamp | string;
    message: string;
}
