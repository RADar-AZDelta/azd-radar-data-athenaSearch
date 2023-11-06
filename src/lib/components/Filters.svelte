<script lang="ts">
  import SvgIcon from './SvgIcon.svelte'
  import filters from '$lib/config/filters.json'
  import type { CustomOptionsEvents, IOptions } from '$lib/Types'
  import AthenaFilter from './AthenaFilter.svelte'
  import { createEventDispatcher } from 'svelte'

  export let facets: Record<string, any> | undefined, athenaFilters: Map<string, string[]>

  const dispatch = createEventDispatcher<CustomOptionsEvents>()

  let show: boolean = false
  let JSONFilters = new Map<string, IOptions>([])
  let openedFilter: string
  let colors: Record<string, string> = {
    domain: '#ec3d31',
    concept: '#50a5ba',
    class: '#6967d2',
    vocab: '#ffa200',
    validity: '#ad007c',
  }
  let filterNames: Record<string, string> = {
    domain: 'domain',
    standardConcept: 'concept',
    conceptClass: 'class',
    Vocabulary: 'vocab',
    invalidReason: 'validity',
  }

  for (let filter of filters) {
    JSONFilters.set(filter.name, {
      altName: filter.altName,
      altNameFacet: filter.altNameFacet,
      options: filter.options,
    })
  }

  async function sideVisibilityChange(value: boolean) {
    show = value
  }

  // A method to check if the filter is already applied to the API call
  function checkFilter(filter: string, altName: string | undefined, option: string): boolean {
    let allFilters: Map<string, string[]> = athenaFilters
    const chosenFilter = !allFilters.get(filter)
      ? altName
        ? allFilters.get(altName)
        : undefined
      : allFilters.get(filter)

    return chosenFilter && chosenFilter?.includes(option) ? true : false
  }

  // A method to delete a filter when a filter for the Athena API call is removed in the section "Activated filters"
  function removeFilter(filter: string, option: string): void {
    athenaFilters.get(filter)!.splice(athenaFilters.get(filter)!.indexOf(option), 1)
    athenaFilters = athenaFilters
    dispatch('updateFilters', { athenaFilters })
  }

  // A method to update the API filters applied on the API call for Athena
  const updateAPIFilters = async (event: Event, filter: string, option: string): Promise<void> => {
    let chosenFilter = athenaFilters.get(filter)
    const inputValue = (event.target as HTMLInputElement).checked
    // If the filter is checked, add it
    if (chosenFilter && inputValue) chosenFilter.push(option)
    else if (chosenFilter && !inputValue && chosenFilter.includes(option)) {
      // If the filter is unchecked and was already in the list, remove it
      chosenFilter.splice(chosenFilter.indexOf(option), 1)
      if (!chosenFilter.length) athenaFilters.delete(filter)
      else athenaFilters.set(filter, chosenFilter)
    } else athenaFilters.set(filter, [option])
    athenaFilters = athenaFilters
    dispatch('updateFilters', { athenaFilters })
  }
</script>

{#if show}
  <section class="filters-container">
    <div class="filters-head">
      <h2 class="filters-title">Filters</h2>
      <button class="filters-button" on:click={() => sideVisibilityChange(false)} id="filters">
        <SvgIcon href="/icons.svg" id="chevrons-left" width="16px" height="16px" />
      </button>
    </div>
    <div class="choice-filters">
      {#each [...JSONFilters] as [key, opt]}
        {#if facets && facets[opt.altNameFacet]}
          <AthenaFilter filter={{ name: key, opts: opt }} bind:openedFilter color={colors[key.toLowerCase()]}>
            <div slot="option" class="filter-option" let:option>
              {#if facets[opt.altNameFacet].hasOwnProperty(option) && facets[opt.altNameFacet][option] > 0}
                <input
                  id={option}
                  class="filter-option-input"
                  type="checkbox"
                  title="Activate/deactivate filter"
                  checked={checkFilter(key, opt.altName, option)}
                  on:click={e => updateAPIFilters(e, opt.altName, option)}
                />
                <label class="filter-option-label" for={option}>{option.replaceAll('/', ' / ')}</label>
              {/if}
            </div>
          </AthenaFilter>
        {/if}
      {/each}
      <div class="activated-filters">
        {#each [...athenaFilters] as [filter, values], _}
          {#each values as value}
            <div class="activated-filter" id={value} style={`background-color: ${colors[filterNames[filter]]}`}>
              <button class="activated-filter-button" on:click={() => removeFilter(filter, value)}>
                <SvgIcon href="/icons.svg" id="x" width="16px" height="16px" />
              </button>
              <p class="activated-filter-name">{value}</p>
            </div>
          {/each}
        {/each}
      </div>
    </div>
  </section>
{:else}
  <div class="sidebar-right">
    <button class="closed-bar" on:click={() => sideVisibilityChange(true)}>
      <SvgIcon href="/icons.svg" id="chevrons-right" width="16px" height="16px" />
      <p>F</p>
      <p>I</p>
      <p>L</p>
      <p>T</p>
      <p>E</p>
      <p>R</p>
      <p>S</p>
      <SvgIcon href="/icons.svg" id="chevrons-right" width="16px" height="16px" />
    </button>
  </div>
{/if}

<style>
  .filters-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-width: 15%;
    padding: 0 0.5rem 0 1.5rem;
    border-right: 1px solid lightgray;
  }

  .filters-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 0;
  }

  .filters-title {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0;
  }

  .filters-button {
    background-color: inherit;
    cursor: pointer;
    border: none;
  }

  .choice-filters {
    flex: 1 1 auto;
  }

  .activated-filters {
    max-height: 30%;
    overflow-y: auto;
    margin-top: 1rem;
  }

  .activated-filter {
    margin-bottom: 0.5rem;
    display: flex;
    gap: 1rem;
    align-items: center;
    padding: 0.5rem 0.5rem;
    border-radius: 10px;
    color: white;
    margin: 1rem 0;
  }

  .activated-filter-button {
    background-color: inherit;
    border: none;
    color: white;
    cursor: pointer;
    padding: 0;
  }

  .activated-filter-button:hover {
    background-color: #d8d8d8;
  }

  .activated-filter-button:focus {
    outline: none;
    box-shadow: 0 0 0 2px #c5c5c5;
  }

  .activated-filter-name {
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

  .sidebar-right {
    height: 100%;
    border-right: 1px solid var(--neutral);
    padding: 0.5rem;
  }

  .closed-bar {
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    cursor: pointer;
    border: none;
    background-color: inherit;
    font-weight: bold;
  }
</style>
