const numPoints = 20;
const numFollowing = 1;
const radiusFactor = 6;
const minRadius = 2;
const velFactor = 0.4;
const velColorFactor = 2;
let canvas, ctx, points, t;

function load() {
	canvas = document.getElementById('canvas');
	canvas.width = innerWidth - 40;
	canvas.height = innerHeight - 80;
	ctx = canvas.getContext('2d');

	start();
	requestAnimationFrame(draw);
}

function start() {
	ctx.fillStyle = '#040';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	t = 0;
	points = [];
	for (let i = 0; i < numPoints; i++) {
		points.push({
			pos: {
				// x: Math.floor(Math.random() * canvas.width),
				// y: Math.floor(Math.random() * canvas.height),
				x:
					canvas.width / 2 +
					(canvas.width / 6) * Math.cos((i * 2 * Math.PI) / numPoints),
				y:
					canvas.height / 2 +
					(canvas.width / 6) * Math.sin((i * 2 * Math.PI) / numPoints),
			},
			vel: {
				x: 0,
				y: 0,
			},
			following: [],
			// color: hsvToRgb(Math.random(), 0.2 + 0.4 * Math.random(), 1),
			radiusFreq: 0.1 * (Math.random() + 0.8),
			radius: 0,
		});
	}

	let j = 0;
	for (const p of points) {
		const f1 = points[(j + points.length - 1) % points.length];
		p.following.push(f1);
		const f2 = points[(j + points.length - 2) % points.length];
		p.following.push(f2);

		// for (let i = 0; i < numFollowing; i++) {
		// let f;
		// do {
		// 	f = points[Math.floor(Math.random() * points.length)];
		// } while (f == p);
		// }
		j++;
	}

	for (let i = 0; i < numPoints / 2; i++) {
		const p = points[Math.floor(Math.random() * points.length)];
		let f;
		do {
			f = points[Math.floor(Math.random() * points.length)];
		} while (f == p);
		p.following.push(f);
	}

	console.log(points);
}

function step() {
	for (const p of points) {
		for (const f of p.following) {
			const dx = p.pos.x - f.pos.x;
			const dy = p.pos.y - f.pos.y;
			const distSq = dx ** 2 + dy ** 2;
			p.vel.x -= (velFactor * dx) / distSq;
			p.vel.y -= (velFactor * dy) / distSq;
		}
		// console.log(p.vel);
	}
	for (const p of points) {
		p.pos.x += p.vel.x;
		p.pos.y += p.vel.y;

		if (p.pos.x < 0 || p.pos.x > canvas.width) {
			p.vel.x *= -1;
		}
		if (p.pos.y < 0 || p.pos.y > canvas.height) {
			p.vel.y *= -1;
		}

		p.radius = minRadius + radiusFactor * (1 + Math.sin(t * p.radiusFreq));
	}
	t++;
}

function draw() {
	step();
	ctx.strokeStyle = '#000';
	for (const p of points) {
		const vel = Math.sqrt(p.vel.x ** 2 + p.vel.y ** 2);
		const h = sigmoid(vel * velColorFactor);
		// console.log(h);
		ctx.fillStyle = hsvToRgb(h, 0.4, 1);
		ctx.beginPath();
		ctx.arc(p.pos.x, p.pos.y, p.radius, 0, 2 * Math.PI);
		ctx.fill();

		ctx.beginPath();
		ctx.arc(p.pos.x, p.pos.y, p.radius, 0, 2 * Math.PI);
		ctx.stroke();

		// ctx.beginPath();
		// ctx.moveTo(p.pos.x, p.pos.y);
		// ctx.lineTo(p.pos.x + 80 * p.vel.x, p.pos.y + 80 * p.vel.y);
		// ctx.stroke();
	}

	requestAnimationFrame(draw);
}

function hsvToRgb(h, s, v) {
	const i = Math.floor(h * 6);
	const f = h * 6 - i;
	const p = v * (1 - s);
	const q = v * (1 - f * s);
	const t = v * (1 - (1 - f) * s);
	let r, g, b;
	switch (i % 6) {
		case 0:
			(r = v), (g = t), (b = p);
			break;
		case 1:
			(r = q), (g = v), (b = p);
			break;
		case 2:
			(r = p), (g = v), (b = t);
			break;
		case 3:
			(r = p), (g = q), (b = v);
			break;
		case 4:
			(r = t), (g = p), (b = v);
			break;
		case 5:
			(r = v), (g = p), (b = q);
			break;
	}

	function toHex(n) {
		let h = n.toString(16);
		if (h.length < 2) {
			h = `0${h}`;
		}
		return h;
	}

	return `#${toHex(Math.round(r * 255))}${toHex(Math.round(g * 255))}${toHex(
		Math.round(b * 255)
	)}`;
}

function sigmoid(x) {
	return 2 / (1 + Math.exp(-x)) - 1;
}
