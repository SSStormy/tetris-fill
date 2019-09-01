var canvas = document.getElementById('game');
var ctx = canvas.getContext('2d');
const log = console.log;

var cw=canvas.width;
var ch=canvas.height;

var muted = false;
var unitTesting = false;
var masterVolume = .25;

var tetrominos = [
	//tetris
	[
		[
			[ 0, 0, 0, 0, ],
			[ 1, 1, 1, 1, ],
			[ 0, 0, 0, 0, ],
			[ 0, 0, 0, 0, ],
		],
		[
			[ 0, 0, 1, 0 ], 
			[ 0, 0, 1, 0 ], 
			[ 0, 0, 1, 0 ],
			[ 0, 0, 1, 0 ], 			
		],
		[
			[ 0, 0, 0, 0, ],
			[ 0, 0, 0, 0, ],
			[ 1, 1, 1, 1, ],
			[ 0, 0, 0, 0, ],
		],
		[
			[ 0, 1, 0, 0 ], 
			[ 0, 1, 0, 0 ], 
			[ 0, 1, 0, 0 ],
			[ 0, 1, 0, 0 ], 			
		],
	],
	// J-piece
	[
		[
			[ 1, 0, 0, ],
			[ 1, 1, 1, ],
		],
		[
			[ 0, 1, 1, ],
			[ 0, 1, 0, ],
			[ 0, 1, 0, ],
		],
		[
			[ 0, 0, 0, ],
			[ 1, 1, 1, ],
			[ 0, 0, 1, ],
		],
		[
			[ 0, 1, 0 ],
			[ 0, 1, 0 ],
			[ 1, 1, 0 ],
		],
	],
	// L-piece
	[
		[
			[ 0, 0, 1, ],
			[ 1, 1, 1, ],
		],
		[
			[ 0, 1, 0, ],
			[ 0, 1, 0, ],
			[ 0, 1, 1, ],
		],
		[
			[ 1, 1, 1, ],
			[ 1, 0, 0, ],
		],
		[
			[ 1, 1, 0, ],
			[ 0, 1, 0, ],
			[ 0, 1, 0, ],
		],
	],
	// O-piece
	[
		[
			[ 1, 1, ],
			[ 1, 1, ],
		],
		[
			[ 1, 1, ],
			[ 1, 1, ],
		],
		[
			[ 1, 1, ],
			[ 1, 1, ],
		],
		[
			[ 1, 1, ],
			[ 1, 1, ],
		],

	],
	// S-piece
	[
		[
			[ 0, 1, 1, ],
			[ 1, 1, 0, ],
		],
		[
			[ 0, 1, 0, ],
			[ 0, 1, 1, ],
			[ 0, 0, 1, ],
		],
		[
			[ 0, 0, 0, ],
			[ 0, 1, 1, ],
			[ 1, 1, 0, ],
		],
		[
			[ 1, 0,0,  ],
			[ 1, 1,0,  ],
			[ 0, 1,0,  ],
		],
	],
	// T-Piece
	[
		[
			[ 0, 1, 0, ],
			[ 1, 1, 1, ],
		],

		
		[
			[ 0,1, 0, ],
			[ 0,1, 1, ],
			[ 0,1, 0, ],
		],

		[
			[ 1, 1, 1, ],
			[ 0, 1, 0, ],
		],
		
		[
			[ 0, 1,0, ],
			[ 1, 1,0, ],
			[ 0, 1,0, ],
		],

	],
	// Z-stück
	[
		[
			[ 1, 1, 0, ],
			[ 0, 1, 1, ],
		],
		[
			[ 0,0, 1, ],
			[ 0,1, 1, ],
			[ 0,1, 0, ],
		],
		[
			[ 0, 0, 0, ],
			[ 1, 1, 0, ],
			[ 0, 1, 1, ],
		],
		[
			[ 0, 1, 0, ],
			[ 1, 1, 0, ],
			[ 1, 0, 0, ],
		],
	],
]

const tetromino_advance = [
    5, 4, 4, 3, 4, 4, 4
];

const image_names = [
    "t_i",
    "t_j",
    "t_l",
    "t_o",
    "t_s",
    "t_t",
    "t_z",
    "t_placeholder",
    "bg",
    "active",
    "b_next",
    "b_next_down",
    "b_rotate",
    "b_rotate_down",
    "b_place",
    "b_place_down",
    "b_undo",
    "b_undo_down",
];

const is_down = {};

const BOARD_SIZE = [6,6];

let state = {
    pieces: [],
    place_pos: [0,0],
    place_block: 0,
    place_angle: 0,
    usable_pieces: {},
    win: false,
};

