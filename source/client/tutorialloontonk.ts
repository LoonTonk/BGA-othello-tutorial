/*
 *------
 * BGA framework: Gregory Isabelli & Emmanuel Colin & BoardGameArena
 * TutorialLoonTonk implementation : © LoonTonk
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 */
/// <amd-module name="bgagame/tutorialloontonk"/>

import Gamegui = require('ebg/core/gamegui');
import "ebg/counter";

/** The root for all of your game code. */
class TutorialLoonTonk extends Gamegui
{
	// myGlobalValue: number = 0;
	// myGlobalArray: string[] = [];

	/** @gameSpecific See {@link Gamegui} for more information. */
	constructor(){
		super();
		console.log('tutorialloontonk constructor');
	}

	/** @gameSpecific See {@link Gamegui.setup} for more information. */
	setup(gamedatas: Gamedatas): void
	{
		console.log( "Starting game setup" );

		// Place the tokens on the board
		for( let i in gamedatas.board )
			{
				let square = gamedatas.board[i];
		
				if( square?.player ) // If square is defined and has a player
					this.addTokenOnBoard( square.x, square.y, square.player );
			}
	
		dojo.query( '.square' ).connect( 'onclick', this, 'onPlayDisc' );
		// Setup game notifications to handle (see "setupNotifications" method below)
		this.setupNotifications(); // <-- Keep this line
		
		// TODO: Set up your game interface here, according to "gamedatas"

		console.log( "Ending game setup" );
	}

	///////////////////////////////////////////////////
	//// Game & client states
	
	/** @gameSpecific See {@link Gamegui.onEnteringState} for more information. */
	onEnteringState(stateName: GameStateName, args: CurrentStateArgs): void
	{
		console.log( 'Entering state: '+stateName );

		switch( stateName )
		{
			case 'playerTurn':
				this.updatePossibleMoves( args.args!.possibleMoves );
				break;
		}
	}

	/** @gameSpecific See {@link Gamegui.onLeavingState} for more information. */
	onLeavingState(stateName: GameStateName): void
	{
		console.log( 'Leaving state: '+stateName );
	}

	/** @gameSpecific See {@link Gamegui.onUpdateActionButtons} for more information. */
	onUpdateActionButtons(stateName: GameStateName, args: AnyGameStateArgs | null): void
	{
		console.log( 'onUpdateActionButtons: ' + stateName, args );
	}

	///////////////////////////////////////////////////
	//// Utility methods
	
	/** Adds a token matching the given player to the board at the specified location. */
	addTokenOnBoard( x: number, y: number, player_id: number )
	{
		let player = this.gamedatas.players[ player_id ];
		if (!player)
			throw new Error( 'Unknown player id: ' + player_id );

		
		dojo.place( this.format_block( 'jstpl_token', {
			color: player.color,
			back_color: 'FFFF00', // testing
			x_y: `${x}_${y}`
		} ) , 'board' );

		this.placeOnObject( `token_${x}_${y}`, `overall_player_board_${player_id}` );
		this.slideToObject( `token_${x}_${y}`, `square_${x}_${y}` ).play();
	}

	/** Removes the 'possibleMove' class from all elements. */
	clearPossibleMoves() {
		document.querySelectorAll('.possibleMove').forEach(element => {
			element.classList.remove('possibleMove');
		});
	}

	/** Updates the squares on the board matching the possible moves. */
	updatePossibleMoves( possibleMoves: boolean[][] )
	{
		this.clearPossibleMoves();

		for( var x in possibleMoves )
		{
			for( var y in possibleMoves[ x ] )
			{
				let square = $(`square_${x}_${y}`);
				if( !square )
					throw new Error( `Unknown square element: ${x}_${y}. Make sure the board grid was set up correctly in the tpl file.` );
				square.classList.add('possibleMove');
			}
		}

		this.addTooltipToClass( 'possibleMove', '', _('Place a disc here') );
	}
	/*
		Here, you can defines some utility methods that you can use everywhere in your typescript
		script.
	*/


	///////////////////////////////////////////////////
	//// Player's action
	
	/*
		Here, you are defining methods to handle player's action (ex: results of mouse click on game objects).
		
		Most of the time, these methods:
		- check the action is possible at this game state.
		- make a call to the game server
	*/
	
	/** Called when a square is clicked, check if it is a possible move and send the action to the server. */
	onPlayDisc( evt: Event )
	{
		// Stop this event propagation
		evt.preventDefault();

		if (!(evt.currentTarget instanceof HTMLElement))
			throw new Error('evt.currentTarget is null! Make sure that this function is being connected to a DOM HTMLElement.');

		// Check if this is a possible move
		if( !evt.currentTarget.classList.contains('possibleMove') )
			return;

		// Check that this action is possible at this moment (shows error dialog if not possible)
		if( !this.checkAction( 'playDisc' ) )
			return;

		// Get the clicked square x and y
		// Note: square id format is "square_X_Y"
		let [_square_, x, y] = evt.currentTarget.id.split('_');

		this.ajaxcall( `/${this.game_name}/${this.game_name}/playDisc.html`, {
			x, y, lock: true
		}, this, function() {} );
	}
	/*
	Example:
	onMyMethodToCall1( evt: Event )
	{
		console.log( 'onMyMethodToCall1' );

		// Preventing default browser reaction
		evt.preventDefault();

		//	With base Gamegui class...

		// Check that this action is possible (see "possibleactions" in states.inc.php)
		if(!this.checkAction( 'myAction' ))
			return;

		this.ajaxcall( "/yourgamename/yourgamename/myAction.html", { 
			lock: true, 
			myArgument1: arg1,
			myArgument2: arg2,
		}, this, function( result ) {
			// What to do after the server call if it succeeded
			// (most of the time: nothing)
		}, function( is_error) {

			// What to do after the server call in anyway (success or failure)
			// (most of the time: nothing)
		} );


		//	With GameguiCookbook::Common...
		this.ajaxAction( 'myAction', { myArgument1: arg1, myArgument2: arg2 }, (is_error) => {} );
	}
	*/

