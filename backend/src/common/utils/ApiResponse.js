/**
 * Consistent success envelope: { success, message, data, meta }.
 * Every controller returns through here so the client sees one shape.
 */
export default class ApiResponse {
  constructor(res) {
    this.res = res;
  }

  static send(res, { statusCode = 200, message = 'Success', data = null, meta = undefined }) {
    const payload = { success: statusCode < 400, message, data };
    if (meta !== undefined) payload.meta = meta;
    return res.status(statusCode).json(payload);
  }

  static ok(res, data, message = 'Success', meta) {
    return ApiResponse.send(res, { statusCode: 200, message, data, meta });
  }

  static created(res, data, message = 'Created successfully') {
    return ApiResponse.send(res, { statusCode: 201, message, data });
  }

  static noContent(res, message = 'Deleted successfully') {
    return ApiResponse.send(res, { statusCode: 200, message, data: null });
  }
}
