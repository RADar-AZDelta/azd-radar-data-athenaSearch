<script lang="ts">
  import type { IColumnMetaData } from '@radar-azdelta/svelte-datatable'
  import type { AutoCompleteEventDetail, ICustomConcept, IinputConfig } from '$lib/Types'
  import AutocompleteInput from '$lib/components/AutocompleteInput.svelte'

  export let columns: IColumnMetaData[] | undefined, data: Record<string, IinputConfig>

  const concept: Record<string, string> = {}

  let mapped: ICustomConcept | undefined,
    mappedButton: boolean = false

  function checkRow() {
    if (
      mapped?.conceptName !== concept.concept_name ||
      mapped?.domainId !== concept.domain_id ||
      mapped?.vocabularyId !== concept.vocabulary_id ||
      mapped?.conceptClassId !== concept.concept_class_id
    )
      mappedButton = false
    else mappedButton = true
  }

  async function saveToRow(e: CustomEvent<AutoCompleteEventDetail>) {
    data[e.detail.id].value = e.detail.value
  }

  function convertResult(): Record<string, any> {
    const obj: Record<string, string> = {}
    for (let item of Object.entries(data)) obj[item[0]] = item[1].value
    return obj
  }
</script>

{#if columns}
  <slot name="action" result={convertResult()} />
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
