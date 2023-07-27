const fs = require("fs");
const path = require("path");

const result = [];
function loadExtensions(type) {
  fs.readdirSync(path.resolve(__dirname, `./${type}`), { withFileTypes: true }).forEach((authorDir) => {
    if (!authorDir.isDirectory()) return;
    fs.readdirSync(path.resolve(__dirname, `./${type}`, authorDir.name)).forEach((extensionId) => {
      try {
        const cfg = JSON.parse(fs.readFileSync(path.resolve(__dirname, `./${type}`, authorDir.name, extensionId, "./acord.cfg"), "utf-8"));
        let outDir = cfg.out.directory.replace(/^(\.\/|\/)?/, "").replace(/\/$/, "");
        if (fs.existsSync(path.resolve(__dirname, `./${type}`, authorDir.name, extensionId, cfg.out.directory, "./source.js"))) {
          delete cfg.out;
          if (!cfg.forceUnverified) {
            result.push({
              meta: {
                author: authorDir.name,
                id: extensionId,
                url: `https://api.acord.app/extensions/raw/${type}/${authorDir.name}/${extensionId}/${outDir}`
              },
              manifest: cfg
            });
          }
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
