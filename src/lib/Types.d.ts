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

export interface IDataTypeInfo {
  data: any[] | any[][] | FetchDataFunc | File | undefined
  internalOptions: ITableOptions
  internalColumns: IColumnMetaData[] | undefined
  renderedData: any[] | any[][] | undefined
  modifyColumnMetadata?: ModifyColumnMetadataFunc
}

export interface IDataTypeFunctionalities {
  render(onlyPaginationChanged: boolean): Promise<IRender>
  saveToFile(): Promise<void>
  getBlob(): Promise<Blob>
  replaceValuesOfColumn(currentValue: any, updatedValue: any, column: string): Promise<void>
  executeExpressionsAndReturnResults(expressions: Record<string, any>): Promise<any>
  executeQueryAndReturnResults(query: Query | object): Promise<any>
  getFullRow(originalIndex: number): Promise<Record<string, any> | void>
  insertRows(rows: Record<string, any>[]): Promise<number[] | void>
  updateRows(rowsToUpdateByOriginalIndex: Map<number, Record<string, any>>): Promise<void>
  renameColumns(columns: Record<string, string>): Promise<void>
  applyFilter(data: any[] | any[][]): Promise<any[] | any[][] | void>
  applySort(data: any[] | any[][]): Promise<any[] | any[][] | void>
  setData(data: IDataTypeInfo): Promise<void>
  setInternalColumns(columns: IColumnMetaData[] | undefined): Promise<IColumnMetaData[]>
  applyPagination(internalOptions: ITableOptions, data: any[] | any[][]): Promise<any[] | any[][] | undefined>
  insertColumns(cols: IColumnMetaData[]): Promise<IColumnMetaData[] | void>
  deleteRows(originalIndices: number[]): Promise<void>
  destroy(): Promise<void>
}

export interface IRender {
  renderedData: any[] | any[][] | undefined
  originalIndices: number[]
  totalRows?: number
  internalColumns: IColumnMetaData[] | undefined
}
