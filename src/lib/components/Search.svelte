<!-- Copyright 2023 RADar-AZDelta -->
<!-- SPDX-License-Identifier: gpl3+ -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import DataTable from '@radar-azdelta/svelte-datatable'
  import columns from '$lib/config/columnsAthena.json'
  import columnNames from '$lib/config/columnNames.json'
  import Filters from '$lib/components/Filters.svelte'
  import Selection from '$lib/components/Selection.svelte'
  import AthenaRow from '$lib/components/AthenaRow.svelte'
  import { AthenaDataTypeImpl } from '$lib/utilClasses/AthenaDataTypeImpl'
  import { assembleAthenaURL } from '$lib/utils'
  import type { CustomOptionsEvents, UpdateFiltersEventDetail, IView, ViewChangedEventDetail } from '$lib/Types'
  import type { IPagination, ITableOptions, SortDirection, TFilter } from '@radar-azdelta/svelte-datatable'
  import '@radar-azdelta/svelte-datatable/styles/data-table.scss'

  export let views: IView[] = [],
    globalFilter: { column: string; filter: string | undefined }

  const mappingUrl = 'https://athena.ohdsi.org/api/v1/concepts?'
  const dispatch = createEventDispatcher<CustomOptionsEvents>()

  let viewSelection: string = 'slotView0'
  let facets: Record<string, any> | undefined = undefined
  let athenaFilters = new Map<string, string[]>([['standardConcept', ['Standard']]])
  let tableOptions: ITableOptions = {
    id: 'athena',
    actionColumn: true,
    rowsPerPageOptions: [5, 10, 15, 20],
    globalFilter,
    saveOptions: false,
    singleSort: true,
    dataTypeImpl: new AthenaDataTypeImpl(),
  }
  let mainFilter: string | undefined = undefined

  ///////////////////////////////////////////////////////////////////////////////////////////////
  // EVENTS
  ///////////////////////////////////////////////////////////////////////////////////////////////

  function rowSelected(row: Record<string, any>): void {
    dispatch('rowSelected', { row })
  }

  async function updateFilters(e: CustomEvent<UpdateFiltersEventDetail>) {
    athenaFilters = e.detail.athenaFilters
  }

  async function selectionChanged(e: CustomEvent<ViewChangedEventDetail>) {
    viewSelection = e.detail.view
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////
  // METHODS
  ///////////////////////////////////////////////////////////////////////////////////////////////

  async function fetchData(
    filteredColumns: Map<String, TFilter>,
    sortedColumns: Map<string, SortDirection>,
    pagination: IPagination
  ): Promise<{ totalRows: number; data: any[][] | any[] }> {
    let filter = filteredColumns.values().next().value
    if (mainFilter) filter = mainFilter
    mainFilter = undefined
    const sort = sortedColumns.entries().next().value
    let apiFilters: string[] = []
    for (let [filter, options] of athenaFilters) {
      const substring = options.map(option => `&${filter}=${option}`).join()
      if (!apiFilters.includes(substring)) apiFilters.push(substring.replaceAll(',', '&'))
    }
    const url = await assembleAthenaURL(mappingUrl, apiFilters, columnNames, filter, sort, pagination, false)
    const response = await fetch(url)
    const apiData = await response.json()
    // Save the facets to exclude filters later
    facets = apiData.facets
    return {
      data: apiData.content,
      totalRows: apiData.totalElements,
    }
  }

  export async function getFilters(): Promise<Map<string, string[]>> {
    return athenaFilters
  }

  let fetchDataFunc = fetchData

  $: {
    athenaFilters
    fetchDataFunc = fetchData
  }

  $: {
    globalFilter
    mainFilter = globalFilter.filter
    fetchDataFunc = fetchData
  }
</script>

<div class="athena-layout">
  {#if $$slots.leftSlot}
    <div class="leftslot">
      <slot name="leftSlot" />
    </div>
  {:else}
    <Filters bind:athenaFilters bind:facets on:updatedFilters={updateFilters} />
  {/if}
  <section class="center-container">
    {#if $$slots.upperSlot}
      <slot name="upperSlot" />
    {/if}
    <section class="athena-table">
      {#if views && views.length}
        <Selection on:viewChanged={selectionChanged} {views} />
      {/if}
      {#if viewSelection === 'slotView0'}
        <div class="table-container">
          <DataTable data={fetchDataFunc} {columns} options={tableOptions}>
            <AthenaRow
              slot="default"
              let:renderedRow
              let:columns
              {renderedRow}
              {columns}
              dblClickAction={rowSelected}
              custom={$$slots['action-athena']}
            >
              <slot let:renderedRow {renderedRow} slot="action-athena" name="action-athena" />
            </AthenaRow>
          </DataTable>
        </div>
      {:else if viewSelection === 'slotView1' && $$slots.slotView1}
        <slot name="slotView1" />
      {:else if viewSelection === 'slotView2' && $$slots.slotView2}
        <slot name="slotView2" />
      {/if}
    </section>
  </section>
  {#if $$slots.rightSlot}
    <slot name="rightSlot" />
  {/if}
</div>

<style>
  .athena-layout {
    display: flex;
    width: 100%;
    height: 100%;
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
    overflow-y: auto;
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
  }

  .table-container {
    padding: 0 1rem;
    flex: 1 1 auto;
    overflow: auto;
  }

  slot {
    height: 100%;
  }
</style>
