<!-- Copyright 2023 RADar-AZDelta -->
<!-- SPDX-License-Identifier: gpl3+ -->
<script lang="ts">
  export let href: string
  export let id: string
  export let width: string
  export let height: string

  // A component to access the icons from a certain svg file
</script>

<svg class={$$props.class} {width} {height}>
  <use href={`${href}#${id}`} />
</svg>
