<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import filters from '$lib/config/filters.json'
  import filterConfig from '$lib/config/filterConfig.json'
  import SvgIcon from '$lib/components/SvgIcon.svelte'
  import AthenaFilter from '$lib/components/AthenaFilter.svelte'
  import type { CustomOptionsEvents } from '$lib/Types'

  export let facets: Record<string, any> | undefined, athenaFilters: Map<string, string[]>, show: boolean

  const dispatch = createEventDispatcher<CustomOptionsEvents>()

  let openedFilter: string
  let colors: Record<string, string> = filterConfig.colors
  let filterNames: Record<string, string> = filterConfig.names

  const hideSide = async () => (show = false)
  const showSide = async () => (show = true)

  // A method to check if the filter is already applied to the API call
  function checkFilter(filter: string, altName: string | undefined, option: string): boolean {
    let allFilters: Map<string, string[]> = athenaFilters
    const chosen = allFilters.get(filter) ?? allFilters.get(altName ?? '')
    return chosen?.includes(option) ?? false
  }

  // A method to delete a filter when a filter for the Athena API call is removed in the section "Activated filters"
  function removeFilter(filter: string, option: string): void {
    athenaFilters.get(filter)!.splice(athenaFilters.get(filter)!.indexOf(option), 1)
    athenaFilters = athenaFilters
    dispatch('updateFilters', { athenaFilters })
  }

  // A method to update the API filters applied on the API call for Athena
  const filtering = async (event: Event, filter: string, option: string): Promise<void> => {
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
      <button class="filters-button" on:click={hideSide} id="filters">
        <SvgIcon id="chevrons-left" />
      </button>
    </div>
    <div class="choice-filters">
      {#each Object.entries(filters) as [id, { name, altName, altNameFacet, options }], _}
        {#if facets && facets[altNameFacet]}
          {@const filter = { name, opts: { altName, altNameFacet, options } }}
          <AthenaFilter {filter} bind:openedFilter color={colors[name.toLowerCase()]}>
            <div slot="option" class="filter-option" let:option>
              {#if facets[altNameFacet].hasOwnProperty(option) && facets[altNameFacet][option] > 0}
                {@const title = 'Activate/deactivate filter'}
                {@const checked = checkFilter(name, altName, option)}
                <input id={option} type="checkbox" {title} {checked} on:click={e => filtering(e, altName, option)} />
                <label class="filter-option-label" for={option}>{option.replaceAll('/', ' / ')}</label>
              {:else}
                <input id={option} class="disabled" type="checkbox" disabled />
                <label class="filter-option-label disabled" for={option}>{option.replaceAll('/', ' / ')}</label>
              {/if}
            </div>
          </AthenaFilter>
        {/if}
      {/each}
      <div class="activated-filters">
        {#each [...athenaFilters] as [filter, values], _}
          {#each values as value}
            {@const color = colors[filterNames[filter]]}
            <div class="activated-filter" id={value} style={`background-color: ${color}`}>
              <button class="activated-filter-button" on:click={() => removeFilter(filter, value)}>
                <SvgIcon id="x" />
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
    <button class="closed-bar" on:click={showSide}>
      <SvgIcon id="chevrons-right" />
      {#each 'FILTERS' as letter}
        <p>{letter}</p>
      {/each}
      <SvgIcon id="chevrons-right" />
    </button>
  </div>
{/if}

<style>
  .filters-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-width: 15%;
    max-width: 15%;
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

  input {
    border: 1px solid #d8d8d8;
  }

  input:hover {
    cursor: pointer;
    border: 1px solid #bbbbbb;
  }

  input:focus {
    outline: none;
    box-shadow: 0 0 0 2px #c5c5c5;
  }

  .filter-option-label {
    max-width: 80%;
  }

  .sidebar-right {
    height: 100%;
    border-right: 1px solid lightgray;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 0.5rem;
  }

  .closed-bar {
    height: 100%;
    display: flex;
    gap: 1rem;
    flex-direction: column;
    cursor: pointer;
    border: none;
    background-color: inherit;
    font-weight: bold;
  }

  p {
    margin: 0;
  }

  .disabled {
    color: lightgray;
  }
</style>
