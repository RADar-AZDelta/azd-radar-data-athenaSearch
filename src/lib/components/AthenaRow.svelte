<!-- Copyright 2023 RADar-AZDelta -->
<!-- SPDX-License-Identifier: gpl3+ -->
<script lang="ts">
  import SvgIcon from '$lib/components/SvgIcon.svelte'
  import type { IAthenaRowProps } from '$lib/interfaces/Types'

  let { renderedRow, columns, iconSize, selectRow, actionChild }: IAthenaRowProps = $props()

  const selected = () => selectRow(renderedRow)

  function referToAthena(row: Record<string, any>): void {
    const referUrl = 'https://athena.ohdsi.org/search-terms/terms/' + row.id
    window.open(encodeURI(referUrl), '_blank')?.focus()
  }
</script>

<td data-name="actions-cell">
  {#if actionChild}
    {@render actionChild(renderedRow)}
  {:else}
  <div data-name="actions-grid">
    <button onclick={() => referToAthena(renderedRow)}>
      <SvgIcon id="link" width={iconSize} height={iconSize} />
    </button>
  </div>
  {/if}
</td>
{#if columns}
  {#each columns || [] as column (column.id)}
    <td ondblclick={selected}>
      <div data-name="cell-container">
        <p title={renderedRow[column.id]}>{renderedRow[column.id]}</p>
      </div>
    </td>
  {/each}
{/if}