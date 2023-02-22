import { Injectable } from '@angular/core';
declare let webkitAudioContext: unknown; // for Safari

@Injectable({
    providedIn: 'root',
})
export class AudioService {
    private context: AudioContext;
    private source: AudioBufferSourceNode | null = null;
    private isPlayingMainTheme = false;
    private mainTheme: string;
    constructor() {
        const audioContext = window.AudioContext || webkitAudioContext;
        this.context = new audioContext();
        this.mainTheme = '../../assets/sounds/kord.mp3';
    }

    playSound(url: string, startDelay: number = 0) {
        const source = this.context.createBufferSource();
        const request = new XMLHttpRequest();

        request.open('GET', url, true);
        request.responseType = 'arraybuffer';

        request.onload = () => {
            const audioData = request.response;

            this.context.decodeAudioData(audioData, (buffer) => {
                source.buffer = buffer;
                source.connect(this.context.destination);
                source.start(startDelay);
            });
        };
        this.source = source;
        request.send();
    }
    playMainTheme() {
        if (this.isPlayingMainTheme) return;
        this.playSound(this.mainTheme);
        this.isPlayingMainTheme = true;
    }
    stopSound() {
        if (!this.source) return;
        this.source.stop();
        this.source = null;
        this.isPlayingMainTheme = false;
    }
}
