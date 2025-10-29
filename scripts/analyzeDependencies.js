const fs = require('fs');
const path = require('path');
const glob = require('glob');

const aliasMap = {
  '@utils': path.resolve(__dirname, '../storybook/utils'),
  '@consts': path.resolve(__dirname, '../storybook/constants'),
  '@molecules': path.resolve(__dirname, '../storybook/components/molecules'),
  '@atoms': path.resolve(__dirname, '../storybook/components/atoms'),
  '@organisms': path.resolve(__dirname, '../storybook/components/organisms'),
};

function resolveImports(
  filePath,
  resolved = new Set(),
  customElements = new Set(),
) {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const dir = path.dirname(filePath);

  // Match import statements
  const importRegex = /import\s+.*?['"](.+?)['"];?/g;
  const matches = Array.from(fileContent.matchAll(importRegex));

  matches
    .map((match) => {
      let importPath = match[1];

      // Resolve aliases
      importPath = Object.entries(aliasMap).reduce(
        (result, [alias, realPath]) =>
          importPath.startsWith(alias)
            ? importPath.replace(alias, realPath)
            : result,
        importPath,
      );

      // Resolve relative imports
      if (importPath.startsWith('.')) {
        return path.resolve(dir, importPath);
      }
      if (fs.existsSync(importPath)) {
        return importPath; // Absolute path after alias resolution
      }

      // Skip unresolved or external imports
      return null;
    })
    .filter(Boolean) // Remove null values
    .forEach((resolvedPath) => {
      // Append extensions if missing
      if (!resolvedPath.endsWith('.js') && !resolvedPath.endsWith('.css')) {
        if (fs.existsSync(`${resolvedPath}.js`)) {
          // eslint-disable-next-line no-param-reassign
          resolvedPath += '.js';
        } else if (fs.existsSync(`${resolvedPath}/index.js`)) {
          // eslint-disable-next-line no-param-reassign
          resolvedPath = `${resolvedPath}/index.js`;
        }
      }

      if (!resolved.has(resolvedPath)) {
        resolved.add(resolvedPath);

        // Check for custom elements in JS files
        if (resolvedPath.endsWith('.js')) {
          // eslint-disable-next-line no-shadow
          const fileContent = fs.readFileSync(resolvedPath, 'utf8');
          const customElementRegex = /customElements\.define\(['"](.+?)['"]/;
          if (customElementRegex.test(fileContent)) {
            customElements.add(resolvedPath);
          }

          // Recurse for further imports
          resolveImports(resolvedPath, resolved, customElements);
        }
      }
    });

  return { resolved, customElements };
}

// Extract CSS files from resolved dependencies
function extractCssFiles(resolvedImports) {
  return Array.from(resolvedImports).filter((file) => file.endsWith('.css'));
}

// Extract JS files for custom elements
function extractCustomElementFiles(customElements) {
  return Array.from(customElements);
}

// Analyze components for dependencies
function analyzeComponents(componentsPath) {
  const components = glob.sync(`${componentsPath}/**/!(*.stories).js`);
  return components.reduce((acc, component) => {
    const { resolved, customElements } = resolveImports(component);
    acc[component] = {
      css: extractCssFiles(resolved),
      js: extractCustomElementFiles(customElements),
    };
    return acc;
  }, {});
}

module.exports = analyzeComponents;
