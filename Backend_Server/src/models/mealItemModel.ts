import { DataTypes, Model } from "sequelize";
import sequelize from "./db";

class MealItem extends Model {
  public id!: string;
  public meal_id!: string;
  public food_id!: string;
  public quantity!: number;
  public calories!: number;
}

MealItem.init(
  {
    id: {
      type: DataTypes.CHAR(36),
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    meal_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
    },
    food_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
    },
    quantity: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
    },
    calories: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "MealItem",
    tableName: "meal_items",
    timestamps: false,
  },
);

export default MealItem;
