import { isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, HostListener, Inject, Input, PLATFORM_ID, SimpleChanges, ViewChild } from '@angular/core';
import { Chart, ChartConfiguration, ChartType } from 'chart.js';

@Component({
  selector: 'app-generic-chart',
  standalone: true,
  imports: [],
  templateUrl: './generic-chart.component.html',
  styleUrl: './generic-chart.component.css'
})
export class GenericChartComponent {
  @Input() chartType: ChartType;
  @Input() chartData: any;
  @Input() chartOptions: any;
  chart: Chart;
  @ViewChild('chartCanvas', { static: true }) chartCanvas: ElementRef<HTMLCanvasElement>;
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (isPlatformBrowser(this.platformId)) {
      if (changes['chartData'] || changes['chartOptions']) {
        this.initializeChart();
      }
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    if (this.chart) {
      this.chart.resize();
    }
  }
  initializeChart(): void {
    const canvas = this.chartCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      if (this.chart) {
        this.chart.destroy();
      }
      this.chart = new Chart(ctx, {
        type: this.chartType,
        data: this.chartData,
        options: this.chartOptions,
      });
    }
  }
}
