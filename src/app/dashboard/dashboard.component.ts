import { Component, OnInit } from '@angular/core';
import { PlayerService } from '../services/player.service';
import { Observable } from 'rxjs';
import { AllOwnersResponse, OwnerDetails } from '../../models/player.model';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  email: string | null = null;
  ownerDetails$!: Observable<OwnerDetails>;
  allOwnerDetails$!: Observable<AllOwnersResponse>;
  displayedColumns: string[] = [
    'name',
    'role',
    'basePrice',
    'currentBid',
    'status',
  ];
  ownerColumns: string[] = [
    'teamName',
    'ownerName',
    'email',
    'playerCount',
    'budget',
  ];
  TOTAL_BUDGET = 100000;
  isAdmin = false;
  constructor(private playerService: PlayerService) {}

  ngOnInit(): void {
    this.isAdmin = this.playerService.getIsAdmin();
    if (this.isAdmin) {
      this.allOwnerDetails$ = this.playerService.getAllOwnersDetails();
    } else {
      this.email = this.getCookie('email');
      if (this.email) {
        this.ownerDetails$ = this.playerService.getUserDetailsByEmailId(
          this.email
        );
      }
    }
  }

  getFullName(firstName: string, lastName: string): string {
    return `${firstName} ${lastName}`;
  }

  getBudgetColor(budget: number): string {
    const percentage = (budget / this.TOTAL_BUDGET) * 100;
    if (percentage >= 75) {
      return 'text-green-600';
    } else if (percentage >= 25) {
      return 'text-orange-500';
    }
    return 'text-red-600';
  }

  getCookie(name: string): string | null {
    const cookies = document.cookie.split('; ');
    for (let cookie of cookies) {
      const [key, value] = cookie.split('=');
      if (key === name) {
        return decodeURIComponent(value);
      }
    }
    return null;
  }

  getBudgetPercentage(budget: number): string {
    return ((budget / this.TOTAL_BUDGET) * 100).toFixed(1);
  }
}
