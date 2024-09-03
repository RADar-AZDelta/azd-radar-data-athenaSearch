import filters from '../constants/filters.json'
import filterNames from '../constants/filterNames.json'
import columnNames from '../constants/columnNames.json'
import filterConfig from '../constants/filterConfig.json'
import columnsAthena from '../constants/columnsAthena.json'
import defaultTableOptions from '../constants/defaultTableOptions.json'

export default class Config {
  static columnNames = columnNames
  static columnsAthena = columnsAthena
  static defaultTableOptions = defaultTableOptions
  static filterConfig = filterConfig
  static filters = filters
  static filterNames = filterNames
}
