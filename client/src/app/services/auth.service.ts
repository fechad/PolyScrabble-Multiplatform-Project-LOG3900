import { Injectable } from '@angular/core';
import { Auth, getAuth, signInWithEmailAndPassword } from 'firebase/auth';
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
        signInWithEmailAndPassword(this.auth, email, password).then((user) => {
            // send user id to server user.user.uid
            // eslint-disable-next-line no-console
            console.log('successful signin', user.user.email);
        });
    }

    async changePassword() {
        // TODO:
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
