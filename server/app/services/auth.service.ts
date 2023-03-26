import { getAuth } from 'firebase-admin/auth';
import { Auth } from 'firebase-admin/lib/auth/auth';
import { UpdateRequest } from 'firebase-admin/lib/auth/auth-config';
import { UserRecord } from 'firebase-admin/lib/auth/user-record';
import { Service } from 'typedi';

// eslint-disable-next-line no-restricted-imports

@Service()
export class Authentificator {
    auth: Auth;
    userNames: string[];
    constructor() {
        this.auth = getAuth();
        this.userNames = [];
    }

    userExists(userName: string): boolean {
        return this.userNames.includes(userName);
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

    async resetUserPassword(email: string) {
        return this.findUserByEmail(email);
    }

    async getFindUser(uid: string) {
        return this.auth.getUser(uid);
    }

    async findUserByEmail(email: string): Promise<UserRecord> {
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
