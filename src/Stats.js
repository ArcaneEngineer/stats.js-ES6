/**
 * @author mrdoob / http://mrdoob.com/
 * @author ArcaneEngineer modified to ES6 module format and generalised to be able to use custom panels.
 */
 
const ID_FPS = 0;
const ID_MS = 1;
const ID_MEM = 2;

const TIME_DIFF = 1000;
const BYTES_PER_MB = 1048576;

export default class Stats 
{
	panelShowId = 0
	container = undefined
	dom = undefined
	panels = []
	timing = {frames: 0}
	
	static panelsConfig =
	[
		{
			name: 'FPS',
			fg: '#0ff',
			bg: '#002',
			updateCondition: function(timing, customObj) {return timing.timeNow >= timing.timePrevFrameEnd + TIME_DIFF;}, 
			calcValue: function (timing){return timing.frames * 1000 / timing.timeSincePrevFrameEnded;},
			calcMaxValue: function (timing){return 100;}
		},
		{
			name: 'MS',
			fg: '#0f0',
			bg: '#020', 
			updateCondition: function(timing, customObj) {return true;},
			calcValue: function (timing){return timing.timeSinceThisFrameStarted;},
			calcMaxValue: function (timing){return 200;}
		},
		{
			name: 'MB',
			fg: '#f08',
			bg: '#201',
			updateCondition: function(timing, customObj) {return timing.timeNow >= timing.timePrevFrameEnd + TIME_DIFF;},
			calcValue: function (timing){return performance.memory.usedJSHeapSize / BYTES_PER_MB;},
			calcMaxValue: function (timing){return performance.memory.jsHeapSizeLimit / BYTES_PER_MB;}, 
			disallowCreate: function() {if (self.performance) return !self.performance.memory; else return true;} //special, for panels that need to check if they can be created. Firefox does not have this property.
		},
	]
	
	static globalConfig =
	{
		wCanvas: 80,
		hCanvas: 48,
		xText: 3,
		yText: 2,
		xGraph: 3,
		yGraph: 15,
		wGraph: 74,
		hGraph: 30,
		fontSize: 9,
		
		alpha: 0.9, //not for premultiplication by pixelRatio!
	}
	
	constructor(globalConfig, panelsConfig)
	{
		if (!panelsConfig) panelsConfig = Stats.panelsConfig; //fall back to the panels config we provide herein.
		if (!globalConfig) globalConfig = Stats.globalConfig; //fall back to the global config we provide herein.
		let g = this.premultiplyGlobalDimensions(globalConfig);
		
		let timing = this.timing;
		timing.timeThisFrameStart = ( performance || Date ).now();
		timing.timePrevFrameEnd = timing.timeThisFrameStart;
		timing.frames = 0;
		
		this.container = document.createElement( 'div' );
		this.container.style.cssText = 'position:fixed;top:0;left:0;cursor:pointer;opacity:0.9;z-index:10000';
		this.container.addEventListener( 'click', (event) => //function ( event )
		{
			event.preventDefault();
			this.showPanel( ++this.panelShowId % event.currentTarget.children.length );

		}, false );
		this.dom = this.container; // Backwards Compatibility
		
		//createPanels
		for (let id = 0; id < panelsConfig.length; id++)
		{
			let p = panelsConfig[id];
			let allowCreatePanel = true; //if no explicit "disallower" exists, we can create.
			if (p.hasOwnProperty('disallowCreate'))
			{
				allowCreatePanel = !p.disallowCreate();
			}
			
			if (allowCreatePanel)
				this.addPanel( new Stats.Panel( id, p, g ) );
		}
		
		this.showPanel( 0 );
	}
	
	premultiplyGlobalDimensions(globalConfig)
	{
		let pixelRatio = Math.round( window.devicePixelRatio || 1 );
		
		//Premultiply: this should happen on devicePixelRatio ratio change, but that is an unlikely event.
		//...in that case, we could store a copy of original config (passed via ctor) for re-multiply/copy.
		let globalConfigCpy = {}; //change a copy to avoid calling class changing original obj. or mul in getters?
		for (let prop in globalConfig)
		{
			globalConfigCpy[prop] = globalConfig[prop] * pixelRatio;
		}
		
		//amend any props that were not to be premultiplied, back to original value.
		globalConfigCpy.alpha = globalConfig.alpha;
		
		//finally, add the ratio itself.
		globalConfigCpy.pixelRatio = pixelRatio;
		
		return globalConfigCpy;
	}
	
	begin()
	{
		this.timing.timeThisFrameStart = ( performance || Date ).now();
	}

