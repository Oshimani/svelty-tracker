<script lang="ts">
    import { createEventDispatcher, onDestroy, onMount } from "svelte";
    import { fly } from "svelte/transition";
    import { backInOut } from "svelte/easing";

    import Icon from "svelte-awesome";
    import {
        faHourglass,
        faPlayCircle,
    } from "@fortawesome/free-regular-svg-icons";
    import { faUndo, faTrash } from "@fortawesome/free-solid-svg-icons";

    import { tick } from "./store";
    import AddTime from "./components/AddTime.svelte";
    import {
        BUTTON,
        INPUT,
        PRIMARY_BUTTON,
        SECONDARY_BUTTON,
    } from "./styles/theme";

    const dispatch = createEventDispatcher();

    export let id: string;
    export let name: string;
    export let duration: number = 0;
    export let target: number = 0;
    export let active: boolean = false;

    $: disabled = duration < 5 * 60;
    $: durationFormatted = new Date(duration * 1000)
        .toISOString()
        .substr(11, 8);
    $: durationStyled = `<strong>${durationFormatted.substr(
        0,
        5
    )}</strong>:${durationFormatted.substr(6, 2)}`;

    let showAnimation: boolean = true;
    let inputValue: string = "";

    let unsubscribe;
    onMount(() => {
        inputValue = name;
        unsubscribe = tick.subscribe((_) => {
            if (active) intervalFunction();
        });

        if (active) start();
    });
    onDestroy(() => unsubscribe());

    function start() {
        dispatch("start", { id });

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
        dispatch("newDuration", { id, duration });
    }

    function intervalFunction() {
        duration++;
        dispatch("newDuration", { id, duration });
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
</script>

<li class="py-2" transition:fly={{ y: -100, duration: 400, easing: backInOut }}>
    <div
        class="px-4 py-2 bg-gray-50 dark:bg-gray-800 dark:text-gray-100 flex flex-row shadow-md rounded gap-4 justify-between items-center"
    >
        <!-- NAME -->
        <input
            class={`${INPUT} flex-grow`}
            type="text"
            bind:value={inputValue}
            on:change={() => handleNameChanged()}
        />

        <!-- RECORDING -->
        <div>
            {#if active}
                <span class="relative flex h-4 w-4">
                    <span
                        class:hidden={!showAnimation}
                        class="absolute animate-ping inline-flex h-full w-full rounded-full bg-red-500 opacity-75"
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

        <!-- TIMER -->
        <div class=" items-baseline">
            <Icon data={faHourglass} />
            {@html durationStyled}
        </div>
        <div class="flex flex-row items-baseline gap-1">
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
        <div class="">
            <button
                disabled={active}
                on:click={() => handleStartClick()}
                class={`${BUTTON} ${PRIMARY_BUTTON}`}
            >
                <Icon data={faPlayCircle} /> Start
            </button>
            <button
                class={`${BUTTON} ${SECONDARY_BUTTON}`}
                on:click={() => handleResetClick()}
                ><Icon data={faUndo} /></button
            >
            <button
                class={`${BUTTON} ${SECONDARY_BUTTON}`}
                on:click={() => handleDeleteClick()}
                ><Icon data={faTrash} /></button
            >
        </div>
    </div>
</li>
