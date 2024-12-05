import { inject, Injectable } from '@angular/core';
import { DataService } from './data.service';
import { TransformationBlock } from '../app.models';
import { getMaxAndMin } from '../helpers/max-min';
import { calculateAverage } from '../helpers/average';

@Injectable({
    providedIn: 'root',
})
export class TransformationService {
    dataService = inject(DataService);

    applyTransformation(selectedItem: TransformationBlock, formData: any): void {
        this.dataService.createTransformation(selectedItem.id);

        if (selectedItem.inputBlock.groupType == 'input') {
            this.dataService.getConnectionData(formData.value.inputBlock)?.subscribe((data) => {
                let transformedData = this.transformData(data, selectedItem.type, formData.value.property);
                this.dataService.emitTransformedData(selectedItem.id, transformedData);
            });
        } else if (selectedItem.inputBlock.groupType == 'transformation') {
            this.dataService.getTransformedData(formData.value.inputBlock)?.subscribe((data) => {
                let transformedData = this.transformData(data, selectedItem.type, formData.value.property);
                this.dataService.emitTransformedData(selectedItem.id, transformedData);
            });
        }

        selectedItem.inputBlock = formData.value.inputBlock;
        selectedItem.property = formData.value.property;
        this.dataService.canvasElements.push(selectedItem);

        this.dataService.blockSelected.next(null);
    }

    transformData(data: any, type: string, property: string): any {
        if (type === 'average') {
            const averageValue = calculateAverage(data, property);
            const averageData = { property: property, data: averageValue };
            return averageData;
        } else if (type === 'top-bottom') {
            const maxMinValues = getMaxAndMin(data, property);
            const topBottomData = { property: property, data: maxMinValues };
            return topBottomData;
        }
        //TODO: implement the other transformation blocks
        return data;
    }
}