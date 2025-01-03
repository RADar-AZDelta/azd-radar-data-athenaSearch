<!-- Copyright 2023 RADar-AZDelta -->
<!-- SPDX-License-Identifier: gpl3+ -->
<script lang="ts">
  import DataTable from '@radar-azdelta/svelte-datatable'
  import Config from '../helpers/Config'
  import AthenaURL from '../helpers/AthenaURL'
  import Filters from '../components/Filters.svelte'
  import Selection from '../components/Selection.svelte'
  import AthenaRow from '../components/AthenaRow.svelte'
  import { AthenaDataTypeImpl } from '../helpers/AthenaDataTypeImpl'
  import type { IPagination, ITableOptions, SortDirection, TFilter } from '@radar-azdelta/svelte-datatable'
  import type { IAthenaFilter, ISearchProps } from '../interfaces/Types'

  let {
    views = [],
    globalFilter = $bindable({ column: 'all', filter: undefined }),
    tableOptions,
    height = '100%',
    width = '100%',
    fontSize = '10px',
    showFilters = false,
    limitedFilters = [],
    facets = $bindable({}),
    fetchData,
    selectRow,
    leftChild,
    rightChild,
    upperChild,
    firstView,
    secondView,
    actionChild,
    getVocabularies,
    getDomains,
    getConceptClasses,
  }: ISearchProps = $props()

  let table: DataTable | undefined = $state()
  let viewSelection: number = $state(0)
  let athenaFilters = $state(new Map<string, string[]>([['standardConcept', ['Standard']], ['invalidReason', ['Valid']]]))
  const defaultTableOpts = Object.assign(Config.defaultTableOptions, { dataTypeImpl: new AthenaDataTypeImpl(), globalFilter })
  let tableOpts = $state<ITableOptions>(tableOptions ? { ...defaultTableOpts, ...tableOptions } : defaultTableOpts)
  let filters: IAthenaFilter[] = $state([])
  let prevGlobalFilter = $state<string | undefined>(undefined)
  let rerender = $state<boolean>(false)

  // Wrapper method for selectRow because it can be undefined
  const selectRowWrapper = async (row: Record<string, any>) => {
    if (selectRow) selectRow(row)
  }
  const updateFilters = async (filters: Map<string, string[]>) => {
    athenaFilters = new Map([...filters])
    triggerFetch()
  }
  const selectionChanged = async (selection: number) => (viewSelection = selection)

  ///////////////////////////////////////////////////////////////////////////////////////////////
  // METHODS
  ///////////////////////////////////////////////////////////////////////////////////////////////

  // Wrapper method to fetch content via the custom fetch method or from Athena as alternative
  async function fetchSource(filters: Map<string, TFilter>, sorts: Map<string, SortDirection>, pagination: IPagination) {
    let filter = tableOpts.globalFilter?.filter?.toString() ?? ''
    const sort = sorts.entries().next().value
    // If there is a custom fetchData method, use it
    if (fetchData) return await fetchData(filter, Config.columnNames, athenaFilters, sorts, pagination)
    // Use the Athena fetch logic as alternative
    let apiFilters: string[] = []
    for (let [filter, options] of athenaFilters) {
      const substring = options.map(option => `&${filter}=${option}`).join()
      if (!apiFilters.includes(substring)) apiFilters.push(substring.replaceAll(',', '&'))
    }
    const url = await AthenaURL.assembleAthenaURL({ apiFilters, columns: Config.columnNames, filter, sort, pagination })
    const response = await fetch(url)
    const apiData = await response.json()
    // Save the facets to exclude filters later
    ;({ facets } = apiData)
    const { content: data, totalElements: totalRows } = apiData
    return { data, totalRows }
  }

  export const getFilters = () => athenaFilters

  async function triggerFetch() {
    if (!table) return
    table.render(false)
    rerender = false
  }

  async function setLimitedFilters() {
    if (filters.length) return
    const [vocabularies, domains, conceptClasses] = await Promise.all([getVocabularies(), getDomains(), getConceptClasses()])
    filters = Config.filters.map(filter => {
      if (filter.name === 'Domain') filter.options = domains.map(d => d.domain_id)
      else if (filter.name === 'Class') filter.options = conceptClasses.map(c => c.concept_class_id)
      else if (filter.name === 'Vocab') filter.options = vocabularies.map(v => v.vocabulary_id)
      const limitedFilter = limitedFilters.find(f => f.name === filter.name)
      if (!limitedFilter) return filter
      if (limitedFilter.value) addFilterIfNotSetYet(filter.altName, limitedFilter.value)
      filter.options = setFiltersWithLimitation(limitedFilter.options, filter.options, limitedFilter.exclude ?? false)
      return filter
    })
  }

  function addFilterIfNotSetYet(filter: string, value: string) {
    const foundFilters = athenaFilters.get(filter)
    if (!foundFilters) return athenaFilters.set(filter, [value])
    const filterExists = foundFilters.includes(value)
    if (filterExists) return
    athenaFilters.set(filter, [...foundFilters, value])
  }

  function setFiltersWithLimitation(options: string[], originalOptions: string[], exclude: boolean) {
    if (!exclude) return options
    const filteredOptions = originalOptions.filter(opt => !options.includes(opt))
    return filteredOptions
  }

  async function updateFilter(filter: string, global: boolean) {
    prevGlobalFilter = filter
    if (global && tableOpts.globalFilter) tableOpts.globalFilter.filter = filter
    else if (global) tableOpts.globalFilter = { filter: globalFilter.filter, column: 'all' }
    else if (!global) globalFilter.filter = filter
  }

  $effect(() => {
    if (rerender) triggerFetch()
  })

  $effect(() => {
    setLimitedFilters()
  })

  $effect(() => {
    if (globalFilter?.filter && prevGlobalFilter !== globalFilter.filter) updateFilter(globalFilter.filter, true)
    else if (tableOpts?.globalFilter && tableOpts?.globalFilter?.filter !== prevGlobalFilter) updateFilter(tableOpts.globalFilter.filter as string, false)
  })
