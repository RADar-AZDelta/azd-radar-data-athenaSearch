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

export interface IinputConfig {
  suggestions?: Record<string, string | number>
  inputAvailable: boolean
  value: string
}

export interface ICustomConcept {
  conceptId: string
  conceptName: string
  domainId: string
  vocabularyId: string
  conceptClassId: string
  standardConcept: string
  conceptCode: string
  validStartDate: string
  validEndDate: string
  invalidReason: string
}

export interface ICustomColumn {
  id: string
  label?: string
  value?: string
}

// Events

export interface CustomOptionsEvents {
  autoComplete: AutoCompleteEventDetail
  customRowCreation: CustomRowCreationEventDetail
  selectionChanged: SelectionChangedEventDetail
  rowSelected: RowSelectedEventDetail
}

export interface AutoCompleteEventDetail {
  id: string
  value: any
  key: string
}

export interface CustomRowCreationEventDetail {
  concept: ICustomConcept
}

export interface SelectionChangedEventDetail {
  selection: string
}

export interface RowSelectedEventDetail {
  row: Record<string, any>
}