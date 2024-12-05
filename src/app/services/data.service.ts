import { Injectable } from '@angular/core';
import { Subject, Observable, BehaviorSubject } from 'rxjs';
import { OutputBlock, InputBlock, TransformationBlock, CanvasItem } from '../app.models';

@Injectable({
    providedIn: 'root',
})
export class DataService {
    connectionData = new Map<string, any[]>();
    transformationData = new Map<string, any[]>();
    private connections = new Map<string, Subject<any[]>>(); // Map of WebSocket connections
    private transformations = new Map<string, Subject<any>>(); // Map of transformations

    lines: { id: string, startElement: HTMLElement, endElement: HTMLElement }[] = [];

    outputBlockSelected$ = new BehaviorSubject<OutputBlock | null>(null);
    blockSelected = new BehaviorSubject<InputBlock | TransformationBlock | OutputBlock | null>(null);
    canvasItems = new BehaviorSubject<CanvasItem[]>([]);
    canvasElements: (InputBlock | TransformationBlock | OutputBlock)[] = []

    // Add a new input stream
    createConnection(connectionId: string) {
        const subject = new Subject<any[]>();
        this.connections.set(connectionId, subject);
        // return subject.asObservable();
    }

    getConnectionData(connectionId: string) {
        const subject = this.connections.get(connectionId);
        return subject?.asObservable();
    }
    // Emit data for a specific input stream
    emitInputData(connectionId: string, data: any): void {
        const subject = this.connections.get(connectionId);

        const prevData = this.connectionData.get(connectionId) ?? [];
        this.connectionData.set(connectionId, [data, ...prevData]);
        const newData = this.connectionData.get(connectionId)!
        console.log(this.connections);

        subject?.next(newData);
    }

    // Add a new transformation stream
    createTransformation(transformationId: string) {
        const subject = new Subject<any>();
        this.transformations.set(transformationId, subject);
        // return subject.asObservable();
    }

    getTransformedData(transformationId: string) {
        const subject = this.transformations.get(transformationId);
        return subject?.asObservable();
    }

    // Emit data for a specific transformation
    emitTransformedData(transformationId: string, data: any): void {
        const subject = this.transformations.get(transformationId);
        const prevData = this.transformationData.get(transformationId) ?? [];
        this.transformationData.set(transformationId, [data, ...prevData]);

        const newData = this.transformationData.get(transformationId)!
        console.log(this.transformations);

        subject?.next(newData);
    }

    clearAll() {
        this.connections.clear();
        this.transformations.clear();
        this.canvasElements = [];
        this.canvasItems.next([]);
        this.blockSelected.next(null);
        this.lines.forEach(x => {
            document.getElementById(x.id)?.remove();
        })
        this.lines = [];
    }
}