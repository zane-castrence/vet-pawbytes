const mongoose = require("mongoose");

// One document: { key: "main", services: [...], vets: [...] }
const catalogSchema = new mongoose.Schema({
  key: { type: String, default: "main", unique: true },
  services: [String],
  vets: [String]
});

module.exports = mongoose.model("Catalog", catalogSchema);
