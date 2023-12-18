//Copyright 2023 RADar-AZDelta
//SPDX-License-Identifier: gpl3+
import { DataTypeCommonBase } from '@radar-azdelta/svelte-datatable/components/datatable/data/DataTypeCommonBase'
import { csvToBlob, getCsvString } from '$lib/utils'
import type { TFilter } from '@radar-azdelta/svelte-datatable'
import type {
  FetchDataFunc,
  IColumnMetaData,
  IDataTypeFunctionalities,
  IDataTypeInfo,
  IRender,
  SortDirection,
} from '@radar-azdelta/svelte-datatable/components/DataTable'

export class AthenaDataTypeImpl extends DataTypeCommonBase implements IDataTypeFunctionalities {
  async setData(dataTypeInfo: IDataTypeInfo): Promise<void> {
    const { data, internalOptions, internalColumns, renderedData } = dataTypeInfo
    this.data = data
    this.internalOptions = internalOptions
    this.internalColumns = internalColumns
    this.renderedData = renderedData
  }

  async setInternalColumns(columns: IColumnMetaData[] | undefined): Promise<IColumnMetaData[]> {
    if (columns) this.internalColumns = columns
    if (!this.internalColumns) return []
    for (let col of this.internalColumns) if (!col.width) col.width = this.internalOptions!.defaultColumnWidth
    return this.internalColumns
  }

  async render(): Promise<IRender> {
    const filteredColumns = this.internalColumns!.reduce<Map<string, TFilter>>((acc, cur) => {
      if (cur && cur.filter) acc.set(cur.id, cur.filter)
      return acc
    }, new Map<string, TFilter>())
    const sortedColumns = this.internalColumns!.reduce<Map<string, SortDirection>>((acc, cur) => {
      if (cur && cur.sortDirection) acc.set(cur.id, cur.sortDirection)
      return acc
    }, new Map<string, SortDirection>())
    const results = await (this.data as FetchDataFunc)(filteredColumns, sortedColumns, this.internalOptions!)
    const originalIndices = Array.from({ length: results.data.length }, (_, i) => i)
    const totalRows = results.totalRows
    this.renderedData = results.data

    return { originalIndices, totalRows, renderedData: this.renderedData, internalColumns: this.internalColumns }
  }

  async saveToFile(): Promise<void> {
    const fileHandle: FileSystemFileHandle = await (<any>window).showSaveFilePicker(this.saveOptions)
    const csvString = await getCsvString(this.internalColumns?.map(col => col.id) ?? [], this.renderedData)
    const writableArrayOfObjects = await fileHandle.createWritable()
    await writableArrayOfObjects.write(csvString)
    await writableArrayOfObjects.close()
  }

  async getBlob(): Promise<Blob> {
    return (await csvToBlob(this.internalColumns?.map(col => col.id) ?? [], this.renderedData)) ?? new Blob([])
  }

  async replaceValuesOfColumn(): Promise<void> {}

  async executeExpressionsAndReturnResults(): Promise<void> {}

  async executeQueryAndReturnResults(): Promise<void> {}

  async insertColumns(): Promise<void> {}

  async getFullRow(): Promise<void> {}

  async getNextRow(): Promise<any> {}

  async getPreviousRow(): Promise<any> {}

  async deleteRows(): Promise<void> {}

  async insertRows(): Promise<void> {}

  async updateRows(): Promise<void> {}

  async renameColumns(): Promise<void> {}

  async applyFilter(): Promise<void> {}

  async applySort(): Promise<void> {}
}
