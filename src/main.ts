import "./styles/reset.css";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/layout.css";
import "./styles/motion.css";
import "./styles/responsive.css";

import { bootstrapApp } from "./app";

const app = document.querySelector<HTMLElement>("#app");

if (!app) {
  throw new Error("Missing #app container");
}

void bootstrapApp(app);

