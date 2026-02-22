import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  productId: { type: String }, // frontend-based ID

  productSnapshot: {
    name: String,
    price: Number,
    image: String,
  },

  quantity: { type: Number, default: 1 },
  unitPrice: { type: Number },
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },

    items: [orderItemSchema],

    totalAmount: { type: Number, required: true },

    currency: { type: String, default: 'USD' },

    status: {
      type: String,
      enum: ['pending', 'paid', 'fulfilled', 'cancelled'],
      default: 'pending',
    },

    shippingAddress: { type: Object },

    paymentProvider: { type: String },
    paymentProviderRef: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model('Order', orderSchema);