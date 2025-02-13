import { Routes } from '@angular/router';
import { WelcomeComponent } from './welcome/welcome.component';
import { AddUserComponent } from './add-user/add-user.component';
import { PlayerListComponent } from './player-list/player-list.component';
import { BiddingProcessComponent } from './bidding-process/bidding-process.component';
import { biddingCheckGuard } from './guards/bidding-check.guard';
import { DashboardComponent } from './dashboard/dashboard.component';

export const routes: Routes = [
  { path: '', component: WelcomeComponent },
  { path: 'adduser', component: AddUserComponent },
  { path: 'players', component: PlayerListComponent },
  { path: 'dashboard', component: DashboardComponent },
  {
    path: 'biddingprocess',
    component: BiddingProcessComponent,
  },
];
