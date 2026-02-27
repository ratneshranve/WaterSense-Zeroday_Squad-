import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// We can optionally use a separate schema or combine with User. 
// For better segregation as per requirements ("Manage Engineers separate from Users"), 
// we'll create an Engineer model. Alternatively, they can be users with 'role: engineer'.
// The prompt specifies "Admin and Engineer login credentials are pre-created... Manage users... Manage Engineers".
// To keep auth centralized, it's often better to have one 'User' model with roles.
// However, the prompt mentions "Collections: Users, Engineers, Reports...". We will follow the distinct collection requirement.

const engineerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    assignedZone: { type: String, required: true },
    availabilityStatus: { 
        type: String, 
        enum: ['available', 'busy', 'offline'],
        default: 'available' 
    }
}, { timestamps: true });

engineerSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

engineerSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const Engineer = mongoose.model('Engineer', engineerSchema);
export default Engineer;
