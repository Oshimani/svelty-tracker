<script lang="ts">
    import App from "./App.svelte";
</script>

<App />

<style global lang="postcss">
    @tailwind base;
    @tailwind components;
    @tailwind utilities;

    @layer components {
        .btn {
            /* general */
            @apply rounded-2xl px-4 py-2 text-white;
            /* general dark */
            @apply dark:text-gray-100;
            /* disabled */
            @apply disabled:cursor-default disabled:bg-gray-100;
            /* disabled dark */
            @apply dark:disabled:bg-gray-700 dark:disabled:from-gray-700 dark:disabled:to-gray-700 dark:disabled:text-gray-400;
        }
        /* .btn, */
        .primary-btn {
            /* general */
            @apply bg-blue-600 hover:bg-blue-500;
            /* general dark */
            @apply bg-gradient-to-r dark:from-red-600 dark:via-red-500 dark:to-yellow-400 dark:hover:from-red-500 dark:hover:via-red-400 dark:hover:to-yellow-400;
        }
        /* .btn, */
        .secondary-btn {
            /* general */
            @apply bg-gray-300 hover:bg-gray-200;
            /* general dark */
            @apply dark:bg-gray-800 dark:hover:bg-gray-700;
        }

        .input {
            /* general */
            @apply px-4 py-1 rounded-2xl shadow-inner;
            /* general dark */
            @apply dark:bg-gray-600 dark:border-gray-600 dark:text-gray-100;
        }
    }
</style>