	///////////////////////////////////////////////////
	//// Reaction to cometD notifications

	/** @gameSpecific See {@link Gamegui.setupNotifications} for more information. */
	setupNotifications()
	{
		console.log( 'notifications subscriptions setup' );
		
		// TODO: here, associate your game notifications with local methods
		
		// With base Gamegui class...
		// dojo.subscribe( 'cardPlayed', this, "notif_cardPlayed" );

		// With GameguiCookbook::Common class...
		// this.subscribeNotif( 'cardPlayed', this.notif_cardPlayed ); // Adds type safety to the subscription

		dojo.subscribe( 'playDisc', this, "notif_playDisc" );
		this.notifqueue.setSynchronous( 'playDisc', 500 );
		dojo.subscribe( 'turnOverDiscs', this, "notif_turnOverDiscs" );
		this.notifqueue.setSynchronous( 'turnOverDiscs', 1000 );
		dojo.subscribe( 'newScores', this, "notif_newScores" );
		this.notifqueue.setSynchronous( 'newScores', 500 );
	}

	notif_playDisc( notif: NotifAs<'playDisc'> )
	{
		this.clearPossibleMoves();
		this.addTokenOnBoard( notif.args.x, notif.args.y, notif.args.player_id );
	}

	notif_turnOverDiscs( notif: NotifAs<'turnOverDiscs'> )
	{
/* 		// Change the color of the turned over discs
		for( var i in notif.args.turnedOver ) // TODO: have new color be an arg
		{
			let token_data = notif.args.turnedOver[ i ]!;
			let token = $<HTMLElement>( `token_${token_data.x}_${token_data.y}` );
			if (!token)
				throw new Error( `Unknown token element: ${token_data.x}_${token_data.y}. Make sure the board grid was set up correctly in the tpl file.` );

			let token_front = $<HTMLElement>( `front_${token_data.x}_${token_data.y}` );
			token_front?.classList.toggle('tokencolor_cbcbcb');
			token.classList.toggle('flipped');
		} */

/* 		for (let i = 0; i < notif.args.prevDiscState.length; i++) {
			const prev_token_data = notif.args.prevDiscState[i];
			if (prev_token_data === undefined) {
				throw new Error("Prev token data is undefined");
			}
			const curr_token_data = notif.args.currDiscState[i];
			if (curr_token_data === undefined) {
				throw new Error("Curr token data is undefined");
			}
			const token = $<HTMLElement>( `token_${prev_token_data.board_x}_${prev_token_data.board_y}` );
			if (token === null) {
				throw new Error("Token is null");
			}
			const player = prev_token_data.board_player;
			const bottom_side = token.classList.contains('flipped') ? "front" : "back"; // Token bottom side is front if flipped, back if not flipped
			const token_bottom = $<HTMLElement>( `${bottom_side}_${prev_token_data.board_x}_${prev_token_data.board_y}` );
			if (token_bottom === null) {
				throw new Error("token_bottom is null");
			}
			const player_colors = notif.args.playerColors;
			for (let i = 0; i < player_colors.length; i++) {
				const color = player_colors[i]!.color;
				token_bottom.classList.remove("tokencolor_" + color);
			}
			let added_color = "";
			for (let i = 0; i < player_colors.length; i++) {
				const id = player_colors[i]!.id;
				if (id === curr_token_data.board_player) {
					added_color += player_colors[i]!.color;
				}
			token_bottom.classList.add("tokencolor_" + added_color);
			token.classList.toggle('flipped');
			}
		}  */
	}

	notif_newScores( notif: NotifAs<'newScores'> )
	{
		for( var player_id in notif.args.scores )
		{
			let counter = this.scoreCtrl[ player_id ];
			let newScore = notif.args.scores[ player_id ];
			if (counter && newScore)
				counter.toValue( newScore );
		}
	}
	/*
	Example:
	
	// The argument here should be one of there things:
	// - `Notif`: A notification with all possible arguments defined by the NotifTypes interface. See {@link Notif}.
	// - `NotifFrom<'cardPlayed'>`: A notification matching any other notification with the same arguments as 'cardPlayed' (A type can be used here instead). See {@link NotifFrom}.
	// - `NotifAs<'cardPlayed'>`: A notification that is explicitly a 'cardPlayed' Notif. See {@link NotifAs}.
	notif_cardPlayed( notif: NotifFrom<'cardPlayed'> )
	{
		console.log( 'notif_cardPlayed', notif );
		// Note: notif.args contains the arguments specified during you "notifyAllPlayers" / "notifyPlayer" PHP call
	}
	*/
}


// The global 'bgagame.tutorialloontonk' class is instantiated when the page is loaded. The following code sets this variable to your game class.
dojo.setObject( "bgagame.tutorialloontonk", TutorialLoonTonk );
// Same as: (window.bgagame ??= {}).tutorialloontonk = TutorialLoonTonk;