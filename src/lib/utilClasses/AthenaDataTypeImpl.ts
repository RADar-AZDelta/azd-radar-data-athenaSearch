//Copyright 2023 RADar-AZDelta
//SPDX-License-Identifier: gpl3+
import { DataTypeCommonBase } from '@radar-azdelta/svelte-datatable'
import type {
  TFilter,
  IDataTypeFunctionalities,
  IColumnMetaData,
  IDataTypeInfo,
  IRender,
  SortDirection,
  FetchDataFunc,
} from '@radar-azdelta/svelte-datatable'

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
}
