import { Hono } from "hono";
import { env } from "hono/adapter";
import { cors } from "hono/cors";

// This ensures c.env.MEDIA_BUCKET is correctly typed
type Bindings = {
  MEDIA_BUCKET: R2Bucket;
};

const app = new Hono<{ Bindings: Bindings }>();
app.use("/*", cors());

app.put("/", async (c) => {
  const body = await c.req.parseBody({
    all: true,
  });
  const image = body["image"];
  try {
    const res = await c.env.MEDIA_BUCKET.put(image.name, image);
    console.log(JSON.stringify(res));
    return c.json({
      message: `Successfully uploaded ${image.name} to the bucket.`,
      body: image,
    });
  } catch (error) {
    return new Response(`Error uploading. ${error} `, { status: 500 });
  }
});

app.get("/all", async (c) => {
  const objects = await c.env.MEDIA_BUCKET.list();
  return c.json(objects);
});

app.get("/:file_name", async (c) => {
  const { file_name } = c.req.param();
  const object = await c.env.MEDIA_BUCKET.get(file_name);
  if (object === null) {
    return new Response("Object Not Found", { status: 404 });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);

  return new Response(object.body, {
    headers,
  });
});

export default app;
