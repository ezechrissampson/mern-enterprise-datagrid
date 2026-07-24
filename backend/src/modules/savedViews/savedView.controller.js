import asyncHandler from '../../core/utils/asyncHandler.js';
import ApiResponse from '../../core/utils/ApiResponse.js';
import ApiError from '../../core/utils/ApiError.js';
import SavedViewService from './savedView.service.js';

const service = new SavedViewService();

export const listSavedViews = asyncHandler(async (req, res) => {
  if (!req.query.resource) throw ApiError.badRequest('resource query param is required');
  const data = await service.list(req.query.resource, req.user);
  new ApiResponse(200, data, 'Saved views fetched').send(res);
});

export const createSavedView = asyncHandler(async (req, res) => {
  const data = await service.create(req.body, req.user);
  new ApiResponse(201, data, 'Saved view created').send(res);
});

export const updateSavedView = asyncHandler(async (req, res) => {
  const data = await service.update(req.params.id, req.body, req.user);
  new ApiResponse(200, data, 'Saved view updated').send(res);
});

export const deleteSavedView = asyncHandler(async (req, res) => {
  await service.remove(req.params.id, req.user);
  new ApiResponse(200, null, 'Saved view deleted').send(res);
});

export const setDefaultSavedView = asyncHandler(async (req, res) => {
  const data = await service.setDefault(req.params.id, req.user);
  new ApiResponse(200, data, 'Default view updated').send(res);
});

export default { listSavedViews, createSavedView, updateSavedView, deleteSavedView, setDefaultSavedView };
