import { Component, inject, Input } from '@angular/core';
import { DataService } from '../../../services/data.service';
import { InputBlock, OutputBlock, TransformationBlock } from '../../../app.models';

@Component({
    selector: 'app-table-output',
    standalone: true,
    imports: [],
    template: `
        <table class="w-full text-sm text-left rtl:text-right text-gray-500">
                <thead class="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                    @for (column of displayedColumns; track $index) {
                        <th scope="col" class="px-6 py-3">{{column}}</th>
                    }
                </tr>
            </thead>
            <tbody>
                @for (item of dataSource; track $index) {
                    <tr class="bg-white border-b">
                        @for (column of displayedColumns; track $index) {
                        <td class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                            {{item[column]}}
                        </td>
                        }
                    </tr>
                }
            </tbody>
        </table>
  `,
    styles: []
})
export class TableComponent {
    _dataService = inject(DataService);
    dataSource: any;

    displayedColumns: string[] = [];

    constructor() {

    }

    ngOnInit() {
        this._dataService.outputBlockSelected$.subscribe((item) => {
            if (item) {
                if (item.inputBlock?.groupType == 'input') {
                    this._dataService.getConnectionData(item.inputBlock.id)?.subscribe((data) => {
                        this.displayedColumns = Object.keys(data[0]);
                        this.dataSource = data;
                    });
                } else if (item.inputBlock?.groupType == 'transformation') {
                    this._dataService.getTransformedData(item.inputBlock.id)?.subscribe((data) => {
                        this.displayedColumns = Object.keys(data[0]);
                        this.dataSource = data;
                    });
                }
            }
        });
    }
}