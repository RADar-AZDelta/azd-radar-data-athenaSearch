<!-- Copyright 2023 RADar-AZDelta -->
<!-- SPDX-License-Identifier: gpl3+ -->
<script lang="ts">
  import debounce from 'lodash.debounce'
  import SvgIcon from '$lib/components/SvgIcon.svelte'
  import type { IOptions, IFilter } from '$lib/Types'

  export let filter: IFilter, openedFilter: string, color: string

  let filterInput: string
  let filteredFilterOptions: IOptions = filter.opts

  // When the input (search for a filter) has changed
  const onChange = debounce(async (e: any): Promise<void> => {
    updateOptionsFromFilter((e.target as HTMLInputElement).value)
  }, 500)

  // Change the section that needs to be opened
  const showCategories = async () => (openedFilter = openedFilter === filter.name ? '' : filter.name)

  // Remove the criteria from the input field to search for a filter
  const removeInputFromFilter = async (): Promise<void> => {
    filterInput = ''
    filteredFilterOptions = filter.opts
  }

  // A method to update the filters with a certain criteria
  const updateOptionsFromFilter = async (input: string): Promise<void> => {
    const options = filter.opts.options.filter(op => op.toLowerCase().includes(input.toLowerCase()))
    const { altName, altNameFacet } = filter.opts
    filteredFilterOptions = { options: options, altName, altNameFacet }
  }
</script>

<div class="filter" class:open={openedFilter === filter.name}>
  <button title="Open filter {filter.name}" class="filter-button" on:click={showCategories}>
    <div class="filter-name">
      <span class="filter-color" style={`background-color: ${color};`} />
      <p>{filter.name !== 'Vocab' ? filter.name : filter.opts.altName}</p>
    </div>
    <SvgIcon id="updown" />
  </button>
  {#if openedFilter === filter.name}
    <div class="filter-item">
      <div class="filter-input-container">
        <input title="Search for filter" placeholder="Filter" bind:value={filterInput} on:input={onChange} />
        <button class="filter-item-button" title="Remove input filter" on:click={removeInputFromFilter}>
          <SvgIcon id="x" />
        </button>
      </div>
      {#each filteredFilterOptions.options as option}
        <slot name="option" {option} />
      {/each}
    </div>
  {/if}
</div>

<style>
  .filter {
    margin-top: 1rem;
    border: 1px solid lightgray;
    border-radius: 5px;
  }

  .open {
    border-radius: 5px 5px 0 0;
  }

  .filter-button {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem;
    border: none;
    border-radius: 0;
    background-color: #e2e2e2;
  }

  .filter-button:focus {
    outline: none;
  }

  .filter-button:hover {
    background: #d8d8d8;
  }

  .filter-button:focus {
    outline: none;
    box-shadow: 0 0 0 2px #c5c5c5;
  }

  .filter-name {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .filter-color {
    width: 12px;
    height: 12px;
    border-radius: 100%;
  }

  .filter-item {
    max-height: 250px;
    margin-top: 0.2rem;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .filter-input-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 0.5rem;
    margin-top: 1rem;
    gap: 0.5rem;
  }

  input {
    border-radius: 5px;
    width: 80%;
    max-width: 250px;
    padding: 0.5rem;
    max-width: 80%;
    min-width: 50%;
    margin-left: 0.5rem;
    border: 1px solid #d8d8d8;
  }

  input:hover {
    border: 1px solid #bbbbbb;
  }

  input:focus {
    outline: none;
    box-shadow: 0 0 0 2px #bbbbbb;
  }

  .filter-item-button {
    border: none;
    background-color: inherit;
    color: #4f4f4f;
  }

  .filter-item-button:hover {
    color: #3b3b3b;
  }

  .filter-item-button:focus {
    outline: none;
    box-shadow: 0 0 0 2px #cecece;
  }

  p {
    margin: 0;
  }
</style>
