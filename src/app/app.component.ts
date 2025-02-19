import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import {
  RouterLink,
  RouterLinkActive,
  RouterModule,
  RouterOutlet,
} from '@angular/router';
import { PlayerService } from './services/player.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterModule,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'Player Auction App';
  isAdmin = false;
  constructor(private playerService: PlayerService) {}

  ngOnInit(): void {
    this.isAdmin = this.playerService.getIsAdmin();
  }
}
