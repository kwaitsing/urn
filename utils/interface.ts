// This file is responsible for interact with the MongoDB and redis, you may call it a wrapper or an interface
import { Collection, type CollectionInfo, type DeleteResult, type InsertOneResult, MongoClient, ObjectId, type UpdateResult, type WithId } from 'mongodb'
import type { MongoIntFind, ObjectAny } from '../type'
import type { RedisClientType } from 'redis';

export const sanitize = (object: ObjectAny) => {
    if (object instanceof Object) {
        for (const key in object) {
            if (/^\$/.test(key)) {
                delete object[key];
            } else {
                sanitize(object[key]); // for nested
            }
        }
    }
    return object
}

export class Dbi {
    private db: string
    private client: MongoClient

    constructor(db: string, client: MongoClient) {
        this.db = db
        this.client = client
    }
    /**
     * 
     * @param collection - The collection you want to operate with
     * @param object - the object you want to write
     * @param doSanitize - do Sanitize or not (true by default)
     * @returns 
     */
    async add(collection: string, object: object, doSanitize: boolean = true): Promise<InsertOneResult> {
        const safeObj = doSanitize ? sanitize(object) : object
        return await this.client.db(this.db).collection(collection).insertOne(safeObj)
    }

    /**
     * 
     * @param collection  - The collection you want to operate with
     * @param objectID - remember to use toObjId() to ensure you're passing ObjectID
     * @param updateObject - Object you want to update
     * @param doSanitize - do Sanitize or not (true by default)
     * @returns 
     */
    async upd(collection: string, objectID: ObjectId, updateObject: object, doSanitize: boolean = true): Promise<UpdateResult> {
        if (!ObjectId.isValid(objectID)) {
            throw new Error('Invalid ObjectId');
        }
        const safeObj = doSanitize ? sanitize(updateObject) : updateObject
        return await this.client.db(this.db).collection(collection).updateOne({
            _id: objectID
        }, {
            $set: safeObj
        })
    }
    /**
     * 
     * @param collection - The collection you want to operate with
     * @param objectID - remember to use toObjId() to ensure you're passing ObjectID
     * @returns 
     */
    async del(collection: string, objectID: ObjectId): Promise<DeleteResult> {
        if (!ObjectId.isValid(objectID)) {
            throw new Error('Invalid ObjectId');
        }
        return await this.client.db(this.db).collection(collection).deleteOne({ _id: objectID })
    }
    /**
     * 
     * @param collection - The collection you want to operate with
     * @param queryObject - queryObject as you would use with mongodb native driver
     * @param optObject - ref to the def of MongoIntFind
     * @returns 
     */
    async get<T>(collection: string, queryObject: ObjectAny, optObject?: MongoIntFind): Promise<WithId<T>[]> {

        let doSanitize: boolean = true
        if (optObject?.doSanitize !== undefined) doSanitize = optObject.doSanitize
        const safeObj = doSanitize ? sanitize(queryObject) : queryObject

        let document: WithId<T>[] = [];

        let cursor = this.client.db(this.db).collection(collection).find(safeObj, optObject)
        for await (let docu of cursor) {
            document.push(docu as WithId<T>)
        }
        return document
    }
    async createCollection(collection: string): Promise<Collection<Document>> {
        return await this.client.db(this.db).createCollection(collection)
    }
    async getCollection(): Promise<(CollectionInfo | Pick<CollectionInfo, "name" | "type">)[]> {
        return await this.client.db(this.db).listCollections().toArray()
    }
    custom() {
        return this.client.db(this.db)
    }
}

export class CDbi {
    private cdb: RedisClientType<any>

    constructor(cdb: RedisClientType<any>) {
        this.cdb = cdb
    }
    async write(set: string, key: string, value: string | number) {
        return await this.cdb.hSet(set, key, value)
    }
    async get(set: string, key: string) {
        return await this.cdb.hGet(set, key)
    }
    async delete(set: string, key: string) {
        return await this.cdb.hDel(set, key)
    }
    custom() {
        return this.cdb
    }
}