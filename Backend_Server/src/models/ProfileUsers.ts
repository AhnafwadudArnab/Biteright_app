import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

class ProfileUser extends Model {
  public id!: number;
  public user_id!: string;

  public gender!: string;
  public age!: number;
  public height_cm!: number;

  public start_weight_kg!: number;
  public target_weight_kg!: number;
  public goal!: string;

  public diet!: string | null;
  public activity!: string | null;
}

ProfileUser.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.CHAR(36), allowNull: false, unique: true },

    gender: DataTypes.STRING,
    age: DataTypes.INTEGER,
    height_cm: DataTypes.FLOAT,

    start_weight_kg: DataTypes.FLOAT,
    target_weight_kg: DataTypes.FLOAT,
    goal: DataTypes.STRING,

    diet: DataTypes.TEXT,
    activity: DataTypes.TEXT,
  },
  {
    sequelize,
    tableName: "profile_users",
    timestamps: true,
  }
);

export default ProfileUser;
export { ProfileUser };