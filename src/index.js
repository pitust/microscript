globalThis.target = process.argv[2] || 'mvms';
require(`./gen-${target}.js`);