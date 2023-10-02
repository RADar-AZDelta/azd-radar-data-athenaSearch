<script lang="ts">
  import { base } from '$app/paths'
  import type { IColumnMetaData } from '@radar-azdelta/svelte-datatable'
  import SvgIcon from '$lib/components/SvgIcon.svelte'

  export let renderedRow: Record<string, any>,
    columns: IColumnMetaData[] | undefined,
    dblClickAction: Function,
    custom: boolean = false

  function referToAthena(): void {
    const referUrl = 'https://athena.ohdsi.org/search-terms/terms/' + renderedRow.id
    window.open(encodeURI(referUrl), '_blank')?.focus()
  }
</script>

<td data-name="actions-cell">
  {#if custom}
    <slot name="action-athena" {renderedRow} />
  {:else}
    <div data-name="actions-grid">
      <button on:click={referToAthena}><SvgIcon href="{base}/icons.svg" id="link" width="16px" height="16px" /></button>
    </div>
  {/if}
</td>
{#if columns}
  {#each columns || [] as column (column.id)}
    <td on:dblclick={() => dblClickAction(renderedRow)}>
      <div data-name="cell-container">
        <p title={renderedRow[column.id]}>{renderedRow[column.id]}</p>
      </div>
    </td>
  {/each}
{/if}
