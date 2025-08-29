const {MongoClient} = require('mongodb')

class MongoDbUtils {
    constructor() {
        this.uri = process.env.MONGODB_URI || 'mongodb+srv://thongtpvinh3:RBZkPEdg7Rzgm5.@cluster0.9b2vw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
        this.client = new MongoClient(this.uri)
        this.db = null
    }

    async connect(dbName) {
        if (!this.db) {
            try {
                await this.client.connect()
                this.db = this.client.db(dbName)
            } catch (error) {
                console.error("Failed to connect to MongoDB", error)
            }
        }
        return this.db
    }

    // Get a collection
    getCollection(collectionName) {
        if (!this.db) {
            throw new Error('Database not connected. Call connect() first.');
        }
        return this.db.collection(collectionName);
    }

    // Close the connection
    async closeConnection() {
        if (this.client) {
            await this.client.close();
            this.db = null;
        }
    }
}

module.exports = new MongoDbUtils();