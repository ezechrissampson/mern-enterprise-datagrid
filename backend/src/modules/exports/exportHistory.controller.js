import asyncHandler from '../../core/utils/asyncHandler.js';
import ApiResponse from '../../core/utils/ApiResponse.js';
import ExportHistoryService from './exportHistory.service.js';
import { contentTypeFor, streamFileDownload } from '../datagrid/datagrid.export.js';

const service = new ExportHistoryService();

export const listExports = asyncHandler(async (req, res) => {
  const { data, meta } = await service.list(req.query, req.user);
  new ApiResponse(200, data, 'Export history fetched', meta).send(res);
});

export const downloadExport = asyncHandler(async (req, res) => {
  const { record, filePath } = await service.getDownload(req.params.id, req.user);
  streamFileDownload(res, filePath, record.filename, contentTypeFor(record.format));
});

export const deleteExport = asyncHandler(async (req, res) => {
  await service.remove(req.params.id, req.user);
  new ApiResponse(200, null, 'Export deleted').send(res);
});

export default { listExports, downloadExport, deleteExport };
