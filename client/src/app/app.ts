import { Component, OnInit, signal, ViewChild, ElementRef, Inject, PLATFORM_ID, AfterViewInit, effect } from '@angular/core'; 
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { DataService } from './services/data';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})

export class AppComponent implements OnInit, AfterViewInit {
  // Core array containing the 10 records currently displayed in UI
  animals = signal<any[]>([]);
  // Tracks active resuce filter, defaults to 'All Breeds'
  currentFilter = signal<string>('All Breeds');
  // Tracks current page in data table, defaults to page 1
  currentPage = signal<number>(1);
  // Stores total matching database records
  totalRecords = signal<number>(0);
  
  // Stores current search bar parameters for data table columns, defaults to no seach parameter
  searchName = signal<string>('');
  searchBreed = signal<string>('');
  searchSex = signal<string>('');
  searchAge = signal<number | null>(null);
  
  // Tracks currently selected row
  selectedRow = signal<any | null>(null);
  
  // Sorting parameters
  activeSortColumn = signal<string>('');
  activeSortOrder = signal<string>('asc');
  
  // Stores global background aggregated breed distribution list
  globalChartMetrics: any[] = [];

  // Connects TypeScript reference link hook directly to template HTML5 canvas tag
  @ViewChild('pieChartCanvas') pieChartCanvas!: ElementRef<HTMLCanvasElement>;
  private chartInstance: Chart | null = null;

  // Stores dynamic modules, map canvas instances, and map markers
  private leafletLib: any = null;
  private mapInstance: any = null;
  private markersLayerGroup: any = null;

  constructor(
    private dataService: DataService, 
    @Inject(PLATFORM_ID) private platformId: Object) {
      // Clears and redraws map pins when data stream shifts state
      effect(() => {
        const activePageRecords = this.animals();
        if (activePageRecords.length > 0 && isPlatformBrowser(this.platformId)) {
          this.updateAllMapMarkers(activePageRecords);
        }
      });

      // Moves map to center on selected animal's pin when a row is selected
      effect(() => {
        const clickedAnimal = this.selectedRow();
        if (clickedAnimal && this.mapInstance && this.leafletLib) {
          const lat = clickedAnimal.location_latitude || 30.75;
          const lng = clickedAnimal.location_longitude || -97.48;
          // Seamlessly pan the map focus camera to the clicked animal row selection boundaries
          this.mapInstance.setView([lat, lng], 12);
        }
      });
  }

  // Initial baseline data payload request
  ngOnInit(): void {
    this.fetchData();
  }

