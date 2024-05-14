<!-- Copyright 2023 RADar-AZDelta -->
<!-- SPDX-License-Identifier: gpl3+ -->
<script lang="ts">
  import DataTable from '@radar-azdelta/svelte-datatable'
  import Config from '$lib/helpers/Config'
  import Filters from '$lib/components/Filters.svelte'
  import { assembleAthenaURL } from '$lib/helpers/utils'
  import Selection from '$lib/components/Selection.svelte'
  import AthenaRow from '$lib/components/AthenaRow.svelte'
  import { AthenaDataTypeImpl } from '$lib/helpers/AthenaDataTypeImpl'
  import type { IPagination, ITableOptions, SortDirection, TFilter } from '@radar-azdelta/svelte-datatable'
  import type { ISearchProps } from '$lib/interfaces/Types'

  let {
    views = [],
    globalFilter = $bindable({ column: 'all', filter: undefined }),
    tableOptions,
    height = '100%',
    width = '100%',
    fontSize = '10px',
    showFilters = false,
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
  let facets: Record<string, any> | undefined = $state()
  let athenaFilters = $state(new Map<string, string[]>([['standardConcept', ['Standard']]]))
  const defaultTableOpts = Object.assign(Config.defaultTableOptions, { dataTypeImpl: new AthenaDataTypeImpl(), globalFilter })
  let tableOpts: ITableOptions = tableOptions ? { ...defaultTableOpts, ...tableOptions } : defaultTableOpts
  let mainFilter: string | undefined = undefined
  let lastTypedFilter: string
  let lastChangedTyped: boolean = true

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

  async function fetchData(filters: Map<String, TFilter>, sorts: Map<string, SortDirection>, pagination: IPagination) {
    let filter = filters.values().next().value
    if (lastTypedFilter !== filter) (lastTypedFilter = filter), (lastChangedTyped = true)
    if (!lastChangedTyped) filter = mainFilter
    const sort = sorts.entries().next().value
    let apiFilters: string[] = []
    for (let [filter, options] of athenaFilters) {
      const substring = options.map(option => `&${filter}=${option}`).join()
      if (!apiFilters.includes(substring)) apiFilters.push(substring.replaceAll(',', '&'))
    }
    // const url = await assembleAthenaURL(mappingUrl, apiFilters, Config.columnNames, filter, sort, pagination, false)
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
    if (table) table.render()
  }

  $effect(() => {
    globalFilter
    mainFilter = globalFilter.filter
    lastChangedTyped = false
    triggerFetch()
  })
</script>

<div class="athena-layout" style={`--height: ${height}; --width: ${width}; --fontSize: ${fontSize};`}>
  {#if leftChild}
    <div class="leftslot">
      {@render leftChild()}
    </div>
  {:else}
    <Filters bind:athenaFilters bind:facets bind:show={showFilters} {updateFilters} />
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
          <DataTable data={fetchData} columns={Config.columnsAthena} options={tableOpts} bind:this={table}>
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