let states = [];

const is_in_board = (x ,y) => {
    if(0 > x || x >= BOARD_SIZE[0]) return false;
    if(0 > y || y >= BOARD_SIZE[1]) return false;

    return true; 
};

function play_btn_down() {
    playSound(3517);

}

function redraw(){
    ctx.fillStyle = "whitesmoke";
	ctx.clearRect(0, 0, canvas.width, canvas.height);

    const scale = 8;

    const draw_piece = (origin_x, origin_y, block, angle, is_placeholder) => {
        
        const img = is_placeholder 
            ? images["t_placeholder"]
            : images[image_names[block]]
        ;

        const piece = tetrominos[block][angle];

        for(var row_index = 0; row_index < piece.length; row_index++) {
            var row = piece[row_index];
            for(var col_index = 0; col_index  < row.length; col_index++) {
                var b = row[col_index];

                if(b == 1) {
                    const x = Math.floor(origin_x + col_index);
                    const y = Math.floor(origin_y + row_index);

                    ctx.drawImage(img, x * scale, y * scale);
                }
            }
        }
    };


    {
        const cx = 7;
        const cy = 7;

        log(is_down);

        ctx.drawImage(images["bg"], (cx - 2) * scale - 4, (cy - 2) * scale - 4);

        ctx.drawImage(is_down["z"] ? images["b_next_down"] : images["b_next"], 
            (cx - 2) * scale + 5, (cy) * scale - 1);

        ctx.drawImage(is_down["x"] ? images["b_rotate_down"] : images["b_rotate"], 
            (cx + 6) * scale + 2, (cy) * scale - 1);

        ctx.drawImage(is_down[" "] ? images["b_place_down"] : images["b_place"], 
            (cx) * scale - 1, (cy + 6) * scale + 2);

        ctx.drawImage(is_down["c"] ? images["b_undo_down"] : images["b_undo"], 
            (cx) * scale - 1, (cy - 1) * scale - 3);

        for(const piece of state.pieces) {
            draw_piece(cx + piece.pos[0], cy + piece.pos[1], piece.block, piece.angle, false);
        }

        draw_piece(
            cx + state.place_pos[0], cy + state.place_pos[1], 
            state.place_block, state.place_angle, true
        );
    }

    const draw_text = (txt, x, y) => {
        ctx.fillStyle = "#230214";
        ctx.font = "16px m5x7";
        ctx.fillText(txt, x * scale, y * scale);
    };

    draw_text("Tetris Fill", cw/2/scale - 3 + 2/scale, 5);
    
    if(state.win) {
        let cx = 7 + 1;
        let cy = 17;

        draw_text("Winner!", cx, cy);
    }
    else {
        let cx = 4;
        let cy = 17;

        for(const block_idx in state.usable_pieces) {
            if(cx + tetromino_advance[block_idx] > cw / scale) {
                cx = 4;
                cy += 4;
            }

            draw_piece(cx, cy, block_idx, 0, true);

            const x = cx + tetromino_advance[block_idx] * .5 - 1;
            if(state.place_block == block_idx) {
                ctx.drawImage(images["active"], x * scale, (cy - 1) * scale);
            }

            const count = String(state.usable_pieces[block_idx]);
            draw_text(count, x + 1/scale, cy - 1/scale);

            cx += tetromino_advance[block_idx];
        }
    }
}

let images = [];
for(var i=0; i< image_names.length; i++) {
	var image = new Image();
	image.onload = function () {
        redraw();
	}

	image.src = image_names[i]+".png";
	images[image_names[i]]=image;
}

function get_mouse_pos(e) {
	var rect = canvas.getBoundingClientRect();
	var scaleX = canvas.width / rect.width;    // relationship bitmap vs. element for X
	var scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for Y

	var clientX=e.clientX;
	var clientY=e.clientY;

	if (scaleX < scaleY){
		scaleX=scaleY;
		clientX-=rect.width/2-(cw/scaleX)/2;
	} else {
		scaleY=scaleX;
		clientY-=rect.height/2-(ch/scaleY)/2;
	}
	var x = (clientX - rect.left) * scaleX;   // scale mouse coordinates after they have
	var y =(clientY - rect.top) * scaleY     // been adjusted to be relative to element

    return [x,y];
}

function is_occupied(x, y) {
    if(!is_in_board(x,y)) {
        return true;
    }

    for(const piece of state.pieces) {
        const block = tetrominos[piece.block][piece.angle];

        const local_x = x - piece.pos[0];
        const local_y = y - piece.pos[1];

        const height = block.length;
        const width = block[0].length;

        if(0 > local_x || local_x >= width) continue;
        if(0 > local_y || local_y >= height) continue;

        if(block[local_y][local_x] == 1) {
            return true;
        }
    }

    return false;
}

