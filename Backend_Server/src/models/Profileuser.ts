import { DataTypes, Model } from "sequelize";
import sequelize from "./db";
import User from "./userModel";

class ProfileUser extends Model {
  public user_id!: string;
  public age!: number;
  public avatar!: string | null;
  public height_cm!: number;
  public start_weight_kg!: number;
  public current_weight_kg!: number;
  public target_weight_kg!: number;
  public goal!: string;
  public diet!: string | null;
  public activity!: string | null;
}

ProfileUser.init(
  {
    user_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      references: {
        model: User,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    age: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    avatar: DataTypes.STRING,
    height_cm: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    start_weight_kg: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.0,
    },
    current_weight_kg: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.0,
    },
    target_weight_kg: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.0,
    },
    goal: {
      type: DataTypes.STRING,
      defaultValue: "Maintain Weight",
    },
    diet: DataTypes.TEXT, // JSON string
    activity: DataTypes.TEXT, // JSON string
  },
  {
    sequelize,
    tableName: "profileUser",
    timestamps: false,
  },
);

// Association: ProfileUser belongs to User
ProfileUser.belongsTo(User, {
  foreignKey: "user_id",
  targetKey: "id",
  onDelete: "CASCADE",
});
User.hasOne(ProfileUser, {
  foreignKey: "user_id",
  sourceKey: "id",
  onDelete: "CASCADE",
});

export default ProfileUser;
