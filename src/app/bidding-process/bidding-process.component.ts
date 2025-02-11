import { Component, OnDestroy, OnInit } from '@angular/core';
import { PlayerService } from '../services/player.service';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import {
  BiddingPayload,
  BiddingProgressResponse,
  OwnerDetails,
  Player,
} from '../../models/player.model';
import {
  BehaviorSubject,
  catchError,
  interval,
  map,
  Observable,
  of,
  Subject,
  Subscription,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
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
  styleUrl: './bidding-process.component.scss',
})
export class BiddingProcessComponent implements OnInit, OnDestroy {
  // selectedPlayer$!: Observable<BiddingProgressResponse | null>;
  // latestDetails$!: Observable<BiddingProgressResponse | null>;
  selectedPlayer$ = new BehaviorSubject<BiddingProgressResponse | null>(null);
  latestDetails$ = new BehaviorSubject<BiddingProgressResponse | null>(null);
  lastBidTeamId: string | null = null;
  latestDetails!: BiddingProgressResponse;
  ownerDetails!: OwnerDetails | null;
  biddingForm: FormGroup;
  currentValue = 0;
  private subscription!: Subscription;
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
      // Poll every 1 second for the latest bid details

      // Initial data load
      this.loadBiddingData();

      // Start polling
      interval(1000)
        .pipe(
          switchMap(() => this.playerService.fetchLatestBid()),
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
    this.playerService
      .biddingProgress()
      .pipe(
        tap((player) => {
          if (player) {
            this.selectedPlayer$.next(player);
          }
        })
      )
      .subscribe();
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
          // Update local state immediately
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
    console.log(playerId);
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
  }
}
