import { Component, Inject } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common'; // ✅ Importa CommonModule

import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialog,
} from '@angular/material/dialog';
import { ImageDialogComponent } from '../../../../shared/image-dialog/image-dialog.component'; // Importa el modal de imagen

@Component({
  selector: 'app-booking-details',
  templateUrl: './booking-details.component.html',
  styleUrls: ['./booking-details.component.css'],
  imports: [MatDialogModule, CommonModule],
})
export class BookingDetailsComponent {
  constructor(
    public dialogRef: MatDialogRef<BookingDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog
  ) {}

  close(): void {
    this.dialogRef.close();
  }

  // Función para abrir la imagen en grande
  openImage(imageUrl: string): void {
    this.dialog.open(ImageDialogComponent, {
      data: { imageUrl },
      panelClass: 'full-screen-dialog',
    });
  }
}
