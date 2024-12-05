import { output } from "@angular/core";

export interface InputBlock {
    id: string;
    type: string;
    productIds: string;
    channels: string;
    url: string;
    displayName: string;
    groupType: string;
}

export interface TransformationBlock {
    id: string;
    type: string;
    inputBlock: any;
    property: string;
    displayName: string;
    groupType: string;
}

export interface OutputBlock {
    id: string;
    type: string;
    inputBlock?: any;
    displayName: string;
    groupType: string;
}


export class Blocks {
    input: InputBlock;
    transformation: TransformationBlock[];
    output: OutputBlock[]
}

// export class BlockElement {
//     name: string;
//     properties: any
// }

export class CanvasItem {
    data: InputBlock | TransformationBlock | OutputBlock;
    x: number;
    y: number;
}

// export class WebSocketConnectionData {
//     id: string;
//     data: any[];
//     formatedData: any[]
// }

export class DragDataModel {
    id: string;
    type: string;
    data: any;
}