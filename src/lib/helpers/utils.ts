//Copyright 2023 RADar-AZDelta
//SPDX-License-Identifier: gpl3+
import type { IUrlAssembly } from '$lib/interfaces/Types'
import type { IPagination } from '@radar-azdelta/svelte-datatable'

export function debounce<T extends (...args: any[]) => any>(cb: T, wait: number) {
  let h: any
  const callable = (...args: any) => {
    clearTimeout(h)
    h = setTimeout(() => cb(...args), wait)
  }
  return <T>(<any>callable)
}

export async function assembleAthenaURL(assembly: IUrlAssembly, baseUrl: string = 'https://athena.ohdsi.org/api/v1/concepts?'): Promise<string> {
  const { apiFilters, columns, filter, sort, pagination, autoMap } = assembly
  let assembledAthenaUrl = baseUrl
  assembledAthenaUrl = await addApiFiltersToUrl(assembledAthenaUrl, apiFilters)
  assembledAthenaUrl = await addSortingToUrl(assembledAthenaUrl, sort, columns)
  assembledAthenaUrl = await addQueryFilterToUrl(assembledAthenaUrl, filter)
  assembledAthenaUrl = await addPaginationToUrl(assembledAthenaUrl, autoMap, pagination)
  return encodeURI(assembledAthenaUrl)
}

async function addApiFiltersToUrl(url: string, apiFilters: string[] | undefined): Promise<string> {
  if (!apiFilters) return url
  for (const filter of apiFilters) url += filter
  return url
}

async function addSortingToUrl(url: string, sort: [string, string] | undefined, columns: Record<string, string>): Promise<string> {
  if (!sort) return url
  const sortingName = columns[sort[0] as keyof object]
  url += `&sort=${sortingName}&order=${sort[1]}`
  return url
}

async function addQueryFilterToUrl(url: string, filter: string | undefined): Promise<string> {
  if (!filter) return url
  url += `&query=${filter}`
  return url
}

async function addPaginationToUrl(url: string, autoMap: boolean | undefined, pagination: IPagination | undefined): Promise<string> {
  if (autoMap) url += '&page=1&pageSize=1'
  else if (pagination) url += `&page=${pagination.currentPage}&pageSize=${pagination.rowsPerPage}`
  return url
}
