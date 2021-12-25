import {
	delete_scores,
	draw_score,
	generate_valid_coords,
	get_scores,
	hide_scores,
	init_board,
	make_a_move,
	show_scores,
} from "./helpers.js";
import { APPLE, BG, SNEK, WALL } from "./tiles.js";

console.log("Snake se cargó con éxito.");

const board = {
	create: () => {
		const { height, width } = game.board.size;

		//create board array
		let board = [];
		for (let i = 0; i < height; i++) board.push([]);

		//create basic board with walls
		for (let y = 0; y < height; y++)
			for (let x = 0; x < width; x++) {
				if (
					(x === 0 || y === 0 || x === width - 1 || y === height - 1) &&
					game.board.has_walls
				)
					board[x][y] = WALL;
				else board[x][y] = BG;
			}

		game.board.array = board;
		console.log("board created!");
	},

	set: () => {
		const { height, width } = game.board.size;
		let canvas_content = "";

		for (let x = 0; x < width; x++)
			for (let y = 0; y < height; y++) {
				canvas_content += game.board.array[x][y];
				if (y === height - 1) canvas_content += "\n";
			}

		game.board.text = canvas_content;
	},

	draw: () => {
		game.board.canvas.innerText = game.board.text;
	},

	has_apple: () => {
		const { height, width } = game.board.size;

		for (let x = 0; x < width; x++)
			for (let y = 0; y < height; y++)
				if (game.board.array[x][y] === APPLE) return true;

		return false;
	},

	has_empty_space: () => {
		const { height, width } = game.board.size;

		for (let x = 0; x < width; x++)
			for (let y = 0; y < height; y++)
				if (game.board.array[x][y] === BG) return true;

		return false;
	},

	generate_apple: () => {
		const { x, y } = generate_valid_coords(game, board) ?? { x: null, y: null };
		if (!x || !y) return;

		game.board.array[x][y] = APPLE;

		if (!board.has_empty_space) return;
	},
};

const snake = {
	speed: 30,

	direction: null,
	length: 2,

	pieces: [],

	set_initial_position: () => {
		const coords = {
			x: Math.floor(game.board.size.width / 2),
			y: Math.floor(game.board.size.height / 2),
		};
		game.snake.position = coords;
		game.snake.pieces = [coords];
	},

	draw: () => {
		const { x, y } = game.snake.position;
		game.board.array[x][y] = SNEK;
	},

	move: {
		right: () => {
			const { x, y } = game.snake.position;
			const { height } = game.board.size;

			if (y + 1 > height - 1) {
				game.board.array[x][0] = SNEK;
				game.snake.position = { x, y: 0 };
				return;
			}

			game.board.array[x][y + 1] = SNEK;
			game.snake.position = { x, y: y + 1 };
		},
		left: () => {
			const { x, y } = game.snake.position;
			const { height } = game.board.size;

			if (y - 1 < 0) {
				game.board.array[x][height - 1] = SNEK;
				game.snake.position = { x, y: height - 1 };
				return;
			}

			game.board.array[x][y - 1] = SNEK;
			game.snake.position = { x, y: y - 1 };
		},
		up: () => {
			const { x, y } = game.snake.position;
			const { width } = game.board.size;

			if (x - 1 < 0) {
				game.board.array[width - 1][y] = SNEK;
				game.snake.position = { x: width - 1, y };
				return;
			}

			game.board.array[x - 1][y] = SNEK;
			game.snake.position = { x: x - 1, y };
		},
		down: () => {
			const { x, y } = game.snake.position;
			const { width } = game.board.size;

			if (x + 1 > width - 1) {
				game.board.array[0][y] = SNEK;
				game.snake.position = { x: 0, y };
				return;
			}

			game.board.array[x + 1][y] = SNEK;
			game.snake.position = { x: x + 1, y };
		},
	},

	check: {
		right: () => {
			const { x, y } = game.snake.position;
			const { height } = game.board.size;

			if (y + 1 > height - 1) return game.board.array[x][0];
			return game.board.array[x][y + 1];
		},
		left: () => {
			const { x, y } = game.snake.position;
			const { height } = game.board.size;

			if (y - 1 < 0) return game.board.array[x][height - 1];
			return game.board.array[x][y - 1];
		},
		up: () => {
			const { x, y } = game.snake.position;
			const { width } = game.board.size;
			if (x - 1 < 0) return game.board.array[width - 1][y];
			return game.board.array[x - 1][y];
		},
		down: () => {
			const { x, y } = game.snake.position;
			const { width } = game.board.size;
			if (x + 1 > width - 1) return game.board.array[0][y];
			return game.board.array[x + 1][y];
		},
	},
};

