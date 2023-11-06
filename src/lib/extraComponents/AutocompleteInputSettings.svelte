<!-- Copyright 2023 RADar-AZDelta -->
<!-- SPDX-License-Identifier: gpl3+ -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import type { CustomOptionsEvents } from '../Types'
  import debounce from 'lodash.debounce'

  let inputValue: string,
    value: string,
    filteredValues: string[] = [],
    autoCompleted: boolean = false

  const dispatch = createEventDispatcher<CustomOptionsEvents>()

  // A method for when the input needs to be saved
  function save(): void {}

  // A method to apply a suggestion to the input field
  function onClickAutoComplete(e: Event): void {
    inputValue = (e.target as HTMLLIElement).id
    save()
    filterNames()
    autoCompleted = true
  }

  // A method to search for suggestions to apply to the input field
  function filterNames(): void | string[] {}

  // A method to save the input value to the settings and apply as assigned reviewer
  const onInput = debounce(async (e: any): Promise<void> => {
    autoCompleted = false
    save()
  }, 500)

  $: {
    inputValue
    filterNames()
  }
</script>

<div data-name="autocomplete-input">
  <input title="Assigned Reviewer" type="text" bind:value={inputValue} on:input={onInput} />
  {#if filteredValues.length > 0}
    <ul>
      {#each filteredValues as name, i}
        {#if i < 7 && !autoCompleted}
          <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
          <li id={name} on:click={onClickAutoComplete} on:keydown={onClickAutoComplete}>{name}</li>
        {/if}
      {/each}
    </ul>
  {/if}
</div>
