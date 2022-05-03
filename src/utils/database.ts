import { Collection, MongoClient } from "mongodb";
import { dbuser, dbpass } from '../config.json';

export async function
    connectToDB(): Promise<MongoClient> {
    const uri = `mongodb+srv://${dbuser}:${dbpass}@k-9-cluster0.5xdl1.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`
    const mongoClient: MongoClient = new MongoClient(uri);
    return mongoClient;
}

export async function
    connectToCollection(name: string, client: MongoClient): Promise<Collection> {
    await client.connect();
    const collection = await client.db('k9').collection(name);
    return collection;
}

export interface IClanQuestMessage {
    channelId: string,
    clanQuestMessage: string
}