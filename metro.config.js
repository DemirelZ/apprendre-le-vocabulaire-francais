const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Türkçe karakterleri desteklemek için
config.resolver.platforms = ["ios", "android", "native", "web"];

module.exports = config;
