<script lang="ts">
    import { createEventDispatcher, onMount } from "svelte";
    import { fly, scale } from "svelte/transition";
    import { flip } from "svelte/animate";
    import { backInOut } from "svelte/easing";

    import Icon from "svelte-awesome";
    import {
        faHourglass,
        faPlayCircle,
    } from "@fortawesome/free-regular-svg-icons";
    import {
        faUndo,
        faTrash,
        faCrosshairs,
        faPlus,
    } from "@fortawesome/free-solid-svg-icons";
    import type { ITracker } from "../models/ITracker";
    import { hideTarget } from "../stores/settings-store";

    import { formatDate, styleDate } from "../utils/date-fns";
    import Tracker from "./Tracker.svelte";
    import Form from "./Form.svelte";

    const dispatch = createEventDispatcher();

    export let trackers: ITracker[] = [];
    export let id: string;
    export let name: string;
    export let duration: number = 0;
    export let target: number = 0;
    export let active: boolean = false;

    export let draggable: boolean;

    $: sum = trackers.reduce((acc, tracker) => acc + tracker.duration, 0);
    $: sumFormatted = formatDate(sum);
    $: sumStyled = styleDate(sumFormatted);

    $: targetFormatted = formatDate(target);
    $: targetStyled = styleDate(targetFormatted);
    $: precentUsed =
        (duration / target) * 100 <= 100 ? (duration / target) * 100 : 100;

    let inputValue: string = "";
    let audio;

    onMount(() => {
        inputValue = name;
    });

    function handleDeleteClick() {
        if (confirm(`Delete ${name}?`)) {
            dispatch("delete", { id });
        }
    }

    function handleTrackerStartTracking(id: string) {
        // stop all
        dispatch("stopCounting", { id });
        // restart current
        const i = trackers.findIndex((t) => t.id === id);
        if (i > -1) {
            trackers[i].active = true;
        }
        trackers = [...trackers];
    }
</script>

<!-- TRACKER LIST -->
<li
    {draggable}
    on:dragstart={(event) => dispatch("dragstart",  event )}
    on:dragover|preventDefault={() => false}
    on:drop|preventDefault={(event) => dispatch("drop",  event )}
    class="py-2"
    transition:fly={{ y: -100, duration: 400, easing: backInOut }}
>
    <div
        class={`${
            target > 0 ? "rounded-b-none" : ""
        } flex-wrap px-4 py-2 bg-gray-50 dark:bg-gray-800 dark:text-gray-100 flex flex-row gap-4 shadow-md rounded justify-between items-center`}
    >
        <input
            class={`input flex-grow overflow-hidden`}
            type="text"
            bind:value={inputValue}
            on:change={() => dispatch("nameChange", { name: inputValue, id })}
        />

        <!-- TIME DISPLAY -->
        <section class="flex flex-row gap-4 justify-evenly w-full md:w-auto">
            <!-- TARGET -->
            {#if !$hideTarget}
                <div
                    class={`${
                        target === 0 ? "opacity-30" : ""
                    } flex flex-row gap-1`}
                >
                    <div class="flex items-center">
                        <Icon data={faCrosshairs} />
                    </div>
                    {@html targetStyled}
                </div>
            {/if}

            <!-- TIMER -->
            <div
                class={`${
                    duration === 0 ? "opacity-30" : ""
                } flex flex-row gap-1`}
            >
                <div class={`${active ? "spin" : ""} flex items-center`}>
                    <Icon data={faHourglass} />
                </div>
                {@html sumStyled}
            </div>
        </section>

        <!-- DELETE BUTTON -->
        <section class="flex flex-row gap-1 justify-evenly w-full md:w-auto">
            <button disabled class={`btn secondary-btn`} on:click={() => false}
                ><Icon data={faUndo} /></button
            >
            <button
                class={`btn secondary-btn`}
                on:click={() => handleDeleteClick()}
                ><Icon data={faTrash} /></button
            >
        </section>
    </div>

    <!-- TRACKERS -->
    <ul>
        {#each trackers as tracker, index (tracker.id)}
            <div animate:flip={{ easing: backInOut, duration: 400 }}>
                <Tracker
                    {...tracker}
                    draggable={true}
                    on:delete={(e) =>
                        dispatch("trackerDelete", {
                            trackerId: e.detail.id,
                            groupId: id,
                        })}
                    on:start={(e) => handleTrackerStartTracking(e.detail.id)}
                    on:newDuration={(e) =>
                        dispatch("trackerPropChange", {
                            key: "duration",
                            value: e.detail.duration,
                            trackerId: e.detail.id,
                            groupId: id,
                        })}
                    on:nameChange={(e) =>
                        dispatch("trackerPropChange", {
                            key: "name",
                            value: e.detail.name,
                            trackerId: e.detail.id,
                            groupId: id,
                        })}
                    on:dragstart={(e) => {
                        dispatch("trackerDragStart", {
                            event: e,
                            trackerId: tracker.id,
                            groupId: id,
                        });
                    }}
                    on:drop={(e) => {
                        dispatch("trackerDrop", {
                            event: e,
                            trackerId: tracker.id,
                            groupId: id,
                        });
                    }}
                />
            </div>
        {/each}
    </ul>

    <!-- NEW FORM -->
    <Form
        type="tracker"
        on:newTracker={(e) =>
            dispatch("addTracker", { tracker: e.detail.tracker, id })}
    />

    <!-- PROGRESS BAR -->
    <div class="relative">
        <div class="overflow-hidden h-1 w-full rounded-b">
            <div
                transition:scale
                style={`width: ${precentUsed}%`}
                class={`${
                    target ? "" : "hidden"
                } prog-bar h-1 bg-blue-600 bg-gradient-to-r dark:from-purple-600 dark:via-red-500 dark:to-yellow-400`}
            />
        </div>
    </div>

    <audio bind:this={audio} src="assets/audio/alert.mp3" />
</li>

<style>
    .prog-bar {
        -webkit-transition: width 1s linear;
        -moz-transition: width 1s linear;
        -o-transition: width 1s linear;
        transition: width 1s linear;
    }
    .spin {
        animation-name: spin;
        animation-duration: 2000ms;
        animation-iteration-count: infinite;
    }
    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }
        50% {
            transform: rotate(180deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }
</style>
