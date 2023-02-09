import { Auth } from 'firebase-admin/lib/auth/auth';
import { UpdateRequest } from 'firebase-admin/lib/auth/auth-config';
import { Service } from 'typedi';
// eslint-disable-next-line no-restricted-imports
import { auth } from '../firebase-config';

@Service()
export class Authentificator {
    auth: Auth;
    userNames: string[];
    constructor() {
        this.auth = auth;
        this.userNames = [];
    }

    userExists(userName: string): boolean {
        return this.userNames.find((name: string) => userName === name) ? true : false;
    }

    loginUser(username: string) {
        if (this.userExists(username)) return;
        this.userNames.push(username);
    }

    logoutUser(username: string) {
        const userToRemove = this.userNames.find((name: string) => username === name);
        if (userToRemove) {
            this.userNames.splice(this.userNames.indexOf(userToRemove), 1);
        }
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
