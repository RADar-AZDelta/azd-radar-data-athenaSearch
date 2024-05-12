import filters from '$lib/constants/filters.json'
import columnNames from '$lib/constants/columnNames.json'
import filterConfig from '$lib/constants/filterConfig.json'
import columnsAthena from '$lib/constants/columnsAthena.json'
import defaultTableOptions from '$lib/constants/defaultTableOptions.json'

export default class Config {
  static columnNames = columnNames
  static columnsAthena = columnsAthena
  static defaultTableOptions = defaultTableOptions
  static filterConfig = filterConfig
  static filters = filters
}
