import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { InputBlock, OutputBlock, TransformationBlock } from '../../app.models';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { InputComponent } from './components/input-block.component';
import { TransformationComponent } from './components/transformation-block.component';
import { OutputComponent } from './components/output-block.component';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-config-panel',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    InputComponent,
    TransformationComponent,
    OutputComponent
  ],
  template: `
  <div class="p-6">
    @if(selectedItem){
      <h1>{{selectedItem.displayName}} Configuration</h1>
      @if(selectedItem){
        @switch (selectedItem.groupType) {
          @case('input'){
            <app-input-block></app-input-block>
          }
          @case('transformation'){
            <app-transformation-block></app-transformation-block>
          }
          @case('output'){
            <app-output-block></app-output-block>
          }
        }
      }
    }
  </div>
  `
})
export class ConfigPanelComponent {
  _dataService = inject(DataService);
  selectedItem: InputBlock | TransformationBlock | OutputBlock;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this._dataService.blockSelected.subscribe(item => {
      if (item) {
        this.selectedItem = item;
      }
    });
  }

}
