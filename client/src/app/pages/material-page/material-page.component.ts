import { Component, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MATERIAL_DEFAULT_PREBUILT_THEME, MATERIAL_PREBUILT_THEMES } from '@app/constants/material-page-constants';

@Component({
    selector: 'app-material-page',
    templateUrl: './material-page.component.html',
    styleUrls: ['./material-page.component.scss'],
})
export class MaterialPageComponent {
    @ViewChild('merciDialogContent')
    private readonly merciDialogContentRef: TemplateRef<HTMLElement>;

    readonly themes = MATERIAL_PREBUILT_THEMES;

    favoriteTheme: string = MATERIAL_DEFAULT_PREBUILT_THEME.value;

    constructor(private readonly matDialog: MatDialog) {}

    onLikeTheme() {
        this.matDialog.open(this.merciDialogContentRef);
    }
}
