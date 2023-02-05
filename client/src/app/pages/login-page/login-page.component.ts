import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MAX_LENGTH_PSEUDO, MIN_LENGTH_PSEUDO } from '@app/constants/constants';

@Component({
    selector: 'app-login-page',
    templateUrl: './login-page.component.html',
    styleUrls: ['./login-page.component.scss'],
})
export class LoginPageComponent {
    isLoginForm: boolean;
    emailSent: boolean;
    protected loginForm: FormGroup;
    constructor(private formBuilder: FormBuilder, private router: Router) {
        // email validator: https://mailtrap.io/blog/angular-email-validation/
        this.loginForm = this.formBuilder.group({
            username: ['', [Validators.required, Validators.minLength(MIN_LENGTH_PSEUDO), Validators.maxLength(MAX_LENGTH_PSEUDO)]],
            email: ['', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
            password: ['', [Validators.required]],
            confirmPassword: ['', [Validators.required]],
        });
        this.isLoginForm = true;
        this.emailSent = false;
    }

    get areLoginInfoValid(): boolean {
        return this.loginForm.controls.email.valid && this.loginForm.controls.password.valid;
    }

    get areSignInInfoValid(): boolean {
        return this.loginForm.controls.username.valid && this.loginForm.controls.email.valid && this.areSignInPasswordsTheSame;
    }

    get invalidUsernameText(): string {
        if (!this.loginForm.controls.username.touched) return '';
        if (this.loginForm.controls.username.value.length < MIN_LENGTH_PSEUDO) return 'Votre pseudo est trop court';
        if (this.loginForm.controls.username.value.length > MAX_LENGTH_PSEUDO) return 'Votre pseudo est trop long';
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

    submitConnection() {
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
