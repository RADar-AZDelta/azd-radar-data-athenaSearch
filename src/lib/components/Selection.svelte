<!-- Copyright 2023 RADar-AZDelta -->
<!-- SPDX-License-Identifier: gpl3+ -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import type { CustomOptionsEvents } from '../Types.d.ts'

  let conceptSelection: string = 'athena'

  const dispatch = createEventDispatcher<CustomOptionsEvents>()

  $: {
    conceptSelection
    dispatch('selectionChanged', { selection: conceptSelection })
  }
</script>

<div data-name="concept-choice">
  <button>
    <input type="radio" bind:group={conceptSelection} id="athena" name="concept-type" value="athena" />
    <label for="athena">Athena concepts</label>
  </button>
  <button>
    <input type="radio" bind:group={conceptSelection} id="custom" name="concept-type" value="custom" />
    <label for="custom">Custom concept</label>
  </button>
</div>
