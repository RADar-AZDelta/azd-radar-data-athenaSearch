<script lang="ts">
  //////////////////////////////////////////////// Framework imports
  import { createEventDispatcher, onMount } from 'svelte'
  import { base } from '$app/paths'
  //////////////////////////////////////////////// Package imports
  import DataTable, {
    type FetchDataFunc,
    type IColumnMetaData,
    type IPagination,
    type SortDirection,
    type TFilter,
  } from '@radar-azdelta/svelte-datatable'
  //////////////////////////////////////////////// config
  import filters from '$lib/config/filters.json'
  import customColumns from '$lib/config/customColumns.json'
  import suggestions from '$lib/config/suggestions.json'
  import columns from '$lib/config/columnNames.json'
  //////////////////////////////////////////////// Component & type imports
  import AthenaFilter from '$lib/components/AthenaFilter.svelte'
  import type {
    CustomMappingEventDetail,
    CustomOptionsEvents,
    ICategories,
    IinputConfig,
    MapConceptIdEventDetail,
  } from '../Types'
  import SvgIcon from '$lib/components/SvgIcon.svelte'
  import AthenaRow from '$lib/components/AthenaRow.svelte'
  import customConceptInfo from '$lib/config/suggestions.json'
  import InputRow from '$lib/components/InputRow.svelte'
  import { AthenaDataTypeImpl } from '$lib/utilClasses/AthenaDataTypeImpl'
  import { assembleAthenaURL, reformatDate } from '$lib/utils'

  export let facets: Record<string, any> | undefined = undefined,
    globalFilter: { column: string; filter: string | undefined } | undefined = undefined

  const mappingUrl = 'https://athena.ohdsi.org/api/v1/concepts?'

  const inputAvailableColumns = ['code', 'name', 'className', 'domain', 'vocabulary']
  const customRow: Record<string, IinputConfig> = {}
  for (let col of customColumns) {
    const name = col.label ? col.label : col.id
    customRow[name] = {
      inputAvailable: inputAvailableColumns.includes(name),
      value: col.value === 'date' ? reformatDate() : col.value ? col.value : '',
      suggestions: (<Record<string, any>>suggestions)[col.id],
    }
  }

  // General variables
  const dispatch = createEventDispatcher<CustomOptionsEvents>()
  let openedFilter: string,
    conceptSelection: string = 'athena',
    errorMessage: string = ''

  // Data variables
  let JSONFilters = new Map<string, ICategories>([]),
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

  const athenaColumns: IColumnMetaData[] = customColumns

  let dataTableAthena: DataTable,
    customConceptData: Record<string, any>[] = [{}]

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
    console.log('SELECTED ROW ', row)
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////
  // METHODS
  ///////////////////////////////////////////////////////////////////////////////////////////////

  async function fetchData(
    filteredColumns: Map<String, TFilter>,
    sortedColumns: Map<string, SortDirection>,
    pagination: IPagination
  ) {
    // Get the filter
    let filter = filteredColumns.values().next().value

    const url = await assembleAthenaURL(
      mappingUrl,
      [],
      columns,
      filter,
      sortedColumns.entries().next().value,
      pagination,
      false
    )
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
    if (chosenFilter && inputValue == true) chosenFilter.push(option)
    else if (chosenFilter && !inputValue && chosenFilter?.includes(option)) {
      // If the filter is unchecked and was already in the list, remove it
      chosenFilter.splice(chosenFilter.indexOf(option), 1)
      if (chosenFilter.length == 0) activatedAthenaFilters.delete(filter)
      else activatedAthenaFilters.set(filter, chosenFilter)
    } else activatedAthenaFilters.set(filter, [option])
    activatedAthenaFilters = activatedAthenaFilters
  }

  export async function getFilters(): Promise<Map<string, string[]>> {
    return activatedAthenaFilters
  }

  // A method to check if the filter is already applied to the API call
  const checkIfFilterExists = (filter: string, altName: string | undefined, option: string): boolean => {
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
  function customMapping(e: CustomEvent<CustomMappingEventDetail>): void | string {
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

    dispatch('customMapping', { concept: e.detail.concept })
  }
</script>

<div data-name="athena-layout">
  <section data-name="filters-container">
    <div data-name="filters">
      {#each [...JSONFilters] as [key, options]}
        {#if facets}
          {#if facets[options.altNameFacet]}
            <AthenaFilter
              filter={{ name: key, categories: options }}
              bind:openedFilter
              allowInput={true}
              color={filterColors[key.toLowerCase()]}
            >
              <div slot="option" data-name="filter-option" let:option>
                {#if facets[options.altNameFacet].hasOwnProperty(option) && facets[options.altNameFacet][option] > 0}
                  <input
                    id={option}
                    type="checkbox"
                    title="Activate/deactivate filter"
                    checked={checkIfFilterExists(key, options.altName, option)}
                    on:change={() =>
                      event != undefined
                        ? updateAPIFilters(event, options.altName != undefined ? options.altName : 'sourceName', option)
                        : null}
                  />
                  <label for={option}>{option.replaceAll('/', ' / ')}</label>
                {/if}
              </div>
            </AthenaFilter>
          {/if}
        {/if}
      {/each}
      <div data-name="activated-filters">
        {#each [...activatedAthenaFilters] as [filter, values]}
          {#each values as value}
            <div
              data-name="activated-filter"
              id={value}
              style={`background-color: ${filterColors[filterNames[filter]]}`}
            >
              <button on:click={() => removeFilter(filter, value)}>
                <SvgIcon href="{base}/icons.svg" id="x" width="16px" height="16px" />
              </button>
              <p>{value}</p>
            </div>
          {/each}
        {/each}
      </div>
    </div>
  </section>
  <section data-name="table-pop-up">
    <div data-name="concept-choice">
      <button>
        <input type="radio" bind:group={conceptSelection} id="athena" name="concept-type" value="athena" />
        <label for="athena">Athena concepts</label>
      </button>
      <button>
        <input type="radio" bind:group={conceptSelection} id="custom" name="concept-type" value="custom" />
        <label for="custom">Custom concept</label>
      </button>
    </div>
    {#if conceptSelection === 'athena'}
      <div data-name="table-container">
        <DataTable
          data={fetchData}
          columns={athenaColumns}
          options={{
            id: 'athena',
            actionColumn: true,
            rowsPerPageOptions: [5, 10, 15, 20],
            globalFilter: globalFilter,
            saveOptions: false,
            singleSort: true,
            dataTypeImpl: new AthenaDataTypeImpl(),
          }}
          bind:this={dataTableAthena}
        >
          <AthenaRow slot="default" let:renderedRow let:columns {renderedRow} {columns} dblClickAction={rowSelected} />
        </DataTable>
      </div>
    {:else if conceptSelection === 'custom'}
      <div data-name="custom-concept-container">
        <h2>Create a custom concept</h2>
        <DataTable
          data={customConceptData}
          columns={customColumns}
          options={{ actionColumn: true, id: 'createCustomConcepts', saveOptions: false }}
        >
          <InputRow slot="default" let:columns {columns} data={customRow} on:customMappingInput={customMapping} />
        </DataTable>

        {#if errorMessage}
          <div data-name="errormessage">
            <p>{errorMessage}</p>
            <button
              on:click={() => {
                errorMessage = ''
              }}><SvgIcon href="{base}/icons.svg" id="x" width="16px" height="16px" /></button
            >
          </div>
        {/if}
      </div>
    {/if}
  </section>
</div>
