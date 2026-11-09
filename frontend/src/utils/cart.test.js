import test from "node:test";
import assert from "node:assert/strict";
import { addCartItem, normalizeCart, refreshCartItem } from "./cart.js";

const product = { id: 1, title: "Produto", price: 10, quantity: 2, status: "active" };
test("estoque liberado após cancelamento substitui o limite antigo", () => {
  const cart = [{ ...product, stock: 1, qty: 1 }];
  assert.equal(addCartItem(cart, product, 1)[0].qty, 2);
  assert.equal(refreshCartItem(cart[0], product).stock, 2);
});
test("não adiciona quantidades inválidas nem produtos indisponíveis", () => {
  for (const qty of [0, -1, 1.5, NaN, Infinity]) assert.deepEqual(addCartItem([], product, qty), []);
  assert.deepEqual(addCartItem([], { ...product, quantity: 0 }, 1), []);
  assert.deepEqual(addCartItem([], { ...product, status: "inactive" }, 1), []);
  assert.equal(addCartItem([], product, 10)[0].qty, 2);
});
test("localStorage corrompido não quebra o carrinho", () => {
  const item = { id: 1, qty: 1, stock: 1, price: 10 };
  assert.deepEqual(normalizeCart({}), []);
  assert.deepEqual(normalizeCart([null, item, item, { ...item, id: 2, qty: -1 }]), [item]);
});
test("atualiza preço e disponibilidade preservando a quantidade escolhida", () => {
  const updated = refreshCartItem({ id: 1, qty: 2, stock: 2 }, { ...product, price: 20, status: "inactive" });
  assert.equal(updated.stock, 0);
  assert.equal(updated.price, 20);
  assert.equal(updated.qty, 2);
});
