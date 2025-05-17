import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private _snackBar = inject(MatSnackBar);

  showError(message: string): void {
    this._snackBar.open(message, 'OK');
  }

  showPermanently(message: string): void {
    this._snackBar.open(message, 'Verwerfen');
  }

  hideMessage(): void {
    this._snackBar.dismiss();
  }
}
