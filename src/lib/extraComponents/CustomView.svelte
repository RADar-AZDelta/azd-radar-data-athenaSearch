<!-- Copyright 2023 RADar-AZDelta -->
<!-- SPDX-License-Identifier: gpl3+ -->
<script lang="ts">
  import customColumns from '$lib/config/customColumns.json'
  import suggestions from '$lib/config/suggestions.json'
  import { reformatDate } from '$lib/utils'
  import DataTable from '@radar-azdelta/svelte-datatable'
  import InputRow from './InputRow.svelte'
  import SvgIcon from '../components/SvgIcon.svelte'

  export let actionColumnCustom: boolean = false

  const inputAvailableColumns = ['code', 'name', 'className', 'domain', 'vocabulary']
  let errorMessage: string = ''

  async function getCustomColumnConfig() {
    const config: Record<string, any> = {}
    for (let col of customColumns) {
      const name = col.label ? col.label : col.id
      const columnConfig: any[] = customColumns.filter(col => col.id === name || col.label === name)
      config[col.id] = {
        inputAvailable: inputAvailableColumns.includes(name),
        value: columnConfig[0].value === 'date' ? reformatDate() : columnConfig[0].value ? columnConfig[0].value : '',
        suggestions: (<Record<string, any>>suggestions)[columnConfig[0].id],
      }
    }
    return config
  }

  async function customMapping() {}
</script>

<div class="custom-concept-container">
  <h2 class="custom-concept-title">Create a custom concept</h2>
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
    <div class="errormessage">
      <p>{errorMessage}</p>
      <button
        class="errormessage-button"
        on:click={() => {
          errorMessage = ''
        }}><SvgIcon href="/icons.svg" id="x" width="16px" height="16px" /></button
      >
    </div>
  {/if}
</div>

<style>
  .custom-concept-container {
    padding: 1rem 1rem 3rem 1rem;
  }

  .custom-concept-title {
    font-size: 24px;
    font-weight: 600;
    margin: 0;
    padding: 0 2rem;
    margin-bottom: 2rem;
  }

  .errormessage {
    display: flex;
    width: max-content;
    border-radius: 5px;
    align-items: center;
    gap: 1rem;
    border: 1px solid red;
    background-color: lightcoral;
    padding: 0.5rem 1rem;
  }

  .errormessage-button {
    background-color: inherit;
    border: none;
    cursor: pointer;
    padding: 0;
    height: auto;
  }
</style>
