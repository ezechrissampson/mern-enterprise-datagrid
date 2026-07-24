import mongoose from 'mongoose';

/**
 * A saved DataGrid layout: filters, sort, column visibility, density, and
 * page size for one resource. Owned by a user; optionally shared so
 * teammates can see (but not edit/delete) it.
 */
const savedViewSchema = new mongoose.Schema(
  {
    resource: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    owner: { type: String, required: true, index: true },
    isShared: { type: Boolean, default: false },
    isDefault: { type: Boolean, default: false },
    filters: { type: mongoose.Schema.Types.Mixed, default: {} },
    sort: { type: [{ id: String, desc: Boolean }], default: [] },
    columnVisibility: { type: mongoose.Schema.Types.Mixed, default: {} },
    density: { type: String, enum: ['compact', 'comfortable', 'spacious'], default: 'comfortable' },
    pageSize: { type: Number, default: 25 },
  },
  { timestamps: true },
);

savedViewSchema.index({ resource: 1, owner: 1 });
// Only one default view per user per resource.
savedViewSchema.index(
  { resource: 1, owner: 1, isDefault: 1 },
  { unique: true, partialFilterExpression: { isDefault: true } },
);

export const SavedView = mongoose.model('SavedView', savedViewSchema);
export default SavedView;
