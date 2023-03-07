const fs = require('fs');
const config = JSON.parse(fs.readFileSync('./acord.cfg', 'utf8'));
const pather = require('path');
const apis = [];
const commons = [];
async function getContent(path, oldImports = ["."]) {
  let content = fs.readFileSync(path, 'utf8');
  const imports = content.matchAll(/import\s+([a-zA-Z0-9_\{\} \,]+)\s+from\s+['"]([\@a-zA-Z0-9_\-\/\.]+)['"]/g);
  for (const imp of imports) {
    const [_, name, importPath] = imp;
    if (importPath.startsWith('.')) {
      if (oldImports.includes(importPath)) continue;
      oldImports.push(importPath);
      const newPath = pather.resolve(pather.dirname(path), importPath.split('/').at(-1).includes(".") ? importPath : importPath + ".js");
      if (newPath.endsWith(".js")) content += "\n" + await getContent(newPath, oldImports);
    } else if (importPath.startsWith('@acord')) {
      if (importPath === "@acord") {
        if (name.includes("{")) {
          const names = name.replace("{", "").replace("}", "").split(",");
          console.log(names, importPath);
          for (const n of names) {
            apis.push(n.trim());
          }
        } else {
          console.error("[ERROR] APIS should be imported with { }");
          console.error("[ERROR] Import path: ", importPath);
        }
      } else {
        const api = importPath.split('/').at(2);
        const api1 = importPath.split('/').at(1);
        if (api === "common") {
          if (importPath === "@acord/modules/common") {
            if (name.includes("{")) {
              const names = name.replace("{", "").replace("}", "").split(",");
              for (const n of names) {
                commons.push(n.trim());
              }
            } else {
              console.error("[ERROR] Commons should be imported with { }");
              console.error("[ERROR] Import path: ", importPath);
            }
          } else {
            const common = importPath.split('/').at(3);
            if (common) commons.push(common);
          }
        } else if (api1 !== "modules" && api1) {
          apis.push(api1);
        }
      }
    }
  }

  return content;
}

(async () => {
  await getContent(pather.resolve(config.index))
  console.log("apis", [...(new Set(apis))]);
  console.log("commons", [...(new Set(commons))]);
})()