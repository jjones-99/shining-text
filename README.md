# shining-text
A shining text experiment for three.js, vite, and tailwindcss. This is meant to somewhat mimic the effect that may be used to represent "magic writing" on a scroll, for example.

## Instructions

A CodePen for this project exists [here](https://codepen.io/jaredcj/pen/ZEKBmMQ). 

To run locally:
- Clone the repo
- Run `npm install`
- Run `npm run dev`

This app uses Vite and, after a short time spinning up, will quickly refresh upon changes to the code.

## Configuration
- There's a set of constants near the top of `/src/shaders/fragment.glsl`. Each can be edited to change the graphics. Play around with them and have fun.
  - In the CodePen, these are in `<script>` tags in the HTML pane.
- There's also a set of constants at the top of `/src/main.ts` defining the textures used for the shader.
  - In the CodePen, these are in the JS pane.
  - Change `MASK_URL` to define the occlusion mask. You don't need to use a black and white image, and `INVERT_MASK` allows you to invert the effect.
  - Change `BASE_URL` to define the background image.

## Credits
- Credit for the inspiration and teaching myself how shaders work goes to a CodePen by [Liam Egan](https://codepen.io/shubniggurath/pen/GGXKJe).
- Credit for documentation when learning three.js goes to the [three.js docs](https://threejs.org/docs).
- Credit for documentation when learning GLSL goes to [The Book of Shaders](https://thebookofshaders.com).
- Credit for the background images goes to [Marjan Blan](https://unsplash.com/@marjan_blan) of [Unsplash](https://unsplash.com). 
