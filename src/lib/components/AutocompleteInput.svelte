<!-- Copyright 2023 RADar-AZDelta -->
<!-- SPDX-License-Identifier: gpl3+ -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import type { CustomOptionsEvents } from '../Types'
  import debounce from 'lodash.debounce'
  import { clickOutside } from '$lib/actions/clickOutside'

  export let id: string,
    list: Record<string, any> | undefined = undefined,
    initial: string | undefined = undefined

  let inputValue: string | null | undefined = initial ? initial : undefined,
    value: any,
    key: string,
    filteredValues: Map<string, any> = new Map(),
    autoCompleted: boolean = false,
    focus: boolean = false,
    suggestionsFocus: boolean = false

  const dispatch = createEventDispatcher<CustomOptionsEvents>()

  // A method for when the input needs to be saved, don't show an error because the user can be typing and can get frustrated with the error
  function save(): void {
    value = inputValue
    if (!list) return
    // The input value must be chosen from the list of values suggested
    if (Object.values(list).includes(value)) dispatch('autoComplete', { id, value, key })
  }

  // A method to apply a suggestion to the input field
  function onClickAutoComplete(e: Event): void {
    const element = e.target as HTMLLIElement
    inputValue = element.textContent
    key = element.id
    save()
    autoCompleted = true
  }

  // A method to search for suggestions to apply to the input field
  function filter(): void {
    filteredValues = new Map<string, any>()
    if (!inputValue || !list) return
    const pairs = Object.entries(list).filter(
      ([key, value]) =>
        (key.toLowerCase().includes(inputValue!.toLowerCase()) ||
          value.toLowerCase().includes(inputValue!.toLowerCase())) &&
        key.toLowerCase() !== inputValue?.toLowerCase() &&
        value.toLowerCase() !== inputValue?.toLowerCase()
    )
    if (!pairs.length) return
    for (let [key, value] of pairs) filteredValues.set(key, value)
  }

  const onInput = debounce(async (e): Promise<void> => {
    autoCompleted = false
    inputValue = e.target.value
    filter()
    save()
  }, 300)

  async function outClick() {
    suggestionsFocus = false
  }
</script>

<div data-name="autocomplete-input">
  <input
    title={id}
    type="text"
    bind:value={inputValue}
    on:input={onInput}
    on:focus={() => {
      focus = true
      suggestionsFocus = true
    }}
    on:focusout={() => {
      focus = false
    }}
  />
  {#if list && filteredValues.size > 0 && (focus || suggestionsFocus)}
    <ul use:clickOutside on:outClick={outClick}>
      {#each [...filteredValues] as [key, value], i}
        {#if i < 7 && !autoCompleted}
          <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
          <li id={key} on:click={onClickAutoComplete} on:keydown={onClickAutoComplete}>{key}</li>
        {/if}
      {/each}
    </ul>
  {/if}
</div>
