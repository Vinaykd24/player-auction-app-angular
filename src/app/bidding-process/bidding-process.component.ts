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
  selectedPlayer$!: Observable<BiddingProgressResponse | null>;
  latestDetails$!: Observable<BiddingProgressResponse | null>;
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
      this.latestDetails$ = interval(30000).pipe(
        switchMap(() =>
          this.playerService.fetchLatestBid().pipe(
            catchError((error) => {
              console.error('Error fetching latest bid:', error);
              return of(null); // Return a fallback value
            })
          )
        ),
        takeUntil(this.destroy$)
      );

      // Combine selectedPlayer$ and latestDetails$ to update currentBidAmount
      this.selectedPlayer$ = this.playerService.biddingProgress().pipe(
        switchMap((player) =>
          this.latestDetails$.pipe(
            map((latestDetails) => {
              if (latestDetails && latestDetails.currentBidAmount) {
                return {
                  ...player,
                  currentBidAmount: latestDetails.currentBidAmount,
                  bidAmount: latestDetails.bidAmount,
                };
              }
              return player;
            })
          )
        ),
        catchError((error) => {
          console.error('Error fetching bidding progress:', error);
          return of(null); // Handle error and provide fallback value
        }),
        takeUntil(this.destroy$)
      );
    }
  }

  bidPlayer(currentBidAmount: number, player: Player, teamId: string): void {
    const bidDetails: BiddingPayload = {
      playerId: player.userId,
      currentBidAmount,
      bidAmount: player.basePrice,
      teamId,
    };
    this.playerService.placeBid(bidDetails).pipe(
      tap((res) => {
        this.snackBar.open(
          `Successfully place a bid of Rs. ${currentBidAmount}`
        );
        console.log(res);
      })
    );
  }

  bidByAmount(amount: number, biddingObject: any): void {
    if (!biddingObject) {
      console.error('No bidding object available!');
      return;
    }

    // Determine the current value (base price if no bid yet)
    const currentBidAmount =
      biddingObject.currentBidAmount || biddingObject.basePrice || 0;
    const updatedBidAmount = currentBidAmount + amount;

    if (this.ownerDetails) {
      // Create the payload for the bidding API
      const biddingPayload: BiddingPayload = {
        playerId: biddingObject.userId, // Use playerId from the biddingObject
        currentBidAmount: updatedBidAmount, // The updated bid amount
        bidAmount: amount, // The amount being added
        teamId: this.ownerDetails?.userId, // Team placing the bid
      };

      // Call the service to place the bid
      this.playerService.placeBid(biddingPayload).subscribe({
        next: (response) => {
          console.log('Bid placed successfully:', response);
        },
        error: (err) => {
          console.error('Error placing bid:', err);
        },
      });
    } else {
      console.error('Owner details not found. Cannot place bid.');
    }
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
