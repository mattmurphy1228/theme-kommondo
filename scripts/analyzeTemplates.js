const fs = require('fs');
const path = require('path');
const glob = require('glob');
const JSON5 = require('json5');
const analyzeComponents = require('./analyzeDependencies');

// Paths
const templatesPath = path.resolve(__dirname, '../templates');
const componentsPath = path.resolve(__dirname, '../storybook/components');

// Analyze components for CSS and JS dependencies
const componentDependencies = analyzeComponents(componentsPath);

function addDependenciesForComponent(componentName, cssFiles, jsFiles) {
  // Find the component's index.js file
  const componentPath = glob.sync(
    `${componentsPath}/**/${componentName}/index.js`,
  )[0];

  // Add dependencies if the component is found
  if (componentPath && componentDependencies[componentPath]) {
    // Add CSS files
    componentDependencies[componentPath].css.forEach((cssFile) => {
      cssFiles.add(cssFile);
    });

    // Add JS files for custom elements
    componentDependencies[componentPath].js.forEach((jsFile) => {
      jsFiles.add(jsFile);
    });
  }
}

// Analyze templates and map components to pages
function analyzeJsonTemplates() {
  const componentUsage = {};

  // Global CSS files from storybook/.storybook/preview.js
  const globalCssFiles = [
    path.resolve(__dirname, '../storybook/styles/base.css'),
    path.resolve(__dirname, '../storybook/tokens/border-radius.css'),
    path.resolve(__dirname, '../storybook/tokens/colors.css'),
    path.resolve(__dirname, '../storybook/tokens/borders.css'),
    path.resolve(__dirname, '../storybook/tokens/breakpoints.css'),
    path.resolve(__dirname, '../storybook/tokens/font-family.css'),
    path.resolve(__dirname, '../storybook/tokens/font-size.css'),
    path.resolve(__dirname, '../storybook/tokens/font-weight.css'),
    path.resolve(__dirname, '../storybook/tokens/line-height.css'),
  ];

  // Add paths for footer and header group files
  const groupFiles = [
    path.resolve('sections/footer-group.json'),
    path.resolve('sections/header-group.json'),
  ];

  // First analyze header and footer group files to get their dependencies
  const headerFooterDeps = {
    css: new Set(globalCssFiles),
    js: new Set(),
  };

  groupFiles.forEach((groupFile) => {
    const content = JSON5.parse(fs.readFileSync(groupFile, 'utf8'));
    const sectionsToAnalyze = Object.values(content.sections) || [];

    if (Array.isArray(sectionsToAnalyze)) {
      sectionsToAnalyze.forEach((section) => {
        const componentPath = glob.sync(
          `${componentsPath}/**/${section.type}/index.js`,
        )[0];

        if (componentPath && componentDependencies[componentPath]) {
          componentDependencies[componentPath].css.forEach((cssFile) => {
            headerFooterDeps.css.add(cssFile);
          });
          componentDependencies[componentPath].js.forEach((jsFile) => {
            headerFooterDeps.js.add(jsFile);
          });
        }
      });
    }
  });

  // Now analyze main templates and include header/footer dependencies
  // Use **/*.json to search recursively in all subdirectories
  const templates = glob.sync(`${templatesPath}/**/*.json`);

  templates.forEach((template) => {
    // Get template name without .json and preserve subfolder structure
    const relativePath = path.relative(templatesPath, template);
    const templateName = relativePath.slice(0, -5); // Remove .json extension
    if (templateName !== 'cart') {
      const content = JSON5.parse(fs.readFileSync(template, 'utf8'));

      // Initialize with header/footer dependencies
      const cssFiles = new Set([...headerFooterDeps.css]);
      const jsFiles = new Set([...headerFooterDeps.js]);

      // Check both sections and components arrays (for group files)
      const sectionsToAnalyze = content.sections || content.components || [];

      if (Array.isArray(sectionsToAnalyze)) {
        sectionsToAnalyze.forEach((section) => {
          addDependenciesForComponent(section.type, cssFiles, jsFiles);
        });
      } else {
        Object.values(sectionsToAnalyze).forEach((section) => {
          addDependenciesForComponent(section.type, cssFiles, jsFiles);
        });
      }

      // Convert the Sets to Arrays for serialization
      componentUsage[templateName] = {
        css: Array.from(cssFiles),
        js: Array.from(jsFiles),
      };
    }
  });

  // Cart Drawer
  const cssFilesCartDrawer = new Set([...headerFooterDeps.css]);
  const jsFilesCartDrawer = new Set([...headerFooterDeps.js]);
  addDependenciesForComponent(
    'CartDrawer',
    cssFilesCartDrawer,
    jsFilesCartDrawer,
  );
  componentUsage['cart-drawer'] = {
    css: Array.from(cssFilesCartDrawer),
    js: Array.from(jsFilesCartDrawer),
  };

  // Cart Page
  const cssFilesCartPage = new Set([...headerFooterDeps.css]);
  const jsFilesCartPage = new Set([...headerFooterDeps.js]);
  addDependenciesForComponent('CartPage', cssFilesCartPage, jsFilesCartPage);
  componentUsage['cart-page'] = {
    css: Array.from(cssFilesCartPage),
    js: Array.from(jsFilesCartPage),
  };

  // TextBlock for policy pages
  const cssFilesTextblock = new Set([...headerFooterDeps.css]);
  const jsFilesTextblock = new Set([...headerFooterDeps.js]);
  addDependenciesForComponent('TextBlock', cssFilesTextblock, jsFilesTextblock);
  componentUsage['text-block'] = {
    css: Array.from(cssFilesTextblock),
    js: Array.from(jsFilesTextblock),
  };

  return componentUsage;
}

// Generate component map
const componentMap = analyzeJsonTemplates();
fs.writeFileSync('./component-map.json', JSON.stringify(componentMap, null, 2));
