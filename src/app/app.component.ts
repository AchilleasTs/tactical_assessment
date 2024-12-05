import { Component, inject, ViewChild } from '@angular/core';
import { OutputPanelComponent } from './components/output-panel/output-panel.component';
import { CommonModule } from '@angular/common';
import { ConfigPanelComponent } from './components/config-panel/config-panel.component';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MainPageComponent } from "./components/main-page/main-page.component";
import {
  MatBottomSheet,
  MatBottomSheetModule,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';
import { DataService } from './services/data.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, MainPageComponent, ConfigPanelComponent, MatSidenavModule, MainPageComponent],
  template: `
    <div class="flex h-screen w-full">
        <div class="flex flex-col h-full justify-between w-full">
          <mat-drawer-container [hasBackdrop]="true">
            <mat-drawer #configurationPanel [mode]="'over'" position="end">
              <app-config-panel></app-config-panel>
            </mat-drawer>
            <mat-drawer-content>
              <app-main-page></app-main-page>
            </mat-drawer-content>
          </mat-drawer-container>
          <!-- @if(outputBlockSelected){
            <div class="w-full">
              <app-output-panel></app-output-panel>
            </div>
          } -->
        </div>
      </div>
  `,
  styles: []
})
export class AppComponent {
  @ViewChild('configurationPanel') configurationPanel: MatSidenav;

  _dataService = inject(DataService);
  _bottomSheet = inject(MatBottomSheet);

  outputBlockSelected: boolean = false;
  bottomSheetRef: MatBottomSheetRef;

  constructor() {
    // this._dataService.outputBlockSelected$.subscribe(value => {
    //   if (value) {
    //     this.openBottomSheet();
    //   } else {
    //     if (this.bottomSheetRef) {
    //       this.bottomSheetRef.dismiss();
    //     }
    //   }
    // });

  }

  ngAfterViewInit() {
    this._dataService.blockSelected.subscribe(value => {
      if (value) {
        this.configurationPanel.toggle(true);
      } else {
        this.configurationPanel.toggle(false);
      }
    })
  }

  openBottomSheet(): void {
    this.bottomSheetRef = this._bottomSheet.open(OutputPanelComponent);
  }
}