const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');

const filePatches = [
  {
    relativePath: 'node_modules/react-native/third-party-podspecs/fmt.podspec',
    replacements: [
      ['spec.version = "11.0.2"', 'spec.version = "12.1.0"'],
      [':tag => "11.0.2"', ':tag => "12.1.0"'],
    ],
  },
  {
    relativePath: 'node_modules/react-native/third-party-podspecs/RCT-Folly.podspec',
    replacements: [
      ['spec.dependency "fmt", "11.0.2"', 'spec.dependency "fmt", "12.1.0"'],
    ],
  },
];

for (const patch of filePatches) {
  const filePath = path.join(projectRoot, patch.relativePath);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing file: ${patch.relativePath}`);
  }

  let content = fs.readFileSync(filePath, 'utf8');

  for (const [from, to] of patch.replacements) {
    if (content.includes(to)) {
      continue;
    }

    if (!content.includes(from)) {
      throw new Error(`Expected text not found in ${patch.relativePath}: ${from}`);
    }

    content = content.replace(from, to);
  }

  fs.writeFileSync(filePath, content);
}

console.log('Patched React Native iOS podspecs for Xcode 26.4 compatibility.');