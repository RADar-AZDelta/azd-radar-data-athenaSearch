<script lang="ts">
  import Config from '$lib/helpers/Config'
  import SvgIcon from '$lib/components/SvgIcon.svelte'
  import AthenaFilter from '$lib/components/AthenaFilter.svelte'
  import type { IFilterProps } from '$lib/interfaces/Types'

  let { facets = $bindable(), athenaFilters = $bindable(), show = $bindable(), filters, limitedFilters, updateFilters }: IFilterProps = $props()

  let openedFilter: string = $state('')
  let colors: Record<string, string> = Config.filterConfig.colors
  let filterNames: Record<string, string> = Config.filterConfig.names

  const hideSide = async () => (show = false)
  const showSide = async () => (show = true)

  // A method to delete a filter when a filter for the Athena API call is removed in the section "Activated filters"
  function removeFilter(filter: string, option: string, cantDelete: boolean): void {
    if (cantDelete) return
    athenaFilters.get(filter)!.splice(athenaFilters.get(filter)!.indexOf(option), 1)
    updateFilters(athenaFilters)
  }

  const isFilterDeletable = (filter: string, option: string) => {
    const name = Config.filterNames.find(f => f.altName === filter)?.name ?? ''
    const isTheFilterLimited = limitedFilters.some(f => f.name === name && f.value == option && f.deletable === false)
    return isTheFilterLimited
  }

  // A method to update the API filters applied on the API call for Athena
  const filtering = async (checked: boolean, filter: string, option: string): Promise<void> => {
    let chosenFilter = athenaFilters.get(filter)
    // If the filter is checked, add it
    if (chosenFilter && checked) chosenFilter.push(option)
    else if (chosenFilter && !checked && chosenFilter.includes(option)) {
      // If the filter is unchecked and was already in the list, remove it
      chosenFilter.splice(chosenFilter.indexOf(option), 1)
      if (!chosenFilter.length) athenaFilters.delete(filter)
      else athenaFilters.set(filter, chosenFilter)
    } else athenaFilters.set(filter, [option])
    updateFilters(athenaFilters)
  }
</script>

{#if show}
  <section class="filters-container">
    <div class="filters-head">
      <h2 class="filters-title">Filters</h2>
      <button class="filters-button" onclick={hideSide} id="filters">
        <SvgIcon id="chevrons-left" />
      </button>
    </div>
    <div class="choice-filters">
      {#each filters as limitedFilter, _}
        {@const { name, altName, altNameFacet, options } = limitedFilter}
        {#if facets && facets[altNameFacet]}
          {@const filter = { name, opts: { altName, altNameFacet, options } }}
          {@const color = colors[name.toLowerCase()]}
          <AthenaFilter {filter} bind:openedFilter {color} {facets} {athenaFilters} {filtering} />
        {/if}
      {/each}
      <div class="activated-filters">
        {#each athenaFilters as [filter, values], _}
          {#each values as value, i}
            {@const cantDelete = isFilterDeletable(filter, value)}
            {@const color = colors[filterNames[filter]] ?? 'orange'}
            <div class="activated-filter" id={value} style={`background-color: ${color}`}>
              {#if !cantDelete}
                <button class="activated-filter-button" onclick={() => removeFilter(filter, value, cantDelete)}>
                  <SvgIcon id="x" />
                </button>
              {:else}
                <!-- svelte-ignore element_invalid_self_closing_tag -->
                <span class="space" />
              {/if}
              <p class="activated-filter-name">{value}</p>
            </div>
          {/each}
        {/each}
      </div>
    </div>
  </section>
{:else}
  <div class="sidebar-right">
    <button class="closed-bar" onclick={showSide}>
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
    height: initial;
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

  .space {
    width: 1rem;
  }

  .activated-filter-name {
    margin: 0;
  }

  .sidebar-right {
    height: initial;
    border-right: 1px solid lightgray;
    padding: 0.5rem;
  }

  .closed-bar {
    height: 100%;
    display: flex;
    gap: 1rem;
    flex-direction: column;
    justify-content: start;
    cursor: pointer;
    border: none;
    background-color: inherit;
    font-weight: bold;
  }

  p {
    margin: 0;
  }
</style>
