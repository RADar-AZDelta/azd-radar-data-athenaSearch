export interface ICategories {
  altName: string
  altNameFacet: string
  options: string[]
}

export interface IFilter {
  name: string
  categories: ICategories
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

// Events

export interface CustomOptionsEvents {
  mapConceptId: MapConceptIdEventDetail
  autoComplete: AutoCompleteEventDetail
  customMapping: CustomMappingEventDetail
}

export interface MapConceptIdEventDetail {
  conceptId: string
  conceptName: string
}

export interface AutoCompleteEventDetail {
  id: string
  value: any
  key: string
}

export interface CustomMappingEventDetail {
  concept: ICustomConcept
}
