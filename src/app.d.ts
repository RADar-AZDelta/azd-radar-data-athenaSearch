//Copyright 2023 RADar-AZDelta
//SPDX-License-Identifier: gpl3+
declare global {
	namespace App {}

	namespace svelte.JSX {
		interface HTMLAttributes {
		  onoutClick: (e: CustomEvent) => void
		}
	  }
}

export {};