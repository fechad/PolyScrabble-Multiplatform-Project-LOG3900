import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
    selector: 'app-settings-page',
    templateUrl: './settings-page.component.html',
    styleUrls: ['./settings-page.component.scss'],
})
export class SettingsPageComponent implements OnInit {
    protected settingsForm: FormGroup;
    constructor(private formBuilder: FormBuilder /* private httpService: HttpService*/) {
        this.settingsForm = this.formBuilder.group({
            avatar: ['', [Validators.required]],
            theme: ['', [Validators.required]],
            language: ['', [Validators.required]],
            music: ['', [Validators.required]],
        });
    }

    // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method, @typescript-eslint/no-empty-function
    ngOnInit(): void {}

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sendData() {
        // eslint-disable-next-line no-console
        console.log(this.settingsForm);
    }
}
