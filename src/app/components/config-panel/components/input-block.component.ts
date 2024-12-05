import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { WebSocketService } from '../../../services/websocket.service';
import { InputBlock } from '../../../app.models';
import { DataService } from '../../../services/data.service';

@Component({
    selector: 'app-input-block',
    imports: [MatFormFieldModule, MatInputModule, MatCheckboxModule, MatButtonModule, ReactiveFormsModule],
    template: `
    <div>
      <form [formGroup]="form" class="flex flex-col gap-2 min-w-[400px]">
        <mat-form-field>
            <mat-label>WebSocket URL</mat-label>
            <input matInput type="text" [formControlName]="'url'" [disabled]="true">
        </mat-form-field>

        <mat-form-field>
            <mat-label>Product IDs (comma separated)</mat-label>
            <input matInput type="text" [formControlName]="'productIds'"  placeholder="e.g. BTC-USD, ETH-USD" >
        </mat-form-field>

        <mat-form-field>
            <mat-label>Channels (comma separated)</mat-label>
            <input matInput type="text" [formControlName]="'channels'" placeholder="e.g. ticker, orderbook">
        </mat-form-field>

        <button mat-raised-button color="primary" (click)="startWebSocket()">Start WebSocket</button>
        <button mat-raised-button color="warn" (click)="stopWebSocket()">Stop WebSocket</button>
      </form>
    </div>
  `
})
export class InputComponent implements OnInit {
    form: FormGroup;
    selectedItem: InputBlock;
    connectionId: string = "";

    constructor(private fb: FormBuilder, private websocketService: WebSocketService, private dataService: DataService) {
        this.dataService.blockSelected.subscribe(item => {
            const element = this.dataService.canvasElements.find(x => x.id == item?.id);
            this.selectedItem = element ? (element as InputBlock) : (item as InputBlock);
            this.connectionId = item?.id!;
            if (this.selectedItem) {
                this.createForm();
            }
        });
    }

    ngOnInit(): void {

    }

    createForm() {
        this.form = this.fb.group({
            url: ['wss://ws-feed-public.sandbox.exchange.coinbase.com'],
            productIds: [this.selectedItem.productIds],
            channels: [this.selectedItem.channels],
        });
    }

    startWebSocket() {
        this.websocketService.startWebSocket(this.form.value, this.connectionId);

        (this.selectedItem as InputBlock).url = this.form.value.inputBlock;
        (this.selectedItem as InputBlock).productIds = this.form.value.productIds;
        (this.selectedItem as InputBlock).channels = this.form.value.channels;
        this.dataService.canvasElements.push(this.selectedItem);

        this.dataService.canvasElements.push(this.form.value);
        this.dataService.blockSelected.next(null);
    }

    stopWebSocket() {
        this.websocketService.closeConnection(this.connectionId);
    }
}