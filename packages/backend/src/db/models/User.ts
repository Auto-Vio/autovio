import mongoose, { Schema } from "mongoose";
import type { User } from "@autovio/shared";

export interface UserDocument {
  _id: string;
  email: string;
  passwordHash: string;
  name: string;
  createdAt: number;
  updatedAt: number;
}

const UserSchema = new Schema(
  {
    _id: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true },
    createdAt: { type: Number, required: true },
    updatedAt: { type: Number, required: true },
  },
  {
    _id: false,
    versionKey: false,
  }
);

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ updatedAt: -1 });

export const UserModel = mongoose.model<UserDocument>("User", UserSchema);

export function toUser(doc: UserDocument): User {
  return {
    id: doc._id,
    email: doc.email,
    name: doc.name,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}
