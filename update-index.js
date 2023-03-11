const fs = require("fs");
const path = require("path");

const result = [];
function loadExtensions(type) {
  fs.readdirSync(path.resolve(__dirname, `./${type}`), { withFileTypes: true }).forEach((authorDir) => {
    if (!authorDir.isDirectory()) return;
    fs.readdirSync(path.resolve(__dirname, `./${type}`, authorDir.name)).forEach((extensionId) => {
      try {
        const cfg = JSON.parse(fs.readFileSync(path.resolve(__dirname, `./${type}`, authorDir.name, extensionId, "./acord.cfg"), "utf-8"));
        delete cfg.config;
        delete cfg.i18n;
        let outDir = cfg.out.directory.replace(/^(\.\/|\/)?/, "").replace(/\/$/, "");
        if (fs.existsSync(path.resolve(__dirname, `./${type}`, authorDir.name, extensionId, cfg.out.directory, "./source.js"))) {
          delete cfg.out;
          result.push({
            meta: {
              author: authorDir.name,
              id: extensionId,
              url: `https://raw.githubusercontent.com/acord-standalone/verified-extensions/main/${type}/${authorDir.name}/${extensionId}/${outDir}`
            },
            manifest: cfg
          })
        }
      } catch (err) { console.error(type, authorDir.name, extensionId, err); }
    });
  });
}

loadExtensions("plugins");
loadExtensions("themes");

fs.writeFileSync(
  path.resolve(__dirname, "./index.json"),
  JSON.stringify(result, null, 2),
  "utf-8"
);