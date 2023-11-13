<!-- Copyright 2023 RADar-AZDelta -->
<!-- SPDX-License-Identifier: gpl3+ -->
<script lang="ts">
  import type { IColumnMetaData } from '@radar-azdelta/svelte-datatable'

  export let renderedRow: Record<string, any>, columns: IColumnMetaData[] | undefined, dblClickAction: Function
</script>

<td data-name="actions-cell">
  {#if $$slots['action-athena']}
    <slot name="action-athena" {renderedRow} />
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
