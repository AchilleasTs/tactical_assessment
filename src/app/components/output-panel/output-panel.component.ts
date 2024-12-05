import { Component, EventEmitter, inject, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { TableComponent } from './components/table-output.component';
import { LogComponent } from './components/log-output.component';
import { ChartOutputComponent } from './components/chart-output.component';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-output-panel',
  imports: [CommonModule, TableComponent, LogComponent, ChartOutputComponent, MatIconModule],
  template: `
    <div class="p-4 bg-gray-100">
      <div class="flex items-center justify-between w-full">
        <h2 class="text-xl font-bold mb-4">Output</h2>
        <mat-icon class="!cursor-pointer" aria-hidden="false" aria-label="close icon" fontIcon="close" (click)="closeOutput()"></mat-icon>
      </div>
      <div class="overflow-y-auto h-full">
        @switch (type) {
          @case ('log') {
            <app-log-output></app-log-output>
          }
          @case ('table') {            
              <app-table-output></app-table-output>            
          }
          @case('graph') {
            <app-chart-output></app-chart-output>
          }
        }
      </div>
    </div>
  `,
  styles: []
})
export class OutputPanelComponent {
  @Output() onClose = new EventEmitter<boolean>();

  _dataService = inject(DataService);
  outputData: any;
  type: string;
  constructor() {

  }

  ngOnInit() {
    this._dataService.outputBlockSelected$.subscribe((item) => {
      if (item) {
        this.type = item?.type;
        // this._dataService.getTransformedData(item.inputBlock.id)?.subscribe((data) => {
        //   this.outputData = data;
        // });
      }
    })
  }

  closeOutput() {
    this.onClose.emit(true);
  }
}