<!-- Copyright 2023 RADar-AZDelta -->
<!-- SPDX-License-Identifier: gpl3+ -->
<script lang="ts">
  import SvgIcon from '../components/SvgIcon.svelte'
  import type { IAthenaRowProps } from '../interfaces/Types'

  let { renderedRow, columns, iconSize, selectRow, actionChild }: IAthenaRowProps = $props()

  const baseURLAthenaDetail: string = 'https://athena.ohdsi.org/search-terms/terms/'
  const selected = () => selectRow(renderedRow)

  function referToAthena(): void {
    const referUrl = baseURLAthenaDetail + renderedRow.id
    // Open the URL in a new tab and direct the user to this tab
    window.open(encodeURI(referUrl), '_blank')?.focus()
  }
</script>

<td data-name="actions-cell">
  {#if actionChild}
    {@render actionChild(renderedRow)}
  {:else}
    <div data-name="actions-grid">
      <button onclick={referToAthena}><SvgIcon id="link" width={iconSize} height={iconSize} /></button>
    </div>
  {/if}
</td>
{#if columns}
  {#each columns || [] as { id } (id)}
    <td ondblclick={selected} style={`background-color: ${renderedRow['nbr_used'] > 0 ? 'lime' : ''}`}>
      <div data-name="cell-container">
        <p title={renderedRow[id]}>{renderedRow[id]}</p>
      </div>
    </td>
  {/each}
{/if}
