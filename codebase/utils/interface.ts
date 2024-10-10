// This file is responsible for interact with the MongoDB and redis, you may call it a wrapper or an interface
import { Collection, type CollectionInfo, type DeleteResult, type InsertOneResult, MongoClient, ObjectId, type UpdateResult, type WithId } from 'mongodb'
import type { MongoIntFind, ObjectAny } from './type'
import type { RedisClientType } from 'redis';

/**
 * 
 * Sanitize an object for MongoDB interface
 * 
 * @param object data
 * @returns safe data (**probably**)
 */
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
     * Push a new document into your db
     * 
     * @param collection - The collection you wanna operate with
     * @param object - the data
     * @param doSanitize - do Sanitize or not (true by default)
     */
    async add(collection: string, object: object, doSanitize: boolean = true): Promise<InsertOneResult> {
        const safeObj = doSanitize ? sanitize(object) : object
        return await this.client.db(this.db).collection(collection).insertOne(safeObj)
    }

    /**
     * 
     * Update a document inside ur db
     * 
     * @param collection  - The collection you want to operate with
     * @param objectID - the ObjectId of that document **Has to be the correct type: ObjectId**
     * @param updateObject - data
     * @param doSanitize - do Sanitize or not (true by default)
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
     * Remove a document from ur db
     * 
     * @param collection - The collection you wanna operate with
     * @param objectID - the ObjectId of that document **Has to be the correct type: ObjectId**
     */
    async del(collection: string, objectID: ObjectId): Promise<DeleteResult> {
        if (!ObjectId.isValid(objectID)) {
            throw new Error('Invalid ObjectId');
        }
        return await this.client.db(this.db).collection(collection).deleteOne({ _id: objectID })
    }
    /**
     * 
     * Grab a document from ur db
     * 
     * @param collection - The collection you wanna operate with
     * @param queryObject - queryObject as you would use with mongodb native driver
     * @param optObject - ref to the def of MongoIntFind
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
    /**
     * 
     * Create a new collection inside your db
     * 
     * @param collection Name of the collection you wanna create
     */
    async createCollection(collection: string): Promise<Collection<Document>> {
        return await this.client.db(this.db).createCollection(collection)
    }
    /**
     * 
     * Grab a list of available collections inside ur db
     * 
     * @returns An array contains all collections in your db
     */
    async getCollection(): Promise<(CollectionInfo | Pick<CollectionInfo, "name" | "type">)[]> {
        return await this.client.db(this.db).listCollections().toArray()
    }
    /**
     * 
     * For some Pros, this is the real mongodb native driver interface
     * 
     */
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