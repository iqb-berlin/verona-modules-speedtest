import { Component, EventEmitter, Output } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatToolbar } from '@angular/material/toolbar';
import { MatIcon } from '@angular/material/icon';
import { FileService } from 'common/services/file.service';

@Component({
  selector: 'speedtest-toolbar',
  standalone: true,
  template: `
    <mat-toolbar>
      <button mat-raised-button (click)="upload.click()">
        Unit laden
        <mat-icon>file_upload</mat-icon>
      </button>
      <input type="file" hidden accept=".json, .voud" #upload
             (change)="loadUnit($event.target)">
      <button mat-raised-button (click)="save()">
        Unit speichern
        <mat-icon>file_download</mat-icon>
      </button>
    </mat-toolbar>
  `,
  imports: [
    MatToolbar,
    MatButton,
    MatIcon
  ],
  styles: [
    'mat-toolbar {background-color: #696969}',
    'mat-toolbar button {margin: 15px}'
  ]
})
export class ToolbarComponent {
  @Output() unitLoaded = new EventEmitter<string>();
  @Output() saveUnit = new EventEmitter();

  save(): void {
    this.saveUnit.emit();
  }

  async loadUnit(eventTarget: EventTarget | null): Promise<void> {
    const unit = await FileService.readFileAsText((eventTarget as HTMLInputElement).files?.[0] as File);
    this.unitLoaded.emit(unit);
  }
}
