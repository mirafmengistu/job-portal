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
        const existingUser = await User.findOne({ email: args.email });
        if (existingUser) {
          throw new Error('User already exists with this email');
        }

        const hashedPassword = await bcrypt.hash(args.password, 10);

        const user = new User({
          name: args.name,
          email: args.email,
          password: hashedPassword,
          role: args.role || 'seeker',
        });

        await user.save();
        return user;
      } catch (error) {
        throw new Error(`Signup failed: ${error.message}`);
      }
    },
  },

  // Login
  login: {
    type: GraphQLString,
    args: {
      email: { type: GraphQLNonNull(GraphQLString) },
      password: { type: GraphQLNonNull(GraphQLString) },
    },
    async resolve(parent, args) {
      try {
        const user = await User.findOne({ email: args.email });
        if (!user) {
          throw new Error('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(args.password, user.password);
        if (!isPasswordValid) {
          throw new Error('Invalid credentials');
        }

        const token = generateToken(user);
        return token;
      } catch (error) {
        throw new Error(`Login failed: ${error.message}`);
      }
    },
  },

  // ✅ ADD THIS: Update User
  updateUser: {
    type: UserType,
    args: {
      id: { type: GraphQLNonNull(GraphQLID) },
      name: { type: GraphQLString },
      email: { type: GraphQLString },
    },
    async resolve(parent, args) {
      try {
        // Check if email is being changed and if it's already taken
        if (args.email) {
          const existingUser = await User.findOne({ 
            email: args.email,
            _id: { $ne: args.id } // Exclude current user
          });
          if (existingUser) {
            throw new Error('Email already in use by another account');
          }
        }

        const user = await User.findByIdAndUpdate(
          args.id,
          { 
            $set: {
              name: args.name,
              email: args.email,
            }
          },
          { new: true, runValidators: true }
        );

        if (!user) {
          throw new Error('User not found');
        }

        return user;
      } catch (error) {
        throw new Error(`Failed to update user: ${error.message}`);
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

      // ✅ Return the user with savedJobs populated
      const updatedUser = await User.findById(args.userId)
        .populate('savedJobs')
        .select('-password');
      
      return updatedUser;
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

      // ✅ Return the user with savedJobs populated
      const updatedUser = await User.findById(args.userId)
        .populate('savedJobs')
        .select('-password');
      
      return updatedUser;
    } catch (error) {
      throw new Error(`Failed to unsave job: ${error.message}`);
    }
  },
},
};