<script lang="ts">
  import type { IColumnMetaData } from '@radar-azdelta/svelte-datatable'
  import type { AutoCompleteEventDetail, ICustomConcept, IinputConfig } from '$lib/Types'
  import AutocompleteInput from '$lib/components/AutocompleteInput.svelte'

  export let columns: IColumnMetaData[] | undefined, data: Record<string, IinputConfig>

  let convertedRow: Record<string, string> = {}

  async function saveToRow(e: CustomEvent<AutoCompleteEventDetail>) {
    data[e.detail.id].value = e.detail.value
  }

  function convertResult(): void {
    for (let item of Object.entries(data)) convertedRow[item[0]] = item[1].value
  }

  $: {
    data
    convertResult()
  }
</script>

{#if columns}
  <slot name="action" result={convertedRow} />
  {#each columns || [] as column (column.id)}
    <td>
      <div data-name="cell-container">
        {#if data[column.id].inputAvailable}
          {#if data[column.id].suggestions}
            <AutocompleteInput
              id={column.id}
              initial={data[column.id].value}
              list={data[column.id].suggestions}
              on:autoComplete={saveToRow}
            />
          {:else}
            <input type="text" bind:value={data[column.id].value} />
          {/if}
        {:else}
          <p>{data[column.id].value}</p>
        {/if}
      </div>
    </td>
  {/each}
{/if}
