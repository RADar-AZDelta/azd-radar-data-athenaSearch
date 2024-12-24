import type { IUrlAssembly } from '../interfaces/Types'
import type { IPagination, SortDirection } from '@radar-azdelta/svelte-datatable'

export default class AthenaURL {
  static async assembleAthenaURL(assembly: IUrlAssembly, baseUrl: string = 'https://athena.ohdsi.org/api/v1/concepts?'): Promise<string> {
    const { apiFilters, columns, filter, sort, pagination, autoMap } = assembly
    let assembledAthenaUrl = baseUrl
    assembledAthenaUrl = await this.addApiFiltersToUrl(assembledAthenaUrl, apiFilters)
    assembledAthenaUrl = await this.addSortingToUrl(assembledAthenaUrl, sort, columns)
    assembledAthenaUrl = await this.addQueryFilterToUrl(assembledAthenaUrl, filter)
    assembledAthenaUrl = await this.addPaginationToUrl(assembledAthenaUrl, autoMap, pagination)
    return encodeURI(assembledAthenaUrl)
  }

  private static async addApiFiltersToUrl(url: string, apiFilters: string[] | undefined): Promise<string> {
    if (!apiFilters) return url
    url += apiFilters.join('&')
    for (const filter of apiFilters) url += filter
    return url
  }

  private static async addSortingToUrl(url: string, sort: [string, SortDirection] | undefined, columns: Record<string, string>): Promise<string> {
    if (!sort) return url
    const sortingName = columns[sort[0] as keyof object]
    url += `&sort=${sortingName}&order=${sort[1]}`
    return url
  }

  private static async addQueryFilterToUrl(url: string, filter: string | undefined): Promise<string> {
    if (!filter) return url
    url += `&query=${filter}`
    return url
  }

  private static async addPaginationToUrl(url: string, autoMap: boolean | undefined, pagination: IPagination | undefined): Promise<string> {
    if (autoMap) url += '&page=1&pageSize=1'
    else if (pagination) url += `&page=${pagination.currentPage}&pageSize=${pagination.rowsPerPage}`
    return url
  }
}
