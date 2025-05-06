import mongoose, { Schema, Types, Document } from 'mongoose';
import crypto from 'crypto';

export interface IClass extends Document {
  name: string;
  description: string;
  instructor: Types.ObjectId;
  members: Types.ObjectId[];
  invitationCode?: string;
  invitationCodeExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
  generateInvitationCode: () => Promise<{ code: string; expires: Date }>;
  revokeInvitationCode: () => Promise<void>;
}

const ClassSchema = new Schema<IClass>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a class name'],
      maxlength: [100, 'Class name cannot be more than 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a class description'],
      maxlength: [500, 'Description cannot be more than 500 characters'],
    },
    instructor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide an instructor'],
    },
    members: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    invitationCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    invitationCodeExpires: {
      type: Date,
    },
  },
  {
    timestamps: true,
    statics: {
      async findByIdAndInstructor(classId: string, instructorId: string) {
        return this.findOne({
          _id: new Types.ObjectId(classId),
          instructor: new Types.ObjectId(instructorId)
        });
      }
    },
    methods: {
      async generateInvitationCode() {
        const code = crypto.randomBytes(3)
          .toString('hex')
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, '0')
          .substring(0, 6);

        const expires = new Date();
        expires.setDate(expires.getDate() + 7);
        
        this.invitationCode = code;
        this.invitationCodeExpires = expires;
        await this.save();
        
        return {
          code: this.invitationCode,
          expires: this.invitationCodeExpires
        };
      },
      async revokeInvitationCode() {
        this.invitationCode = undefined;
        this.invitationCodeExpires = undefined;
        await this.save();
      }
    }
  }
);

if (mongoose.models.Class) {
  delete mongoose.models.Class;
}

const Class = mongoose.model<IClass>('Class', ClassSchema);

export default Class; 