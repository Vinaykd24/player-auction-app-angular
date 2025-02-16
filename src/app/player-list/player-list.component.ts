import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTable } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { PlayerService } from '../services/player.service';
import { Player } from '../../models/player.model';
import { BehaviorSubject, catchError, finalize, of } from 'rxjs';
import { Router } from '@angular/router';

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

  constructor(
    private playerService: PlayerService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPlayers();
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

  startBidding(player: Player) {
    // Add player ID to bidding in progress
    this.biddingInProgressSubject.next([
      ...this.biddingInProgressSubject.value,
      player.userId,
    ]);

    this.playerService
      .startBidding(player.userId)
      .pipe(
        finalize(() => {
          // Remove player ID from bidding in progress
          this.biddingInProgressSubject.next(
            this.biddingInProgressSubject.value.filter(
              (id) => id !== player.userId
            )
          );
        })
      )
      .subscribe({
        next: () => {
          this.snackBar.open(
            `Bidding started for ${player.firstName} ${player.lastName}`,
            'Close',
            {
              duration: 5000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
            }
          );
          this.playerService.setSelectedPlayerUidSignal(player.userId);
          this.router.navigate(['/biddingprocess']);
        },
        error: (error) => {
          console.error('Error starting bidding:', error);
          this.snackBar.open(
            'Failed to start bidding. Please try again.',
            'Close',
            {
              duration: 5000,
            }
          );
        },
      });
  }
}
