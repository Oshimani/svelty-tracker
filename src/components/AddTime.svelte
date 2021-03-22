<script lang="ts">
    import { fade } from "svelte/transition";
    import { sineInOut } from "svelte/easing";
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();

    export let manipulation: "add" | "sub";
    export let duration: number;

    let threshold: number = 180;
    let showButtons: boolean = false;
    let timeout: number;

    const topButtonValue: number = 1 * 60 * 60; // 1h
    const centerButtonValue: number = 15 * 60; // 15min
    const buttonButtonValue: number = 5 * 60; // 5min

    $: sign = manipulation === "add" ? "+" : "-";

    function handleMouseEnter() {
        timeout = setTimeout(() => {
            showButtons = true;
        }, threshold);
    }
    function handleMouseLeave() {
        clearInterval(timeout);
        showButtons = false;
        timeout = undefined;
    }

    function handleClick(value) {
        if (manipulation === "sub") value = 0 - value;
        dispatch("timeChange", { value });
    }
</script>

<section
    class="relative"
    on:mouseenter={() => handleMouseEnter()}
    on:mouseleave={() => handleMouseLeave()}
>
    {#if showButtons}
        <button
            disabled={manipulation === "sub" && topButtonValue > duration}
            on:click={() => handleClick(topButtonValue)}
            transition:fade={{ duration: 120, easing: sineInOut }}
            class={`btn secondary-btn absolute shadow-md bottom-10 z-20`}
            >{sign}1h</button
        >
    {/if}

    <div>
        <button
            class={`btn secondary-btn`}
            disabled={manipulation === "sub" && centerButtonValue > duration}
            on:click={() => handleClick(centerButtonValue)}
            class:shadow-md={showButtons}>{sign}15min</button
        >
    </div>

    {#if showButtons}
        <button
            disabled={manipulation === "sub" && buttonButtonValue > duration}
            on:click={() => handleClick(buttonButtonValue)}
            transition:fade={{ duration: 120, easing: sineInOut }}
            class={`btn secondary-btn absolute shadow-md top-10 z-20`}
            >{sign}5min</button
        >
    {/if}
</section>

<style>
    button {
        min-width: 86.9219px;
    }
</style>
