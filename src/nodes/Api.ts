import Node from './Node';
import {ImageVar, NumberVar, StringVar} from './io/AbstractIOSet';
import throttle from 'lodash/throttle'
import {createCanvas, paintToCanvas} from "./canvas";

const numberOfImageInputs = 8;
const inputs = {
    name0: {
        type: 'String',
        default: 'image'
    } as StringVar,
    image0: {
        type: 'Image',
    } as ImageVar,
    name1: {
        type: 'String',
    } as StringVar,
    image1: {
        type: 'Image',
    } as ImageVar,
    name2: {
        type: 'String',
    } as StringVar,
    image2: {
        type: 'Image',
    } as ImageVar,
    name3: {
        type: 'String',
    } as StringVar,
    image3: {
        type: 'Image',
    } as ImageVar,
    name4: {
        type: 'String',
    } as StringVar,
    image4: {
        type: 'Image',
    } as ImageVar,
    name5: {
        type: 'String',
    } as StringVar,
    image5: {
        type: 'Image',
    } as ImageVar,
    name6: {
        type: 'String',
    } as StringVar,
    image6: {
        type: 'Image',
    } as ImageVar,
    name7: {
        type: 'String',
    } as StringVar,
    image7: {
        type: 'Image',
    } as ImageVar,
    width: {
        type: 'Number',
    } as NumberVar,
    height: {
        type: 'Number',
    } as NumberVar,
    url: {
        type: 'String',
    } as StringVar,
    query: {
        type: 'String',
    } as StringVar,
    throttleMs: {
        type: 'Number',
        default: 10000,
    } as NumberVar,
};

const outputs = {
    image: {
        type: 'Image',
    } as ImageVar,
};


export default class Api extends Node<typeof inputs, typeof outputs> {
    private updateThrottled;
    private updateThrottleWait;
    private tempCanvas: HTMLCanvasElement;
    constructor() {
        super('Api', inputs, outputs);
        this.updateThrottleWait = this.in.throttleMs.value;
        this.updateThrottled = throttle(this.upload, this.updateThrottleWait);
        console.log(this.updateThrottleWait);
    }

    async _update() {
        if (!this.in.url.value || !this.in.width.value || !this.in.height.value) {
            return;
        }

        if (this.updateThrottleWait !== this.in.throttleMs.value) {
            this.updateThrottleWait = this.in.throttleMs.value;
        }

        try {
            this.out.image.value = await this.updateThrottled();
        } catch (e) {
            console.error(e);
            this.out.image.value = undefined;
            await new Promise((resolve) => setTimeout(resolve, this.updateThrottleWait));
        }
    }

    private async upload(): Promise<HTMLImageElement | undefined> {
        const formData = await this.createFormData();

        const response = await fetch(this.in.url.value, {
            method: 'POST',
            body: formData,
        })

        if (response.status >= 400) {
            throw new Error(response.statusText);
        }

        const blob = await response.blob();

        const img = new Image();
        img.src = URL.createObjectURL(blob);
        await new Promise((resolve) => {
            img.onload = () => {
                resolve();
            }
        })

        return img;
    }

    private async createFormData() {
        const formData = new FormData();

        const queryString = new URLSearchParams(this.in.query.value);
        queryString.forEach((value, key) => {
            formData.append(key, value);
        })

        for(let i = 0; i < numberOfImageInputs; i++) {
            if (this.in['name' + i].value && this.in['image' + i].value) {
                formData.append(this.in['name' + i].value, await this.getBlobFromImage(this.in['image' + i].value));
            }
        }

        return formData;
    }

    private async getBlobFromImage(media: CanvasImageSource): Promise<Blob> {
        if (!this.tempCanvas) {
            this.tempCanvas = createCanvas(this.in.width.value, this.in.height.value);
        }

        paintToCanvas(this.tempCanvas, media, {
            top: 0, left: 0, width: this.in.width.value, height: this.in.height.value,
        })

        return await new Promise((resolve, reject) => {
            this.tempCanvas.toBlob((blob) => {
                if (!blob) {
                    reject();
                }
                resolve(blob);
            })
        });
    }
}