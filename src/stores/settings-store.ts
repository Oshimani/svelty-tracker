import { writable } from 'svelte/store';

const SETINGS_PLAYSOUND = "setting_playSound";

function createPlaySound() {
    const { subscribe, set } = writable(localStorage.getItem(SETINGS_PLAYSOUND) === "true" ? true : false);

    return {
        subscribe,
        set: (value) => {
            // write to local storage
            localStorage.setItem(SETINGS_PLAYSOUND, String(value))
            // update store
            set(value);
        }
    };
}
export const playSound = createPlaySound();

const SETTINGS_HIDETARGET = "setting_hideTarget";
function createHideTarget() {
    const { subscribe, set } = writable(localStorage.getItem(SETTINGS_HIDETARGET) === "true" ? true : false);

    return {
        subscribe,
        set: (value) => {
            // write to local storage
            localStorage.setItem(SETTINGS_HIDETARGET, String(value))
            // update store
            set(value);
        }
    };
}
export const hideTarget = createHideTarget();
