import { Schema, model } from 'mongoose';

// 1. The TypeScript shape of a user (same idea as before)
export interface IUser {
  name: string;
  email: string;
  password: string;
}

// 2. The schema: rules MongoDB should follow when saving a user
const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true, // can't save a user without a name
      trim: true,     // removes extra spaces: "  Ali  " → "Ali"
    },
    email: {
      type: String,
      required: true,
      unique: true,    // no two users can have the same email
      lowercase: true, // "Ali@Example.com" → "ali@example.com"
      trim: true,
    },
    password: {
      type: String,
      required: true, // this will store the HASHED password, never the real one
    },
  },
  {
    timestamps: true, // automatically adds createdAt and updatedAt fields
  }
);

// 3. The model: the object we use to read and write users in the database
export const User = model<IUser>('User', userSchema);