import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { PlayerService } from '../services/player.service';

export const biddingCheckGuard: CanActivateFn = (route, state) => {
  const playerService = inject(PlayerService);
  return !!playerService.getSelectedPlayerUidSignal();
};

export const authGuard: CanActivateFn = () => {
  const playerService = inject(PlayerService);
  return playerService.getIsAdmin();
};
