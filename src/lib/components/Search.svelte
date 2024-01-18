<!-- Copyright 2023 RADar-AZDelta -->
<!-- SPDX-License-Identifier: gpl3+ -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import DataTable from '@radar-azdelta/svelte-datatable'
  import columns from '$lib/config/columnsAthena.json'
  import columnNames from '$lib/config/columnNames.json'
  import defaultOpts from '$lib/config/defaultTableOptions.json'
  import SvgIcon from '$lib/components/SvgIcon.svelte'
  import Filters from '$lib/components/Filters.svelte'
  import Selection from '$lib/components/Selection.svelte'
  import AthenaRow from '$lib/components/AthenaRow.svelte'
  import { AthenaDataTypeImpl } from '$lib/utilClasses/AthenaDataTypeImpl'
  import { assembleAthenaURL } from '$lib/utils'
  import type { IPagination, ITableOptions, SortDirection, TFilter } from '@radar-azdelta/svelte-datatable'
  import type { CustomOptionsEvents, UpdateFiltersEventDetail, IView, ViewChangedEventDetail } from '$lib/Types'

  export let views: IView[] = []
  export let globalFilter: { column: string; filter: string | undefined } = { column: 'all', filter: undefined }
  export let tableOptions: ITableOptions | undefined = undefined
  export let height: string = '100%'
  export let width: string = '100%'
  export let fontSize: string = '10px'
  export let showFilters: boolean = false

  const mappingUrl = 'https://athena.ohdsi.org/api/v1/concepts?'
  const dispatch = createEventDispatcher<CustomOptionsEvents>()

  let viewSelection: number = 0
  let facets: Record<string, any> | undefined = undefined
  let athenaFilters = new Map<string, string[]>([['standardConcept', ['Standard']]])
  const defaultTableOpts = Object.assign(defaultOpts, { dataTypeImpl: new AthenaDataTypeImpl(), globalFilter })
  let tableOpts: ITableOptions = tableOptions ? { ...defaultTableOpts, ...tableOptions } : defaultTableOpts
  let mainFilter: string | undefined = undefined
  let lastTypedFilter: string
  let lastChangedTyped: boolean = true

  ///////////////////////////////////////////////////////////////////////////////////////////////
  // EVENTS
  ///////////////////////////////////////////////////////////////////////////////////////////////

  const rowSelected = (row: Record<string, any>) => dispatch('rowSelected', { row })

  const updateFilters = (e: CustomEvent<UpdateFiltersEventDetail>) => (athenaFilters = e.detail.athenaFilters)

  const selectionChanged = (e: CustomEvent<ViewChangedEventDetail>) => (viewSelection = e.detail.view)

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
    const url = await assembleAthenaURL(mappingUrl, apiFilters, columnNames, filter, sort, pagination, false)
    const response = await fetch(url)
    const apiData = await response.json()
    // Save the facets to exclude filters later
    ;({ facets } = apiData)
    const { content, totalElements } = apiData
    return { data: content, totalRows: totalElements }
  }

  function referToAthena(row: Record<string, any>): void {
    const referUrl = 'https://athena.ohdsi.org/search-terms/terms/' + row.id
    window.open(encodeURI(referUrl), '_blank')?.focus()
  }

  export const getFilters = () => athenaFilters
  const triggerFetch = () => (fetchDataFunc = fetchData)

  let fetchDataFunc = fetchData

  $: {
    athenaFilters
    triggerFetch()
  }

  $: {
    globalFilter
    mainFilter = globalFilter.filter
    lastChangedTyped = false
    triggerFetch()
  }
</script>

<div class="athena-layout" style={`--height: ${height}; --width: ${width}; --fontSize: ${fontSize};`}>
  {#if $$slots.leftSlot}
    <div class="leftslot">
      <slot name="leftSlot" />
    </div>
  {:else}
    <Filters bind:athenaFilters bind:facets bind:show={showFilters} on:updatedFilters={updateFilters} />
  {/if}
  <section class="center-container">
    {#if $$slots.upperSlot}
      <slot name="upperSlot" />
    {/if}
    <section class="athena-table">
      {#if views && views.length}
        <Selection on:viewChanged={selectionChanged} {views} />
      {/if}
      {#if viewSelection === 0}
        <div class="table-container">
          <DataTable data={fetchDataFunc} {columns} options={tableOpts}>
            <AthenaRow slot="default" let:renderedRow let:columns {renderedRow} {columns} dblClickAction={rowSelected}>
              <div slot="action-athena">
                {#if $$slots['action-athena']}
                  <slot {renderedRow} name="action-athena" />
                {:else}
                  <div data-name="actions-grid">
                    <button on:click={() => referToAthena(renderedRow)}>
                      <SvgIcon id="link" width={fontSize} height={fontSize} />
                    </button>
                  </div>
                {/if}
              </div>
            </AthenaRow>
          </DataTable>
        </div>
      {:else if viewSelection === 1 && $$slots.slotView1}
        <slot name="slotView1" />
      {:else if viewSelection === 2 && $$slots.slotView2}
        <slot name="slotView2" />
      {/if}
    </section>
  </section>
  {#if $$slots.rightSlot}
    <slot name="rightSlot" />
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

  slot {
    height: 100%;
  }
</style>
