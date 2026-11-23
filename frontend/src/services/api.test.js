import assert from "node:assert/strict";
import { test } from "node:test";
import { Capacitor } from "@capacitor/core";

test("cliente HTTP preserva o contrato web e Android", async t => {
  const originalPlatform = Capacitor.isNativePlatform;
  const originalFetch = globalThis.fetch;
  t.after(() => {
    Capacitor.isNativePlatform = originalPlatform;
    globalThis.fetch = originalFetch;
  });

  for (const native of [false, true]) {
    await t.test(native ? "Android usa API HTTPS e cookies" : "web mantém o proxy /api", async () => {
      Capacitor.isNativePlatform = () => native;
      const { apiRequest, ApiError } = await import(`./api.js?native=${native}`);
      const prefix = native ? "https://digital-trading-selling.vercel.app/api" : "/api";
      let received;
      globalThis.fetch = async (url, options) => {
        received = { url, options };
        return Response.json({ success: true });
      };
      await apiRequest("/users/login", { method: "POST", body: { email: "test@example.com", password: "example" } });
      assert.equal(received.url, `${prefix}/users/login`);
      assert.equal(received.options.credentials, "include");
      assert.equal(received.options.headers["Content-Type"], "application/json");
      assert.equal(JSON.parse(received.options.body).email, "test@example.com");

      const images = new FormData();
      images.append("images", new Blob(["image"], { type: "image/png" }), "test.png");
      await apiRequest("/products/1/images", { method: "POST", body: images });
      assert.equal(received.options.body, images);
      assert.equal(received.options.headers, undefined, "o transporte define o boundary multipart");

      globalThis.fetch = async () => Response.json({ message: "Sessão expirada" }, { status: 401 });
      await assert.rejects(apiRequest("/users/me"), error => error instanceof ApiError && error.status === 401);
    });
  }
});
