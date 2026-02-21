import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  phoneNumber: { type: String },
  address: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', userSchema);
