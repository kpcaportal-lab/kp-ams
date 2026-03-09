import mongoose, { Schema, Document } from 'mongoose';

export interface IClientSpoc extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  clientId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ClientSpocSchema = new Schema<IClientSpoc>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    phone: { type: String },
    position: { type: String },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

export const ClientSpoc =
  mongoose.models.ClientSpoc || mongoose.model<IClientSpoc>('ClientSpoc', ClientSpocSchema);
