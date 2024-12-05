import { Component, inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { CanvasItem, InputBlock, OutputBlock, TransformationBlock } from '../../../app.models';
import { MatInputModule } from '@angular/material/input';
import { DataService } from '../../../services/data.service';
import { TransformationService } from '../../../services/transformation.service';
import { connect } from '../../../helpers/draw-lines';

@Component({
    selector: 'app-transformation-block',
    imports: [MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, ReactiveFormsModule],
    template: `
    @if(selectedItem){
        <div>
          <form [formGroup]="form" class="flex flex-col gap-2 min-w-[400px]">
            <mat-form-field>
                <mat-label>Input Type Block</mat-label>
                <mat-select [formControlName]="'inputBlock'">
                @for (item of availableInputs; track item) {
                    <mat-option [value]="item.id">{{item.displayName}}</mat-option>
                }
                </mat-select>
            </mat-form-field>
            <mat-form-field>
                <mat-label>Property for Transformation</mat-label>
                <mat-select [formControlName]="'property'">
                @for (option of options; track option) {
                    <mat-option [value]="option">{{option}}</mat-option>
                }
                </mat-select>
            </mat-form-field>
    
            <button mat-raised-button color="primary" (click)="applyTransformation()">Apply Transformation</button>
          </form>
        </div>
    }
  `
})
export class TransformationComponent implements OnInit {
    private fb = inject(FormBuilder);
    private dataService = inject(DataService);
    _transformationService = inject(TransformationService);

    form: FormGroup;
    availableInputs: (InputBlock | TransformationBlock | OutputBlock)[] = [];
    selectedItem: any;

    options = ['best_ask',
        'best_ask_size',
        'best_bid',
        'best_bid_size',
        'high_24h',
        'last_size',
        'low_24h',
        'open_24h',
        'price',
        'product_id',
        'sequence',
        'side',
        'time',
        'trade_id',
        'type',
        'volume_24h',
        'volume_30d'];

    get transformations(): FormArray {
        return this.form.get('transformations') as FormArray;
    }

    constructor() {
        this.dataService.blockSelected.subscribe(item => {
            if (item) {
                const element = this.dataService.canvasElements.find(x => x.id == item?.id);
                this.selectedItem = element ? (element as TransformationBlock) : (item as TransformationBlock);
                this.createForm();
            }
        });

        this.dataService.canvasItems.subscribe(items => {
            if (this.selectedItem) {
                this.availableInputs = items.map(i => i.data).filter(x => x.groupType != 'output' && x.id != this.selectedItem.id);
            } else {
                this.availableInputs = items.map(i => i.data).filter(x => x.groupType != 'output');
            }
        })
    }

    ngOnInit(): void {
    }

    createForm() {
        this.form = this.fb.group({
            id: [this.selectedItem.id, Validators.required],
            type: [this.selectedItem.groupType, Validators.required],
            inputBlock: [this.selectedItem.inputBlock, Validators.required],
            property: [(this.selectedItem as TransformationBlock).property, Validators.required],
        });
    }

    applyTransformation(): void {
        const start = document.getElementById(this.form.value.inputBlock);
        const end = document.getElementById(this.selectedItem.id);
        const line = this.dataService.lines.find(x => x.id == "l-" + this.selectedItem.id + '#' + this.form.value.inputBlock);
        if (!line) {
            this.dataService.lines.push({ id: "l-" + this.selectedItem.id + '#' + this.form.value.inputBlock, startElement: start!, endElement: end! });
        }

        connect(start!, end!, '#000', 2, "l-" + this.selectedItem.id + '#' + this.form.value.inputBlock);
        (this.selectedItem as TransformationBlock).inputBlock = this.dataService.canvasElements.find(x => x.id == this.form.value.inputBlock);
        this._transformationService.applyTransformation(this.selectedItem, this.form)

        this.dataService.blockSelected.next(null);
    }
}