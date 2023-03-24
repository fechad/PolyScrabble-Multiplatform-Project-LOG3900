import { DragDropModule } from '@angular/cdk/drag-drop';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ChatComponent } from '@app/components/chat/chat.component';
import { GameWaitLoadingComponent } from '@app/components/game-wait-loading/game-wait-loading.component';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { PlayersInfosComponent } from '@app/components/players-infos/players-infos.component';
import { RackComponent } from '@app/components/rack/rack.component';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppMaterialModule } from '@app/modules/material.module';
import { AppComponent } from '@app/pages/app/app.component';
import { GameCreateMultiplayerPageComponent } from '@app/pages/game-create-multiplayer-page/game-create-multiplayer-page.component';
import { GameJoinMultiplayerPageComponent } from '@app/pages/game-join-multiplayer-page/game-join-multiplayer-page.component';
import { GameOptionPageComponent } from '@app/pages/game-option-page/game-option-page.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { GameWaitMultiplayerPageComponent } from '@app/pages/game-wait-multiplayer-page/game-wait-multiplayer-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { MaterialPageComponent } from '@app/pages/material-page/material-page.component';
import { CloudinaryModule } from '@cloudinary/ng';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { BestScoresTableComponent } from './components/best-scores-table/best-scores-table.component';
import { ConfirmationPopupComponent } from './components/confirmation-popup/confirmation-popup.component';
import { EmojisPickerComponent } from './components/emojis-picker/emojis-picker.component';
import { EndGamePopupComponent } from './components/endgame-popup/endgame-popup.component';
import { ErrorDialogComponent } from './components/error-dialog/error-dialog.component';
import { GamesTableComponent } from './components/games-table/games-table.component';
import { GeneralChatComponent } from './components/general-chat/general-chat.component';
import { GoalDialogDataComponent } from './components/goal-dialog-data/goal-dialog-data.component';
import { GoalComponent } from './components/goal/goal.component';
import { GoalsContainerComponent } from './components/goals-container/goals-container.component';
import { HeaderComponent } from './components/header/header.component';
import { HintShowerComponent } from './components/hint-shower/hint-shower.component';
import { LeaderBoardDialogDataComponent } from './components/leaderboard-dialog-data/leaderboard-dialog-data.component';
import { MenuComponent } from './components/menu/menu.component';
import { MessagesDisplayComponent } from './components/messages-display/messages-display.component';
import { PredefinedAvatarsPopupComponent } from './components/predefined-avatars-popup/predefined-avatars-popup.component';
import { ThemedPopUpComponent } from './components/themed-pop-up/themed-pop-up.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { UserSummaryComponent } from './components/user-summary/user-summary.component';
import { VirtualPlayerComponent } from './components/virtual-player/virtual-player.component';
import { AdminDictionariesPageComponent } from './pages/admin-dictionaries-page/admin-dictionaries-page.component';
import { AdminGamesPageComponent } from './pages/admin-games-page/admin-games-page.component';
import { AdminPageComponent } from './pages/admin-page/admin-page.component';
import { BestScoresPageComponent } from './pages/best-scores-page/best-scores-page.component';
import { ChatWindowPageComponent } from './pages/chat-window-page/chat-window-page.component';
import { ForgotPasswordPageComponent } from './pages/forgot-password-page/forgot-password-page.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { SettingsPageComponent } from './pages/settings-page/settings-page.component';
import { ThemedPageComponent } from './pages/themed-page/themed-page.component';

/**
 * Main module that is used in main.ts.
 * All automatically generated components will appear in this module.
 * Please do not move this module in the module folder.
 * Otherwise Angular Cli will not know in which module to put new component
 */

// eslint-disable-next-line prefer-arrow/prefer-arrow-functions, @typescript-eslint/naming-convention
export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
    declarations: [
        AppComponent,
        GamePageComponent,
        MainPageComponent,
        MaterialPageComponent,
        PlayAreaComponent,
        SidebarComponent,
        GameOptionPageComponent,
        GameCreateMultiplayerPageComponent,
        GameJoinMultiplayerPageComponent,
        GameWaitMultiplayerPageComponent,
        ChatComponent,
        PlayersInfosComponent,
        RackComponent,
        MessagesDisplayComponent,
        LeaderBoardDialogDataComponent,
        GameWaitLoadingComponent,
        ErrorDialogComponent,
        AdminPageComponent,
        AdminDictionariesPageComponent,
        EmojisPickerComponent,
        GoalsContainerComponent,
        GoalComponent,
        GoalDialogDataComponent,
        AdminGamesPageComponent,
        BestScoresPageComponent,
        GamesTableComponent,
        GoalsContainerComponent,
        GoalComponent,
        GoalDialogDataComponent,
        ConfirmationPopupComponent,
        HeaderComponent,
        BestScoresTableComponent,
        EndGamePopupComponent,
        LoginPageComponent,
        GeneralChatComponent,
        UserProfileComponent,
        UserSummaryComponent,
        MenuComponent,
        SettingsPageComponent,
        ForgotPasswordPageComponent,
        PredefinedAvatarsPopupComponent,
        ChatWindowPageComponent,
        ThemedPageComponent,
        VirtualPlayerComponent,
        ThemedPopUpComponent,
        HintShowerComponent,
    ],
    imports: [
        AppMaterialModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        HttpClientModule,
        ReactiveFormsModule,
        MatSlideToggleModule,
        DragDropModule,
        CloudinaryModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient],
            },
            defaultLanguage: 'fr',
        }),
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
