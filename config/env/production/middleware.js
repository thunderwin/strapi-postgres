module.exports = {
  settings: {
    logger: {
      level: "error",
    },
    parser: {
      enabled: true,
      multipart: true,
      formidable: {
        maxFileSize: 200 * 1024 * 1024, // Defaults to 200mb
      },
    },
  },
};
