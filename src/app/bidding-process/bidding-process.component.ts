import { Component, OnDestroy, OnInit } from '@angular/core';
import { PlayerService } from '../services/player.service';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import {
  BiddingPayload,
  BiddingProgressResponse,
  OwnerDetails,
} from '../../models/player.model';
import { BehaviorSubject, Subject, Subscription, tap, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-bidding-process',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
  ],
  templateUrl: './bidding-process.component.html',
  styleUrls: ['./bidding-process.component.scss'],
})
export class BiddingProcessComponent implements OnInit, OnDestroy {
  selectedPlayer$ = new BehaviorSubject<BiddingProgressResponse | null>(null);
  latestDetails$ = new BehaviorSubject<BiddingProgressResponse | null>(null);
  lastBidTeamId: string | null = null;
  ownerDetails!: OwnerDetails | null;
  biddingForm: FormGroup;
  currentValue = 0;
  private destroy$ = new Subject<void>();
  isAdmin = false;

  constructor(
    private fb: FormBuilder,
    private playerService: PlayerService,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.biddingForm = this.fb.group({
      customBidAmt: [''],
    });
  }

  ngOnInit(): void {
    this.ownerDetails = this.playerService.getSelectedOwnerSignal();
    this.isAdmin = this.playerService.getIsAdmin();

    if (this.ownerDetails || this.isAdmin) {
      this.loadBiddingData();

      this.playerService
        .onBiddingUpdates()
        .pipe(
          tap((latestBid) => {
            if (latestBid) {
              this.lastBidTeamId = this.ownerDetails
                ? this.ownerDetails?.userId
                : 'Admin';
              this.latestDetails$.next(latestBid);
              const currentPlayer = this.selectedPlayer$.value;
              if (currentPlayer) {
                this.selectedPlayer$.next({
                  ...currentPlayer,
                  currentBidAmount: latestBid.currentBidAmount,
                  bidAmount: latestBid.bidAmount,
                  teamId: latestBid.teamId,
                });
              }
            }
          }),
          takeUntil(this.destroy$)
        )
        .subscribe();
    }
  }

  canBid(): boolean {
    return (
      !!this.ownerDetails && this.lastBidTeamId !== this.ownerDetails.userId
    );
  }

  private loadBiddingData() {
    this.playerService.biddingProgress().subscribe({
      next: (player) => {
        if (player) {
          this.selectedPlayer$.next(player);

          const playerId = player.userId || ''; // Extract playerId from response
          if (playerId) {
            this.playerService.connectWebSocket(playerId);
          } else {
            console.error('Player ID is missing from API response');
          }
        }
      },
      error: (err) => {
        console.error('Error fetching bidding data:', err);
      },
    });
  }

  bidByAmount(amount: number, biddingObject: any): void {
    if (!this.ownerDetails || !biddingObject) return;

    const currentBidAmount =
      biddingObject.currentBidAmount || biddingObject.basePrice || 0;
    const biddingPayload: BiddingPayload = {
      playerId: biddingObject.userId,
      currentBidAmount: currentBidAmount + amount,
      bidAmount: amount,
      teamId: this.ownerDetails.userId,
    };

    this.playerService
      .placeBid(biddingPayload)
      .pipe(
        tap((response) => {
          const currentPlayer = this.selectedPlayer$.value;
          if (currentPlayer) {
            this.selectedPlayer$.next({
              ...currentPlayer,
              currentBidAmount: currentBidAmount + amount,
              bidAmount: amount,
            });
          }
        })
      )
      .subscribe();
  }

  markAsUnsold() {
    throw new Error('Method not implemented.');
  }

  markAsSold(playerId: string) {
    this.playerService.markPlayerSold(playerId).subscribe({
      next: (response) => {
        this.snackBar.open(`${response.message}`, 'Close', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
        });
      },
      error: (error) => {
        console.error('Error marking player sold:', error);
        this.snackBar.open(
          error.error.message || 'Please try again.',
          'Close',
          {
            duration: 5000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
          }
        );
      },
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.playerService.disconnectWebSocket();
  }
}
