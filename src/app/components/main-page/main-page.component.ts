import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import {
  CdkDragDrop,
  CdkDrag,
  CdkDragEnd,
  CdkDragStart,
} from '@angular/cdk/drag-drop';
import { Blocks, CanvasItem, DragDataModel, InputBlock, OutputBlock, TransformationBlock } from '../../app.models';
import { WebSocketService } from '../../services/websocket.service';
import { generateGuid } from '../../helpers/guid-generator'
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { connect } from '../../helpers/draw-lines';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { OutputPanelComponent } from '../output-panel/output-panel.component';

@Component({
  selector: 'app-main-page',
  imports: [CdkDrag, MatIconModule, CommonModule, MatDividerModule, MatButtonModule, OutputPanelComponent],
  template: `
    <div class="flex h-screen">
      <!-- Sidebar -->
       <div class="p-4 bg-gray-100 h-full w-1/6 border-r-2 border-r-slate-700/10">
          <div class="flex flex-col gap-6 w-full pt-5">
             <div class="flex flex-col gap-2 w-full items-center">
                <span class="text-xl mb-4">Input Block</span>
                  <div class="bg-sky-600/70 text-white p-2 rounded shadow cursor-move w-52 text-center"
                    draggable="true" (dragstart)="onDragStart($event, blocks.input)">
                    {{blocks.input.displayName}}
                  </div>
              </div>
            
              <mat-divider></mat-divider>

              <div class="flex flex-col gap-2 w-full items-center">
                <span class="text-xl mb-4">Transformation Blocks</span>
                @for (block of blocks.transformation; track $index) {
                  <div class="bg-orange-700/70 text-white p-2 rounded shadow cursor-move w-52 text-center"
                    draggable="true" (dragstart)="onDragStart($event, block)">
                    {{block.displayName}}
                  </div>
                }
              </div>

              <mat-divider></mat-divider>

               <div class="flex flex-col gap-2 w-full items-center">
                <span class="text-xl mb-4">Output Blocks</span>
                @for (block of blocks.output; track $index) {
                  <div class="bg-emerald-900/70 text-white p-2 rounded shadow cursor-move w-52 text-center"
                    draggable="true" (dragstart)="onDragStart($event, block)">
                    {{block.displayName}}
                  </div>
                }
              </div>
          </div>
        </div>

        <div class="flew flex-col w-5/6">
          <!-- Canvas -->
          <div #canvas class="canvasContainer w-full bg-gray-200 relative h-[calc(100%_-_384px)] p-4" (dragover)="onDragOver($event)" (drop)="onDrop($event)">
             <button class="absolute top-4 left-[calc(100%_-_150px)] w-36" mat-flat-button (click)="clearCanvas()">Clear Canvas</button>
    
              @for (item of canvasItems; track $index) {
                <div [id]="item.data.id" class="text-white p-2 rounded shadow cursor-move w-52 z-[100]"
                  [ngClass]="{
                    'bg-emerald-900/70':item.data.groupType == 'output',
                    'bg-orange-700/70':item.data.groupType == 'transformation',
                    'bg-sky-600/70':item.data.groupType == 'input'
                  }"
                  [ngStyle]="{'top.px': item.y, 'left.px': item.x}"
                  cdkDrag
                  cdkDragBoundary=".canvasContainer"
                  (cdkDragMoved)="onCanvasDragStart($event,item.data.id)"
                  (cdkDragEnded)="onDragEnd($event, $index)"
                >
                  <div class="flex items-center justify-between w-full">
                    {{ item.data.displayName}}
                    <div class="flex item-center gap-2">
                      <mat-icon class="!cursor-pointer" aria-hidden="false" aria-label="Example home icon" fontIcon="settings" (click)="canvasItemClicked(item.data)"></mat-icon>
    
                      @if(item.data.groupType == 'output'){
                        <mat-icon class="!cursor-pointer" aria-hidden="false" aria-label="eye icon" fontIcon="visibility" (click)="openOutput(item.data)"></mat-icon>
                      }
                    </div>
                  </div>
                </div>
              }
          </div>

          <!-- output section --> 
          <div class="absolute w-[calc(100%_-_16.6%)] bottom-0 h-96 overflow-hidden z-[9999]">
           @if(showOutput){
              <div class="w-full h-full overflow-y-auto">
                <app-output-panel (onClose)="closeOutput($event)"></app-output-panel>           
              </div>
            }        
          </div>
        </div>
    </div>
  `
})
export class MainPageComponent {
  @ViewChild('canvas', { static: true }) canvas!: ElementRef<HTMLDivElement>;

