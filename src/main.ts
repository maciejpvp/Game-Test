import "./style.css";
import { Game } from "./Game";
// import "./debug/animPreview.ts";

const canvas = document.createElement("canvas");
document.body.appendChild(canvas);

new Game(canvas);
