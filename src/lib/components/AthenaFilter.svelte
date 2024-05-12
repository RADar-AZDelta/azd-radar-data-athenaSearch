<!-- Copyright 2023 RADar-AZDelta -->
<!-- SPDX-License-Identifier: gpl3+ -->
<script lang="ts">
  import debounce from 'lodash.debounce'
  import SvgIcon from '$lib/components/SvgIcon.svelte'
  import type { IOptions, IAthenaFilterProps } from '$lib/interfaces/Types'

  let { filter, openedFilter = $bindable(), color, facets, athenaFilters, filtering }: IAthenaFilterProps = $props()

  let filterInput: string = $state('')
  let filteredFilterOptions: IOptions = filter.opts
  let sortedOptions: string[] = $state(filteredFilterOptions.options.sort(sorting))

  const onChange = debounce(async ({ target }): Promise<void> => updateOptionsFromFilter(target.value), 500)
  const showCategories = async () => (openedFilter = openedFilter === filter.name ? '' : filter.name)
  const removeInputFromFilter = async (): Promise<any> => ((filterInput = ''), (filteredFilterOptions = filter.opts))

  const updateOptionsFromFilter = async (input: string): Promise<void> => {
    const options = filter.opts.options.filter(op => op.toLowerCase().includes(input.toLowerCase()))
    const { altName, altNameFacet } = filter.opts
    filteredFilterOptions = { options: options, altName, altNameFacet }
    sortedOptions = filteredFilterOptions.options.sort(sorting)
  }

  function checkFilter(filter: string, altName: string | undefined, option: string): boolean {
    const chosen = athenaFilters.get(filter) ?? athenaFilters.get(altName ?? '')
    return chosen?.includes(option) ?? false
  }

  function sorting(a: any, b: any) {
    const { altNameFacet } = filter.opts
    const enableA = facets[altNameFacet].hasOwnProperty(a) && facets[altNameFacet][a] > 0
    const enableB = facets[altNameFacet].hasOwnProperty(b) && facets[altNameFacet][b] > 0
    if (enableA && !enableB) return -1
    else if (!enableA && enableB) return 1
    else if (!enableA && !enableB) return 0
    else if (a > b) return 1
    else return -1
  }
</script>

<div class="filter" class:open={openedFilter === filter.name}>
  <button title="Open filter {filter.name}" class="filter-button" onclick={showCategories}>
    <div class="filter-name">
      <!-- svelte-ignore element_invalid_self_closing_tag -->
      <span class="filter-color" style={`background-color: ${color};`} />
      <p>{filter.name !== 'Vocab' ? filter.name : filter.opts.altName}</p>
    </div>
    <SvgIcon id="updown" />
  </button>
  {#if openedFilter === filter.name}
    <div class="filter-item">
      <div class="filter-input-container">
        <input class="filter-input" title="Search" placeholder="Filter" bind:value={filterInput} oninput={onChange} />
        <button class="filter-item-button" title="Remove input filter" onclick={removeInputFromFilter}>
          <SvgIcon id="x" />
        </button>
      </div>
      {#each sortedOptions as option}
        {@const { name } = filter}
        {@const { altNameFacet, altName } = filter.opts}
        <div class="filter-option">
          {#if facets[altNameFacet].hasOwnProperty(option) && facets[altNameFacet][option] > 0}
            {@const title = 'Activate/deactivate filter'}
            {@const checked = checkFilter(name, altName, option)}
            <input class="filter-option-input" id={option} type="checkbox" {title} {checked} onclick={e => filtering(e, altName, option)} />
            <label class="filter-option-label" for={option}>{option.replaceAll('/', ' / ')}</label>
          {:else}
            <input class="filter-option-input disabled" id={option} type="checkbox" disabled />
            <label class="filter-option-label disabled" for={option}>{option.replaceAll('/', ' / ')}</label>
          {/if}
        </div>
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

  .filter-input {
    border-radius: 5px;
    width: 80%;
    max-width: 250px;
    padding: 0.5rem;
    max-width: 80%;
    min-width: 50%;
    margin-left: 0.5rem;
    border: 1px solid #d8d8d8;
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

  p {
    margin: 0;
  }

  .filter-option {
    display: flex;
    justify-content: start;
    align-items: center;
    gap: 1rem;
    padding: 0 0 0 0.5rem;
  }

  .filter-option-input {
    border: 1px solid #d8d8d8;
  }

  .filter-option-input:hover {
    cursor: pointer;
    border: 1px solid #bbbbbb;
  }

  .filter-option-input:focus {
    outline: none;
    box-shadow: 0 0 0 2px #c5c5c5;
  }

  .filter-option-label {
    max-width: 80%;
  }

  .disabled {
    color: lightgray;
  }
</style>
