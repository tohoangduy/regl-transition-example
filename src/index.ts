/*
	tags: basic, video

	<p>This example shows how to overlay a chroma keyed video over a background rendered by regl. </p>

 */

// const GLTransitions = require("gl-transitions");
// const createREGL = require("regl");
// const createREGLTransition = require("regl-transition");

// const delay = 1;
// const duration = 1.5;
import * as REGL from 'regl';
// const regl = require('regl')();
const regl = REGL();
const listVideo = ['Big_Buck_Bunny_720_10s_5MB.mp4', 'Manulife-Cutdown-15s-Opt1.mp4', 'Jellyfish_720_10s_5MB.mp4', 'doggie-chromakey.ogv']
var videoIndex = 0
var videoPlaying = false

// const texture = regl.texture({
//	width: 1366,
//	height: 768,
//	wrapS: gl.CLAMP_TO_EDGE,
//	wrapT: gl.CLAMP_TO_EDGE,
//	min: "linear"
// })

const drawDoggie = regl({
	frag: `
	precision mediump float;
	uniform sampler2D texture;
	uniform vec2 screenShape;
	uniform float time;

	varying vec2 uv;

	// vec4 background () {
	//	vec2 pos = 0.5 - gl_FragCoord.xy / screenShape;
	//	float r = length(pos);
	//	float theta = atan(pos.y, pos.x);
	//	return vec4(
	//		cos(pos.x * time) + sin(pos.y * pos.x * time),
	//		cos(100.0 * r * cos(0.3 * time) + theta),
	//		sin(time / r + pos.x * cos(10.0 * time + 3.0)),
	//		1);
	// }

	void main () {
		// vec4 color = texture2D(texture, uv);
		// float chromakey = step(0.15 + max(color.r, color.b), color.g);
		// gl_FragColor = mix(color, background(), chromakey);
		
		gl_FragColor = texture2D(texture, uv);
	}`,

	vert: `
	precision mediump float;
	attribute vec2 position;
	varying vec2 uv;
	void main () {
		uv = vec2(1.0 - position.x, position.y);
		gl_Position = vec4(1.0 - 2.0 * position, 0, 1);
	}`,

	attributes: {
		position: [
			-2, 0,
			0, -2,
			2, 2],
	},

	uniforms: {
		texture: regl.prop('video' as never),

		screenShape: ({viewportWidth, viewportHeight}: any) =>
			[viewportWidth, viewportHeight],

		time: regl.context('time')
	},

	count: 3
})

require('resl')({
	manifest: {
		video: {
			type: 'video',
			src: 'assets/' + listVideo[videoIndex],
			stream: true
		}
	},

	onDone: ({video}: any) => {
		// video.autoplay = true
		// video.loop = true
		video.muted = true
		video.onended = function(_e: any) {
			videoPlaying = false;
			videoIndex = ++videoIndex % listVideo.length;
			video.src = 'assets/' + listVideo[videoIndex];
			video.play();
		}
		video.onplaying = () => {
			texture.resize(video.videoWidth, video.videoHeight)
			videoPlaying = true
		}
		
		const texture = regl.texture(video)
		video.play()

		regl.frame(() => {
			if (videoPlaying) {
				drawDoggie({ video: texture.subimage(video) });
			}
		})
	}
})

// const GLTransitions = require("gl-transitions");
// const createREGL = require("regl");
// const createREGLTransition = require("regl-transition");

// const delay = 1;
// const duration = 1.5;
// const imgSrcs = ["1.jpg", "2.jpg", "3.jpg", "4.jpg"];
// const videoSrcs = ['Big_Buck_Bunny_720_10s_5MB.mp4', 'Jellyfish_720_10s_5MB.mp4'];

// const loadImage = src =>
//	new Promise((resolve, reject) => {
//		const img = new Image();
//		img.onload = () => resolve(img);
//		img.onerror = reject;
//		img.onabort = reject;
//		img.src = src;
//	});

// const regl = createREGL();
// const transitions = GLTransitions.map(t => createREGLTransition(regl, t));

// Promise.all(imgSrcs.map(loadImage)).then(imgs => {
//	const slides = imgs.map(img => regl.texture(img));
//	regl.frame(({ time }) => {
//		const index = Math.floor(time / (delay + duration));
//		const from = slides[index % slides.length];
//		const to = slides[(index + 1) % slides.length];
//		const transition = transitions[index % transitions.length];
//		const total = delay + duration;
//		const progress = Math.max(0, (time - index * total - delay) / duration);
//		transition({ progress, from, to });
//	});
// });
