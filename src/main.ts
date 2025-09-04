import "./style.css";
import { Game } from "./Game";

const canvas = document.createElement("canvas");
document.body.appendChild(canvas);

new Game(canvas);
