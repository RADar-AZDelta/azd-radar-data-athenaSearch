//Copyright 2023 RADar-AZDelta
//SPDX-License-Identifier: gpl3+
declare global {
  namespace App {}
  namespace svelteHTML {
    interface HTMLAttributes<T> {
      'on:outClick'?: (event: CustomEvent) => void
    }
  }
}

export {}
