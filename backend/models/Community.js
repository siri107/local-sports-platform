const mongoose = require("mongoose");

const communitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Community name is required"],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      default: "",
    },
    sportType: {
      type: String,
      required: [true, "Sport/interest type is required"],
    },
    coverImage: {
      type: String,
      default: "",
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    events: [
      {
        title: { type: String, required: true },
        description: { type: String, default: "" },
        location: { type: String, default: "" },
        date: { type: Date },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Virtual field for quick member count access in API responses
communitySchema.virtual("memberCount").get(function () {
  return this.members ? this.members.length : 0;
});

communitySchema.set("toJSON", { virtuals: true });
communitySchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Community", communitySchema);
