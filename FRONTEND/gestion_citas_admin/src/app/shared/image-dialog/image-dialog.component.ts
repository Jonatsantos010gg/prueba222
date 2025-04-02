import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-image-dialog',
  templateUrl: './image-dialog.component.html',
  styleUrls: ['./image-dialog.component.css'],
})
export class ImageDialogComponent {
  // ✅ Declara la variable `data` correctamente
  constructor(
    public dialogRef: MatDialogRef<ImageDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { imageUrl: string } // <- Esto ya lo tienes bien
  ) {}

  close(): void {
    this.dialogRef.close();
  }
}
