<script lang="ts">
  import { base } from '$app/paths'
  import type { IColumnMetaData } from '@radar-azdelta/svelte-datatable'
  import SvgIcon from '$lib/components/SvgIcon.svelte'

  export let renderedRow: Record<string, any>, columns: IColumnMetaData[] | undefined, dblClickAction: Function

  function referToAthena(): void {
    const referUrl = import.meta.env.VITE_ATHENA_DETAIL + renderedRow.id
    window.open(encodeURI(referUrl), '_blank')?.focus()
  }
</script>

<td data-name="actions">
  <slot name="action" />
  <button on:click={referToAthena}><SvgIcon href="{base}/icons.svg" id="link" width="16px" height="16px" /></button>
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
