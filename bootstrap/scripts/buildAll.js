const execa = require("execa");

const $ = (cmd) => {
	console.log(`$ ${cmd}`);
	return execa.commandSync(cmd, {stdout: process.stdout, buffer: false});
}

console.log("building all...")
$(`npx lerna run build --scope @dendronhq/common-all`);
$(`npx lerna run build --scope @dendronhq/common-server `);
$(`npx lerna run build --scope @dendronhq/engine-server `);
$(`npx lerna run build --scope @dendronhq/pods-core `);
$(`npx lerna run build --parallel --scope "@dendronhq/{common-test-utils,api-server}"`);
$(`npx lerna run build --parallel --scope "@dendronhq/{common-frontend,dendron-cli}"`);
$(`npx lerna run build --scope @dendronhq/engine-test-utils `);
$(`npx lerna run build --parallel --scope "@dendronhq/{plugin-core,dendron-next-server}"`);
console.log("done")