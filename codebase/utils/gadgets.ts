import { ObjectId } from "mongodb";

/**
 * 
 * Convert smth into ObjectId
 * 
 * @param input Any input works, as long as it can be used to create an ObjectId
 * @returns 
 */
export const toObjId = (input: any): ObjectId => {
    return new ObjectId(input)
}