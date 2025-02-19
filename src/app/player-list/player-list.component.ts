import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTable } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { PlayerService } from '../services/player.service';
import { AllOwnersResponse, Player } from '../../models/player.model';
import { BehaviorSubject, catchError, finalize, Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

interface TableState {
  players: Player[];
  loading: boolean;
  error: string | null;
}

@Component({
  selector: 'app-player-list',
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatCardModule,
    MatIconModule,
    MatChipsModule,
  ],
  templateUrl: './player-list.component.html',
  styleUrl: './player-list.component.scss',
})
export class PlayerListComponent implements OnInit {
  displayedColumns: string[] = ['name', 'role', 'basePrice', 'actions'];
  private tableStateSubject = new BehaviorSubject<TableState>({
    players: [],
    loading: true,
    error: null,
  });

  tableState$ = this.tableStateSubject.asObservable();

  private biddingInProgressSubject = new BehaviorSubject<string[]>([]);
  biddingInProgress$ = this.biddingInProgressSubject.asObservable();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<Player>;
  ownerDetails$!: Observable<AllOwnersResponse>;

  constructor(
    private playerService: PlayerService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPlayers();
    this.loadOwnerDetails();
  }

  loadPlayers() {
    this.tableStateSubject.next({
      ...this.tableStateSubject.value,
      loading: true,
      error: null,
    });

    this.playerService
      .getAvailablePlayers()
      .pipe(
        catchError((error) => {
          console.error('Error loading players:', error);
          this.snackBar.open(
            'Failed to load players. Please try again.',
            'Close',
            {
              duration: 5000,
            }
          );
          return of([]); // Return empty array in case of error
        })
      )
      .subscribe((players) => {
        this.tableStateSubject.next({
          players: players,
          loading: false,
          error: null,
        });
      });
  }

  loadOwnerDetails(): void {
    this.ownerDetails$ = this.playerService.getAllOwnersDetails();
  }

  getBudgetColorClass(budget: number): string {
    // Assuming a maximum budget of 10,000,000 for calculation
    const maxBudget = 10000000;
    const percentage = (budget / maxBudget) * 100;

    if (percentage <= 30) return 'budget-red';
    if (percentage <= 50) return 'budget-orange';
    return 'budget-green';
  }

  startAuction() {
    const players = this.tableStateSubject.value.players;

    if (!players.length) {
      this.snackBar.open('No available players for auction.', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
      return;
    }

    // Randomly select a player
    const randomIndex = Math.floor(Math.random() * players.length);
    const selectedPlayer = players[randomIndex];

    // Add selected player to bidding process
    this.biddingInProgressSubject.next([
      ...this.biddingInProgressSubject.value,
      selectedPlayer.userId,
    ]);

    this.playerService
      .startBidding(selectedPlayer.userId)
      .pipe(
        finalize(() => {
          // Remove from bidding progress after processing
          this.biddingInProgressSubject.next(
            this.biddingInProgressSubject.value.filter(
              (id) => id !== selectedPlayer.userId
            )
          );
        })
      )
      .subscribe({
        next: () => {
          this.snackBar.open(
            `Auction started for ${selectedPlayer.firstName} ${selectedPlayer.lastName}`,
            'Close',
            {
              duration: 5000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
            }
          );
          this.playerService.setSelectedPlayerUidSignal(selectedPlayer.userId);
          this.router.navigate(['/biddingprocess']);
        },
        error: (error) => {
          console.error('Error starting auction:', error);
          this.snackBar.open(
            'Failed to start auction. Please try again.',
            'Close',
            {
              duration: 5000,
            }
          );
        },
      });
  }
}