// happens every frame
const game_logic = (override = false) => {
	// initial check
	if (!game.is_init) {
		if (!game.board.array) board.create();
		if (!game.snake.position) snake.set_initial_position();

		game.is_init = true;
		console.log("Game is initialized.");
		draw_score(game.points.n, game);
	}

	// win condition check
	if (!board.has_empty_space() && !board.has_apple()) {
		game.stop(true);
	}

	if (game.board_requires_updating) {
		snake.draw();
		if (!board.has_apple()) board.generate_apple();
		board.set();
		board.draw();

		game.board_requires_updating = false;
	}

	if (game.tick === snake.speed || override) {
		if (game.direction_pressed) make_a_move(game, snake);

		game.tick = 0;
		game.board_requires_updating = true;
	}

	game.tick++;
};

const game = {
	instance: null,

	tick: 0,

	direction_pressed: null,

	is_init: false,
	board_requires_updating: true,

	points: {
		n: 0,
		canvas: document.getElementById("points"),
	},

	board: {
		canvas: document.getElementById("snake"),
		array: null,
		text: null,

		has_walls: false,
		size: {
			height: 20,
			width: 20,
		},
	},

	snake: {
		position: null,
		pieces: [],
		move: (dir) => {
			switch (dir) {
				case "up":
					snake.move.up();
					break;
				case "down":
					snake.move.down();
					break;
				case "left":
					snake.move.left();
					break;
				case "right":
					snake.move.right();
					break;
				default:
					throw new Error("Invalid direction");
			}
		},
		check: (dir) => {
			switch (dir) {
				case "up":
					return snake.check.up();
				case "down":
					return snake.check.down();
				case "left":
					return snake.check.left();
				case "right":
					return snake.check.right();
				default:
					throw new Error("Invalid direction");
			}
		},
	},

	stop: (player_won = false) => {
		const scores = get_scores() ?? [];
		let has_highest_score = true;
		let name;
		let message;

		// check if high score
		if (scores)
			scores.forEach((entry) => {
				if (entry.points > game.points.n) has_highest_score = false;
			});

		message = player_won ? "¡Ganaste!" : "¡Perdiste!";
		message += "\nTu puntaje: " + game.points.n;
		message += has_highest_score ? "\n¡Nuevo récord!" : "";
		message += "\nIngresa tu nombre:";

		window.clearInterval(game.instance);

		name = prompt(message)?.trim() ?? "N/A";
		if (name === "") name = "N/A";
		scores.push({ name, points: game.points.n });
		localStorage.setItem("scores", JSON.stringify(scores));

		location.reload();
	},

	add_point: () => {
		game.points.n++;
		snake.length++;
		document.getElementById("points").innerText = game.points.n;

		draw_score(game.points.n, game);
	},
};

document.getElementById("start_board").onclick = () =>
	init_board(game, snake, game_logic);

// set actions for the view scores button
document.getElementById("view_scores").onclick = show_scores;

// set actions for the return to menu button
document.getElementById("return_to_main").onclick = hide_scores;

// set actions for the remove all scores button
document.getElementById("remove_all_scores").onclick = delete_scores;
