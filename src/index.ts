import { Hono } from "hono";
import { cors } from "hono/cors";
import images from "./images";

const api = new Hono().basePath("/api");

api.use(cors());
api.route("/images", images);

export default api;
