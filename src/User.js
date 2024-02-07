const Model = require('./Model.js');
const bcrypt = require('bcrypt');

class User extends Model {
    static tableName = 'users';
    constructor(props) {
        super(
            User.tableName,
            [
                'email',
                'first_name',
                'last_name',
                'password',
                'is_admin'
            ],
            props
        );
        console.log(this.all());
    }

    /**
     * Find a User record by email.
     * @param {string} email 
     * @returns {User}
     */
    static findByEmail(email) {
        return DB.instance.read('WHERE email = ?', [email]).map(row => this.mapToModel(row));
    }

    /**
     * Validate a User's password.
     * @param {string} password 
     */
    static validatePassword(password) {
        const user = this.find(id);
        if (user) {
            return bcrypt.compare(password, user.password);
        }
        return false;
    }
}

module.exports = User;