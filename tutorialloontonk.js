var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define("bgagame/tutorialloontonk", ["require", "exports", "ebg/core/gamegui", "ebg/counter"], function (require, exports, Gamegui) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var TutorialLoonTonk = (function (_super) {
        __extends(TutorialLoonTonk, _super);
        function TutorialLoonTonk() {
            var _this = _super.call(this) || this;
            console.log('tutorialloontonk constructor');
            return _this;
        }
        TutorialLoonTonk.prototype.setup = function (gamedatas) {
            console.log("Starting game setup");
            for (var i in gamedatas.board) {
                var square = gamedatas.board[i];
                if (square === null || square === void 0 ? void 0 : square.player)
                    this.addTokenOnBoard(square.x, square.y, square.player);
            }
            dojo.query('.square').connect('onclick', this, 'onPlayDisc');
            this.setupNotifications();
            console.log("Ending game setup");
        };
        TutorialLoonTonk.prototype.onEnteringState = function (stateName, args) {
            console.log('Entering state: ' + stateName);
            switch (stateName) {
                case 'playerTurn':
                    this.updatePossibleMoves(args.args.possibleMoves);
                    break;
            }
        };
        TutorialLoonTonk.prototype.onLeavingState = function (stateName) {
            console.log('Leaving state: ' + stateName);
        };
        TutorialLoonTonk.prototype.onUpdateActionButtons = function (stateName, args) {
            console.log('onUpdateActionButtons: ' + stateName, args);
        };
        TutorialLoonTonk.prototype.addTokenOnBoard = function (x, y, player_id) {
            var player = this.gamedatas.players[player_id];
            if (!player)
                throw new Error('Unknown player id: ' + player_id);
            dojo.place(this.format_block('jstpl_token', {
                color: player.color,
                back_color: player.color,
                x_y: "".concat(x, "_").concat(y)
            }), 'board');
            this.placeOnObject("token_".concat(x, "_").concat(y), "overall_player_board_".concat(player_id));
            this.slideToObject("token_".concat(x, "_").concat(y), "square_".concat(x, "_").concat(y)).play();
        };
        TutorialLoonTonk.prototype.clearPossibleMoves = function () {
            document.querySelectorAll('.possibleMove').forEach(function (element) {
                element.classList.remove('possibleMove');
            });
        };
        TutorialLoonTonk.prototype.updatePossibleMoves = function (possibleMoves) {
            this.clearPossibleMoves();
            for (var x in possibleMoves) {
                for (var y in possibleMoves[x]) {
                    var square = $("square_".concat(x, "_").concat(y));
                    if (!square)
                        throw new Error("Unknown square element: ".concat(x, "_").concat(y, ". Make sure the board grid was set up correctly in the tpl file."));
                    square.classList.add('possibleMove');
                }
            }
            this.addTooltipToClass('possibleMove', '', _('Place a disc here'));
        };
        TutorialLoonTonk.prototype.onPlayDisc = function (evt) {
            evt.preventDefault();
            if (!(evt.currentTarget instanceof HTMLElement))
                throw new Error('evt.currentTarget is null! Make sure that this function is being connected to a DOM HTMLElement.');
            if (!evt.currentTarget.classList.contains('possibleMove'))
                return;
            if (!this.checkAction('playDisc'))
                return;
            var _a = evt.currentTarget.id.split('_'), _square_ = _a[0], x = _a[1], y = _a[2];
            this.ajaxcall("/".concat(this.game_name, "/").concat(this.game_name, "/playDisc.html"), {
                x: x,
                y: y,
                lock: true
            }, this, function () { });
        };
        TutorialLoonTonk.prototype.setupNotifications = function () {
            console.log('notifications subscriptions setup');
            dojo.subscribe('playDisc', this, "notif_playDisc");
            this.notifqueue.setSynchronous('playDisc', 500);
            dojo.subscribe('turnOverDiscs', this, "notif_turnOverDiscs");
            this.notifqueue.setSynchronous('turnOverDiscs', 1000);
            dojo.subscribe('newScores', this, "notif_newScores");
            this.notifqueue.setSynchronous('newScores', 500);
        };
        TutorialLoonTonk.prototype.notif_playDisc = function (notif) {
            this.clearPossibleMoves();
            this.addTokenOnBoard(notif.args.x, notif.args.y, notif.args.player_id);
        };
        TutorialLoonTonk.prototype.notif_turnOverDiscs = function (notif) {
            for (var i = 0; i < notif.args.prevDiscState.length; i++) {
                console.log(notif.args.prevDiscState.length);
                var prev_token_data = notif.args.prevDiscState[i];
                if (prev_token_data === undefined) {
                    throw new Error("Prev token data is undefined");
                }
                var curr_token_data = notif.args.currDiscState[i];
                if (curr_token_data === undefined) {
                    throw new Error("Curr token data is undefined");
                }
                var token = $("token_".concat(prev_token_data.board_x, "_").concat(prev_token_data.board_y));
                if (token === null) {
                    throw new Error("Token is null");
                }
                console.log(prev_token_data);
                var player = prev_token_data.board_player;
                var bottom_side = token.classList.contains('flipped') ? "front" : "back";
                var token_bottom = $("".concat(bottom_side, "_").concat(prev_token_data.board_x, "_").concat(prev_token_data.board_y));
                if (token_bottom === null) {
                    throw new Error("token_bottom is null");
                }
                var player_colors = notif.args.playerColors;
                for (var i_1 = 0; i_1 < player_colors.length; i_1++) {
                    var color = player_colors[i_1].color;
                    token_bottom.classList.remove("tokencolor_" + color);
                    console.log("tokencolor_" + color);
                }
                var added_color = "";
                for (var i_2 = 0; i_2 < player_colors.length; i_2++) {
                    var id = player_colors[i_2].id;
                    console.log("ID " + id + " board player " + curr_token_data.board_player);
                    if (id.toString() === curr_token_data.board_player.toString()) {
                        console.log("added color: " + player_colors[i_2].color);
                        added_color += player_colors[i_2].color;
                    }
                }
                token_bottom.classList.add("tokencolor_" + added_color);
                token.classList.toggle('flipped');
                console.log(token_bottom.classList);
            }
        };
        TutorialLoonTonk.prototype.notif_newScores = function (notif) {
            for (var player_id in notif.args.scores) {
                var counter = this.scoreCtrl[player_id];
                var newScore = notif.args.scores[player_id];
                if (counter && newScore)
                    counter.toValue(newScore);
            }
        };
        return TutorialLoonTonk;
    }(Gamegui));
    dojo.setObject("bgagame.tutorialloontonk", TutorialLoonTonk);
});
