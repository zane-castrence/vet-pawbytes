// Frontend expects `id` (string), not Mongo's `_id` / `__v`.
module.exports = {
  virtuals: true,
  versionKey: false,
  transform(_doc, ret) { ret.id = String(ret._id); delete ret._id; delete ret.password; return ret; }
};
