import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class SocketClientService {
    socket: Socket;
    isMenuSocketFeaturesConfigured: boolean;

    constructor() {
        this.isMenuSocketFeaturesConfigured = false;
    }

    removeAllPreviousListeners() {
        if (!this.socket) return;
        this.socket.removeAllListeners();
    }

    refreshConnection() {
        this.removeAllPreviousListeners();
        if (!this.isSocketAlive()) {
            this.connect();
        }
    }

    isSocketAlive(): boolean {
        return this.socket && this.socket.connected;
    }

    connect() {
        this.socket = io(environment.serverUrl.replace('/api', ''), { transports: ['websocket'], upgrade: false });
    }

    disconnect() {
        if (!this.socket) return;
        this.socket.disconnect();
    }

    on<T>(event: string, action: (data: T) => void) {
        this.socket.on(event, action);
    }

    send<T>(event: string, data?: T) {
        if (data) {
            this.socket.emit(event, data);
        } else {
            this.socket.emit(event);
        }
    }
}
