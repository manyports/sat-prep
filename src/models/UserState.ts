import mongoose, { Schema, Types, Document, Model } from 'mongoose';

export interface IUserState extends Document {
  userId: Types.ObjectId;
  currentClassId?: string;
  testResults?: Map<string, any>;
  savedTests?: any[];
  lastVisited?: Map<string, Date>;
  createdAt: Date;
  updatedAt: Date;
}

interface UserStateModel extends Model<IUserState> {
  findOrCreateByUserId(userId: string): Promise<IUserState>;
  updateCurrentClassId(userId: string, classId: string): Promise<IUserState>;
  getCurrentClassId(userId: string): Promise<string | undefined>;
  saveTest(userId: string, test: any): Promise<IUserState>;
  getSavedTests(userId: string): Promise<any[]>;
  updateSavedTest(userId: string, testId: string, updatedTest: any): Promise<IUserState>;
}

const UserStateSchema = new Schema<IUserState, UserStateModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true
    },
    currentClassId: {
      type: String,
    },
    testResults: {
      type: Map,
      of: Schema.Types.Mixed,
      default: new Map()
    },
    savedTests: {
      type: [Schema.Types.Mixed],
      default: []
    },
    lastVisited: {
      type: Map,
      of: Date,
      default: new Map()
    }
  },
  {
    timestamps: true
  }
);

UserStateSchema.statics.findOrCreateByUserId = async function(userId: string): Promise<IUserState> {
  let userState = await this.findOne({ userId: new Types.ObjectId(userId) });
  
  if (!userState) {
    userState = await this.create({ 
      userId: new Types.ObjectId(userId),
    });
  }
  
  return userState;
};

UserStateSchema.statics.updateCurrentClassId = async function(userId: string, classId: string): Promise<IUserState> {
  const userState = await this.findOrCreateByUserId(userId);
  userState.currentClassId = classId;
  await userState.save();
  return userState;
};

UserStateSchema.statics.getCurrentClassId = async function(userId: string): Promise<string | undefined> {
  const userState = await this.findOrCreateByUserId(userId);
  return userState.currentClassId;
};

UserStateSchema.statics.saveTest = async function(userId: string, test: any): Promise<IUserState> {
  const userState = await this.findOrCreateByUserId(userId);
  
  if (!userState.savedTests) {
    userState.savedTests = [];
  }
  
  userState.savedTests.push(test);
  await userState.save();
  return userState;
};

UserStateSchema.statics.getSavedTests = async function(userId: string): Promise<any[]> {
  const userState = await this.findOrCreateByUserId(userId);
  return userState.savedTests || [];
};

UserStateSchema.statics.updateSavedTest = async function(userId: string, testId: string, updatedTest: any): Promise<IUserState> {
  const userState = await this.findOrCreateByUserId(userId);
  
  if (!userState.savedTests) {
    userState.savedTests = [];
  }
  
  const index = userState.savedTests.findIndex((test: any) => test.id === testId);
  
  if (index !== -1) {
    userState.savedTests[index] = updatedTest;
    await userState.save();
  }
  
  return userState;
};

if (mongoose.models.UserState) {
  delete mongoose.models.UserState;
}

const UserState = mongoose.model<IUserState, UserStateModel>('UserState', UserStateSchema);

export default UserState; 