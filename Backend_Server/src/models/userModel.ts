import { DataTypes, Model } from "sequelize";
import sequelize from "./db";

class User extends Model {
  public id!: number; // Auto-increment integer
  public email!: string;
  public password!: string;
  public name?: string;
  public age?: number;
  public gender?: string;
  public height_cm?: number;
  public weight_kg?: number;
  public activity_level?: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      unique: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    gender: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    height_cm: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    weight_kg: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    activity_level: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "users",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default User;
