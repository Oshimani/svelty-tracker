import type { ITracker } from "./ITracker";

export interface ITrackerGroup {
    name: string;
    id: string;
    trackers: ITracker[];
}