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
		
		this.fpsPanel = this.addPanel( this.CreatePanel( 'FPS', '#0ff', '#002' ) );
		this. msPanel = this.addPanel( this.CreatePanel( 'MS' , '#0f0', '#020' ) );
		if ( self.performance && self.performance.memory )
		{
		this.memPanel = this.addPanel( this.CreatePanel( 'MB' , '#f08', '#201' ) );
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
	
	CreatePanel( name, fg, bg )
	{
		var min = Infinity, max = 0, round = Math.round;
		var PR = round( window.devicePixelRatio || 1 );

		var WIDTH = 80 * PR, HEIGHT = 48 * PR,
				TEXT_X = 3 * PR, TEXT_Y = 2 * PR,
				GRAPH_X = 3 * PR, GRAPH_Y = 15 * PR,
				GRAPH_WIDTH = 74 * PR, GRAPH_HEIGHT = 30 * PR;

		var canvas = document.createElement( 'canvas' );
		var context = canvas.getContext( '2d' );
		
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

		let panel =
		{
			dom: canvas,

			update: function ( value, maxValue )
			{
				min = Math.min( min, value );
				max = Math.max( max, value );

				context.fillStyle = bg;
				context.globalAlpha = 1;
				context.fillRect( 0, 0, WIDTH, GRAPH_Y );
				context.fillStyle = fg;
				context.fillText( round( value ) + ' ' + name + ' (' + round( min ) + '-' + round( max ) + ')', TEXT_X, TEXT_Y );

				context.drawImage( canvas, GRAPH_X + PR, GRAPH_Y, GRAPH_WIDTH - PR, GRAPH_HEIGHT, GRAPH_X, GRAPH_Y, GRAPH_WIDTH - PR, GRAPH_HEIGHT );

				context.fillRect( GRAPH_X + GRAPH_WIDTH - PR, GRAPH_Y, PR, GRAPH_HEIGHT );

				context.fillStyle = bg;
				context.globalAlpha = 0.9;
				context.fillRect( GRAPH_X + GRAPH_WIDTH - PR, GRAPH_Y, PR, round( ( 1 - ( value / maxValue ) ) * GRAPH_HEIGHT ) );
			}
		};
		
		return panel;
	}
}