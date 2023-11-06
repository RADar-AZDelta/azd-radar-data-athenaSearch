<!-- Copyright 2023 RADar-AZDelta -->
<!-- SPDX-License-Identifier: gpl3+ -->
<script lang="ts">
  let value: string = ''

  async function equivalenceChange(e: Event) {
    value = (<any>e.target).value
  }
</script>

<div data-name="equivalence">
  <select title="Equivalence" name="equivalence" id="equivalence" on:change={equivalenceChange}>
    <option value="EQUAL">EQUAL</option>
    <option value="EQUIVALENT">EQUIVALENT</option>
    <option value="WIDER">WIDER</option>
    <option value="NARROWER">NARROWER</option>
    <option value="INEXACT">INEXACT</option>
    <option value="UNMATCHED">UNMATCHED</option>
    <option value="UNREVIEWED">UNREVIEWED</option>
  </select>
</div>
