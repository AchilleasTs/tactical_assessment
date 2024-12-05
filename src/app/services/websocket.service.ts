import { inject, Injectable } from '@angular/core';
import { InputBlock } from '../app.models';
import { DataService } from './data.service';
import { Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class WebSocketService {
    dataService = inject(DataService);

    socketConnections: { id: string, socket: WebSocket }[] = [];

    private socket!: WebSocket;

    startWebSocket(data: InputBlock, connectionId: string): void {
        const conn = this.socketConnections.find(x => x.id == connectionId);

        //if there is already a connection with this id and has an open socket then do nothing
        if (conn && conn.socket.readyState == 1) {
            return;
        }

        this.socket = new WebSocket(data.url);

        if (conn) {
            conn.socket = this.socket;
        } else {
            this.dataService.createConnection(connectionId);
            this.socketConnections.push({ id: connectionId, socket: this.socket })
        }

        this.socket.onopen = () => {
            console.log('WebSocket connected.')
            const message = JSON.stringify({
                type: "subscribe",
                product_ids: data.productIds.split(","),
                channels: data.channels.split(",")
            });
            this.sendMessage(message);
        };

        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log('Received:', data);
            if (data.type == 'ticker') {
                this.dataService.emitInputData(connectionId, data); // Emit to DataService
            } else if (data.type == 'subscription') {

            }
        };

        this.socket.onerror = (error) => console.error('WebSocket error:', error);
        this.socket.onclose = () => console.log('WebSocket closed.');
    }

    closeConnections() {
        this.socketConnections.forEach(x => {
            if (this.socket.readyState == 1) {
                x.socket.close()
            }
        });
        this.socketConnections = [];
    }

    closeConnection(connectionId: string) {
        const connSocket = this.socketConnections.find(x => x.id == connectionId)?.socket;
        if (connSocket?.readyState == 1) {
            connSocket.close();
        }
        this.socketConnections = this.socketConnections.filter(x => x.id != connectionId);
    }

    // Send a message through the WebSocket
    sendMessage(message: string): void {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(message);
        } else {
            console.error('WebSocket is not open!');
        }
    }
}