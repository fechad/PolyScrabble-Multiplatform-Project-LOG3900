export abstract class CommunicationManager {
    protected abstract connectSocket(): void;
    protected abstract onFirstSocketConnection(): void;
}