	end()
	{
		let timing = this.timing;
		
		//pre-update timing
		timing.frames++;
		timing.timeNow = ( performance || Date ).now();
		timing.timeSinceThisFrameStarted = timing.timeNow - timing.timeThisFrameStart;
		timing.timeSincePrevFrameEnded = timing.timeNow - timing.timePrevFrameEnd;
		
		for (let id = 0; id < this.panels.length; id++)
		{
			// console.log(id);
			// console.log(this.panels);
			let panel = this.panels[id];
			let config = panel.p;
			if (config.updateCondition(timing) == true)
				panel.update(timing);
		}
		
		//post-update timing
		if ( timing.timeNow >= timing.timePrevFrameEnd + TIME_DIFF )
		{
			timing.timePrevFrameEnd = timing.timeNow;
			timing.frames = 0;
		}
		
		return timing.timeNow;
	}

	update()
	{
		timing.timeThisFrameStart = this.end();
	}

	addPanel( panel )
	{
		this.panels[panel.id] = panel;
		this.container.appendChild( panel.dom );
		return panel;
	}

	showPanel( id )
	{
		//TODO possibly rather interate by prop (string name) and eliminate id? may be hard with DOM children array.
		for ( let i = 0; i < this.container.children.length; i ++ )
		{
			this.container.children[ i ].style.display = i === id ? 'block' : 'none';
		}

		this.panelShowId = id;
	}
	
	static Panel = class Panel
	{
		dom = undefined
		g = undefined //global config
		p = undefined //panel config
		min = Infinity
		max = 0
		
		constructor(id, p,  g) 
		{
			//global panel values
			this.g = g;
			let wCanvas = g.wCanvas;
			let hCanvas = g.hCanvas;
			let xText = g.xText;
			let yText = g.yText;
			let xGraph = g.xGraph;
			let yGraph = g.yGraph;
			let wGraph = g.wGraph;
			let hGraph = g.hGraph;
			let alpha = g.alpha;
			let pixelRatio = g.pixelRatio;
			
			//panel-specifics
			this.id = id;
			this.name = p.name;
			this.p = p;
			let fg = p.fg; 
			let bg = p.bg; 
			
			//render
			let canvas = this.dom = document.createElement( 'canvas' );
			let context = canvas.getContext( '2d' );
			
			canvas.width = wCanvas;
			canvas.height = hCanvas;
			canvas.style.cssText = 'width:80px;height:48px';
			
			context.font = 'bold ' + ( g.fontSize ) + 'px Helvetica,Arial,sans-serif';
			context.textBaseline = 'top';

			context.fillStyle = bg;
			context.fillRect( 0, 0, wCanvas, hCanvas );

			context.fillStyle = fg;
			context.fillText( name, xText, yText );
			context.fillRect( xGraph, yGraph, wGraph, hGraph );

			context.fillStyle = bg;
			context.globalAlpha = alpha;
			context.fillRect( xGraph, yGraph, wGraph, hGraph );
		}
		
		update(timing)
		{	
			let round = Math.round;

			//global panel values
			let g = this.g;
			let wCanvas = g.wCanvas;
			let hCanvas = g.hCanvas;
			let xText = g.xText;
			let yText = g.yText;
			let xGraph = g.xGraph;
			let yGraph = g.yGraph;
			let wGraph = g.wGraph;
			let hGraph = g.hGraph;
			let alpha = g.alpha;
			const alphaFull = 1.0;
			let pixelRatio = g.pixelRatio;
			
			//panel-specifics
			let p = this.p;
			let name = p.name;
			let value    = p.calcValue   (timing);
			let maxValue = p.calcMaxValue(timing);
			let min = this.min = Math.min( this.min, value );
			let max = this.max = Math.max( this.max, value );
			let fg = p.fg; 
			let bg = p.bg; 
			
			//render
			let canvas = this.dom;
			let context = canvas.getContext( '2d' );
			
			context.fillStyle = bg;
			context.globalAlpha = alphaFull;
			context.fillRect( 0, 0, wCanvas, yGraph );
			context.fillStyle = fg;
			context.fillText( round( value ) + ' ' + name + ' (' + round( min ) + '-' + round( max ) + ')', xText, yText );

			context.drawImage( canvas, xGraph + pixelRatio, yGraph, wGraph - pixelRatio, hGraph, xGraph, yGraph, wGraph - pixelRatio, hGraph );

			context.fillRect( xGraph + wGraph - pixelRatio, yGraph, pixelRatio, hGraph );

			context.fillStyle = bg;
			context.globalAlpha = alpha;
			context.fillRect( xGraph + wGraph - pixelRatio, yGraph, pixelRatio, round( ( 1 - ( value / maxValue ) ) * hGraph ) );
		}
	}
}