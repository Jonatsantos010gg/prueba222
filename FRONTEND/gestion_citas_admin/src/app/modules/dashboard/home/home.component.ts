import {
  Component,
  OnInit,
  ViewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import { BookingsService } from '../../../core/services/bookings.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { BookingDetailsComponent } from '../modals/booking-details/booking-details.component';
import { ImageDialogComponent } from '../../../shared/image-dialog/image-dialog.component';
// @ts-ignore
import * as XLSX from 'xlsx-js-style';
import * as FileSaver from 'file-saver';
import { SelectionModel } from '@angular/cdk/collections';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  FormControl,
  FormGroupDirective,
  NgForm,
  Validators,
  FormsModule,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: FormControl | null,
    form: FormGroupDirective | NgForm | null
  ): boolean {
    const isSubmitted = form && form.submitted;
    return !!(
      control &&
      control.invalid &&
      (control.dirty || control.touched || isSubmitted)
    );
  }
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    ReactiveFormsModule,
    MatDatepickerModule,  
    MatButtonModule,
    MatCheckboxModule,
  ],
  providers: [
    provideNativeDateAdapter(), // ✅ Ajusta el formato de fecha
    MatDialog,
  ],
})
export class HomeComponent implements OnInit {
  searchFormControl = new FormControl('', [Validators.required]);
  matcher = new MyErrorStateMatcher();
  allCitas: any[] = [];

