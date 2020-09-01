const util = {
  getExtension({
    originalname,
    mimetype,
    defaults = 'jpg'
  }) {
    if (originalname) {
      return originalname.slice(originalname.lastIndexOf('.') + 1)
    }
    if (mimetype) {
      return mimetype.slice(mimetype.indexOf('/') + 1)
    }
    return defaults
  }
}

module.exports = util;