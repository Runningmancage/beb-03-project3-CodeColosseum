import { Schema, model } from "mongoose";

const schema = new Schema(
  {
    symbol: { type: String },
    address: { type: String, required: true, unique: true },
    colosseum: { type: String },
  },
  { timestamps: true }
);

const Model = model("Contract", schema);

export = Model