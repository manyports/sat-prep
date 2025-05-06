import mongoose from 'mongoose';

export interface IMessage extends mongoose.Document {
  class: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  content: string;
  channel: string;
  assignment?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new mongoose.Schema<IMessage>(
  {
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: [true, 'Please provide a class'],
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide a sender'],
    },
    content: {
      type: String,
      required: [true, 'Please provide message content'],
      maxlength: [2000, 'Message cannot be more than 2000 characters'],
    },
    channel: {
      type: String,
      required: [true, 'Please provide a channel'],
      enum: ['general', 'assignments', 'questions'],
      default: 'general',
    },
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
    },
  },
  { timestamps: true }
);

const Message = mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);

export default Message; 