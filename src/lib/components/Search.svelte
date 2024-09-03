<!-- Copyright 2023 RADar-AZDelta -->
<!-- SPDX-License-Identifier: gpl3+ -->
<script lang="ts">
  import DataTable from '@radar-azdelta/svelte-datatable'
  import Config from '../helpers/Config'
  import Filters from '../components/Filters.svelte'
  import { assembleAthenaURL } from '../helpers/utils'
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
  }: ISearchProps = $props()

  let table: DataTable | undefined = $state()
  let viewSelection: number = $state(0)
  let athenaFilters = $state(new Map<string, string[]>([['standardConcept', ['Standard']]]))
  const defaultTableOpts = Object.assign(Config.defaultTableOptions, { dataTypeImpl: new AthenaDataTypeImpl(), globalFilter })
  let tableOpts = $state<ITableOptions>(tableOptions ? { ...defaultTableOpts, ...tableOptions } : defaultTableOpts)
  let filters: IAthenaFilter[] = $state([])

  let rerender = $state<boolean>(true)

  const rowSelected = async (row: Record<string, any>) => {
    if (selectRow) selectRow(row)
  }
  const updateFilters = async (filters: Map<string, string[]>) => {
    athenaFilters = new Map([...filters])
    triggerFetch()
  }
  const selectionChanged = async (selection: number) => {
    viewSelection = selection
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////
  // METHODS
  ///////////////////////////////////////////////////////////////////////////////////////////////

  async function fetchSource(filters: Map<String, TFilter>, sorts: Map<string, SortDirection>, pagination: IPagination) {
    let filter = tableOpts.globalFilter?.filter?.toString() ?? ''
    const sort = sorts.entries().next().value
    if (fetchData) return await fetchData(filter, Config.columnNames, athenaFilters, sorts, pagination)
    let apiFilters: string[] = []
    for (let [filter, options] of athenaFilters) {
      const substring = options.map(option => `&${filter}=${option}`).join()
      if (!apiFilters.includes(substring)) apiFilters.push(substring.replaceAll(',', '&'))
    }
    const url = await assembleAthenaURL({ apiFilters, columns: Config.columnNames, filter, sort, pagination })

    const response = await fetch(url)
    const apiData = await response.json()
    // Save the facets to exclude filters later
    ;({ facets } = apiData)
    const { content, totalElements } = apiData
    return { data: content, totalRows: totalElements }
  }

  export const getFilters = () => athenaFilters
  const triggerFetch = () => {
    if (table) {
      table.render()
      rerender = false
    }
  }

  function setLimitedFilters() {
    if (filters.length) return
    filters = Config.filters.map(filter => {
      const limitedFilter = limitedFilters.find(f => f.name === filter.name)
      if (!limitedFilter) return filter
      if (limitedFilter.value) addFilterIfNotSetYet(filter.altName, limitedFilter.value)
      filter.options = setFiltersWithLimitation(limitedFilter.options, filter.options, limitedFilter.exclude ?? false)
      return filter
    })
    updateFilters(athenaFilters)
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

  const setFilter = (filter?: string) => {
    tableOpts.globalFilter!.filter = filter
    rerender = true
  }

  const updateGlobalFilter = (opt: ITableOptions) => {
    if (globalFilter.filter) globalFilter.filter = opt.globalFilter?.filter?.toString() ?? ''
  }

  $effect(() => {
    if (rerender) triggerFetch()
  })

  $effect(() => {
    setLimitedFilters()
  })

  $effect(() => {
    setFilter(globalFilter.filter)
  })

  $effect(() => {
    updateGlobalFilter(tableOpts)
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
            {#snippet rowChild(renderedRow: any, originalIndex: any, index: any, columns: any, option: any)}
              <AthenaRow {renderedRow} {columns} iconSize={fontSize} selectRow={rowSelected} {actionChild} />
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
