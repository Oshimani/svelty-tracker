<script lang="ts">
    import { fade, fly } from "svelte/transition";
    import { backInOut } from "svelte/easing";
    import { faPlus } from "@fortawesome/free-solid-svg-icons";
    import Icon from "svelte-awesome";

    import type { ITracker } from "../models/ITracker";

    import NumberInput from "./NumberInput.svelte";

    export let submit: (newTracker: ITracker) => void;
    export let checkID: (id: string) => boolean;

    let submitButton;
    let showModal: boolean = false;

    let name: string;
    let targetHours: number = 0; // in seconds
    let targetMinutes: number = 0; // in seconds

    $: target = targetHours + targetMinutes;

    function saveName() {
        if (!checkID(name)) {
            // cancel here
            alert(`Name: ${name} alsready in list, name has to be unique.`);
            return;
        }

        showModal = true;
        // cheap hack
        setTimeout(() => {
            submitButton.focus();
        }, 10);
    }

    function handleSubmit() {
        submit({
            name,
            id: name,
            duration: 0,
            target,
            active: true,
        } as ITracker);

        // reset form
        name = "";
        showModal = false;
        targetHours = 0;
        targetMinutes = 0;
    }

    function handleDurationChange(value: number, unit: string) {
        switch (unit) {
            case "hours":
                targetHours = value;
                break;
            case "minutes":
                targetMinutes = value;
                break;
            default:
                break;
        }
    }
</script>

<form
    class="bg-gray-300 dark:bg-gray-800 rounded-2xl px-4 py-2 shadow flex flex-row gap-1"
    on:submit|preventDefault={() => saveName()}
>
    <input
        class="input flex-grow"
        placeholder="title for new tracker"
        type="text"
        bind:value={name}
    />
    <button disabled={!name} class={`btn secondary-btn`} type="submit"
        ><Icon data={faPlus} /></button
    >
</form>

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
        class="app-modal fixed bg-gray-50 dark:text-gray-100 dark:bg-gray-800 shadow-md rounded-2xl flex flex-col gap-4"
    >
        <header class="">
            <h1 class=" text-center px-12 pt-4">Set target duration</h1>
            <p class="text-sm text-center text-gray-600">
                (leave at 0 for no target duration)
            </p>
            <div
                class="w-full h-1 bg-blue-600 bg-gradient-to-r dark:from-purple-600 dark:via-red-500 dark:to-yellow-400"
            />
        </header>

        <section class="px-12">
            <div class="flex flex-row gap-2 justify-evenly">
                <NumberInput
                    on:change={(e) =>
                        handleDurationChange(e.detail.duration, "hours")}
                    unit="hours"
                />
                <NumberInput
                    on:change={(e) =>
                        handleDurationChange(e.detail.duration, "minutes")}
                    addAmount={5}
                    unit="minutes"
                />
            </div>
        </section>

        <footer class="w-full ">
            <div
                class="w-full h-1 bg-blue-600 bg-gradient-to-r dark:from-purple-600 dark:via-red-500 dark:to-yellow-400"
            />
            <div class="px-12 pb-4 pt-2 flex gap-2">
                <button
                    on:click={() => {
                        showModal = false;
                    }}
                    class={`btn secondary-btn`}>Cancel</button
                >
                <button
                    bind:this={submitButton}
                    on:click={() => handleSubmit()}
                    class={`btn secondary-btn`}>Submit</button
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
    form input {
        @apply rounded-r-none;
    }
    form button {
        @apply rounded-l-none;
    }
</style>