const for_occupied_in_block = (block, fx) => {
    let leave = false;

    for(let y_off = 0;
            y_off < block.length;
            y_off += 1
    ) {
        for(let x_off = 0;
                x_off < block[y_off].length;
                x_off += 1
        ) {
            if(block[y_off][x_off] == 0) {
                continue;
            }

            if(!fx(x_off, y_off)) {
                leave = true;
                break;
            }
        }

        if(leave) {
            break;
        }
    }
};

const move_cursor = (dx, dy) => {
    const x = state.place_pos[0] + dx;
    const y = state.place_pos[1] + dy;

    const block = tetrominos[state.place_block][state.place_angle];

    let can_move = true;
    for_occupied_in_block(block, (x_off, y_off) => {
        if(!is_in_board(x + x_off, y + y_off)) {
            can_move = false;
            return false;
        }

        return true;
    });

    if(can_move) {
        state.place_pos[0] = x;
        state.place_pos[1] = y;
        playSound(4042);
    }
    else {
        playSound(124124);
    }

};

function push_state() {
    const old_state = {
        pieces: [],
        place_pos: [...state.place_pos],
        place_block: state.place_block,
        place_angle: state.place_angle,
        usable_pieces: {},
        win: state.win
    };

    for(const p of state.pieces) {
        const old_piece = {
            pos: [...p.pos],
            block: p.block,
            angle: p.angle,
        };

        old_state.pieces.push(old_piece);
    }

    for(const key in state.usable_pieces) {
        old_state.usable_pieces[key] = state.usable_pieces[key];
    }
    states.push(old_state);
}

function fix_rotation() {
    const block = tetrominos[state.place_block][state.place_angle];

    while(true) {
        let cont = false;

        for_occupied_in_block(block, (x_off, y_off) => {
            if(0 > state.place_pos[0] + x_off) {
                state.place_pos[0] += 1;
                cont = true;
                return false;
            }
            return true;
        });

        for_occupied_in_block(block, (x_off, y_off) => {
            if(state.place_pos[0] + x_off >= BOARD_SIZE[0]) {
                state.place_pos[0] -= 1;
                cont = true;
                return false;
            }
            return true;
        });

        for_occupied_in_block(block, (x_off, y_off) => {
            if(0 > state.place_pos[1] + y_off) {
                state.place_pos[1] += 1;
                cont = true;
                return false;
            }
            return true;
        });

        for_occupied_in_block(block, (x_off, y_off) => {
            if(state.place_pos[1] + y_off >= BOARD_SIZE[1]) {
                state.place_pos[1] -= 1;
                cont = true;
                return false;
            }
            return true;
        });

        if(!cont) {
            break;
        }
    }
}

function next_usable_piece() {
    const start_idx = state.place_block;
    while(true) {
        state.place_block = (state.place_block + 1) % tetrominos.length;

        if(state.usable_pieces[state.place_block] != undefined && 
            state.usable_pieces[state.place_block] > 0
        ) {
            fix_rotation();
            break;
        }
        else if(state.place_block == start_idx) {
            push_state();
            state.win = true;
            break;
        }
    }
}

