/**
 * Wraps async route handlers so rejected promises flow to the error middleware.
 * Removes the need for try/catch in every controller.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
