//Copyright 2023 RADar-AZDelta
//SPDX-License-Identifier: gpl3+
import Search from './components/Search.svelte'
import AthenaURL from './helpers/AthenaURL'
import type { IView, ILimitedFilter } from './interfaces/Types'

const assembleURL = AthenaURL.assembleAthenaURL.bind(AthenaURL)

export { Search, assembleURL }
export type { IView, ILimitedFilter }
