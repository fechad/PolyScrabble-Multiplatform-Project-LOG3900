import { HttpClientModule } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { HttpService } from '@app/services/http.service';

import { LoginPageComponent } from './login-page.component';

describe('LoginPageComponent', () => {
    let component: LoginPageComponent;
    let fixture: ComponentFixture<LoginPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HttpClientModule],
            declarations: [LoginPageComponent],
            providers: [{ provide: FormBuilder }, { provide: HttpService }],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(LoginPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
