import { DataTypes, Model } from 'sequelize';
import sequelize from './db';

class User extends Model {
    public id!: number;
    public name!: string;
    public email!: string;
    public gender!: 'male' | 'female';
    public age!: number;
    public height_cm!: number;
    public weight_kg!: number;
    public created_at!: Date;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
    password: any;
}

User.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING(150),
        unique: true,
    },
    gender: {
        type: DataTypes.ENUM('male', 'female'),
        allowNull: false,
    },
    age: {
        type: DataTypes.INTEGER,
    },
    height_cm: {
        type: DataTypes.DECIMAL(5, 2),
    },
    weight_kg: {
        type: DataTypes.DECIMAL(5, 2),
    },
}, {
    sequelize,
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
});

export default User;