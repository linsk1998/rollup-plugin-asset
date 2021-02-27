var { createFilter } =require('@rollup/pluginutils');
var MagicString = require('magic-string');
var { basename } = require('path');
module.exports=function(options){
	const defaultOptions={
		publicPath: "",
		include:[/\.css$/,/\.jpg$/,/\.png$/,/\.gif$/,/\.swf$/,/\.ogg$/,/\.mp4$/]
	};
	options = Object.assign(defaultOptions,options);
	const filter = createFilter(options.include || defaultOptions.include, options.exclude);
	var assetFiles=[];
	var assetVariables=[];
	return {
		name: 'asset',

		transform(code, id) {
			if (!filter(id)) return null;
			var fileId = this.emitFile({
				type: 'asset',
				name: basename(id),
				source: code
			});
			var variable=`__asset_${fileId}__`;
			assetFiles.push(fileId);
			assetVariables.push(variable);
			return {
				code: `export default ${variable};`
			};
		},
		renderChunk(code, chunk, config){
			if(chunk.type !== 'chunk'){
				return ;
			}
			var ast = null;
			try {
				ast = this.parse(code);
			} catch (err) {
				this.warn({
					code: 'PARSE_ERROR',
					message: ("rollup-plugin-asset: failed to parse " + chunk.facadeModuleId + ".")
				});
			}
			if (!ast) {
				return ;
			}
			var hasChanged=false;
			var magicString = new MagicString(code);
			ast.body.forEach(function (node) {
				if (node.type==='VariableDeclaration') {
					node.declarations.forEach(function(vder) {
						if(vder.type=="VariableDeclarator") {
							var init=vder.init;
							if(init.type==="Identifier") {
								var i=assetVariables.indexOf(init.name);
								if(i>=0){
									var fileName=this.getFileName(assetFiles[i]);
									magicString.overwrite(init.start,init.end,JSON.stringify(options.publicPath+fileName));
									hasChanged=true;
								}
							}
						}
					}, this);
				}
			}, this);
			if (!hasChanged) {
				return {
					code: code,
					ast: ast
				};
			}
			return {
				code: magicString.toString()
			};
		}
	};
};