//Copyright 2023 RADar-AZDelta
//SPDX-License-Identifier: gpl3+
export interface IOptions {
  altName: string
  altNameFacet: string
  options: string[]
}

export interface IFilter {
  name: string
  opts: IOptions
}

export interface IView {
  name: string
  value: string
  viewSlot: 'slotView0' | 'slotView1' | 'slotView2'
}

// Events

export interface CustomOptionsEvents {
  viewChanged: ViewChangedEventDetail
  rowSelected: RowSelectedEventDetail
  updateFilters: UpdateFiltersEventDetail
}

export interface ViewChangedEventDetail {
  view: string
}

export interface RowSelectedEventDetail {
  row: Record<string, any>
}

export interface UpdateFiltersEventDetail {
  athenaFilters: Map<string, string[]>
}