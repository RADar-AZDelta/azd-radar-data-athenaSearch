<!-- Copyright 2023 RADar-AZDelta -->
<!-- SPDX-License-Identifier: gpl3+ -->
<script lang="ts">
  import debounce from 'lodash.debounce'
  import SvgIcon from '$lib/components/SvgIcon.svelte'
  import type { IOptions, IFilter } from '$lib/Types'

  export let filter: IFilter, openedFilter: string, color: string
  let filterInput: string,
    filteredFilterOptions: IOptions = filter.opts

  // A method for when the input (search for a filter) has changed
  const onChange = debounce(async (e: any): Promise<void> => {
    updateOptionsFromFilter((e.target as HTMLInputElement).value)
  }, 500)

  // A method to change the section that needs to be opened
  const showCategories = async (): Promise<void> => {
    openedFilter = openedFilter === filter.name ? '' : filter.name
  }

  // A method to remove the criteria from the input field to search for a filter
  const removeInputFromFilter = async (): Promise<void> => {
    filterInput = ''
    filteredFilterOptions = filter.opts
  }

  // A method to update the filters with a certain criteria
  const updateOptionsFromFilter = async (input: string): Promise<void> => {
    const options = filter.opts.options.filter(op => op.toLowerCase().includes(input.toLowerCase()))
    filteredFilterOptions = {
      options: options,
      altName: filter.opts.altName,
      altNameFacet: filter.opts.altNameFacet,
    }
  }
</script>

<div class="filter">
  <button title="Open filter {filter.name}" class="filter-button" on:click={showCategories}>
    <div class="filter-name">
      <span class="filter-color" style={`background-color: ${color};`} />
      <p>{filter.name !== 'Vocab' ? filter.name : filter.opts.altName}</p>
    </div>
    <SvgIcon id="updown" />
  </button>
  {#if openedFilter == filter.name}
    <div class="filter-item">
      <div class="filter-input-container">
        <input
          class="filter-input"
          title="Search for filter"
          placeholder="Filter"
          bind:value={filterInput}
          on:input={onChange}
        />
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

  .filter-button {
    width: 100%;
    /* height: 100%; */
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 1rem;
    border: none;
    background-color: #e2e2e2;
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
    overflow-y: auto;
    overflow-x: hidden;
  }

  .filter-input-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 0.5rem;
    width: 100%;
    margin-top: 1rem;
    gap: 0.5rem;
  }

  .filter-input {
    border-radius: 5px;
    padding: 0.5rem;
    max-width: 80%;
    min-width: 50%;
    margin-left: 0.5rem;
    border: 1px solid #d8d8d8;
    font-size: 1rem;
  }

  .filter-input:hover {
    border: 1px solid #bbbbbb;
  }

  .filter-input:focus {
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
</style>