</script>

<div class="athena-layout" style={`--height: ${height}; --width: ${width}; --fontSize: ${fontSize};`}>
  {#if leftChild}
    <div class="leftslot">
      {@render leftChild()}
    </div>
  {:else}
    <Filters bind:athenaFilters bind:facets bind:show={showFilters} {filters} {limitedFilters} {updateFilters} />
  {/if}
  <section class="center-container">
    {#if upperChild}
      {@render upperChild()}
    {/if}
    <section class="athena-table">
      {#if views && views.length}
        <Selection changeView={selectionChanged} {views} />
      {/if}
      {#if viewSelection === 0}
        <div class="table-container">
          <DataTable data={fetchSource} columns={Config.columnsAthena} bind:options={tableOpts} bind:this={table}>
            <!-- Issue in getting the type of props from the svelte-datatable package -->
            {#snippet rowChild({ renderedRow, columns })}
              <AthenaRow {renderedRow} {columns} iconSize={fontSize} selectRow={selectRowWrapper} {actionChild} />
            {/snippet}
          </DataTable>
        </div>
      {:else if viewSelection === 1 && firstView}
        {@render firstView()}
      {:else if viewSelection === 2 && secondView}
        {@render secondView()}
      {/if}
    </section>
  </section>
  {#if rightChild}
    {@render rightChild()}
  {/if}
</div>

<style>
  :global(p, label, input, select, option) {
    font-size: var(--fontSize);
  }

  .athena-layout {
    display: flex;
    height: var(--height);
    width: var(--width);
    overflow: hidden;
  }

  .center-container {
    min-width: 63%;
    flex: 1 1 auto;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .athena-table {
    width: 100%;
    height: 100%;
    /* overflow-y: auto; */
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
  }

  .table-container {
    padding: 0 1rem;
    flex: 1 1 auto;
    max-height: 100%;
    overflow: auto;
  }
</style>
