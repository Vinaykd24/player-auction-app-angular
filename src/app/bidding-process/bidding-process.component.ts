import { Component, OnInit } from '@angular/core';
import { PlayerService } from '../services/player.service';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import {
  BiddingPayload,
  BiddingProgressResponse,
  Player,
} from '../../models/player.model';
import { interval, Observable, Subscription, switchMap, tap } from 'rxjs';
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
export class BiddingProcessComponent implements OnInit {
  selectedPlayer$!: Observable<BiddingProgressResponse>;
  latestDetails$!: Observable<BiddingProgressResponse>;
  latestDetails!: BiddingProgressResponse;
  ownerDetails!: Player | null;
  biddingForm: FormGroup;
  currentValue = 0;
  private subscription!: Subscription;
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
      this.subscription = interval(6000)
        .pipe(switchMap(() => this.playerService.fetchLatestBid()))
        .subscribe({
          next: (response: BiddingProgressResponse) => {
            console.log(response);
            this.latestDetails = response;
            this.currentValue = response.currentBidAmount;
          },
          error: (error) => {
            console.log(error);
          },
        });
      // Poll every 1 second
      this.latestDetails$ = interval(1000).pipe(
        switchMap(() => this.playerService.fetchLatestBid())
      );
      this.selectedPlayer$ = this.playerService.biddingProgress();
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

  bidByAmount(amount: number, player: Player) {
    console.log(amount);
    // this.currentValue =
    //   this.currentValue === 0
    //     ? player.basePrice + amount
    //     : this.currentValue + amount;
    if (this.ownerDetails) {
      const biddingPayload: BiddingPayload = {
        playerId: player.userId,
        currentBidAmount: this.currentValue + amount,
        bidAmount: amount,
        teamId: this.ownerDetails?.userId,
      };
      this.playerService.placeBid(biddingPayload).subscribe({
        next: (response) => {
          console.log('Bid placed successfully:', response);
        },
        error: (err) => {
          console.error('Error placing bid:', err);
        },
      });
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
}