function on_key_down(e){

    if(!state.win) {
        if (e.key==="ArrowUp"||e.key=="W"||e.key=="w"){
            e.preventDefault();
            move_cursor(0, -1);
            redraw();
            return false;
        }
        if (e.key==="ArrowDown"||e.key=="S"||e.key=="s"){
            e.preventDefault();
            move_cursor(0, 1);
            redraw();
            return false;
        }
        if (e.key==="ArrowLeft"||e.key=="A"||e.key=="a"){
            e.preventDefault();
            move_cursor(-1, 0);
            redraw();
            return false;
        }
        if (e.key==="ArrowRight"||e.key=="D"||e.key=="d"){
            e.preventDefault();
            move_cursor(1, 0);
            redraw();
            return false;
        }

        if(e.key==="z" || e.key === "Z") {
            e.preventDefault();
            next_usable_piece();
            is_down["z"] = true;
            playSound(52363);
            play_btn_down();

            redraw();
            return false;
        }

        if(e.key==="x" || e.key==="X") {
            e.preventDefault();
            state.place_angle += 1;
            if(state.place_angle >= 4) {
                state.place_angle = 0;
            }
            fix_rotation();
            playSound(123457);
            is_down["x"] = true;
            redraw();
            play_btn_down();
            return false;
        }
        if(e.key===" " && !is_down[" "]) {
            is_down[" "] = true;
            play_btn_down();
            const block = tetrominos[state.place_block][state.place_angle];

            let can_place = true;

            for_occupied_in_block(block, (x_off, y_off) => {
                if(is_occupied(state.place_pos[0] + x_off, state.place_pos[1] + y_off)) {
                    can_place = false;
                    return false;
                }
                return true;
            });

            if(can_place && state.usable_pieces[state.place_block] > 0) {

                push_state();

                state.usable_pieces[state.place_block] -= 1;

                playSound(534);
                state.pieces.push({
                    pos: [state.place_pos[0], state.place_pos[1]],
                    block: state.place_block,
                    angle: state.place_angle
                });

                if(state.usable_pieces[state.place_block] <= 0) {
                    delete state.usable_pieces[state.place_block];
                    next_usable_piece();
                }
            };

            e.preventDefault();
            redraw();
            return false;
        }
    }
	if (e.key==="c" || e.key == "C") {
		e.preventDefault();
        if(states.length > 0) {
            state = states[states.length - 1];
            states.splice(states.length - 1);
            playSound(4047);
        }
        is_down["c"] = true;
            play_btn_down();
        redraw();
        return false;
    }
}

function on_key_up(e){
	if (e.key==="z" || e.key == "Z") {
        is_down["z"] = false;
        redraw();
		e.preventDefault();
        return false;

    }

	if (e.key==="x" || e.key == "X") {
        is_down["x"] = false;
        redraw();
		e.preventDefault();
        return false;

    }
	if (e.key==="c" || e.key == "C") {
        is_down["c"] = false;
        redraw();
		e.preventDefault();
        return false;
    }
	if (e.key===" ") {
        is_down[" "] = false;
        redraw();
		e.preventDefault();
        return false;
    }
}

//canvas.addEventListener("pointerdown",on_pointer_click);
//canvas.addEventListener("pointerup",on_pointer_release);
document.addEventListener("keydown", on_key_down);
document.addEventListener("keyup",on_key_up);

const rng = new RNG(String(new Date()));

const array_scramble = (arr) => {
    for(let i = arr.length - 1;
            i > 1;
            i -= 1
    ) {
        const rand = rng.random(0, i + 1);
        const temp = arr[i];

        arr[i] = arr[rand];
        arr[rand] = temp;
    }
}

function dfs_make_puzzle() {
    const blocks = [0,1,2,3,4,5,6];
    const angles = [0,1,2,3];
    const positions = [];

    for(let x_off = 0; x_off < BOARD_SIZE[0]; x_off += 1) {
        for(let y_off = 0; y_off < BOARD_SIZE[1]; y_off += 1) {

            if(!is_occupied(x_off, y_off)) {
                positions.push([x_off, y_off]);
            }
        }
    }

    if(positions.length == 0) {
        return true;
    }

    array_scramble(blocks);
    array_scramble(angles);
    array_scramble(positions);

    for(const pos of positions) {
        for(const block_idx of blocks) {
            for(const angle of angles) {

                const block = tetrominos[block_idx][angle];

                let can_place = true;
                for_occupied_in_block(block, (x_off, y_off) => {
                    if(is_occupied(pos[0] + x_off, pos[1] + y_off)) {
                        can_place = false;
                        return false;
                    }
                    
                    return true;
                });

                if(!can_place) {
                    continue;
                }

                const idx = state.pieces.length;
                state.pieces.push({
                    pos,
                    block: block_idx,
                    angle
                });

                if(!dfs_make_puzzle()) {
                    state.pieces.splice(idx);
                }

                return true;
            }
        }
    }
    return false;
}

while(true) {
    dfs_make_puzzle();

    let cont = false;
    for(let x_off = 0; x_off < BOARD_SIZE[0]; x_off += 1) {
        for(let y_off = 0; y_off < BOARD_SIZE[1]; y_off += 1) {

            if(!is_occupied(x_off, y_off)) {
                cont = true;
                break;
            }
        }

        if(cont) {
            break;
        }
    }
    if(cont) {
        state.pieces = [];
    }
    else {
        for(const p of state.pieces) {
            if(state.usable_pieces[p.block] == undefined) {
                state.usable_pieces[p.block] = 0;
            }
            state.usable_pieces[p.block] += 1;
        }
        log(state.usable_pieces);

        state.pieces = [];

        break;
    }
}

if(!state.usable_pieces[state.place_block])  {
    next_usable_piece();
}
