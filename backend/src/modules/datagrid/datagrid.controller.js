import asyncHandler from '../../core/utils/asyncHandler.js';
import ApiResponse from '../../core/utils/ApiResponse.js';
import DataGridService from './datagrid.service.js';
import { getResource, listResources } from './datagrid.registry.js';
import { writeExportFile, contentTypeFor, streamFileDownload } from './datagrid.export.js';
import ExportHistoryService from '../exports/exportHistory.service.js';

const exportHistoryService = new ExportHistoryService();

/**
 * Every handler is resource-agnostic: `req.params.resource` selects which
 * registered collection to operate on. No per-module route/controller code
 * is ever required for a new collection — only a registry entry.
 */

export const listRecords = asyncHandler(async (req, res) => {
  const service = new DataGridService(req.params.resource);
  const { data, meta } = await service.list(req.query, req.gridScope);
  new ApiResponse(200, data, 'Records fetched', meta).send(res);
});

export const getRecord = asyncHandler(async (req, res) => {
  const service = new DataGridService(req.params.resource);
  const data = await service.getOne(req.params.id);
  new ApiResponse(200, data).send(res);
});

export const createRecord = asyncHandler(async (req, res) => {
  const service = new DataGridService(req.params.resource);
  const data = await service.create(req.body);
  new ApiResponse(201, data, 'Record created').send(res);
});

export const updateRecord = asyncHandler(async (req, res) => {
  const service = new DataGridService(req.params.resource);
  const data = await service.update(req.params.id, req.body);
  new ApiResponse(200, data, 'Record updated').send(res);
});

export const deleteRecord = asyncHandler(async (req, res) => {
  const service = new DataGridService(req.params.resource);
  await service.remove(req.params.id);
  new ApiResponse(200, null, 'Record deleted').send(res);
});

export const bulkDelete = asyncHandler(async (req, res) => {
  const service = new DataGridService(req.params.resource);
  const result = await service.bulkDelete(req.body.ids, req.gridScope);
  new ApiResponse(200, result, 'Bulk delete completed').send(res);
});

export const bulkUpdate = asyncHandler(async (req, res) => {
  const service = new DataGridService(req.params.resource);
  const result = await service.bulkUpdate(req.body.ids, req.body.patch, req.gridScope);
  new ApiResponse(200, result, 'Bulk update completed').send(res);
});

export const exportRecords = asyncHandler(async (req, res) => {
  const service = new DataGridService(req.params.resource);
  const resource = getResource(req.params.resource);
  const rows = await service.forExport(req.query, req.gridScope);

  const columns = Object.entries(resource.fieldsConfig)
    .filter(([, f]) => f.select !== false)
    .map(([key, f]) => ({ key: f.path, label: f.label || key }));

  const friendlyBase = `${req.params.resource}-export-${Date.now()}`;
  const { storedFilename, filePath, sizeBytes, extension } = await writeExportFile(req.query.format, rows, columns);
  const filename = `${friendlyBase}.${extension}`;
  const scope = req.query.ids ? 'selected' : (req.query.search || req.query.filters ? 'filtered' : 'all');

  await exportHistoryService.record({
    resource: req.params.resource,
    format: req.query.format,
    filename,
    storedFilename,
    scope,
    rowCount: rows.length,
    sizeBytes,
    requestedBy: req.user?.id,
    query: { search: req.query.search, filters: req.query.filters, sort: req.query.sort },
  });

  streamFileDownload(res, filePath, filename, contentTypeFor(req.query.format));
});

export const listDataGridResources = asyncHandler(async (req, res) => {
  new ApiResponse(200, listResources()).send(res);
});

export const getResourceMeta = asyncHandler(async (req, res) => {
  const resource = getResource(req.params.resource);
  const fields = Object.entries(resource.fieldsConfig).map(([key, f]) => ({
    key,
    label: f.label || key,
    type: f.type,
    filterable: !!f.filterable,
    sortable: !!f.sortable,
    searchable: !!f.searchable,
  }));
  new ApiResponse(200, {
    fields,
    bulkActions: resource.bulkActions,
    rowActions: resource.rowActions,
  }).send(res);
});

export default {
  listRecords,
  getRecord,
  createRecord,
  updateRecord,
  deleteRecord,
  bulkDelete,
  bulkUpdate,
  exportRecords,
  getResourceMeta,
  listDataGridResources,
};
