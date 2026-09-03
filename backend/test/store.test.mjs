import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { makeAlias } from "../server/store.mjs";

test("makeAlias returns the requested length", () => {
  assert.equal(makeAlias(6).length, 6);
  assert.equal(makeAlias(10).length, 10);
});

test("makeAlias uses the unambiguous charset only", () => {
  const allowed = /^[abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789]+$/;
  for (let i = 0; i < 50; i++) assert.match(makeAlias(), allowed);
});

test("makeAlias generates varied output", () => {
  const set = new Set(Array.from({ length: 20 }, () => makeAlias()));
  assert.ok(set.size > 10, "aliases should not all collide");
});
