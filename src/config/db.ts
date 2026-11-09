import mongoose from 'mongoose';

export async function connectDb(uri: string): Promise<void> {
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
}

export async function disconnectDb(): Promise<void> {
  await mongoose.disconnect();
}
