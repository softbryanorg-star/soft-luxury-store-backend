import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, index: true },
  description: { type: String },
  price: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  sku: { type: String },
  stock: { type: Number, default: 0 },
  images: [{ type: String }],
  attributes: { type: Object }
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model('Product', productSchema);
