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
	
	constructor()
	{
		this.beginTime = ( performance || Date ).now();
		this. prevTime = this.beginTime;
		this.frames = 0;
		
		this.container = document.createElement( 'div' );
		this.container.style.cssText = 'position:fixed;top:0;left:0;cursor:pointer;opacity:0.9;z-index:10000';
		this.container.addEventListener( 'click', (event) => //function ( event )
		{
			event.preventDefault();
			this.showPanel( ++this.mode % event.currentTarget.children.length );

		}, false );
		this.dom = this.domElement = this.container; // Backwards Compatibility
		
		this.fpsPanel = this.addPanel( new Stats.Panel( 'FPS', '#0ff', '#002' ) );
		this. msPanel = this.addPanel( new Stats.Panel( 'MS' , '#0f0', '#020' ) );
		if ( self.performance && self.performance.memory )
		{
		this.memPanel = this.addPanel( new Stats.Panel( 'MB' , '#f08', '#201' ) );
		}

		this.showPanel( 0 );
	}
	
	begin()
	{
		this.beginTime = ( performance || Date ).now();
	}

	end()
	{
		this.frames ++;

		var time = ( performance || Date ).now();

		this.msPanel.update( time - this.beginTime, 200 );

		if ( time >= this.prevTime + 1000 )
		{
			this.fpsPanel.update( ( this.frames * 1000 ) / ( time - this.prevTime ), 100 );

			this.prevTime = time;
			this.frames = 0;

			if ( this.memPanel )
			{
				var memory = performance.memory;
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
		min = 0
		max = 0
		PR = 0
		WIDTH = 0
		TEXT_X = 0
		TEXT_Y = 0
		GRAPH_X = 0
		GRAPH_Y = 0
		GRAPH_WIDTH = 0
		GRAPH_HEIGHT = 0
		
		dom = undefined
		fg = undefined
		bg = undefined
		
		constructor(name, fg, bg) 
		{
			console.log (`Child: ${name}`);
			
			this.name = name;
			this.fg = fg;
			this.bg = bg;
			//numeric config
			
			this.min = Infinity;
			this.max = 0;
			let PR = this.PR = Math.round( window.devicePixelRatio || 1 );

			let WIDTH = this.WIDTH = 80 * PR;
			let HEIGHT = this.HEIGHT = 48 * PR;
			let TEXT_X = this.TEXT_X = 3 * PR;
			let TEXT_Y = this.TEXT_Y = 2 * PR;
			let GRAPH_X = this.GRAPH_X = 3 * PR;
			let GRAPH_Y = this.GRAPH_Y = 15 * PR;
			let GRAPH_WIDTH = this.GRAPH_WIDTH = 74 * PR;
			let GRAPH_HEIGHT = this.GRAPH_HEIGHT = 30 * PR;
			
			//canvas and context
			let canvas = document.createElement( 'canvas' );
			let context = canvas.getContext( '2d' );
			
			canvas.width = WIDTH;
			canvas.height = HEIGHT;
			canvas.style.cssText = 'width:80px;height:48px';
			
			context.font = 'bold ' + ( 9 * PR ) + 'px Helvetica,Arial,sans-serif';
			context.textBaseline = 'top';

			context.fillStyle = bg;
			context.fillRect( 0, 0, WIDTH, HEIGHT );

			context.fillStyle = fg;
			context.fillText( name, TEXT_X, TEXT_Y );
			context.fillRect( GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT );

			context.fillStyle = bg;
			context.globalAlpha = 0.9;
			context.fillRect( GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT );
			

			this.dom = canvas;
		}
		
		update ( value, maxValue )
		{
			let round = Math.round;
			let min = this.min = Math.min( this.min, value );
			let max = this.max = Math.max( this.max, value );
			let bg = this.bg;
			let fg = this.fg;
			let TEXT_X = this.TEXT_X;
			let TEXT_Y = this.TEXT_Y;
			let GRAPH_X = this.GRAPH_X;
			let GRAPH_Y = this.GRAPH_Y;
			let GRAPH_WIDTH = this.GRAPH_WIDTH;
			let GRAPH_HEIGHT = this.GRAPH_HEIGHT;
			let WIDTH = this.WIDTH;
			let PR = this.PR;
			let canvas = this.dom;
			var context = canvas.getContext( '2d' );
			
			context.fillStyle = bg;
			context.globalAlpha = 1;
			context.fillRect( 0, 0, WIDTH, GRAPH_Y );
			context.fillStyle = fg;
			context.fillText( round( value ) + ' ' + this.name + ' (' + round( min ) + '-' + round( max ) + ')', TEXT_X, TEXT_Y );

			context.drawImage( canvas, GRAPH_X + PR, GRAPH_Y, GRAPH_WIDTH - PR, GRAPH_HEIGHT, GRAPH_X, GRAPH_Y, GRAPH_WIDTH - PR, GRAPH_HEIGHT );

			context.fillRect( GRAPH_X + GRAPH_WIDTH - PR, GRAPH_Y, PR, GRAPH_HEIGHT );

			context.fillStyle = bg;
			context.globalAlpha = 0.9;
			context.fillRect( GRAPH_X + GRAPH_WIDTH - PR, GRAPH_Y, PR, round( ( 1 - ( value / maxValue ) ) * GRAPH_HEIGHT ) );
		}
	}
}