/**
 * This file defines the Model class, which is the base class for all models in the application.
 * A Model is a class that represents a single entity in the application, such as a user, a post, or a comment.
 * It provides methods for creating, reading, updating, and deleting instances of the entity in the database.
 * The Model class uses the DB object from the DB.js file to interact with the SQLite database.
 * Methods to interact with the database will be added to the DB class in the next steps, and will include methods for creating, reading, updating, and deleting records in the database.
 * The Model class will be extended by specific model classes, such as the User class, to provide methods for interacting with specific entities in the database.
 */
const DB = require('./DatabaseManager');

class Model {
    constructor(tableName, fields, props = {}) {
        this.tableName = tableName;
        this.fields = fields;
        this.props = props;
    }

    /**
     * Create a new record in the database.
     */
    create() {
        DB.create(this.tableName, this.props);
    }

    // Method to read records from the database
    read(where = '', values = []) {
        return DB.read(this.tableName, where, values).map(row => this.mapToModel(row));
    }

    // Method to find a record by id
    static async find(id) {
        return await DB.find(this.tableName, id);
    }

    /**
     * Get all records of this Model from the database.
     * @returns {Array} - An array of Model instances for each record in the database.
     */
    static async all() {
        return await DB.read(this.tableName);
    }

    // Method to update a record in the database
    static update() {
        DB.update(this.tableName, this.props.id, this.props);
    }

    // Method to delete a record from the database
    static delete() {
        DB.delete(this.tableName, this.props.id);
    }

    // Method to map a database row to a model instance
    mapToModel(row) {
        let obj = new this.constructor();
        obj.props = row;
        return obj;
    }
}

module.exports = Model;