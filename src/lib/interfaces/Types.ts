//Copyright 2023 RADar-AZDelta
//SPDX-License-Identifier: gpl3+
import type { IColumnMetaData, IPagination, ITableOptions, SortDirection } from '@radar-azdelta/svelte-datatable'
import type { Snippet } from 'svelte'

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
  viewSlot: number
}

export interface IAthenaFilterProps {
  filter: IFilter
  openedFilter: string
  color: string
  athenaFilters: Map<string, string[]>
  filtering: (checked: boolean, filter: string, option: string) => Promise<void>
}

export interface IAthenaRowProps {
  renderedRow: Record<string, any>
  columns: IColumnMetaData[] | undefined
  iconSize: string
  selectRow: (row: Record<string, any>) => Promise<void>
  actionChild?: Snippet<[renderedRow: Record<string, any>]>
}

export interface IFilterProps {
  facets: Record<string, any> | undefined
  athenaFilters: Map<string, string[]>
  show: boolean
  filters: IAthenaFilter[]
  limitedFilters: ILimitedFilter[]
  updateFilters: (filters: Map<string, string[]>) => Promise<void>
}

export interface ISelectionProps {
  views: IView[]
  changeView: (selection: number) => Promise<unknown>
}

export interface ISvgIconProps {
  width?: string
  height?: string
  id: string
}

export interface ITableFilter {
  column: string
  filter: string | undefined
}

export interface ISearchProps {
  views?: IView[]
  globalFilter?: ITableFilter
  tableOptions?: ITableOptions
  height?: string
  width?: string
  fontSize?: string
  showFilters?: boolean
  limitedFilters?: ILimitedFilter[]
  facets?: Record<string, any>
  fetchData?: (
    filter: string | undefined,
    columns: Record<string, string>,
    athenaFilters: Map<string, string[]>,
    sorts: Map<string, SortDirection>,
    pagination: IPagination,
  ) => Promise<{
    data: any
    totalRows: any
  }>
  selectRow?: (row: Record<string, any>) => Promise<void>
  leftChild?: Snippet
  rightChild?: Snippet
  upperChild?: Snippet
  firstView?: Snippet
  secondView?: Snippet
  actionChild?: Snippet<[renderedRow: Record<string, any>]>
  getVocabularies: () => Promise<IVocabulary[]>
  getDomains: () => Promise<IDomain[]>
  getConceptClasses: () => Promise<IConceptClass[]>
}

export interface IDomain {
  domain_id: string
  domain_name: string
  domain_concept_id: number
}

export interface IVocabulary {
  vocabulary_concept_id: number
  vocabulary_id: string
  vocabulary_name: string
  vocabulary_reference: string
  vocabulary_version: string
}

export interface IConceptClass {
  concpet_class_concept_id: number
  concept_class_id: string
  concept_class_name: string
}

export interface ILimitedFilter {
  name: string
  options: string[]
  deletable?: boolean
  exclude?: boolean
  value?: string
}

export interface IUrlAssembly {
  apiFilters?: string[]
  columns: Record<string, string>
  filter?: string
  sort?: [string, SortDirection]
  pagination?: IPagination
  autoMap?: boolean
}

export interface IAthenaFilter {
  name: string
  altName: string
  altNameFacet: string
  options: string[]
}
