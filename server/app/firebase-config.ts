import admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import serviceAccount from './service-account.json';

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as ServiceAccount),
});

export const db = getFirestore();
export const auth = admin.auth();

module.exports = admin;
