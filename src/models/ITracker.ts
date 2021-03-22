export interface ITracker {
    name: string;
    id: string;
    duration: number; // in seconds
    target: number; // in seconds
    active: boolean;
}