import { Writable, writable } from "svelte/store";

export class ITracker {
    interval: number;
    public readonly durationStore: Writable<number>;
    public readonly activeStore: Writable<boolean>;
    public readonly id: string;

    constructor(id: string, public name: string, active = false, duration: number = 0) {
        this.durationStore = writable(duration);
        this.activeStore = writable(false);
        if (id) this.id = id
        else
            this.id = name + Math.random();
        if (active) this.start()
    }

    private _intervallFunction() {
        this.durationStore.update(d => d + 1);
    }

    start() {
        console.log("tracker started", this.name, this.interval);
        if (!this.interval) {
            this.interval = setInterval(() => { this._intervallFunction() }, 1000);
        }
        this.activeStore.set(true);
    }

    stop() {
        console.log("tracker stopped", this.name);
        clearInterval(this.interval);
        this.activeStore.set(false);
        this.interval = undefined;
    }

    reset() {
        this.durationStore.set(0);
    }

    addTime(amount: number) {
        this.durationStore.update(d => d + (amount * 60));
    }
}