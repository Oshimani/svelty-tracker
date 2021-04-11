<script lang="ts">
    import { createEventDispatcher, onDestroy, onMount } from "svelte";
    import { fly, scale } from "svelte/transition";
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
    } from "@fortawesome/free-solid-svg-icons";

    import { tick } from "../store";
    import AddTime from "./AddTime.svelte";
    import { hideTarget, playSound } from "../stores/settings-store";

    const dispatch = createEventDispatcher();

    export let id: string;
    export let name: string;
    export let duration: number = 0;
    export let target: number = 0;
    export let active: boolean = false;

    export let draggable: boolean;

    $: durationFormatted = formatDate(duration);
    $: durationStyled = styleDate(durationFormatted);

    $: targetFormatted = formatDate(target);
    $: targetStyled = styleDate(targetFormatted);
    $: precentUsed =
        (duration / target) * 100 <= 100 ? (duration / target) * 100 : 100;

    let showAnimation: boolean = true;
    let inputValue: string = "";

    let unsubscribe;
    let audio;

    onMount(() => {
        inputValue = name;
        unsubscribe = tick.subscribe((_) => {
            if (active) intervalFunction();
        });

        if (active) start();
    });

    onDestroy(() => unsubscribe());

    function formatDate(value: number) {
        return new Date(value * 1000).toISOString().substr(11, 8);
    }

    function styleDate(value: string) {
        return `<strong>${value.substr(0, 5)}</strong>:${value.substr(6, 2)}`;
    }

    function start() {
        dispatch("start", { id });

        showAnimation = true;
        setTimeout(() => {
            showAnimation = false;
        }, 3000);
    }

    function reset() {
        duration = 0;
        dispatch("newDuration", { id, duration });
    }

    function intervalFunction() {
        duration++;
        dispatch("newDuration", { id, duration });

        // play audio when @ 100%
        if (target === duration && $playSound) {
            if (audio) audio.play();
        }
    }

    function addTime(amount: number) {
        duration += amount;
        dispatch("newDuration", { id, duration });
    }

    function handleStartClick() {
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

    function handleNameChanged() {
        dispatch("nameChange", { name: inputValue, id });
    }

    function handleDragStart(event) {
        dispatch("dragstart", { event });
    }

    function handleDrop(event) {
        dispatch("drop", { event });
    }
</script>

<li
    {draggable}
    on:dragstart={(e) => handleDragStart(e)}
    on:dragover|preventDefault={() =>{ return false}}
    on:drop|preventDefault={(e) => handleDrop(e)}
    class="py-2"
    transition:fly={{ y: -100, duration: 400, easing: backInOut }}
>
    <div
        class={`${
            target > 0 ? "rounded-b-none" : ""
        } flex-wrap px-4 py-2 bg-gray-50 dark:bg-gray-800 dark:text-gray-100 flex flex-row gap-4 shadow-md rounded justify-between items-center`}
    >
        <section class="flex flex-row gap-4 flex-grow">
            <!-- NAME -->
            <input
                class={`input flex-grow overflow-hidden`}
                type="text"
                bind:value={inputValue}
                on:change={() => handleNameChanged()}
            />

            <!-- RECORDING -->
            <div class="flex flex-col justify-center">
                {#if active}
                    <span class="relative flex h-4 w-4">
                        <span
                            class={`${
                                !showAnimation ? "hidden" : ""
                            } absolute animate-ping inline-flex h-full w-full rounded-full bg-red-500 opacity-75`}
                        />
                        <span
                            class="relative inline-flex rounded-full h-4 w-4 bg-red-600"
                        />
                    </span>
                {:else}
                    <span
                        class="relative inline-flex rounded-full h-4 w-4 bg-red-800 opacity-40"
                    />
                {/if}
            </div>
        </section>

        <section class="flex flex-row gap-4 justify-evenly w-full md:w-auto">
            <!-- TARGET -->
            {#if !$hideTarget}
                <div class={`${target === 0 ? "opacity-30" : ""}`}>
                    <Icon data={faCrosshairs} />
                    {@html targetStyled}
                </div>
            {/if}

            <!-- TIMER -->
            <div class={`${duration === 0 ? "opacity-30" : ""}`}>
                <Icon data={faHourglass} />
                {@html durationStyled}
            </div>
        </section>

        <!-- TIMER BUTTONS -->
        <div
            class="flex flex-row items-baseline gap-1 justify-evenly w-full md:w-auto"
        >
            <AddTime
                {duration}
                on:timeChange={(e) => addTime(e.detail.value)}
                manipulation="add"
            />
            <AddTime
                {duration}
                on:timeChange={(e) => addTime(e.detail.value)}
                manipulation="sub"
            />
        </div>

        <!-- BUTTONS -->
        <div class="flex flex-row gap-1 justify-evenly w-full md:w-auto">
            <button
                disabled={active}
                on:click={() => handleStartClick()}
                class={`btn primary-btn`}
            >
                <Icon data={faPlayCircle} /> Start
            </button>
            <button
                class={`btn secondary-btn`}
                on:click={() => handleResetClick()}
                ><Icon data={faUndo} /></button
            >
            <button
                class={`btn secondary-btn`}
                on:click={() => handleDeleteClick()}
                ><Icon data={faTrash} /></button
            >
        </div>
    </div>

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
</style>
