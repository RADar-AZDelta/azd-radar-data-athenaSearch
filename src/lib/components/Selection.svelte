<!-- Copyright 2023 RADar-AZDelta -->
<!-- SPDX-License-Identifier: gpl3+ -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import type { CustomOptionsEvents, IView } from '$lib/Types'

  export let views: IView[] = []

  const expandedViews: IView[] = [{ name: 'Athena concepts', value: 'athena', viewSlot: 'slotView0' }, ...views]

  let conceptSelection: string = 'athena'

  const dispatch = createEventDispatcher<CustomOptionsEvents>()

  $: {
    conceptSelection
    dispatch('viewChanged', { view: conceptSelection })
  }
</script>

<div class="concept-choice">
  {#each expandedViews as view}
    <button class="concept-choice-button">
      <input
        class="concept-choice-input"
        type="radio"
        bind:group={conceptSelection}
        id={view.value}
        name="concept-type"
        value={view.viewSlot}
      />
      <label class="concept-choice-label" for={view.value}>{view.name}</label>
    </button>
  {/each}
</div>

<style>
  .concept-choice {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 2rem 1rem 2rem;
  }

  .concept-choice-button {
    width: 45%;
    border: 1px solid #d8d8d8;
    border-radius: 5px;
    background-color: inherit;
    cursor: pointer;
    display: flex;
    padding: 0;
  }

  .concept-choice-button:has(input[type='radio'].checked) {
    background-color: #cecece;
  }

  .concept-choice-button:hover {
    background-color: #d8d8d8;
  }

  .concept-choice-button:active {
    outline: none;
    box-shadow: 0 0 0 2px #c5c5c5;
  }

  .concept-choice-input {
    display: none;
  }

  .concept-choice-label {
    text-align: center;
    width: 100%;
    height: 100%;
    padding: 0.5rem 0;
    cursor: pointer;
  }
</style>
