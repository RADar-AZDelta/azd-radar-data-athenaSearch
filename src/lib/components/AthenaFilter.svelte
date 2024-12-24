<!-- Copyright 2023 RADar-AZDelta -->
<!-- SPDX-License-Identifier: gpl3+ -->
<script lang="ts">
  import { debounce } from '../helpers/utils'
  import SvgIcon from '../components/SvgIcon.svelte'
  import type { IOptions, IAthenaFilterProps } from '../interfaces/Types'

  let { filter, openedFilter = $bindable(), color, athenaFilters, filtering }: IAthenaFilterProps = $props()

  let filterInput: string = $state('')
  let filteredFilterOptions: IOptions = filter.opts
  const sorting = (a: string, b: string) => (a > b ? 1 : -1)
  let sortedOptions: string[] = $state(filteredFilterOptions.options.sort(sorting))

  const onChange = debounce(async ({ target }): Promise<void> => updateOptionsFromFilter(target.value), 500)
  const showCategories = async () => (openedFilter = openedFilter === filter.name ? '' : filter.name)
  const removeInputFromFilter = async (): Promise<any> => ((filterInput = ''), (filteredFilterOptions = filter.opts))

  // Filter the shown filters with the typed value
  const updateOptionsFromFilter = async (input: string): Promise<void> => {
    const options = filter.opts.options.filter(op => op.toLowerCase().includes(input.toLowerCase()))
    const { altName, altNameFacet } = filter.opts
    filteredFilterOptions = { options, altName, altNameFacet }
    sortedOptions = options.sort(sorting)
  }

  // Check if the filter is active on the filter name or alternative name
  function checkFilter(filter: string, altName: string | undefined, option: string): boolean {
    const chosen = athenaFilters.get(filter) ?? athenaFilters.get(altName ?? '')
    return chosen?.includes(option) ?? false
  }

  // Filter the table with the option (name of option) & alternative name
  function filterTable(e: Event, altName: string, option: string) {
    const checked = (e.target as HTMLInputElement).checked
    filtering(checked, altName, option)
  }
</script>

{#if filter.opts.options.length}
  <div class="filter" class:open={openedFilter === filter.name}>
    <button title="Open filter {filter.name}" class="filter-button" onclick={showCategories}>
      <div class="filter-name">
        <!-- svelte-ignore element_invalid_self_closing_tag -->
        <span class="filter-color" style={`background-color: ${color};`} />
        <p>{filter.name !== 'Vocab' ? filter.name : 'Vocabulary'}</p>
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
          {@const { altName } = filter.opts}
          {@const title = 'Activate/deactivate filter'}
          {@const checked = checkFilter(name, altName, option)}
          <div class="filter-option">
            <input class="filter-option-input" id={option} type="checkbox" {title} {checked} onclick={e => filterTable(e, altName, option)} />
            <label class="filter-option-label" for={option}>{option.replaceAll('/', ' / ')}</label>
          </div>
        {/each}
      </div>
    {/if}
  </div>
{/if}

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
</style>
