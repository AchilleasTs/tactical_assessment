import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { DataService } from '../../../services/data.service';
import { ChartComponent, ApexChart, ApexXAxis, ApexYAxis, ApexTitleSubtitle, NgApexchartsModule } from 'ng-apexcharts';

export type ChartOptions = {
    series: ApexAxisChartSeries;
    chart: ApexChart;
    xaxis: ApexXAxis;
    yaxis: ApexYAxis;
    title: ApexTitleSubtitle;
};

@Component({
    selector: 'app-chart-output',
    standalone: true,
    imports: [NgApexchartsModule],
    template: `
        <apx-chart class="max-w-full h-full mx-auto"
            [series]="chartOptions.series!"
            [chart]="chartOptions.chart!"
            [xaxis]="chartOptions.xaxis!"
            [yaxis]="chartOptions.yaxis!"
            [title]="chartOptions.title!">
        </apx-chart>
  `,
})
export class ChartOutputComponent implements OnInit {
    @ViewChild('chart') chart!: ChartComponent;

    _dataService = inject(DataService);

    public chartOptions: Partial<ChartOptions>;
    private dataPoints: { x: string; y: number }[] = []; // Stores chart data

    constructor() {
        this.chartOptions = {
            series: [
                {
                    name: 'Volume 24',
                    data: this.dataPoints, // Bind data points
                },
            ],
            chart: {
                type: 'line',
                height: 300,
                animations: {
                    enabled: true,
                    speed: 500,
                },
            },
            xaxis: {
                type: 'datetime',
                title: { text: 'Time' },
            },
            yaxis: {
                title: { text: 'Volume 24' },
            },
            title: {
                text: 'Volume 24 (Real-Time)',
                align: 'center',
            },
        };
    }

    ngOnInit(): void {
        this._dataService.outputBlockSelected$.subscribe((item) => {
            if (item) {
                if (item.inputBlock?.groupType == 'input') {
                    this._dataService.getConnectionData(item.inputBlock.id)?.subscribe((data) => {
                        this.updateChart(data[0]);
                    });
                } else if (item.inputBlock?.groupType == 'transformation') {
                    this._dataService.getTransformedData(item.inputBlock.id)?.subscribe((data) => {
                        this.updateChart(data[0]);
                    });
                }
            }
        })

    }

    updateChart(data: any): void {
        const timestamp = new Date(data.time).getTime(); // Convert to timestamp
        const price = parseFloat(data.volume_24h);

        this.dataPoints.push({ x: new Date(timestamp).toISOString(), y: price });

        if (this.dataPoints.length > 50) {
            this.dataPoints.shift(); // Keep only the last 50 data points
        }

        // Update series dynamically
        this.chartOptions.series = [
            {
                name: data.product_id + ' Volume 24',
                data: [...this.dataPoints], // Use a fresh copy to trigger Angular change detection
            },
        ];
    }
}