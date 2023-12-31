import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, updatePassword } from 'firebase/auth';
// eslint-disable-next-line no-restricted-imports
import { app } from '../../firebase-config';

@Injectable({
    providedIn: 'root',
})
export class Authentificator {
    auth: Auth;

    constructor() {
        this.auth = getAuth(app);
    }

    async signIn(email: string, password: string) {
        return signInWithEmailAndPassword(this.auth, email, password);
    }

    async signUp(email: string, password: string) {
        return createUserWithEmailAndPassword(this.auth, email, password);
    }

    async changePassword(newPassword: string) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return updatePassword(this.auth.currentUser!, newPassword);
    }

    async getUserEmail() {
        return this.auth.currentUser?.email;
    }

    async getToken() {
        return this.auth.currentUser?.getIdToken;
    }

    // eslint-disable-next-line no-unused-vars
    async updateUser(newEmail?: string, newPassword?: string) {
        // const update = { uid: this.auth.currentUser?.uid, email: newEmail, password: newPassword };
        // sends the update to server
    }
}
