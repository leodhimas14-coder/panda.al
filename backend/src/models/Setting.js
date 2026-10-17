const mongoose = require('mongoose');

// One document holding shop settings the owner edits from the admin panel.
const settingSchema = new mongoose.Schema(
  {
    _id: { type: String, default: 'shop' },
    // Banner at the top of the home page. Empty url = no banner.
    homeBanner: {
      url: { type: String, trim: true, default: '' }, // .mp4/.webm video or an image
      posterUrl: { type: String, trim: true, default: '' }, // image shown while the video loads
      link: { type: String, trim: true, default: '' }, // where a tap goes, e.g. /dyqani?oferta=1
    },
  },
  { timestamps: true }
);

settingSchema.statics.get = async function get() {
  return (await this.findById('shop')) || new this({ _id: 'shop' });
};

module.exports = mongoose.model('Setting', settingSchema);
