<script lang="ts">
    import { faMinus, faPlus } from "@fortawesome/free-solid-svg-icons";
    import Icon from "svelte-awesome";

    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();
    export let unit: string;
    export let addAmount: number = 1;
    let duration: number = 0;

    $: disabled = duration - addAmount < 0;
    $: durationInSeconds = () => {
        switch (unit) {
            case "hours":
                return duration * 60 * 60;
            case "minutes":
                return duration * 60;
            default:
                return duration;
        }
    };

    function onAddTime(amount: number) {
        duration = +duration + +amount;
        onChange();
    }

    function onChange() {
        dispatch("change", { duration: durationInSeconds() });
    }
</script>

<div class="flex flex-col gap-2">
    <p class="text-xs text-center dark:text-gray-100 lowercase">
        {unit}
    </p>

    <button
        class={`btn secondary-btn w-16`}
        on:click|preventDefault={() => onAddTime(addAmount)}
        ><Icon data={faPlus} /></button
    >
    <input
        class={`input text-center w-16`}
        placeholder={unit}
        bind:value={duration}
        on:change={() => onChange()}
        type="number"
        step="1"
        min="0"
    />
    <button
        {disabled}
        class={`btn secondary-btn w-16`}
        on:click|preventDefault={() => onAddTime(addAmount * -1)}
        ><Icon data={faMinus} /></button
    >
</div>

<style>
    /* Chrome, Safari, Edge, Opera */
    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }

    /* Firefox */
    input[type="number"] {
        -moz-appearance: textfield;
    }
</style>
