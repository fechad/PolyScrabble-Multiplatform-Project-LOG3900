import { AfterViewInit, Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MAX_LENGTH_PSEUDO, MIN_LENGTH_PSEUDO } from '@app/constants/constants';
import { HttpService } from '@app/services/http.service';
import { PlayerService } from '@app/services/player.service';
import { lastValueFrom } from 'rxjs';

@Component({
    selector: 'app-login-page',
    templateUrl: './login-page.component.html',
    styleUrls: ['./login-page.component.scss'],
})
export class LoginPageComponent implements AfterViewInit {
    isLoginForm: boolean;
    emailSent: boolean;
    usernames: string[];
    protected loginForm: FormGroup;
    constructor(private formBuilder: FormBuilder, private router: Router, private playerService: PlayerService, private httpService: HttpService) {
        // email validator: https://mailtrap.io/blog/angular-email-validation/
        this.loginForm = this.formBuilder.group({
            username: ['', [Validators.required, Validators.minLength(MIN_LENGTH_PSEUDO), Validators.maxLength(MAX_LENGTH_PSEUDO)]],
            email: ['', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
            password: ['', [Validators.required]],
            confirmPassword: ['', [Validators.required]],
        });
        this.isLoginForm = true;
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
        return this.loginForm.controls.username.valid && this.loginForm.controls.email.valid && this.areSignInPasswordsTheSame;
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

    get userExist() {
        return this.usernames.find((username: string) => username === this.username);
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
        const loginResult = await lastValueFrom(this.httpService.loginUser(this.username));
        if (this.httpService.anErrorOccurred()) {
            // TODO: afficher erreur
            return;
        }
        const STATUS_OK = 200;
        if (loginResult.status !== STATUS_OK) {
            // afficher erreur
            return;
        }

        this.playerService.player.pseudo = this.username;
        this.router.navigate(['/main']);
    }

    submitRegistration() {
        this.clearInputFields();
        this.emailSent = true;
    }

    private clearInputFields() {
        this.loginForm.controls.username.setValue('');
        this.loginForm.controls.email.setValue('');
        this.loginForm.controls.password.setValue('');
        this.loginForm.controls.confirmPassword.setValue('');
    }
}
