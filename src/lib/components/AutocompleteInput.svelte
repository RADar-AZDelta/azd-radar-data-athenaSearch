<!-- Copyright 2023 RADar-AZDelta -->
<!-- SPDX-License-Identifier: gpl3+ -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import debounce from 'lodash.debounce'
  import type { CustomOptionsEvents } from '$lib/Types'
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

  async function onFocus() {
    focus = true
    suggestionsFocus = true
  }

  async function onFocusOut() {
    focus = false
  }
</script>

<div>
  <input
    class="autocomplete-input"
    title={id}
    bind:value={inputValue}
    on:input={onInput}
    on:focus={onFocus}
    on:focusout={onFocusOut}
  />
  {#if list && filteredValues.size > 0 && (focus || suggestionsFocus)}
    <ul class="autocomplete-list" use:clickOutside on:outClick={outClick}>
      {#each [...filteredValues] as [key, value], i}
        {#if i < 7 && !autoCompleted}
          <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
          <li class="autocomplete-item" id={key} on:click={onClickAutoComplete} on:keydown={onClickAutoComplete}>
            {key}
          </li>
        {/if}
      {/each}
    </ul>
  {/if}
</div>

<style>
  .autocomplete-input {
    border: 1px solid #d8d8d8;
  }

  .autocomplete-input:hover {
    border: 1px solid #bbbbbb;
  }

  .autocomplete-input:focus {
    outline: none;
    box-shadow: 0 0 0 2px #c5c5c5;
  }

  .autocomplete-list {
    list-style-type: none;
    padding: 0.5rem 0 2rem 0;
    margin: 0;
    position: absolute;
  }

  .autocomplete-item {
    border-top: 1px solid #cecece;
    border-left: 1px solid #cecece;
    border-right: 1px solid #cecece;
    padding: 0.5rem 1rem;
    background-color: white;
    cursor: pointer;
  }

  .autocomplete-item:last-child {
    border: 1px solid #cecece;
  }

  .autocomplete-item:hover {
    background-color: #e2e2e2;
  }

  .autocomplete-input:focus {
    outline: none;
    box-shadow: 0 0 0 2px #c5c5c5;
  }
</style>
