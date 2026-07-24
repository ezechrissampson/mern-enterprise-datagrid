import mongoose from 'mongoose';

/**
 * One record per generated export file. `storedFilename` is the on-disk
 * (or bucket-key, if swapped to S3/GCS) name; `filename` is the friendly
 * name shown to and downloaded by the user.
 */
const exportHistorySchema = new mongoose.Schema(
  {
    resource: { type: String, required: true, index: true },
    format: { type: String, enum: ['csv', 'xlsx', 'json'], required: true },
    filename: { type: String, required: true },
    storedFilename: { type: String, required: true },
    scope: { type: String, enum: ['all', 'filtered', 'selected'], default: 'filtered' },
    rowCount: { type: Number, default: 0 },
    sizeBytes: { type: Number, default: 0 },
    requestedBy: { type: String, index: true },
    status: { type: String, enum: ['completed', 'failed'], default: 'completed' },
    query: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

exportHistorySchema.index({ requestedBy: 1, createdAt: -1 });

export const ExportHistory = mongoose.model('ExportHistory', exportHistorySchema);
export default ExportHistory;
