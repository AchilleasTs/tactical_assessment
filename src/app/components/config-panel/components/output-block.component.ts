import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { InputBlock, TransformationBlock, OutputBlock } from '../../../app.models';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { DataService } from '../../../services/data.service';
import { connect } from '../../../helpers/draw-lines';

@Component({
    selector: 'app-output-block',
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
    
            <span>THis graph will show live update of the price</span>

            <button mat-raised-button color="primary" (click)="showData()">Apply Transformation</button>
          </form>
        </div>
    }
  `
})
export class OutputComponent implements OnInit {
    form: FormGroup;
    availableInputs: (InputBlock | TransformationBlock | OutputBlock)[] = [];
    selectedItem: any;

    constructor(private fb: FormBuilder, private dataService: DataService) {
        this.dataService.blockSelected.subscribe(item => {
            if (item) {
                const element = this.dataService.canvasElements.find(x => x.id == item?.id);
                this.selectedItem = element ? (element as OutputBlock) : (item as OutputBlock);
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
            inputBlock: [this.selectedItem.inputBlock?.id, Validators.required]
        });
    }

    showData(): void {
        this.dataService.getTransformedData(this.form.value.inputBlock)?.subscribe((data) => {
            console.log("DATAAAAAA========>", data);
        });

        //remove previous connection if exist
        const prevState = this.dataService.canvasElements.find(x => x.id == this.selectedItem.id);
        if ((prevState as TransformationBlock).inputBlock) {
            const prevLineId = "l-" + this.selectedItem.id + '#' + (prevState as TransformationBlock).inputBlock.id;
            this.dataService.lines = this.dataService.lines.filter(x => x.id != prevLineId);
            document.getElementById(prevLineId)?.remove();
        }

        const start = document.getElementById(this.form.value.inputBlock);
        const end = document.getElementById(this.selectedItem.id);
        const line = this.dataService.lines.find(x => x.id == "l-" + this.selectedItem.id + '#' + this.form.value.inputBlock);
        if (!line) {
            this.dataService.lines.push({ id: "l-" + this.selectedItem.id + '#' + this.form.value.inputBlock, startElement: start!, endElement: end! });
        }

        connect(start!, end!, '#000', 2, "l-" + this.selectedItem.id + '#' + this.form.value.inputBlock);


        (this.selectedItem as OutputBlock).inputBlock = this.dataService.canvasElements.find(x => x.id == this.form.value.inputBlock);


        this.dataService.canvasElements.push(this.selectedItem);

        this.dataService.blockSelected.next(null);
    }
}