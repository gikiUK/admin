const fs = require("fs");
const path = require("path");

const localPackages = {
  "@gikiuk/facts-engine": path.resolve(__dirname, "../api/packages/facts-engine")
};

function readPackage(pkg) {
  for (const [name, localPath] of Object.entries(localPackages)) {
    if (pkg.dependencies?.[name] && fs.existsSync(localPath)) {
      pkg.dependencies[name] = `link:${localPath}`;
    }
  }
  return pkg;
}

module.exports = { hooks: { readPackage } };
