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

  async function showConcept(row: Record<string, any>) {
    selected = row
  }
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

  <div class="container">
    <Search {views}>
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