  // Guarantees all HTML canvas layouts exist on the DOM layout map before drawing graphics
  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.updatePieChart();
      this.initializeLeafletMap();
    }
  }

  // Dynamically loads Leaflet files
  async initializeLeafletMap(): Promise<void> {
    // Only load in a true browser viewport, bypassing Node.js SSR compilation crashes
    if (!isPlatformBrowser(this.platformId) || typeof window === 'undefined') return;

    try {
      // Clean cache verification check
      if (this.mapInstance) return;

      // Dynamic async browser load structure
      const LeafletModule = await import('leaflet');
      this.leafletLib = LeafletModule;

      // Build target instances
      this.mapInstance = this.leafletLib.map('leaflet-map-id').setView([30.75, -97.48], 11);

      // Bind open-source street atlas backgound imagery tiles
      this.leafletLib.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(this.mapInstance);

      // Initialize clearable layer group and attach to master map
      this.markersLayerGroup = this.leafletLib.layerGroup().addTo(this.mapInstance);

      // Invalidate canvas viewport frames safely on render complete ticks
      setTimeout(() => {
        if (this.mapInstance) {
          this.mapInstance.invalidateSize();
          // Drop initial page pins immediately on viewport generation load ticks
          const initialPageData = this.animals();
          if (initialPageData.length > 0) {
            this.updateAllMapMarkers(initialPageData);
          }
        }
      }, 350);
    } catch (err) {
      console.error('Failed to bundle browser asset module specifier:', err);
    }
  }

  // Wipes old maps, iterates through active documents, puts markers on master map
  private updateAllMapMarkers(pageAnimals: any[]): void {
    if (!this.mapInstance || !this.leafletLib || !this.markersLayerGroup) return;

    // Clear existing pins
    this.markersLayerGroup.clearLayers();

    // Define map pin appearance parameters
    const customIcon = this.leafletLib.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dis/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 42],
      populAnchor: [1, -34],
      tooltipAnchor: [16, -28]
    });

    const markerCoordinates: any[] = [];

    // Iterate through active records
    pageAnimals.forEach(animal => {
      const latitude = animal.location_latitude;
      const longitude = animal.location_longitude;

      if (latitude && longitude) {
        markerCoordinates.push([latitude, longitude]);

        // Construct marker layers with functional interactive Tooltips and Popups
        const marker = this.leafletLib.marker([latitude, longitude], { icon: customIcon })
          .bindTooltip(`Breed: ${animal.breed || 'Unknown'}`)
          .bindPopup(`
            <div style="font-family: sans-serif; text-align: left; min-width: 150px;">
              <h3 style="margin: 0 0 5px 0; color: #0076a3; font-size: 14px; border-bottom: 1px solid #eee; padding-bottom: 4px;">Animal Details</h3>
              <p style="margin: 4px 0; font-size: 12px;"><b>Name:</b> ${animal.name || 'Unnamed'}</p>
              <p style="margin: 4px 0; font-size: 12px;"><b>Breed:</b> ${animal.breed}</p>
              <p style="margin: 4px 0; font-size: 12px;"><b>Sex:</b> ${animal.sex_upon_outcome}</p>
            </div>
          `);

          // Pack pin layer directly into clearable layer group container
          this.markersLayerGroup.addLayer(marker);
      }
    });

    // Automatically fit map boundaries to active pins
    if (markerCoordinates.length > 0) {
      this.mapInstance.fitBounds(markerCoordinates, { padding: [30, 30] });
    }
  }

  // Implements page changes when filter button is pressed
  onFilterChange(selectedFilter: string): void {
    this.currentFilter.set(selectedFilter);
    this.currentPage.set(1);
    this.fetchData();
  }

  // Increments page pointers and triggers data requests when 'next page' button is pressed
  nextPage(): void {
    this.currentPage.update(p => p + 1);
    this.fetchData();
  }

  // Safely decrements page pointers and triggers data requests when 'previous page' button is pressed
  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
      this.fetchData();
    }
  }

  // Resolves active state metrics, passes arguments to data service layer, returns custom JSON structure
  private fetchData(): void {
    // Inject signal values directly into the network stream trigger
    this.dataService.getAnimals(
      this.currentFilter(), 
      this.currentPage(), 
      this.searchName(), 
      this.searchBreed(),
      this.searchSex(),
      this.searchAge(),
      this.activeSortColumn(),
      this.activeSortOrder()
    ).subscribe({
      next: (response: any) => {
        // Hydrate data array signals with un-nested payload pieces
        this.animals.set(response.data);
        this.totalRecords.set(response.total);
        this.globalChartMetrics = response.breedsSummary || [];

        // Automatically highlights focus back onto index row 0 when data loads
        if (response.data && response.data.length > 0) {
          this.selectRow(response.data[0]);
        } else {
          this.selectedRow.set(null);
        }

        // Trigger chart redraw checks on active browser windows
        if (isPlatformBrowser(this.platformId)) {
          this.updatePieChart();
        }
      },
      error: (err) => {
        console.error('Failed to resolve paginated dataset chunk:', err);
      }
    });
  }

  // Maps server-side aggregated breeds distribution tally directly into Chart.js elements
  private updatePieChart(): void {
    if (!isPlatformBrowser(this.platformId) || !this.pieChartCanvas) return;

    // Map labels and quantities from global metrics background counts tracker
    const labels = this.globalChartMetrics.map(item => item._id || 'Unknown');
    const dataValues = this.globalChartMetrics.map(item => item.count);

    if (labels.length === 0) return;

    // Prevent rendering glitches and memory leaks by destroying previous chart instances
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    const ctx = this.pieChartCanvas.nativeElement.getContext('2d');
    if (ctx) {
      this.chartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: labels,
          datasets: [{
            data: dataValues,
            backgroundColor: [
              '#2b5c8f', '#b83b5e', '#f08a5d', '#3f72af', 
              '#9575cd', '#4f98ca', '#00adb5', '#ff9f43'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { boxWidth: 12, font: { size: 11 } }
            }
          }
        }
      });
    }
  }

  // Toggles column states between ascending and descending alignments
  toggleSort(columnName: string): void {
    if (this.activeSortColumn() === columnName) {  // Toggle directions if clicking the same header cell twice
      this.activeSortOrder.update(current => current === 'asc' ? 'desc' : 'asc');
    } else {  // Revert to ascending sequence by default if targeting a new column cell
      this.activeSortColumn.set(columnName);
      this.activeSortOrder.set('asc');
    }
    this.currentPage.set(1);
    this.fetchData();
  }

  // Overrides tracking targets to sync details panels and center viewport focuses on cell touches
  selectRow(animal: any): void {
    this.selectedRow.set(animal);
    console.log(`Active row tracking updated to: ${animal.name || 'Unnamed'} (${animal._id})`);
  }

  // Intercepts keystrokes from column sub-headers, performs numbers conversion configurations, issues fresh search queries
  onColumnSearch(column: string, event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement.value;

    if (column === 'name') {
      this.searchName.set(value);
    } else if (column === 'breed') {
      this.searchBreed.set(value);
    } else if (column === 'sex_upon_outcome') {
      this.searchSex.set(value);
    } else if (column === 'age_upon_outcome_in_weeks') {
      // Convert the string to a number, or fallback to null if empty
      const numericAge = value ? parseInt(value, 10) : null;
      this.searchAge.set(numericAge);
    }

    this.currentPage.set(1);
    this.fetchData();
  }

}