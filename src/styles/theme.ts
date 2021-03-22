

// BUTTONS
export const BUTTON = "rounded-2xl px-4 py-2 text-white dark:text-gray-100";
const _DISABLED_BUTTON_COLOR = "disabled:cursor-default disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:disabled:from-gray-700 dark:disabled:to-gray-700 dark:disabled:text-gray-400"
const _PRIMARY_COLOR = "bg-blue-600 hover:bg-blue-500 disabled:text-gray-500 bg-gradient-to-r dark:from-red-600 dark:via-red-500 dark:to-yellow-400 dark:hover:from-red-500 dark:hover:via-red-400 dark:hover:to-yellow-400"
export const PRIMARY_BUTTON = `${_PRIMARY_COLOR} ${_DISABLED_BUTTON_COLOR}`;
const _SECONDARY_BUTTON = "bg-gray-300 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
export const SECONDARY_BUTTON = `${_SECONDARY_BUTTON} ${_DISABLED_BUTTON_COLOR}`;

// INPUTS
export const INPUT = "px-4 py-1 rounded-2xl dark:bg-gray-600 dark:border-gray-600 dark:text-gray-100 shadow-inner";
