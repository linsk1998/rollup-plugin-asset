Emit file as asset.

## Config

```javascript
import asset from "rollup-plugin-asset"

export default {
	input:"src/index.js",
	output:{
		dir: "dist",
		format: "esm",
		assetFileNames: "assets/[name]-[hash][extname]"
	},
	plugins:[
		asset()
	]
};
```

## Before

```javascript
import style from "./index.css";
console.log(style);
```

## After

```javascript
var style = "assets/index-55407cb8.css";
console.log(style);
```

## Options

- include: See @rollup/pluginutils. Default is .css,.jpg,.png,.gif,.swf,.ogg,.mp4.
- exclude: See @rollup/pluginutils.
- publicPath: Path prefix. Default is "".
