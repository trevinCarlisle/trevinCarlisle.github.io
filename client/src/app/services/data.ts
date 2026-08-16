import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DataService {
  private url = 'http://127.0.0.1:5000/api/animals';

  constructor(private http: HttpClient) { }

  // Fetches baseline unfiltered database when application initiates
  getBackendData(): Observable<any> {
    return this.getAnimals('All Breeds', 1);
  }

  // Dynamic query mapping, compiles all sorting rules to pass as a query, returns Observable streaming custom facet object wrapper structure
  getAnimals(filterType: string, page: number, name: string = '', breed: string = '', sex: string = '', age: number | null = null, sortBy: string = '', sortOrder: string = 'asc'): Observable<any> {
    // Construct URL mapping query strings
    let queryUrl = `${this.url}?type=${filterType}&page=${page}&name=${name}&breed=${breed}&sex=${sex}&sortBy=${sortBy}&sortOrder=${sortOrder}`;
    
    // Dynamically append age to query argument if a value is in header search bar
    if (age !== null && age !== undefined) {
      queryUrl += `&age=${age}`;
    }
    
    // Execute HTTP GET request to pull and return data objects
    return this.http.get<any>(queryUrl);
  }
}