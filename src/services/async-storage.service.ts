import { utilService } from './util.service'

export const storageService = {
    query,
    get,
    post,
    put,
    remove,
}

async function query<T>(entityType: string, delay = 200): Promise<T[]> {
    const entities = utilService.loadFromStorage<T[]>(entityType) || []
    return new Promise(resolve => setTimeout(() => resolve(entities), delay))
}

async function get<T extends { id: string }>(entityType: string, entityId: string): Promise<T> {
    const entities = await query<T>(entityType)
    const entity = entities.find(e => e.id === entityId)
    if (!entity) throw new Error(`Cannot find entity with id ${entityId}`)
    return entity
}

async function post<T>(entityType: string, newEntity: T): Promise<T & { id: string }> {
    const entity = { ...newEntity, id: utilService.makeId() }
    const entities = await query<T & { id: string }>(entityType)
    entities.push(entity)
    utilService.saveToStorage(entityType, entities)
    return entity
}

async function put<T extends { id: string }>(entityType: string, updatedEntity: T): Promise<T> {
    const entities = await query<T>(entityType)
    const idx = entities.findIndex(e => e.id === updatedEntity.id)
    if (idx < 0) throw new Error(`Update failed, cannot find entity with id ${updatedEntity.id}`)
    entities.splice(idx, 1, updatedEntity)
    utilService.saveToStorage(entityType, entities)
    return updatedEntity
}

async function remove<T extends { id: string }>(entityType: string, entityId: string): Promise<void> {
    const entities = await query<T>(entityType)
    const idx = entities.findIndex(e => e.id === entityId)
    if (idx < 0) throw new Error(`Remove failed, cannot find entity with id ${entityId}`)
    entities.splice(idx, 1)
    utilService.saveToStorage(entityType, entities)
}