<script lang="ts">
    import { createEventDispatcher, onDestroy, onMount } from "svelte";
    import { fade, fly } from "svelte/transition";
    import { backIn, backInOut } from "svelte/easing";

    import Icon from "svelte-awesome";
    import {
        faHourglass,
        faPlayCircle,
    } from "@fortawesome/free-regular-svg-icons";
    import { faUndo, faTrash } from "@fortawesome/free-solid-svg-icons";

    import { tick } from "./store";
    const dispatch = createEventDispatcher();

    export let id: string;
    export let name: string;
    export let duration: number = 0;
    export let active: boolean = false;

    $: disabled = duration < 5 * 60;
    $: durationFormatted = new Date(duration * 1000).toISOString().substr(11, 8);

    let showAnimation: boolean = true;

    let unsubscribe;
    onMount(() => {
        unsubscribe = tick.subscribe((_) => {
            if (active) intervalFunction();
        });

        stopOthers();
        start();
    });
    onDestroy(() => unsubscribe());

    function start() {
        showAnimation = true;
        setTimeout(() => {
            showAnimation = false;
        }, 3000);
    }

    function stop() {
        active = false;
    }

    function reset() {
        duration = 0;
    }

    function intervalFunction() {
        duration++;
        dispatch("newDuration", { id, duration });
    }

    function addTime(amount: number) {
        duration += amount * 60;
        dispatch("newDuration", { id, duration });
    }

    function stopOthers() {
        dispatch("startTracking", { id });
    }

    function handleStartClick() {
        stopOthers();
        start();
    }

    function handleResetClick() {
        if (confirm(`Reset ${name}?`)) {
            reset();
        }
    }

    function handleDeleteClick() {
        if (confirm(`Delete ${name}?`)) {
            dispatch("delete", { id });
        }
    }
</script>

<li class="py-1" transition:fly={{ y: -100, duration: 500, easing: backInOut }}>
    <div
        class="px-4 py-2 flex flex-row shadow-md rounded gap-4 justify-between items-center"
    >
        <!-- NAME -->
        <input class="flex-grow" type="text" bind:value={name} />

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
            {durationFormatted}
            <button on:click={() => addTime(5)}>+5min</button>
            <button on:click={() => addTime(-5)} {disabled}>-5min</button>
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
