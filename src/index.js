globalThis.target = process.argv[2] || 'ts';
require(`./gen-${target}.js`);