import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OtherUserProfileComponent } from '@app/components/other-user-profile/other-user-profile.component';
import { UserProfileComponent } from '@app/components/user-profile/user-profile.component';
import { AdminDictionariesPageComponent } from '@app/pages/admin-dictionaries-page/admin-dictionaries-page.component';
import { AdminGamesPageComponent } from '@app/pages/admin-games-page/admin-games-page.component';
import { AdminPageComponent } from '@app/pages/admin-page/admin-page.component';
import { BestScoresPageComponent } from '@app/pages/best-scores-page/best-scores-page.component';
import { ChatWindowPageComponent } from '@app/pages/chat-window-page/chat-window-page.component';
import { ForgotPasswordPageComponent } from '@app/pages/forgot-password-page/forgot-password-page.component';
import { GameCreateMultiplayerPageComponent } from '@app/pages/game-create-multiplayer-page/game-create-multiplayer-page.component';
import { GameJoinMultiplayerPageComponent } from '@app/pages/game-join-multiplayer-page/game-join-multiplayer-page.component';
import { GameOptionPageComponent } from '@app/pages/game-option-page/game-option-page.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { GameWaitMultiplayerPageComponent } from '@app/pages/game-wait-multiplayer-page/game-wait-multiplayer-page.component';
import { LoginPageComponent } from '@app/pages/login-page/login-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { MaterialPageComponent } from '@app/pages/material-page/material-page.component';
import { SettingsPageComponent } from '@app/pages/settings-page/settings-page.component';
import { ThemedPageComponent } from '@app/pages/themed-page/themed-page.component';
export const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: LoginPageComponent },
    { path: 'main', component: MainPageComponent },
    { path: 'game', component: GamePageComponent },
    { path: 'game/option', component: GameOptionPageComponent },
    { path: 'game/multiplayer/create/:mode', component: GameCreateMultiplayerPageComponent },
    { path: 'game/multiplayer/join', component: GameJoinMultiplayerPageComponent },
    { path: 'game/multiplayer/wait', component: GameWaitMultiplayerPageComponent },
    { path: 'game/themed', component: ThemedPageComponent },
    { path: 'admin', component: AdminPageComponent },
    { path: 'admin/scores', component: BestScoresPageComponent },
    { path: 'admin/games', component: AdminGamesPageComponent },
    { path: 'admin/dictionaries', component: AdminDictionariesPageComponent },
    { path: 'material', component: MaterialPageComponent },
    { path: 'user', component: UserProfileComponent },
    { path: 'other-user', component: OtherUserProfileComponent },
    { path: 'settings', component: SettingsPageComponent },
    { path: 'reset-password', component: ForgotPasswordPageComponent },
    { path: 'chat', component: ChatWindowPageComponent },
    { path: '**', redirectTo: '/home' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true, onSameUrlNavigation: 'reload' })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
