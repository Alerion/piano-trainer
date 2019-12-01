import _ from 'lodash'
import get from 'get-value'

import {
  Middleware, MiddlewareAPI, Dispatch, AnyAction,
} from 'redux'
import { Slice } from '@reduxjs/toolkit'


const NAMESPACE = 'redux_store'
const STATES_DEFAULT: any[] = []

type Path = string
type State = Record<string, any>
export type WorkspaceId = string

function realiseObject(objectPath: Path, objectInitialValue = {}) {
  function retrieve(objectPathArr: Path[], objectInProgress: State): any {
    if (objectPathArr.length === 0) {
      return objectInProgress
    }
    return retrieve(objectPathArr.slice(1), { [objectPathArr[0]]: objectInProgress })
  }
  return retrieve(objectPath.split('.').reverse(), objectInitialValue)
}

function saveToLocalStore(storeState: State, paths: Path[], workspaceId: WorkspaceId) {
  const namespace = `${NAMESPACE}_${workspaceId}`

  if (paths.length === 0) {
    localStorage[namespace] = JSON.stringify(storeState)
  } else {
    paths.forEach((path) => {
      const stateForLocalStorage = get(storeState, path)
      if (stateForLocalStorage !== undefined) {
        // console.log('saveToLocalStore', `${namespace}_${path}`, stateForLocalStorage)
        localStorage[`${namespace}_${path}`] = JSON.stringify(stateForLocalStorage)
      } else {
        // Make sure nothing is ever saved for this incorrect state
        console.warn(`Store ${path} is undefined while saving to localStore`)
        localStorage.removeItem(`${namespace}_${path}`)
      }
    })
  }
}

function getPersistPathsFromSlices(slices: Slice[]): Path[] {
  return _.flatten(slices.map((slice) => {
    if (slice.persistent === '*') {
      return slice.name
    }
    if (typeof slice.persistent !== 'string' && slice.persistent) {
      return slice.persistent.map(field => `${slice.name}.${field}`)
    }
    return []
  }))
}

export function load(paths: Path[], workspaceId: WorkspaceId): State {
  const namespace = `${NAMESPACE}_${workspaceId}`
  let loadedState = {}

  // Load all of the namespaced Redux data from LocalStorage into local Redux state tree
  if (paths.length === 0) {
    if (localStorage[namespace]) {
      loadedState = JSON.parse(localStorage[namespace])
    }
  } else { // Load only specified states into the local Redux state tree
    paths.forEach((path) => {
      const data = localStorage.getItem(`${namespace}_${path}`)
      if (data) {
        loadedState = _.merge(loadedState, realiseObject(path, JSON.parse(data)))
      }
    })
  }

  return loadedState
}

export function getSaveToStoreMiddleware(
  workspaceId: WorkspaceId, slices: Slice[], debounce: number = 200,
): Middleware {
  const persistPaths = getPersistPathsFromSlices(slices)
  const save = _.debounce(saveToLocalStore, debounce)

  return (api: MiddlewareAPI) => (next: Dispatch<AnyAction>) => (action: AnyAction) => {
    const returnValue = next(action)
    const storeState = api.getState()
    return save(storeState, persistPaths, workspaceId)
  }
}

export function getPersistentStateLoader(slices: Slice[]) {
  const persistPaths = getPersistPathsFromSlices(slices)

  // Used as default state when we can't load it from local storage
  const initialState = _.fromPairs(slices.map(slice => [slice.name, slice.initialState]))

  return function loadPersistentState(workspaceId: WorkspaceId) {
    const loadedState = load(persistPaths, workspaceId)
    return _.merge(_.cloneDeep(initialState), loadedState)
  }
}
