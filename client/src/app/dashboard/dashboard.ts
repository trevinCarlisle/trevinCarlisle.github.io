import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../services/data';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  // Defines the rescue profile buttons
  rescueTypes: string[] = ['All Breeds', 'Water Rescue', 'Mountain or Wilderness Rescue', 'Disaster or Individual Tracking'];
  // Tracks currently selected profile filter, defaults to All Breeds
  selectedFilter: string = 'All Breeds';
  // Local collection cache, holds current chunk of 10 documents displayed on UI
  animals: any[] = [];
  // Individual animal object most recently selected by the user
  selectedRow: any = null;
  // Tracks offset index number for server-side skipping
  currentPage: number = 1;
  // Total count of documents matching the current filter
  totalRecords: number = 0;

  // Inject network data service layer into component constructor scope
  constructor(private dataService: DataService) {}

  // Angular lifecycle initialization, automatically executes when component is loaded in browser
  ngOnInit(): void {
    this.loadData();
  }

  // Synchronizes UI states, initializes HTTP API handshake, processes paginated object wrapper response
  loadData(): void {
    // GET network request passing active profile filter name and current page number
    this.dataService.getAnimals(this.selectedFilter, this.currentPage).subscribe({
      next: (response) => {
        // Unpack the new backend wrapper layout variables
        this.animals = response.data;        // Extract 10-record paginated data chunk slice array
        this.totalRecords = response.total;  // Extract global background document counter metric integer

        // Automatically highlight index row 0 upon data loading
        if (this.animals.length > 0) {
          this.selectRow(this.animals[0]);
        } else {
          this.selectedRow = null;
        }
      },
      error: (err) => {
        // Log pipeline network transmission failures  
        console.error('Failed to unpack payload metrics:', err);
      }
    });
  }  

  // Updates active tracking reference target
  selectRow(row: any): void {
    this.selectedRow = row;
    // Map updates dynamically in template via bindings
  }
}