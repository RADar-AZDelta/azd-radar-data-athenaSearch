<!-- Copyright 2023 RADar-AZDelta -->
<!-- SPDX-License-Identifier: gpl3+ -->
<script lang="ts">
  import type { IView } from '$lib/Types'
  import Search from '$lib/components/Search.svelte'
  import CustomView from '$lib/extraComponents/CustomView.svelte'
  import Details from '$lib/extraComponents/Details.svelte'
  import Head from '$lib/extraComponents/Head.svelte'
  let selected: Record<string, any> = {}
  const views: IView[] = [
    { name: 'custom concept', value: 'custom', viewSlot: 'slotView1' },
    { name: 'mapped concepts', value: 'mapped', viewSlot: 'slotView2' },
  ]

  const rows = {
    row1: {
      sourceCode: '123',
      sourceName: 'test',
      sourceFrequency: 1,
    },
    row2: {
      sourceCode: '222',
      sourceName: 'work',
      sourceFrequency: 1,
    },
    row3: {
      sourceCode: '321',
      sourceName: 'last',
      sourceFrequency: 1,
    },
  }

  async function showConcept(row: Record<string, any>) {
    selected = row
  }

  let globalFilter: { column: string; filter: string | undefined } = { column: 'all', filter: undefined }
</script>

<svelte:head>
  <title>Svelte Athena Search</title>
  <meta name="description" content="Svelte Athena Search example with actions" />
</svelte:head>

<section class="page-container">
  <h1>Svelte Athena Search</h1>
  <p>
    This example shows that you can give custom actions on the left side of each row. This can be used to retrieve the
    data and perform some action for example. This custom action can also be given to the custom concept table. You can
    also customize the layout on the upper & right side. In this example I will use this to navigate through some
    fictive rows & to give more information.
  </p>

  <p>Selected Row: {JSON.stringify(selected)}</p>

  <div>
    <button on:click={() => (globalFilter.filter = rows.row1.sourceName)}>Row1</button>
    <button on:click={() => (globalFilter.filter = rows.row2.sourceName)}>Row2</button>
    <button on:click={() => (globalFilter.filter = rows.row3.sourceName)}>Row3</button>
  </div>

  <div class="container">
    <Search {views} bind:globalFilter>
      <button slot="action-athena" let:renderedRow on:click={() => showConcept(renderedRow)}>Action</button>
      <div slot="upperSlot">
        <Head />
      </div>
      <div slot="slotView1">
        <CustomView />
      </div>
      <div slot="rightSlot">
        <Details />
      </div>
    </Search>
  </div>
</section>

<style>
  .container {
    margin: 1rem 1rem 1rem 0;
    height: 60vh;
    border: 1px solid lightgray;
    border-radius: 5px;
    padding: 1rem 0;
  }
</style>
