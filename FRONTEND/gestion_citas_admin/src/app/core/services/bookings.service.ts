import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BookingsService {
  private apiUrl = 'http://localhost:3002/api/bookings'; // 🔥 API real
  private localJsonUrl = './assets/json23.json'; // 📁 JSON local

  private cachedData: any[] = []; // 🛑 Guarda los datos locales para evitar recargas innecesarias

  constructor(private http: HttpClient) {}

  getBookings(): Observable<any[]> {
    console.log("🔹 Cargando JSON local primero...");

    // 🔹 Carga primero los datos locales
    return this.http.get<any[]>(this.localJsonUrl).pipe(
      tap(localData => {
        console.log("✅ Datos locales cargados:", localData);
        this.cachedData = localData; // Guarda los datos locales
        this.fetchFromApi(); // Intenta obtener la API sin bloquear la vista
      }),
      catchError(error => {
        console.error("❌ Error cargando JSON local", error);
        return of([]); // Si el JSON local falla, retorna un array vacío
      })
    );
  }

  // 🔥 Obtiene datos de la API sin bloquear la carga
  private fetchFromApi() {
    console.log("🔹 Intentando cargar datos desde la API...");
    this.http.get<any[]>(this.apiUrl).pipe(
      catchError(error => {
        console.warn("⚠️ API no disponible, manteniendo datos locales", error);
        return of(this.cachedData); // Si la API falla, usa los datos locales en memoria
      })
    ).subscribe(apiData => {
      console.log("✅ Datos actualizados desde la API:", apiData);
      this.cachedData = apiData; // Actualiza los datos si la API responde
    });
  }
}
