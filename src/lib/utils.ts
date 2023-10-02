//Copyright 2023 RADar-AZDelta
//SPDX-License-Identifier: gpl3+
import type { IPagination } from '@radar-azdelta/svelte-datatable'

export function reformatDate(date: Date = new Date()) {
    return `${date.getFullYear()}-${
        (date.getMonth() + 1).toString().length === 2
          ? date.getMonth() + 1
          : `0${date.getMonth() + 1}`
      }-${date.getDate().toString().length === 2 ? date.getDate() : `0${date.getDate()}`}`
}

export async function assembleAthenaURL (url: string, apiFilters: string[] = [], columns: Record<string, string>, flt?: string, srt?: string[], pg?: IPagination, auto?: boolean): Promise<string> {
    let assembledAthenaUrl = url
    // Apply the api filters
    if (apiFilters) {
      for (let filter of apiFilters) {
        assembledAthenaUrl += filter
      }
    }
    // Add sorting to URL if there is sorting
    if (srt) {
      const sortingName = columns[srt[0] as keyof Object]
      assembledAthenaUrl += `&sort=${sortingName}&order=${srt[1]}`
    }
    // Add filter to URL if there is a filter
    if (flt) {
      assembledAthenaUrl += `&query=${flt}`
    }
    // Add pagination to URL if there is pagination
    if (auto) {
      assembledAthenaUrl += `&page=1`
      assembledAthenaUrl += `&pageSize=1`
    } else if (pg && !auto) {
      assembledAthenaUrl += `&page=${pg.currentPage}`
      assembledAthenaUrl += `&pageSize=${pg.rowsPerPage}`
    }
    return encodeURI(assembledAthenaUrl)
  }