import mongoose from 'mongoose';

export const ROLES = ['super_admin', 'staff'];

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 40,
      index: true,
    },
    name: { type: String, default: '', trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, required: true, enum: ROLES, default: 'staff', index: true },
    active: { type: Boolean, default: true, index: true },
    lastLoginAt: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

UserSchema.set('toJSON', {
  transform(_doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.passwordHash;
    return ret;
  },
});

export const User = mongoose.model('User', UserSchema);
