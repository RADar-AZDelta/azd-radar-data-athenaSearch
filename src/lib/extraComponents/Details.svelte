<!-- Copyright 2023 RADar-AZDelta -->
<!-- SPDX-License-Identifier: gpl3+ -->
<script lang="ts">
  import SvgIcon from '../components/SvgIcon.svelte'
  import AutocompleteInputSettings from './AutocompleteInputSettings.svelte'
  import Equivalence from './Equivalence.svelte'

  let show: boolean = false
  let reviewer: string = ''

  async function sideVisibilityChange(value: boolean) {
    show = value
  }
</script>

{#if show}
  <section class="container">
    <div class="head">
      <button class="button" on:click={() => sideVisibilityChange(false)}>
        <SvgIcon href="/icons.svg" id="chevrons-right" width="16px" height="16px" />
      </button>
      <h2 class="title">Detail</h2>
    </div>
    <div class="info-container">
      <Equivalence />
      <div class="reviewer">
        <p>Assigned reviewer: {reviewer}</p>
        <AutocompleteInputSettings />
      </div>
      <div class="comments">
        <p>Comments</p>
        <textarea title="Comments" name="Comments" id="Comments" cols="28" rows="6" />
      </div>
    </div>
  </section>
{:else}
  <div class="sidebar-left">
    <button class="closed-bar" on:click={() => sideVisibilityChange(true)}>
      <SvgIcon href="/icons.svg" id="chevrons-left" width="16px" height="16px" />
      <p>D</p>
      <p>E</p>
      <p>T</p>
      <p>A</p>
      <p>I</p>
      <p>L</p>
    </button>
  </div>
{/if}

<style>
  .container {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-width: 15%;
    padding: 0 0.5rem 0 1.5rem;
    border-left: 1px solid lightgray;
  }

  .head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 0;
  }

  .title {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0;
  }

  .button {
    background-color: inherit;
    cursor: pointer;
    border: none;
  }
  .sidebar-left {
    height: 100%;
    border-left: 1px solid var(--neutral);
    padding: 0.5rem;
  }

  .closed-bar {
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    cursor: pointer;
    border: none;
    background-color: inherit;
    font-weight: bold;
  }
</style>
