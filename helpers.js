import numbers from "./numbers.js";
import { APPLE, BG } from "./tiles.js";

/**
 * @param {[{name: string, points: number}]} scores
 * @param {HTMLDivElement} where
 */
export const set_scores = (scores, where) => {
	const name_col = document.createElement("div");
	const score_col = document.createElement("div");

	scores.forEach((score) => {
		const name_element = document.createElement("div");
		const points_element = document.createElement("div");

		name_element.innerHTML = score.name;
		points_element.innerHTML = score.points;

		name_col.appendChild(name_element);
		score_col.appendChild(points_element);
	});

	where.style.display = "flex";
	where.style.justifyContent = "space-around";
	where.innerHTML = "";
	where.appendChild(name_col);
	where.appendChild(score_col);
};

/**
 * @param {HTMLElement} element
 */
export const hide_element = (element) => {
	element.hidden = true;
};

/**
 * @param {HTMLElement} element
 */
export const show_element = (element) => {
	element.removeAttribute("hidden");
};

/**
 * Nota: retorna los puntajes ordenados de forma descendiente.
 * @returns {[{name, score}] | null} Arreglo de puntajes, o null en caso de error.
 */
export const get_scores = () => {
	try {
		let scores = JSON.parse(localStorage.getItem("scores"));
		scores.sort((a, b) => b.points - a.points);
		return scores;
	} catch (e) {
		return null;
	}
};

export const show_scores = () => {
	const score_entries = document.getElementById("score_entries");
	const score_board = document.getElementById("score_board");
	const game_form = document.getElementById("form");
	const scores = get_scores();

	if (!scores) {
		alert("No hay puntajes guardados.");
		return;
	}

	set_scores(scores, score_entries);

	show_element(score_board);
	hide_element(game_form);
};

export const hide_scores = () => {
	const game_form = document.getElementById("form");
	const score_board = document.getElementById("score_board");

	hide_element(score_board);
	show_element(game_form);
};

export const delete_scores = () => {
	if (confirm("¿Quieres borrar todos los puntajes?")) {
		localStorage.removeItem("scores");
		hide_scores();
	}
};

export const game_input_listener = (ev, game, snake) => {
	const key = ev.key;
	const key_debug = document.getElementById("key_pressed");
	let direction = "";

	if (key === "ArrowUp" || key === "w") direction = "up";
	if (key === "ArrowDown" || key === "s") direction = "down";
	if (key === "ArrowLeft" || key === "a") direction = "left";
	if (key === "ArrowRight" || key === "d") direction = "right";

	game.direction_pressed = direction;
	key_debug.innerText = game.direction_pressed;

	if (snake.speed <= 0) game_logic(true);
};

export const draw_score = (score, game) => {
	const score_counter = document.getElementById("score");
	const string_score = score.toString();

	const max_digits = Math.trunc(game.board.size.height / 4);
	const excess_pixels = game.board.size.height % 4;

	score_counter.innerHTML = "";

	for (let i = 0; i < max_digits - string_score.length; i++) {
		const digit = document.createElement("div");
		digit.innerHTML = numbers[0];
		score_counter.appendChild(digit);
	}

	for (let number of string_score) {
		const digit = document.createElement("div");
		digit.innerHTML = numbers[number];

		score_counter.appendChild(digit);
	}

	for (let i = 0; i < excess_pixels; i++) {
		const col = document.createElement("div");
		col.innerText = "⬛\n⬛\n⬛\n⬛\n⬛\n";
		score_counter.appendChild(col);
	}
};

export const make_a_move = (game, snake) => {
	// set valid snake direction
	if (
		!snake.direction ||
		(snake.direction === "left" && game.direction_pressed !== "right") ||
		(snake.direction === "right" && game.direction_pressed !== "left") ||
		(snake.direction === "up" && game.direction_pressed !== "down") ||
		(snake.direction === "down" && game.direction_pressed !== "up")
	) {
		snake.direction = game.direction_pressed;
	}

	document.getElementById("snake_dir").innerText = snake.direction;

	switch (game.snake.check(snake.direction)) {
		case APPLE:
			game.add_point();
			game.snake.move(snake.direction);
			break;
		case BG:
			game.snake.move(snake.direction);
			break;
		default:
			game.stop();
			return;
	}

	if (game.snake.pieces.length > snake.length) {
		const { x, y } = game.snake.pieces.shift();
		game.board.array[x][y] = BG;
	}

	game.snake.pieces.push(game.snake.position);
};

export const init_board = (game, snake, game_logic) => {
	const game_form = document.getElementById("form");
	const game_board = document.getElementById("the_game");

	const height = document.getElementById("height").value;
	const width = document.getElementById("width").value;
	const speed = document.getElementById("speed").value;
	const walls = document.getElementById("walls").checked;

	//console.log({ height, width, speed, walls });

	hide_element(game_form);
	show_element(game_board);

	//set the variables
	game.board.size = { height, width };
	snake.speed = Number.parseInt(speed);
	game.board.has_walls = walls;

	//start game
	game.instance = window.setInterval(game_logic, 1);
	document.onkeydown = (ev) => game_input_listener(ev, game, snake);
};

export const generate_valid_coords = (game, board) => {
	if (!game.board) return null;
	if (!board.has_empty_space) return null;

	const valid_coords = [];

	game.board.array.forEach((row, x) =>
		row.forEach((tile, y) => {
			if (tile === BG) valid_coords.push({ x, y });
		})
	);

	return valid_coords[Math.floor(Math.random() * valid_coords.length)];
};
