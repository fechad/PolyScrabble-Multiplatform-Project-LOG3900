import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ChatComponent } from '@app/components/chat/chat.component';
import { GameWaitLoadingComponent } from '@app/components/game-wait-loading/game-wait-loading.component';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { PlayersInfosComponent } from '@app/components/players-infos/players-infos.component';
import { RackComponent } from '@app/components/rack/rack.component';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { StartGameComponent } from '@app/components/start-game/start-game.component';
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
import { BestScoresTableComponent } from './components/best-scores-table/best-scores-table.component';
import { BotsTableComponent } from './components/bots-table/bots-table.component';
import { DictionariesTableComponent } from './components/dictionaries-table/dictionaries-table.component';
import { EditBotPopupComponent } from './components/edit-bot-popup/edit-bot-popup.component';
import { EditDictionaryPopupComponent } from './components/edit-dictionary-popup/edit-dictionary-popup.component';
import { EmojisPickerComponent } from './components/emojis-picker/emojis-picker.component';
import { GamesTableComponent } from './components/games-table/games-table.component';
import { GoalDialogDataComponent } from './components/goal-dialog-data/goal-dialog-data.component';
import { GoalComponent } from './components/goal/goal.component';
import { GoalsContainerComponent } from './components/goals-container/goals-container.component';
import { HeaderComponent } from './components/header/header.component';
import { LeaderboardDialogDataComponent } from './components/leaderboard-dialog-data/leaderboard-dialog-data.component';
import { MessagesDisplayComponent } from './components/messages-display/messages-display.component';
import { StartGameSoloComponent } from './components/start-game-solo/start-game-solo.component';
import { UploadDictionaryPopupComponent } from './components/upload-dictionary-popup/upload-dictionary-popup.component';
import { ConfirmationPopupComponent } from './confirmation-popup/confirmation-popup.component';
import { EndGamePopupComponent } from './endgame-popup/endgame-popup.component';
import { ErrorDialogComponent } from './error-dialog/error-dialog.component';
import { AdminBotPageComponent } from './pages/admin-bot-page/admin-bot-page.component';
import { AdminDictionariesPageComponent } from './pages/admin-dictionaries-page/admin-dictionaries-page.component';
import { AdminGamesPageComponent } from './pages/admin-games-page/admin-games-page.component';
import { AdminPageComponent } from './pages/admin-page/admin-page.component';
import { BestScoresPageComponent } from './pages/best-scores-page/best-scores-page.component';

/**
 * Main module that is used in main.ts.
 * All automatically generated components will appear in this module.
 * Please do not move this module in the module folder.
 * Otherwise Angular Cli will not know in which module to put new component
 */
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
        StartGameComponent,
        GameJoinMultiplayerPageComponent,
        GameWaitMultiplayerPageComponent,
        ChatComponent,
        PlayersInfosComponent,
        RackComponent,
        MessagesDisplayComponent,
        LeaderboardDialogDataComponent,
        GameWaitLoadingComponent,
        ErrorDialogComponent,
        StartGameSoloComponent,
        AdminPageComponent,
        AdminDictionariesPageComponent,
        EmojisPickerComponent,
        DictionariesTableComponent,
        EditDictionaryPopupComponent,
        GoalsContainerComponent,
        GoalComponent,
        GoalDialogDataComponent,
        AdminBotPageComponent,
        BotsTableComponent,
        EditBotPopupComponent,
        AdminGamesPageComponent,
        BestScoresPageComponent,
        GamesTableComponent,
        GoalsContainerComponent,
        GoalComponent,
        GoalDialogDataComponent,
        UploadDictionaryPopupComponent,
        ConfirmationPopupComponent,
        HeaderComponent,
        BestScoresTableComponent,
        EndGamePopupComponent,
    ],
    imports: [
        AppMaterialModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        HttpClientModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatProgressSpinnerModule,
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
