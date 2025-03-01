**What's changed so far:** 

* Converted to ES6 module.
* Generalised loop-based processing of all panels, thereby *sealing off* the majority of code from future changes.
* Allowed custom panels to be added by the user via external config *without* changing the Stats.js source code further, an improvement over the original version where source changes were required for init and update of custom panels.
  
**What's planned:**

* Get module working in a separate rendering thread: secondary threads cannot write canvases without `OffscreenCanvas` / `transferControlToOffscreen`.

stats.js
========

#### JavaScript Performance Monitor ####

This class provides a simple info box that will help you monitor your code performance.

* **FPS** Frames rendered in the last second. The higher the number the better.
* **MS** Milliseconds needed to render a frame. The lower the number the better.
* **MB** MBytes of allocated memory. (Run Chrome with `--enable-precise-memory-info`)
* **CUSTOM** User-defined panel support.


### Screenshots ###

![fps.png](https://raw.githubusercontent.com/mrdoob/stats.js/master/files/fps.png)
![ms.png](https://raw.githubusercontent.com/mrdoob/stats.js/master/files/ms.png)
![mb.png](https://raw.githubusercontent.com/mrdoob/stats.js/master/files/mb.png)
![custom.png](https://raw.githubusercontent.com/mrdoob/stats.js/master/files/custom.png)


### Installation ###
```bash
npm install stats.js
```

### Usage ###

```javascript
//See config formats in the javascript source. These can be copied, modified, and placed here for custom user experience.

let globalConfig = {...}; //contains sizes, colors, text attributes, general to all panels.

static panelsConfig =
[
	{
		name: 'FPS',
		fg: '#0ff',
		bg: '#002',
		updateCondition: function(timing, customObj) {return timing.timeNow >= timing.timePrevFrameEnd + TIME_DIFF;}, 
		calcValue: function (timing){console.log('n', timing.timeSincePrevFrameEnded); return timing.frames * 1000 / timing.timeSincePrevFrameEnded;},
		calcMaxValue: function (timing){return 100;}
	},
	{ //custom panel example
		name: 'Entities',
		fg: '#222',
		bg: '#444', 
		updateCondition: function(timing, customObj) {return true;}, //always update
		calcValue: function (timing){return Entities.count;}, //numerator
		calcMaxValue: function (timing){return Entities.MAX;} //denominator
	},
];
var stats = new Stats(globalConfig, panelsConfig); //parameters are optional - defaults will otherwise be used
stats.showPanel( 1 ); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild( stats.dom );

function animate() {

	stats.begin();

	// monitored code goes here

	stats.end();

	requestAnimationFrame( animate );

}

requestAnimationFrame( animate );
```


### Bookmarklet ###

You can add this code to any page using the following bookmarklet:

```javascript
javascript:(function(){var script=document.createElement('script');script.onload=function(){var stats=new Stats();document.body.appendChild(stats.dom);requestAnimationFrame(function loop(){stats.update();requestAnimationFrame(loop)});};script.src='https://mrdoob.github.io/stats.js/build/stats.min.js';document.head.appendChild(script);})()
```
