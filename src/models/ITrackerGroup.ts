import type { ITracker } from "./ITracker";

export interface ITrackerGroup {
    name: string;
    id: string;
    duration: number; // in seconds
    target: number; // in seconds
    active: boolean;
    trackers: ITracker[]
}
