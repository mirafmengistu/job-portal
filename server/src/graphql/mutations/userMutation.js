import { GraphQLNonNull, GraphQLString, GraphQLID } from "graphql";
import UserType from "../types/UserType.js";
import { User } from "../../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Helper to generate token
const generateToken = (user) => {
  return jwt.sign(
    { userId: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

export const userMutation = {
  // Signup
  signup: {
    type: UserType,
    args: {
      name: { type: GraphQLNonNull(GraphQLString) },
      email: { type: GraphQLNonNull(GraphQLString) },
      password: { type: GraphQLNonNull(GraphQLString) },
      role: { type: GraphQLString },
    },
    async resolve(parent, args) {
      try {
        // Check if user exists
        const existingUser = await User.findOne({ email: args.email });
        if (existingUser) {
          throw new Error('User already exists with this email');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(args.password, 10);

        // Create user
        const user = new User({
          name: args.name,
          email: args.email,
          password: hashedPassword,
          role: args.role || 'seeker',
        });

        await user.save();

        // ✅ FIX: Return the Mongoose document directly
        // GraphQL will use the resolve function in UserType to map _id → id
        return user;
      } catch (error) {
        throw new Error(`Signup failed: ${error.message}`);
      }
    },
  },

  // Login
  login: {
    type: GraphQLString, // Returns token as string
    args: {
      email: { type: GraphQLNonNull(GraphQLString) },
      password: { type: GraphQLNonNull(GraphQLString) },
    },
    async resolve(parent, args) {
      try {
        // Find user
        const user = await User.findOne({ email: args.email });
        if (!user) {
          throw new Error('Invalid credentials');
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(args.password, user.password);
        if (!isPasswordValid) {
          throw new Error('Invalid credentials');
        }

        // Generate token
        const token = generateToken(user);
        return token;
      } catch (error) {
        throw new Error(`Login failed: ${error.message}`);
      }
    },
  },

  // Save a job (bookmark)
  saveJob: {
    type: UserType,
    args: {
      userId: { type: GraphQLNonNull(GraphQLID) },
      jobId: { type: GraphQLNonNull(GraphQLID) },
    },
    async resolve(parent, args) {
      try {
        const user = await User.findById(args.userId);
        if (!user) {
          throw new Error('User not found');
        }

        if (user.savedJobs.includes(args.jobId)) {
          throw new Error('Job already saved');
        }

        user.savedJobs.push(args.jobId);
        await user.save();

        // Map _id to id and remove password
        const userObject = user.toObject();
        delete userObject.password;

        return {
          id: userObject._id,
          name: userObject.name,
          email: userObject.email,
          role: userObject.role,
          createdAt: userObject.createdAt,
          updatedAt: userObject.updatedAt,
        };
      } catch (error) {
        throw new Error(`Failed to save job: ${error.message}`);
      }
    },
  },

  // Unsave a job (remove bookmark)
  unsaveJob: {
    type: UserType,
    args: {
      userId: { type: GraphQLNonNull(GraphQLID) },
      jobId: { type: GraphQLNonNull(GraphQLID) },
    },
    async resolve(parent, args) {
      try {
        const user = await User.findById(args.userId);
        if (!user) {
          throw new Error('User not found');
        }

        user.savedJobs = user.savedJobs.filter(
          (jobId) => jobId.toString() !== args.jobId
        );
        await user.save();

        const userObject = user.toObject();
        delete userObject.password;

        return {
          id: userObject._id,
          name: userObject.name,
          email: userObject.email,
          role: userObject.role,
          createdAt: userObject.createdAt,
          updatedAt: userObject.updatedAt,
        };
      } catch (error) {
        throw new Error(`Failed to unsave job: ${error.message}`);
      }
    },
  },
};