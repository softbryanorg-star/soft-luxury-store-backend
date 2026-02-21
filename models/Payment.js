import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  provider: { type: String },
  providerPaymentId: { type: String },
  status: { type: String },
  amount: { type: Number },
  meta: { type: Object }
}, { timestamps: true });

export default mongoose.models.Payment || mongoose.model('Payment', paymentSchema);
