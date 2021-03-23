<script lang="ts">
    import { fade, fly } from "svelte/transition";
    import { backInOut } from "svelte/easing";

    import { faCog } from "@fortawesome/free-solid-svg-icons";
    import Icon from "svelte-awesome";

    import { hideTarget, playSound } from "../stores/settings-store";

    let showModal: boolean = false;
</script>

<!-- MENU BUTTON -->
<button class={`btn bg-transparent`} on:click={() => (showModal = true)}
    ><Icon data={faCog} scale="1.5" /></button
>

{#if showModal}
    <!-- BACKDROP -->
    <div
        transition:fade
        on:click={() => {
            showModal = false;
        }}
        class="fixed top-0 left-0 w-screen h-screen bg-gray-900 opacity-80"
    />

    <!-- MODAL -->
    <div
        transition:fly={{ y: -800, duration: 400, easing: backInOut }}
        class="app-modal normal-case fixed text-gray-800 bg-gray-50 dark:text-gray-100 dark:bg-gray-800 shadow-md rounded-2xl flex flex-col gap-4"
    >
        <!-- HEADER -->
        <header class="">
            <h1 class=" text-center px-12 pt-4">Settings</h1>
            <div
                class="w-full h-1 bg-blue-600 bg-gradient-to-r dark:from-purple-600 dark:via-red-500 dark:to-yellow-400"
            />
        </header>

        <!-- SETTINGS -->
        <section class="px-12">
            <div class="flex flex-col gap-2">
                <!-- PLAY SOUND WHEN TARGET=DURATION -->
                <label
                    for="play-sound"
                    title="Plays a sound when the targeted duration is hit"
                    >Play sound <input
                        name="play-sound"
                        id="play-sound"
                        type="checkbox"
                        bind:checked={$playSound}
                    /></label
                >
                <!-- HIDE TARGET -->
                <label
                    title="If you do not use the targets you can hide them all together"
                    for="hide-target"
                    >Hide target <input
                        name="hide-target"
                        id="hide-target"
                        type="checkbox"
                        bind:checked={$hideTarget}
                    /></label
                >
            </div>
        </section>

        <!-- BUTTONS -->
        <footer class="w-full ">
            <div
                class="w-full h-1 bg-blue-600 bg-gradient-to-r dark:from-purple-600 dark:via-red-500 dark:to-yellow-400"
            />
            <div class="px-12 pb-4 pt-2 text-center">
                <button
                    on:click={() => {
                        showModal = false;
                    }}
                    class={`btn secondary-btn`}>Close</button
                >
            </div>
        </footer>
    </div>
{/if}

<style>
    .app-modal {
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }
</style>