  blocks: Blocks = {
    input: {
      id: generateGuid(),
      type: "input",
      productIds: "",
      channels: "",
      url: "",
      displayName: "Input",
      groupType: 'input'
    },
    transformation: [
      {
        id: generateGuid(),
        type: "average",
        inputBlock: null,
        property: "",
        displayName: "Average value",
        groupType: 'transformation'
      },
      {
        id: generateGuid(),
        type: "top-bottom",
        inputBlock: null,
        property: "",
        displayName: "Top/bottom value",
        groupType: 'transformation'
      },
      {
        id: generateGuid(),
        type: "sum",
        inputBlock: null,
        property: "",
        displayName: "Sum of values",
        groupType: 'transformation'
      },
      {
        id: generateGuid(),
        type: "threshold",
        inputBlock: null,
        property: "",
        displayName: "Threshold alert",
        groupType: 'transformation'
      },
      {
        id: generateGuid(),
        type: "count",
        inputBlock: null,
        property: "",
        displayName: "Count of objects",
        groupType: 'transformation'
      },
      {
        id: generateGuid(),
        type: "rate",
        inputBlock: null,
        property: "",
        displayName: "Rate of events",
        groupType: 'transformation'
      }
    ],
    output: [
      {
        id: generateGuid(),
        type: "log",
        inputBlock: null,
        displayName: "Console Output",
        groupType: 'output'
      },
      {
        id: generateGuid(),
        type: "table",
        inputBlock: null,
        displayName: "Table",
        groupType: 'output'
      },
      {
        id: generateGuid(),
        type: "graph",
        inputBlock: null,
        displayName: "Graph",
        groupType: 'output'
      }
    ]
  }

  _dataService = inject(DataService);
  _webSocketService = inject(WebSocketService);
  // Items dropped on canvas
  canvasItems: CanvasItem[] = [];
  isDrag: boolean = false;

  draggedItem: any = null;
  showOutput: boolean = false;

  constructor() {
    this._dataService.canvasItems.subscribe(items => {
      this.canvasItems = items;
    });

    this._dataService.outputBlockSelected$.subscribe(value => {
      if (value) {
        this.showOutput = true;
      } else {
        this.showOutput = false;
      }
    });
  }

  onDragStart(event: DragEvent, item: any): void {
    this.draggedItem = item;
    event.dataTransfer?.setData('text/plain', JSON.stringify(item));
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  // Handle the drop event
  onDrop(event: DragEvent): void {
    event.preventDefault();

    const data = event.dataTransfer?.getData('text/plain');
    if (data) {
      const droppedItem = JSON.parse(data);

      // Get the drop position 
      const canvasRect = this.canvas.nativeElement.getBoundingClientRect();
      const dropX = event.clientX - canvasRect.left;
      const dropY = event.clientY - canvasRect.top;

      // Add the dropped item to the canvas at the calculated position
      this.addItemToCanvas(droppedItem, dropX, dropY);
    }
  }

  addItemToCanvas(item: any, x: number, y: number): void {
    item.id = generateGuid();
    item.displayName = item.displayName + "-" + item.id.split("-")[0];

    let canvasItem: CanvasItem = {
      data: item,
      x: x,
      y: y
    }

    const newItems = [...this.canvasItems, canvasItem];
    this._dataService.canvasItems.next(newItems);
    this._dataService.canvasElements.push(item);
    if (item.groupType == 'input') {
      this._dataService.createConnection(item.id);
    }
  }

  onCanvasDragStart(event: CdkDragStart, elementId: string): void {
    const lines = this._dataService.lines.filter(x => x.startElement.id == elementId || x.endElement.id == elementId);
    lines.forEach(l => {
      connect(l.startElement, l.endElement, '#000', 2, "l-" + l.endElement.id + '#' + l.startElement.id);
    });
  }

  onCanvasDragEnd(event: DragEvent, element: HTMLDivElement): void {
    const canvasRect = this.canvas.nativeElement.getBoundingClientRect();
    element.style.left = `${event.clientX - canvasRect.left}px`;
    element.style.top = `${event.clientY - canvasRect.top}px`;
  }

  onDragEnd(event: CdkDragEnd, index: number) {
    this.isDrag = true;
    const newPosition = event.dropPoint;
    this.canvasItems[index].x = newPosition.x;
    this.canvasItems[index].y = newPosition.y;
  }

  canvasItemClicked(item: InputBlock | TransformationBlock | OutputBlock) {
    this._dataService.blockSelected.next(item);
  }

  openOutput(item: OutputBlock) {
    this._dataService.outputBlockSelected$.next(item);
  }

  clearCanvas() {
    this._webSocketService.closeConnections();
    this._dataService.clearAll();
    this.showOutput = false;
  }

  closeOutput(value: boolean) {
    this.showOutput = !value;
  }
}