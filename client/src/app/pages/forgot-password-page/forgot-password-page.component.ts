/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/member-ordering */
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MAX_LENGTH_PSEUDO, MIN_LENGTH_PSEUDO } from '@app/constants/constants';
import { Authentificator as Authenticator } from '@app/services/auth.service';
import { HttpService } from '@app/services/http.service';
import { PlayerService } from '@app/services/player.service';
import { ThemeService } from '@app/services/theme.service';
import { lastValueFrom } from 'rxjs';

@Component({
    selector: 'app-forgot-password-page',
    templateUrl: './forgot-password-page.component.html',
    styleUrls: ['./forgot-password-page.component.scss'],
})
export class ForgotPasswordPageComponent {
    isPasswordResetForm: boolean;
    isUserFound: boolean;
    loginError: string;
    emailSent: boolean;
    protected loginForm: FormGroup;
    constructor(
        private formBuilder: FormBuilder,
        private router: Router,
        private playerService: PlayerService,
        private httpService: HttpService,
        private authService: Authenticator,
        protected themeService: ThemeService,
    ) {
        // email validator: https://mailtrap.io/blog/angular-email-validation/
        this.loginForm = this.formBuilder.group({
            temporaryPassword: ['', [Validators.required, Validators.minLength(MIN_LENGTH_PSEUDO), Validators.maxLength(MAX_LENGTH_PSEUDO)]],
            email: ['', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
            password: ['', [Validators.required]],
            confirmPassword: ['', [Validators.required]],
        });
        this.isPasswordResetForm = true;
        this.isUserFound = false;
        this.loginError = '';
        this.emailSent = false;
    }

    get temporaryPassword(): string {
        return this.loginForm.controls.temporaryPassword.value;
    }

    get areLoginInfoValid(): boolean {
        return this.loginForm.controls.email.valid;
    }

    get areSignInInfoValid(): boolean {
        return this.loginForm.controls.email.valid && this.areSignInPasswordsTheSame;
    }

    get isPseudoValid(): boolean {
        return this.loginForm.controls.temporaryPassword.valid;
    }

    get isEmailInvalid(): boolean {
        return this.loginForm.controls.email.invalid && this.loginForm.controls.email.touched;
    }

    get invalidEmailText(): string {
        if (!this.isEmailInvalid) return '';
        return "L'email fournit n'est pas valide";
    }

    get isConfirmedPasswordInvalid(): boolean {
        return !this.areSignInPasswordsTheSame && this.loginForm.controls.confirmPassword.touched;
    }

    get areSignInPasswordsTheSame(): boolean {
        if (this.loginForm.controls.password.value === '' || this.loginForm.controls.confirmPassword.value === '') return false;
        return this.loginForm.controls.password.value === this.loginForm.controls.confirmPassword.value;
    }

    get invalidConfirmPassWordText(): string {
        if (!this.isConfirmedPasswordInvalid) return '';
        return 'Le mot de passe ne concorde pas';
    }

    get invalidLoginInfo(): string {
        if (this.isUserFound) return '';
        return this.loginError;
    }

    setPlaceholderAsLabel(labelElement: HTMLLabelElement) {
        labelElement.classList.remove('placeholder');
    }

    setLabelAsPlaceholder(labelElement: HTMLLabelElement, formControlName: string) {
        if (this.loginForm.get(formControlName)?.value) return;
        labelElement.classList.add('placeholder');
    }

    focusInput(inputElement: HTMLInputElement) {
        inputElement.focus();
    }

    /*

this.authService
            .signIn(this.loginForm.controls.email.value, this.loginForm.controls.password.value)
            .then(async (userCredential) => {
                // Signed in
                const user = userCredential.user;
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const loginResult = await lastValueFrom(this.httpService.loginUser(user?.email!));
                // eslint-disable-next-line no-console
                console.log(loginResult);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                this.playerService.player.pseudo = (loginResult as any).username;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                this.playerService.player.email = (loginResult as any).email;
                await this.playerService.setUserInfo();
                this.router.navigate(['/main']);
            })
            .catch((error) => {
                const errorCode: string = error.code;
                if (errorCode) {
                    const errorMessage = error.message;
                    this.loginError = errorMessage;
                }
            });
    */
    async submitConnection() {
        this.authService
            .signIn(this.loginForm.controls.email.value, this.loginForm.controls.temporaryPassword.value)
            .then(async (userCredential) => {
                await this.authService
                    .changePassword(this.loginForm.controls.password.value)
                    .then(async () => {
                        // Signed in
                        const user = userCredential.user;
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        const loginResult = await lastValueFrom(this.httpService.loginUser(user?.email!));
                        // eslint-disable-next-line no-console
                        console.log(loginResult);
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        this.playerService.player.pseudo = (loginResult as any).username;
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        this.playerService.player.email = (loginResult as any).email;
                        await this.playerService.setUserInfo();
                        this.router.navigate(['/main']);
                    })
                    .catch(() => {
                        this.playerService.player.email = this.loginForm.controls.email.value;
                        this.router.navigate(['/main']);
                    });
            })
            .catch((error) => {
                const errorCode: string = error.code;
                if (errorCode) {
                    this.isUserFound = false;
                    const errorMessage = error.message;
                    this.loginError = errorMessage;
                }
            });
    }

    async submitPasswordReset() {
        // this.isPasswordResetForm = false;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const resetResult: any = await lastValueFrom(this.httpService.resetUserPassword(this.loginForm.controls.email.value));

        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        if (resetResult?.status === 202) {
            this.isPasswordResetForm = false;
            this.loginError = '';
        } else {
            this.isUserFound = false;
            const errorMessage = 'User not found with the provided email';
            this.loginError = errorMessage;
        }
    }
}
