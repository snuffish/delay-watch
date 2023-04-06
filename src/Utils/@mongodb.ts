/*import {
	ObjectID,
	MongoClient,
	Db,
	Collection
} from 'mongodb'
const dbInstance: DbInstance = {
	client: null,
	db: null
}
export const connect = async (): Promise<DBResponse> => {
	if (!process.env.MONGODB_URI) {
		throw new Error('DB Connection error => No DB URI')
	}
	const dbUrl: string = process.env.MONGODB_URI
	const dbName: string = 'wedding'
	try {
		dbInstance.client = await MongoClient.connect(dbUrl, {
			useUnifiedTopology: true
		})
		dbInstance.db = dbInstance.client.db(dbName)
		console.log('Successfully connected to DB')
		return { success: true }
	} catch (error) {
		console.log('DB Connection Error => ', error)
		return {
			success: false,
			error
		}
	}
}
export const disconnect = (): void => {
	if (dbInstance.client !== null) {
		dbInstance.db = null
		dbInstance.client.close()
		dbInstance.client = null
		console.log('Disconnected from DB')
	} else {
		console.log('DB already disconnected')
	}
}
export const findById = async (
	collectionName: string,
	id: string
): Promise<any> => {
	if (dbInstance.db === null) {
		throw new Error('DB not connected')
	} else {
		const collection = dbInstance.db.collection(collectionName)
		const result = await collection.findOne({ _id: new ObjectID(id) })
		return result
	}
}
export const findOne = async (
	collectionName: string,
	params: any
): Promise<any> => {
	if (dbInstance.db === null) {
		throw new Error('DB not connected')
	} else {
		const collection: Collection = dbInstance.db.collection(collectionName)
		const result = await collection.findOne(parseParams(params))
		return result
	}
}
export const findInCollection = async (
	collectionName: string,
	params: any
): Promise<DBResponse> => {
	if (dbInstance.db === null) {
		return {
			success: false,
			error: new Error('DB not connected')
		}
	} else {
		const collection = dbInstance.db.collection(collectionName)
		const result = await collection.find(parseParams(params)).toArray()
		return {
			success: true,
			data: result
		}
	}
}
export const saveOneInCollection = async (
	collectionName: string,
	params: any
)Promise<any> => {
	if (dbInstance.db === null) {
		throw new Error('DB not connected')
	} else {
		const collection: Collection = dbInstance.db.collection(collectionName)
		const result = await collection.insertOne(params)
		return result.ops[0]
	}
}
export const parseParams = (params: any): any => {
	const newParams: any = {}
	Object.keys(params).forEach((key: string): void => {
		if (key === 'id') {
			newParams._id = new ObjectID(params.id)
		} else {
			newParams[key] = params[key]
		}
	})
	return newParams
}
export interface DBResponse {
	success: boolean,
	data?: any,
	error?: Error
}
export interface DbInstance {
	client: MongoClient | null,
	db: Db | null
}*/