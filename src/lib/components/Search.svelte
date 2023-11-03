<!-- Copyright 2023 RADar-AZDelta -->
<!-- SPDX-License-Identifier: gpl3+ -->
<script lang="ts">
  //////////////////////////////////////////////// Framework imports
  import { createEventDispatcher } from 'svelte'
  //////////////////////////////////////////////// Package imports
  import DataTable from '@radar-azdelta/svelte-datatable'
  import type { IPagination, SortDirection, TFilter } from '@radar-azdelta/svelte-datatable'
  import '@radar-azdelta/svelte-datatable/styles/data-table.scss'
  //////////////////////////////////////////////// config
  import filters from '$lib/config/filters.json'
  import customColumns from '$lib/config/customColumns.json'
  import columns from '$lib/config/columnsAthena.json'
  import suggestions from '$lib/config/suggestions.json'
  import columnNames from '$lib/config/columnNames.json'
  import customConceptInfo from '$lib/config/suggestions.json'
  //////////////////////////////////////////////// Component & type imports
  import AthenaFilter from '$lib/components/AthenaFilter.svelte'
  import Selection from '$lib/components/Selection.svelte'
  import SvgIcon from '$lib/components/SvgIcon.svelte'
  import AthenaRow from '$lib/components/AthenaRow.svelte'
  import type {
    CustomRowCreationEventDetail,
    CustomOptionsEvents,
    IOptions,
    ICustomColumn,
    IinputConfig,
    SelectionChangedEventDetail,
  } from '$lib/Types'
  import InputRow from '$lib/components/InputRow.svelte'
  import { AthenaDataTypeImpl } from '$lib/utilClasses/AthenaDataTypeImpl'
  import { assembleAthenaURL, reformatDate } from '$lib/utils'

  export let actionColumnCustom: boolean = false

  // General variables
  let facets: Record<string, any> | undefined = undefined
  const inputAvailableColumns = ['code', 'name', 'className', 'domain', 'vocabulary']
  const mappingUrl = 'https://athena.ohdsi.org/api/v1/concepts?'
  const dispatch = createEventDispatcher<CustomOptionsEvents>()
  let openedFilter: string,
    conceptSelection: string = 'athena',
    errorMessage: string = ''

  // Data variables
  let JSONFilters = new Map<string, IOptions>([]),
    activatedAthenaFilters = new Map<string, string[]>([['standardConcept', ['Standard']]]),
    filterColors: Record<string, string> = {
      domain: '#ec3d31',
      concept: '#50a5ba',
      class: '#6967d2',
      vocab: '#ffa200',
      validity: '#ad007c',
    },
    filterNames: Record<string, string> = {
      domain: 'domain',
      standardConcept: 'concept',
      conceptClass: 'class',
      Vocabulary: 'vocab',
      invalidReason: 'validity',
    }

  ///////////////////////////////////////////////////////////////////////////////////////////////
  // DATA
  ///////////////////////////////////////////////////////////////////////////////////////////////

  for (let filter of filters) {
    JSONFilters.set(filter.name, {
      altName: filter.altName,
      altNameFacet: filter.altNameFacet,
      options: filter.options,
    })
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////
  // EVENTS
  ///////////////////////////////////////////////////////////////////////////////////////////////

  function rowSelected(row: Record<string, any>): void {
    dispatch('rowSelected', { row })
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
    const sort = sortedColumns.entries().next().value
    let apiFilters: string[] = []
    for (let [filter, options] of activatedAthenaFilters) {
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

  // A method to update the API filters applied on the API call for Athena
  const updateAPIFilters = async (event: Event, filter: string, option: string): Promise<void> => {
    let chosenFilter = activatedAthenaFilters.get(filter)
    const inputValue = (event.target as HTMLInputElement).checked
    // If the filter is checked, add it
    if (chosenFilter && inputValue) chosenFilter.push(option)
    else if (chosenFilter && !inputValue && chosenFilter.includes(option)) {
      // If the filter is unchecked and was already in the list, remove it
      chosenFilter.splice(chosenFilter.indexOf(option), 1)
      if (!chosenFilter.length) activatedAthenaFilters.delete(filter)
      else activatedAthenaFilters.set(filter, chosenFilter)
    } else activatedAthenaFilters.set(filter, [option])
    activatedAthenaFilters = activatedAthenaFilters
  }

  export async function getFilters(): Promise<Map<string, string[]>> {
    return activatedAthenaFilters
  }

  // A method to check if the filter is already applied to the API call
  function checkFilter(filter: string, altName: string | undefined, option: string): boolean {
    let allFilters: Map<string, string[]> = activatedAthenaFilters
    const chosenFilter = !allFilters.get(filter)
      ? altName
        ? allFilters.get(altName)
        : undefined
      : allFilters.get(filter)

    return chosenFilter && chosenFilter?.includes(option) ? true : false
  }

  // A method to delete a filter when a filter for the Athena API call is removed in the section "Activated filters"
  function removeFilter(filter: string, option: string): void {
    activatedAthenaFilters.get(filter)!.splice(activatedAthenaFilters.get(filter)!.indexOf(option), 1)
    activatedAthenaFilters = activatedAthenaFilters
  }

  // A method for custom mapping
  function customMapping(e: CustomEvent<CustomRowCreationEventDetail>): void | string {
    errorMessage = ''
    const domainKeys = Object.keys(customConceptInfo.domain_id)
    const domainValues = Object.values(customConceptInfo.domain_id)
    // Check if the domain id and the concept class id are predefined values
    if (!domainKeys.includes(e.detail.concept.domainId) || !domainValues.includes(e.detail.concept.domainId))
      return (errorMessage = 'The domain id is not valid')
    const classKeys = Object.keys(customConceptInfo.concept_class_id)
    const classValues = Object.values(customConceptInfo.concept_class_id)
    if (!classKeys.includes(e.detail.concept.conceptClassId) || !classValues.includes(e.detail.concept.conceptClassId))
      return (errorMessage = 'The concept class id is not valid')

    dispatch('customRowCreation', { concept: e.detail.concept })
  }

  async function getCustomColumnConfig() {
    const config: Record<string, IinputConfig> = {}
    for (let col of customColumns) {
      const name = col.label ? col.label : col.id
      const columnConfig: ICustomColumn[] = customColumns.filter(col => col.id === name || col.label === name)
      config[col.id] = {
        inputAvailable: inputAvailableColumns.includes(name),
        value: columnConfig[0].value === 'date' ? reformatDate() : columnConfig[0].value ? columnConfig[0].value : '',
        suggestions: (<Record<string, any>>suggestions)[columnConfig[0].id],
      }
    }
    return config
  }

  async function selectionChanged(e: CustomEvent<SelectionChangedEventDetail>) {
    conceptSelection = e.detail.selection
  }

  let fetchDataFunc = fetchData

  $: {
    activatedAthenaFilters
    fetchDataFunc = fetchData
  }
</script>

<div data-name="athena-layout">
  <section data-name="filters-container">
    <div data-name="filters">
      <div data-name="activated-filters">
        {#each [...activatedAthenaFilters] as [filter, values]}
          {#each values as value}
            <div
              data-name="activated-filter"
              id={value}
              style={`background-color: ${filterColors[filterNames[filter]]}`}
            >
              <button on:click={() => removeFilter(filter, value)}>
                <SvgIcon href="/icons.svg" id="x" width="16px" height="16px" />
              </button>
              <p>{value}</p>
            </div>
          {/each}
        {/each}
      </div>
      {#each [...JSONFilters] as [key, opt]}
        {#if facets && facets[opt.altNameFacet]}
          <AthenaFilter filter={{ name: key, opts: opt }} bind:openedFilter color={filterColors[key.toLowerCase()]}>
            <div slot="option" data-name="filter-option" let:option>
              {#if facets[opt.altNameFacet].hasOwnProperty(option) && facets[opt.altNameFacet][option] > 0}
                <input
                  id={option}
                  type="checkbox"
                  checked={checkFilter(key, opt.altName, option)}
                  on:click={e => updateAPIFilters(e, opt.altName, option)}
                />
                <label for={option}>{option.replaceAll('/', ' / ')}</label>
              {/if}
            </div>
          </AthenaFilter>
        {/if}
      {/each}
    </div>
  </section>
  <section data-name="athena-table">
    <Selection on:selectionChanged={selectionChanged} />
    {#if conceptSelection === 'athena'}
      <div data-name="table-container">
        <DataTable
          data={fetchDataFunc}
          {columns}
          options={{
            id: 'athena',
            actionColumn: true,
            rowsPerPageOptions: [5, 10, 15, 20],
            globalFilter: { column: 'all', filter: undefined },
            saveOptions: false,
            singleSort: true,
            dataTypeImpl: new AthenaDataTypeImpl(),
          }}
        >
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
    {:else if conceptSelection === 'custom'}
      <div data-name="custom-concept-container">
        <h2>Create a custom concept</h2>
        {#await getCustomColumnConfig() then config}
          <DataTable
            data={[{}]}
            columns={customColumns}
            options={{ actionColumn: actionColumnCustom, id: 'createCustomConcepts', saveOptions: false }}
          >
            <InputRow slot="default" let:columns {columns} data={config} on:customMappingInput={customMapping}>
              <slot let:result renderedRow={result} slot="action" name="action-custom-concept" />
            </InputRow>
          </DataTable>
        {/await}

        {#if errorMessage}
          <div data-name="errormessage">
            <p>{errorMessage}</p>
            <button
              on:click={() => {
                errorMessage = ''
              }}><SvgIcon href="/icons.svg" id="x" width="16px" height="16px" /></button
            >
          </div>
        {/if}
      </div>
    {/if}
  </section>
</div>
