//Copyright 2023 RADar-AZDelta
//SPDX-License-Identifier: gpl3+
import type { IPagination } from '@radar-azdelta/svelte-datatable'

export function reformatDate(date: Date = new Date()) {
  return `${date.getFullYear()}-${
    (date.getMonth() + 1).toString().length === 2 ? date.getMonth() + 1 : `0${date.getMonth() + 1}`
  }-${date.getDate().toString().length === 2 ? date.getDate() : `0${date.getDate()}`}`
}

export async function assembleAthenaURL(
  url: string,
  apiFilters: string[] = [],
  columns: Record<string, string>,
  flt?: string,
  srt?: string[],
  pg?: IPagination,
  auto?: boolean
): Promise<string> {
  let assembledAthenaUrl = url
  // Apply the api filters
  if (apiFilters) {
    for (let filter of apiFilters) {
      assembledAthenaUrl += filter
    }
  }
  // Add sorting to URL if there is sorting
  if (srt) {
    const sortingName = columns[srt[0] as keyof object]
    assembledAthenaUrl += `&sort=${sortingName}&order=${srt[1]}`
  }
  // Add filter to URL if there is a filter
  if (flt) {
    assembledAthenaUrl += `&query=${flt}`
  }
  // Add pagination to URL if there is pagination
  if (auto) {
    assembledAthenaUrl += '&page=1'
    assembledAthenaUrl += '&pageSize=1'
  } else if (pg && !auto) {
    assembledAthenaUrl += `&page=${pg.currentPage}`
    assembledAthenaUrl += `&pageSize=${pg.rowsPerPage}`
  }
  return encodeURI(assembledAthenaUrl)
}

export async function csvToBlob(columns: string[], data: any[] | any[][] | undefined) {
  const csvString = await getCsvString(columns, data)
  const blob = new Blob([csvString], { type: 'text/csv' })
  return blob
}

export async function getCsvString(columns: string[], data: any[] | any[][] | undefined) {
  if (!data) return ''
  let csvArrayObjObjects = ''
  let keyCounterArrayOfObjects: number = 0
  for (let row = 0; row <= data.length; row++) {
    for (let col of columns) {
      if (!row) {
        csvArrayObjObjects += col + (keyCounterArrayOfObjects + 1 < columns.length ? ',' : '\r\n')
        keyCounterArrayOfObjects++
      } else {
        const value = (<any[]>data)[row - 1][col as keyof object].toString().replaceAll(',', ';')
        csvArrayObjObjects += value + (keyCounterArrayOfObjects + 1 < columns.length ? ',' : '\r\n')
        keyCounterArrayOfObjects++
      }
    }
    keyCounterArrayOfObjects = 0
  }
  return csvArrayObjObjects
}
