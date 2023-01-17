/* eslint-disable */ // we want to use this to tests socket related classes
type CallbackSignature = (params: any) => {};

export class SocketTestHelper {
    on(event: string, callback: CallbackSignature) {
        if (!this.callbacks.has(event)) {
            this.callbacks.set(event, []);
        }

        this.callbacks.get(event)!.push(callback);
    }

    emit(event: string, ...params: any) {
    }

    disconnect() {}

    peerSideEmit(event: string, params?: any) {
        if (!this.callbacks.has(event)) {
            return;
        }

        for (const callback of this.callbacks.get(event)!) {
            callback(params);
        }
    }

    private callbacks = new Map<string, CallbackSignature[]>();
}
