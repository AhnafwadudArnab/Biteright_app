import { DataTypes, Model } from "sequelize";
import sequelize from "./db";

class DietMeal extends Model {
  public id!: string;
  public user_id!: string;
  public meal_type!: string;
  public eaten_at!: Date;
  public created_at!: Date;
}

DietMeal.init(
  {
    id: {
      type: DataTypes.CHAR(36),
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    user_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
    },
    meal_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    eaten_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "DietMeal",
    tableName: "meals",
    timestamps: false,
  },
);

export default DietMeal;
