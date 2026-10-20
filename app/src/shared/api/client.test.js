import { afterAll, afterEach, beforeAll, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { apiClient, definirJeton } from "./client";
import { server } from "@shared/mocks/server";

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
afterEach(() => {
  server.resetHandlers();
  definirJeton(null);
});
afterAll(() => server.close());

it("n'envoie pas l'ancien access à la route qui renouvelle le cookie", async () => {
  let authorization;
  server.use(
    http.post("*/api/auth/refresh/", ({ request }) => {
      authorization = request.headers.get("authorization");
      return HttpResponse.json({ access: "nouvel-access" });
    }),
  );
  definirJeton("ancien-access-expire");

  await apiClient.post("/api/auth/refresh/");

  expect(authorization).toBeNull();
});

it("conserve le bearer sur les changements de mot de passe authentifiés", async () => {
  let authorization;
  server.use(
    http.post("*/api/auth/changer-mot-de-passe/", ({ request }) => {
      authorization = request.headers.get("authorization");
      return HttpResponse.json({ detail: "Mot de passe modifié." });
    }),
  );
  definirJeton("access-valide");

  await apiClient.post("/api/auth/changer-mot-de-passe/");

  expect(authorization).toBe("Bearer access-valide");
});
