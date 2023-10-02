<!-- Copyright 2023 RADar-AZDelta -->
<!-- SPDX-License-Identifier: gpl3+ -->
<script lang="ts">
  import Search from '$lib/components/Search.svelte'
  let selected: Record<string, any> = {}

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
    data and perform some action for example. This custom action can also be given to the custom concept table.
  </p>

  <p>Selected Row: {JSON.stringify(selected)}</p>

  <div class="container">
    <Search filterAllColumns={true} sortOneColumn={false} actionColumnCustom={true}>
      <button slot="action-athena" let:renderedRow on:click={() => showConcept(renderedRow)}>Action</button>
      <button slot="action-custom-concept" let:renderedRow on:click={() => showConcept(renderedRow)}>Action</button>
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
