import admin, { ServiceAccount } from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import serviceAccount from './service-account.json';

export const app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as ServiceAccount),
});
export const db = getFirestore();
export const auth = admin.auth();

module.exports = admin;
