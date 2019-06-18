import Canvas2d from './Canvas2d';
import {createCanvas, mediaSize, paintToCanvas} from '../canvas';

export default class Compose extends Canvas2d {

    constructor(options) {
        super('Compose', {
            image: null,
            fg: {
                type: 'Image'
            },
            fgX: {
                type: 'Number',
                default: 0,
                step: 1,
            },
            fgY: {
                type: 'Number',
                default: 0,
                step: 1,
            },
            bg: {
                type: 'Image',
            },
            bgX: {
                type: 'Number',
                default: 0,
                step: 1,
            },
            bgY: {
                type: 'Number',
                default: 0,
                step: 1,
            },
            width: {
                type: 'Number',
                default: 100,
                step: 1,
                min: 1
            },
            height: {
                type: 'Number',
                default: 100,
                step: 1,
                min: 1,
            },
            mode: {
                type: 'String',
                default: 'source-over',
                enum: [
                    'source-over',
                    'source-in',
                    'source-out',
                    'source-atop',
                    'destination-over',
                    'destination-in',
                    'destination-out',
                    'destination-atop',
                    'lighter',
                    'copy',
                    'xor',
                    'multiply',
                    'screen',
                    'overlay',
                    'darken',
                    'lighten',
                    'color-dodge',
                    'color-burn',
                    'hard-light',
                    'soft-light',
                    'difference',
                    'exclusion',
                    'hue',
                    'saturation',
                    'color',
                    'luminosity',
                ]
            }
        }, {
            image: {
                type: 'Image'
            }
        }, options);
    }

    get width() {
        return this.__in.width.value;
    }

    get height() {
        return this.__in.height.value;
    }

    get fg() {
        if (!this.__in.fg.value) {
            return null;
        } else {
            const {width, height} = this.__in.fg.value;
            return {
                image: this.__in.fg.value,
                top: this.__in.fgY.value || 0,
                left: this.__in.fgX.value || 0,
                width,
                height,
            };
        }
    }

    get bg() {
        if (!this.__in.bg.value) {
            return null;
        } else {
            const {width, height} = this.__in.bg.value;
            return {
                image: this.__in.bg.value,
                top: this.__in.bgY.value || 0,
                left: this.__in.bgX.value || 0,
                width,
                height,
            };
        }
    }

    /**
     * @param {any} values
     * @param {HTMLCanvasElement} canvas
     * @param {CanvasRenderingContext2D} ctx
     */
    async render({width, height, mode}, canvas, ctx) {
        if (!width || !height) {
            return;
        }
        if (!this.bg && !this.fg) {
            return;
        }

        canvas.width = width;
        canvas.height = height;

        ctx.globalCompositeOperation = 'source-over';

        if (this.bg) {
            paintToCanvas(canvas, this.bg.image, this.bg);
        }

        ctx.globalCompositeOperation = mode;

        if (this.fg) {
            paintToCanvas(canvas, this.fg.image, this.fg);
        }

        return canvas;
    }
}