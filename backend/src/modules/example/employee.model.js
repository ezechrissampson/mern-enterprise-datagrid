import mongoose from 'mongoose';

/**
 * Example collection used purely to demonstrate registering a resource with
 * the DataGrid module. Delete this in real integrations — it is not part
 * of the reusable module itself.
 */
const employeeSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true },
    department: { type: String, enum: ['Engineering', 'Sales', 'Support', 'HR', 'Finance'], required: true },
    role: { type: String, trim: true },
    status: { type: String, enum: ['active', 'inactive', 'archived'], default: 'active' },
    salary: { type: Number, min: 0 },
    hireDate: { type: Date, default: Date.now },
    isRemote: { type: Boolean, default: false },
    tags: [{ type: String }],
  },
  { timestamps: true },
);

employeeSchema.index({ department: 1, status: 1 });
employeeSchema.index({ firstName: 'text', lastName: 'text', email: 'text' });

export const Employee = mongoose.model('Employee', employeeSchema);
export default Employee;
