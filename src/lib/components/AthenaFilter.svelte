<!-- Copyright 2023 RADar-AZDelta -->
<!-- SPDX-License-Identifier: gpl3+ -->
<script lang="ts">
  import { base } from '$app/paths'
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

<div data-name="filter">
  <button title="Open filter {filter.name}" data-name="filter-button" on:click={showCategories}>
    <div data-name="filter-name">
      <span data-name="filter-color" style={`background-color: ${color};`} />
      <p>{filter.name !== 'Vocab' ? filter.name : filter.opts.altName}</p>
    </div>
    <SvgIcon href="{base}/icons.svg" id="updown" width="16px" height="16px" />
  </button>
  {#if openedFilter == filter.name}
    <div data-name="filter-item">
      <div data-name="filter-input">
        <input
          type="text"
          title="Search for filter"
          placeholder="Filter"
          data-name={filter.name}
          bind:value={filterInput}
          on:input={onChange}
        />
        <button title="Remove input filter" on:click={removeInputFromFilter}>
          <SvgIcon href="{base}/icons.svg" id="x" height="16px" width="16px" />
        </button>
      </div>
      {#each filteredFilterOptions.options as option}
        <slot name="option" {option} />
      {/each}
    </div>
  {/if}
</div>
