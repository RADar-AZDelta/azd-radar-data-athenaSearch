//Copyright 2023 RADar-AZDelta
//SPDX-License-Identifier: gpl3+
import type { IColumnMetaData, IPagination, ITableOptions } from '@radar-azdelta/svelte-datatable'
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
  facets: Record<string, any>
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
  changeView: (selection: number) => Promise<void>
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
  selectRow?: (row: Record<string, any>) => Promise<void>
  leftChild?: Snippet
  rightChild?: Snippet
  upperChild?: Snippet
  firstView?: Snippet
  secondView?: Snippet
  actionChild?: Snippet<[renderedRow: Record<string, any>]>
}

export interface ILimitedFilter {
  name: string
  options: string[]
  exclude?: boolean
  value?: string
}

export interface IUrlAssembly {
  apiFilters?: string[]
  columns: Record<string, string>
  filter?: string
  sort?: [string, string]
  pagination?: IPagination
  autoMap?: boolean
}

export interface IAthenaFilter {
  name: string
  altName: string
  altNameFacet: string
  options: string[]
}