  dateRange = new FormGroup({
    start: new FormControl<Date | null>(null, Validators.required),
    end: new FormControl<Date | null>(null, Validators.required),
  });
  emailFormControl = new FormControl('', [
    Validators.required,
    Validators.email,
  ]);
  selection = new SelectionModel<any>(true, []);
  displayedColumns: string[] = [
    'SELECCION',
    'ID_CITA',
    'FECHA_RESERVA',
    'ESTADO',
    'NOMBRE_DEL_SALON',
    'NOMBRE_USUARIO',
    'RAZON_SOCIAL',
    'RUC',
    'NOMBRE_DEL_BANCO',
    'NUMERO_DE_CUENTA',
    'CODIGO_INTERBANCARIO',
    'EMAIL_CLIENTE',
    'ID_IZIPAY',
    'DOCUMENTOS_IMAGENES',
  ];
  dataSource = new MatTableDataSource<any>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private bookingsService: BookingsService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.obtenerCitas();
  }

  openImageDialog(images: string[]): void {
    this.dialog.open(ImageDialogComponent, {
      data: { images },
      panelClass: 'full-screen-dialog',
    });
  }
  obtenerCitas(): void {
    this.bookingsService.getBookings().subscribe(
      (data) => {
        // ✅ Primero, asignar el ID_CITA antes de filtrar
        this.allCitas = data.map((cita, index) => ({
          ...cita,
          ID_CITA: `#A${cita.ID_CITA}`, // Se usa el total antes del filtro
        }));

        // ✅ Luego, aplicar el filtro (sin afectar ID)
        const filteredData = this.allCitas.filter(
          (cita) =>
            cita.IS_DELETED !== 1 && // 🔥 Se mantiene el filtro de eliminados
            cita.ESTADO !== 13
        );

        this.dataSource.data = filteredData.map((cita) => ({
          ...cita,
          ESTADO: this.mapEstado(cita.ESTADO),
        }));
        this.selection.select(...this.dataSource.data);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      (error) => {
        console.error('Error al obtener citas:', error);
      }
    );
  }
  openDetailsModal(cita: any) {
    this.dialog.open(BookingDetailsComponent, {
      width: '80vw', // o '1000px'
      maxHeight: '90vh', // o ajusta según necesidad
      data: cita, // 🔥 Pasamos los datos de la cita al modal
    });
  }
  applyDateFilter() {
    const start = this.dateRange.value.start;
    const end = this.dateRange.value.end;

    if (!start || !end) return;

    this.dataSource.data = this.allCitas
      .filter((cita) => {
        const citaFecha = new Date(cita.FECHA_RESERVA);
        return (
          citaFecha >= start &&
          citaFecha <= end &&
          cita.IS_DELETED !== 1 &&
          cita.ESTADO !== 13
        );
      })
      .map((cita) => ({
        ...cita,
        ESTADO: this.mapEstado(cita.ESTADO),
      }));

    // 🔥 Limpia la selección y selecciona solo los que cumplen con el rango
    this.selection.clear();
    this.dataSource.data.forEach((row) => this.selection.select(row));

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  mapEstado(estado: number): string {
    const estadosMap: { [key: number]: string } = {
      0: 'Pending',
      1: 'Confirmed',
      2: 'Completed',
      3: 'Cancelled by Service Provider',
      4: 'Declined',
      5: 'No Show',
      6: 'Reschedule by User',
      7: 'Reschedule by Service Provider',
      8: 'Confirmed by Provider after User Reschedule',
      9: 'Declined by Provider after User Reschedule',
      10: 'Confirmed by User after Provider Reschedule',
      11: 'Declined by User after Provider Reschedule',
      12: 'Ongoing',
      13: 'In cart',
      14: 'Cancelled by User',
      15: 'Cancelled by Admin',
    };
    return estadosMap[estado] || 'Unknown';
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value
      .trim()
      .toLowerCase();
    this.dataSource.filter = filterValue;
  }
  mostrarAlerta() {
    this.snackBar.open('Debes seleccionar al menos un registro.', 'Cerrar', {
      duration: 3000,
      panelClass: ['snack-warning'], // opcional
    });
  }
  exportarExcel(): void {
    if (this.selection.selected.length === 0) {
      this.mostrarAlerta();
      return;
    }
    const BASE_URL = 'https://media.bukiglobal.com/users/';

    const maxImagenes = Math.max(
      ...this.dataSource.data.map((cita) =>
        Array.isArray(cita.DOCUMENTOS_IMAGENES)
          ? cita.DOCUMENTOS_IMAGENES.length
          : 0
      )
    );

    const datosExportarFormateados = this.selection.selected.map((cita) => {
      const fechaReserva = new Date(cita.FECHA_RESERVA);
      const fechaFormateada = fechaReserva.toLocaleString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });

      const imagenes = cita.DOCUMENTOS_IMAGENES || [];
      const imagenesUrls: { [key: string]: string } = {};
      for (let i = 0; i < maxImagenes; i++) {
        imagenesUrls[`DOCUMENTO_${i + 1}`] = imagenes[i]
          ? `${BASE_URL}${imagenes[i]}`
          : '';
      }

      return {
        ID_CITA: cita.ID_CITA,
        FECHA_RESERVA: fechaFormateada,
        ESTADO: cita.ESTADO,
        NOMBRE_DEL_SALON: cita.NOMBRE_DEL_SALON,
        NOMBRE_CLIENTE: cita.NOMBRE_USUARIO,
        EMAIL_SALON: cita.EMAIL_BUSINESS,
        RAZON_SOCIAL: cita.RAZON_SOCIAL,
        IZIPAY: cita.PAYMENT_TRANSACTION_ID,
        RUC: cita.RUC,
        NOMBRE_DEL_BANCO: cita.NOMBRE_DEL_BANCO,
        NUMERO_DE_CUENTA: cita.NUMERO_DE_CUENTA,
        CODIGO_INTERBANCARIO: cita.CODIGO_INTERBANCARIO,
        NOMBRE_DE_LA_CUENTA: cita.NOMBRE_DE_LA_CUENTA,
        CODIGO_PAIS: cita.CODIGO_PAIS,
        TELEFONO_CLIENTE: cita.NUMERO_TELEFONO,
        ...imagenesUrls, // Agrega IMAGEN_1, IMAGEN_2...
        EMAIL_CLIENTE: cita.EMAIL_CLIENTE,
        GENERO: cita.GENERO,
        MONTO_WALLET: Number(cita.MONTO_WALLET),
        MONTO_TARJETA: Number(cita.MONTO_TARJETA),
        TIPO_PAGO:
          cita.MONTO_WALLET > 0 && cita.MONTO_TARJETA > 0
            ? 'AMBOS'
            : cita.MONTO_WALLET > 0
            ? 'WALLET'
            : cita.MONTO_TARJETA > 0
            ? 'TARJETA'
            : 'NINGUNO',
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(datosExportarFormateados);
    const keys = Object.keys(datosExportarFormateados[0]);
    for (let i = 0; i < datosExportarFormateados.length; i++) {
      for (let j = 0; j < keys.length; j++) {
        const key = keys[j];
        if (key.startsWith('DOCUMENTO_')) {
          const cellAddress = XLSX.utils.encode_cell({ r: i + 1, c: j }); // +1 porque fila 0 es cabecera
          const url = (datosExportarFormateados[i] as any)[key];

          if (url) {
            worksheet[cellAddress] = {
              v: `Documento ${key.split('_')[1]}`,
              t: 's',
              l: { Target: url },
              s: worksheet[cellAddress]?.s, // mantener estilos
            };
          }
        }
      }
    }

    const ref = worksheet['!ref'];
    if (ref) {
      worksheet['!autofilter'] = { ref };

      const range = XLSX.utils.decode_range(ref);
      for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
          if (!worksheet[cellAddress]) continue;

          const isHeader = R === 0;
          worksheet[cellAddress].s = {
            fill: isHeader ? { fgColor: { rgb: 'FFFF00' } } : undefined,
            font: isHeader
              ? {
                  name: 'Calibri',
                  sz: 11,
                  bold: true,
                  color: { rgb: '000000' },
                }
              : {
                  name: 'Calibri',
                  sz: 11,
                  color: { rgb: '000000' },
                },

            alignment: { horizontal: 'center', vertical: 'center' },
            border: {
              top: { style: 'thin', color: { rgb: '000000' } },
              bottom: { style: 'thin', color: { rgb: '000000' } },
              left: { style: 'thin', color: { rgb: '000000' } },
              right: { style: 'thin', color: { rgb: '000000' } },
            },
          };
        }
      }
    }

    worksheet['!cols'] =
      datosExportarFormateados.length > 0
        ? Object.keys(datosExportarFormateados[0]).map((key) => {
            const maxLength = Math.max(
              key.length,
              ...datosExportarFormateados.map((row) =>
                (row as any)[key] ? (row as any)[key].toString().length : 0
              )
            );
            return { wch: maxLength + 2 };
          })
        : [];

    const workbook = {
      Sheets: { Citas: worksheet },
      SheetNames: ['Citas'],
    };

    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    const ahora = new Date();
    const fechaStr = ahora
      .toLocaleString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
      .replace(/[\/,:\s]/g, '-');

    this.guardarArchivoExcel(excelBuffer, `citas_${fechaStr}`);
  }

  guardarArchivoExcel(buffer: any, nombre: string): void {
    const data: Blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
    });
    FileSaver.saveAs(data, `${nombre}_export.xlsx`);
  }
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.dataSource.data.forEach((row) => this.selection.select(row));
    }
  }

  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${
      row.ID_CITA
    }`;
  }
}
