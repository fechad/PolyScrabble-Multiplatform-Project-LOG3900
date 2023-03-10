/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { HttpResponse } from '@angular/common/http';
import { AfterViewInit, Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MAX_LENGTH_PSEUDO, MIN_LENGTH_PSEUDO } from '@app/constants/constants';
import { Authentificator as Authenticator } from '@app/services/auth.service';
import { HttpService } from '@app/services/http.service';
import { PlayerService } from '@app/services/player.service';
import { lastValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-login-page',
    templateUrl: './login-page.component.html',
    styleUrls: ['./login-page.component.scss'],
})
export class LoginPageComponent implements AfterViewInit {
    isLoginForm: boolean;
    isLoginInfoValid: boolean;
    loginError: string;
    emailSent: boolean;
    usernames: string[];
    protected loginForm: FormGroup;
    constructor(
        private formBuilder: FormBuilder,
        private router: Router,
        private playerService: PlayerService,
        private httpService: HttpService,
        private authService: Authenticator,
    ) {
        if (environment.production) {
            this.playerService.player.email = 'Chad@gmail.com';
            this.playerService.player.pseudo = `User ${new Date().toLocaleTimeString([], { hour12: false })}`;
            router.navigateByUrl('/main');
        }
        // email validator: https://mailtrap.io/blog/angular-email-validation/
        this.loginForm = this.formBuilder.group({
            username: ['', [Validators.required, Validators.minLength(MIN_LENGTH_PSEUDO), Validators.maxLength(MAX_LENGTH_PSEUDO)]],
            email: ['', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
            password: ['', [Validators.required]],
            confirmPassword: ['', [Validators.required]],
        });
        this.isLoginForm = true;
        this.isLoginInfoValid = true;
        this.loginError = '';
        this.emailSent = false;
        this.usernames = [];
    }

    get username(): string {
        return this.loginForm.controls.username.value;
    }

    get areLoginInfoValid(): boolean {
        return this.loginForm.controls.email.valid && this.loginForm.controls.password.valid;
    }

    get areSignInInfoValid(): boolean {
        return this.loginForm.controls.email.valid && this.areSignInPasswordsTheSame;
    }

    get isPseudoValid(): boolean {
        return this.loginForm.controls.username.valid && !this.userExist;
    }

    get invalidUsernameText(): string {
        if (!this.loginForm.controls.username.touched) return '';
        if (this.loginForm.controls.username.value.length < MIN_LENGTH_PSEUDO) return 'Votre pseudo est trop court';
        if (this.loginForm.controls.username.value.length > MAX_LENGTH_PSEUDO) return 'Votre pseudo est trop long';
        if (this.userExist) return 'Ce nom existe déja';
        return '';
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
        if (this.isLoginInfoValid) return '';
        return this.loginError;
    }

    get userExist() {
        return this.usernames.find((username: string) => username.toLowerCase() === this.username.toLowerCase());
    }

    async ngAfterViewInit() {
        const serverResponse = await lastValueFrom(this.httpService.getUsernames());
        if (serverResponse) this.usernames = serverResponse;
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

    connectAccount() {
        this.isLoginForm = true;
    }

    registerAccount() {
        this.isLoginForm = false;
    }

    async submitConnection() {
        // const loginResult = await lastValueFrom(this.httpService.loginUser(this.username));
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
                this.router.navigate(['/main']);

                // ...
            })
            .catch((error) => {
                const errorCode: string = error.code;
                if (errorCode) {
                    this.isLoginInfoValid = false;
                    const errorMessage = error.message;
                    this.loginError = errorMessage;
                }
            });
    }

    forgotPassword() {
        this.router.navigate(['/reset-password']);
    }

    submitRegistration() {
        this.authService
            .signUp(this.loginForm.controls.email.value, this.loginForm.controls.password.value)
            .then(async (userCredential) => {
                // Signed in
                const user = userCredential.user;
                const signUpResult: HttpResponse<{ email: string; username: string }> = await lastValueFrom(
                    this.httpService.signUpUser(user?.email!, this.loginForm.value.username),
                );
                const statusCode = 201;
                if (signUpResult.status === statusCode) {
                    const loginResult = await lastValueFrom(this.httpService.loginUser(user?.email!));
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    this.playerService.player.email = (loginResult as any).email;
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    this.playerService.player.pseudo = (loginResult as any).username;

                    this.router.navigate(['/main']);
                } else {
                    this.loginError = 'Error: could not create account';
                    this.clearInputFields();
                }
                // ...
            })
            .catch((error) => {
                const errorCode: string = error.code;
                if (errorCode) {
                    this.isLoginInfoValid = false;
                    const errorMessage = error.message;
                    this.loginError = errorMessage;
                }
            });
    }

    private clearInputFields() {
        this.loginForm.controls.username.setValue('');
        this.loginForm.controls.email.setValue('');
        this.loginForm.controls.password.setValue('');
        this.loginForm.controls.confirmPassword.setValue('');
    }
}
