/**
 * @author mrdoob / http://mrdoob.com/
 * @author ArcaneEngineer modified to ES6 module format
 */

export default class Stats 
{
	REVISION = "16-ES6"
	mode = 0
	beginTime = 0
	prevTime = 0
	frames = 0
	fpsPanel = undefined
	 msPanel = undefined
	memPanel = undefined
	container = undefined
	dom = undefined
	domElement = undefined
	
	constructor(config)
	{
		let g = this.configureGlobals(config);
		
		this.beginTime = ( performance || Date ).now();
		this.prevTime = this.beginTime;
		this.frames = 0;
		
		this.container = document.createElement( 'div' );
		this.container.style.cssText = 'position:fixed;top:0;left:0;cursor:pointer;opacity:0.9;z-index:10000';
		this.container.addEventListener( 'click', (event) => //function ( event )
		{
			event.preventDefault();
			this.showPanel( ++this.mode % event.currentTarget.children.length );

		}, false );
		this.dom = this.domElement = this.container; // Backwards Compatibility
		
		this.fpsPanel = this.addPanel( new Stats.Panel( 'FPS', '#0ff', '#002', g ) );
		this. msPanel = this.addPanel( new Stats.Panel( 'MS' , '#0f0', '#020', g ) );
		if ( self.performance && self.performance.memory )
		{
		this.memPanel = this.addPanel( new Stats.Panel( 'MB' , '#f08', '#201', g ) );
		}

		this.showPanel( 0 );
	}
	
	configureGlobals(config)
	{
		if (!config)
		{
			config =
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
				
				//NOT for premul by pixelRatio:
				alpha: 0.9,
			}
		}
		
		let pixelRatio = Math.round( window.devicePixelRatio || 1 );
		
		//Premultiply: this should happen on devicePixelRatio ratio change, but that is an unlikely event.
		//...in that case, we could store a copy of original config (passed via ctor) for re-multiply/copy.
		let configCpy = {}; //change a copy to avoid calling class changing original obj. or mul in getters?
		for (let prop in config)
		{
			configCpy[prop] = config[prop] * pixelRatio;
			
		}
		//amend non-premultiplied props, since all have been overwritten:
		configCpy.alpha = config.alpha;
		//add final prop
		configCpy.pixelRatio = pixelRatio;
		
		return configCpy;
	}
	
	begin()
	{
		this.beginTime = ( performance || Date ).now();
	}

	end()
	{
		this.frames ++;

		let time = ( performance || Date ).now();

		this.msPanel.update( time - this.beginTime, 200 );

		if ( time >= this.prevTime + 1000 )
		{
			this.fpsPanel.update( ( this.frames * 1000 ) / ( time - this.prevTime ), 100 );

			this.prevTime = time;
			this.frames = 0;

			if ( this.memPanel )
			{
				let memory = performance.memory;
				this.memPanel.update( memory.usedJSHeapSize / 1048576, memory.jsHeapSizeLimit / 1048576 );
			}
		}
		return time;
	}

	update()
	{
		this.beginTime = this.end();
	}

	addPanel( panel )
	{
		this.container.appendChild( panel.dom );
		return panel;
	}

	showPanel( id )
	{
		for ( let i = 0; i < this.container.children.length; i ++ )
		{
			this.container.children[ i ].style.display = i === id ? 'block' : 'none';
		}

		this.mode = id;
	}
	
	setMode(id) // Backwards Compatibility
	{
		this.showPanel(id);
	}
	
	//nested class
	static Panel = class Panel
	{
		dom = undefined
		fg = undefined
		bg = undefined
		g = undefined //global config
		min = Infinity
		max = 0
		
		constructor(name, fg, bg, g) 
		{
			//panel-specifics
			this.name = name;
			this.fg = fg;
			this.bg = bg;
			this.g = g;
			
			//all-panel sizes
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
			
			//canvas and context
			let canvas = document.createElement( 'canvas' );
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
			
			this.dom = canvas;
		}
		
		update ( value, maxValue )
		{
			let round = Math.round;
			let g = this.g;
			
			//panel-specifics
			let name = this.name;
			let bg = this.bg;
			let fg = this.fg;
			let min = this.min = Math.min( this.min, value );
			let max = this.max = Math.max( this.max, value );
			
			//all-panel sizes
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
			
			//canvas and context
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