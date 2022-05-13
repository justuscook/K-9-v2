import { Collection, MongoClient } from "mongodb";
import { dbuser, dbpass } from '../config.json';

/**
 * 
 * @returns MongoClient connected to the bot DB
 */
export async function
    connectToDB(): Promise<MongoClient> {
    const uri = `mongodb+srv://${dbuser}:${dbpass}@k-9-cluster0.5xdl1.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`
    const mongoClient: MongoClient = new MongoClient(uri);
    return mongoClient;
}

/**
 * 
 * @param name Name of the collection
 * @param client The client that connected already
 * @returns The collection, usually need to add a type or .toArray()
 */
export async function
    connectToCollection(name: string, client: MongoClient): Promise<Collection> {
    await client.connect();
    const collection = await client.db('k9').collection(name);
    return collection;
}
//DB data format
export interface IClanQuestMessage {
    clanQuestMessage: string,
    channelId: string
}