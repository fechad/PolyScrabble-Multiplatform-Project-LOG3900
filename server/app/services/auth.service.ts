import { Auth } from 'firebase-admin/lib/auth/auth';
import { UpdateRequest } from 'firebase-admin/lib/auth/auth-config';
import { Service } from 'typedi';
// eslint-disable-next-line no-restricted-imports
import { auth } from '../firebase-config';

@Service()
export class Authentificator {
    auth: Auth;

    constructor() {
        this.auth = auth;
    }

    async getFindUser(uid: string) {
        return this.auth.getUser(uid);
    }

    async findUserByEmail(email: string) {
        return this.auth.getUserByEmail(email);
    }

    async getUserEmail(uid: string) {
        return (await this.auth.getUser(uid)).email;
    }

    async createToken(idToken: string) {
        return this.auth.verifyIdToken(idToken);
    }

    async updateUser(uid: string, update: UpdateRequest) {
        this.auth.updateUser(uid, update);
    }
}
