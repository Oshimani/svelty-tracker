<script context="module">
    let current;
</script>

<script lang="ts">
    import { createEventDispatcher, onDestroy, onMount } from "svelte";
    import Icon from "svelte-awesome";
    import {
        faHourglass,
        faPlayCircle,
    } from "@fortawesome/free-regular-svg-icons";
    import { faUndo, faTrash } from "@fortawesome/free-solid-svg-icons";
    import type { ITracker } from "./ITracker";

    const dispatch = createEventDispatcher();

    export let tracker: ITracker;

    $: disabled = duration < 5 * 60;

    let showAnimation: boolean = true;

    let duration: number;
    const unsubDuration = tracker.durationStore.subscribe(
        (value) => (duration = value)
    );

    let active: boolean;
    const unsubActive = tracker.activeStore.subscribe(
        (value) => (active = value)
    );

    onMount(() => {
        stopOthers();
    });

    onDestroy(() => {
        unsubDuration();
        unsubActive();
    });

    function stopOthers() {
        if (current && current !== tracker) current.stop();
        current = tracker;
    }

    function handleStartClick() {
        stopOthers();
        tracker.start();

        showAnimation = true;
        setTimeout(() => {
            showAnimation = false;
        }, 3000);
    }

    function handleResetClick() {
        if (confirm(`Reset ${tracker.name}?`)) {
            tracker.reset();
        }
    }

    function handleDeleteClick() {
        if (confirm(`Delete ${tracker.name}?`)) {
            dispatch("delete", { id: tracker.id });
        }
    }
</script>

<li class="py-1">
    <div
        class="px-4 py-2 flex flex-row shadow-md rounded gap-4 justify-between items-center"
    >
        <!-- NAME -->
        <input class="flex-grow" type="text" bind:value={tracker.name} />

        <!-- RECORDING -->
        <div>
            {#if active}
                <span class="relative flex h-4 w-4">
                    <span
                        class:hidden={!showAnimation}
                        class="absolute animate-ping inline-flex h-full w-full rounded-full bg-red-400 opacity-75"
                    />
                    <span
                        class="relative inline-flex rounded-full h-4 w-4 bg-red-500"
                    />
                </span>
            {:else}
                <span class="relative h-4 w-4 inline-flex" />
            {/if}
        </div>

        <!-- TIMER -->
        <div>
            <Icon data={faHourglass} />
            {new Date(duration * 1000).toISOString().substr(11, 8)}
            <button on:click={() => tracker.addTime(5)}>+5min</button>
            <button on:click={() => tracker.addTime(-5)} {disabled}
                >-5min</button
            >
        </div>

        <!-- BUTTONS -->
        <div class="">
            <button on:click={() => handleStartClick()}>
                <Icon data={faPlayCircle} />Start
            </button>
            <button on:click={() => handleResetClick()}
                ><Icon data={faUndo} />Reset</button
            >
            <button on:click={() => handleDeleteClick()}
                ><Icon data={faTrash} />Delete</button
            >
        </div>
    </div>
</li>

<style>
    button {
        @apply px-2;
        @apply py-1;
    }
</style>
