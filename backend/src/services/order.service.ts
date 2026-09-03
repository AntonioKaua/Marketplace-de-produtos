import { supabase } from "../config/supabase.js";
import { decrementStock, restockProduct } from "./product.service.js";

export interface OrderItemInput {
  productId: number;
  quantity: number;
}

export interface ShippingInput {
  cep: string;
  address: string;
  city: string;
  state: string;
}

export class OrderError extends Error {
  constructor(
    message: string,
    public status: number,
    public field?: string,
  ) {
    super(message);
  }
}

interface ProductForOrder {
  id_products: number;
  title: string;
  price: number;
  status: string;
  id_user: number;
}

async function loadProductsForOrder(items: OrderItemInput[]) {
  const ids = items.map(item => item.productId);

  const { data, error } = await supabase
    .from("products")
    .select("id_products, title, price, status, id_user")
    .in("id_products", ids);

  if (error) {
    throw new Error(error.message);
  }

  const products = data as ProductForOrder[];
  const byId = new Map(products.map(product => [product.id_products, product]));

  for (const item of items) {
    const product = byId.get(item.productId);

    if (!product) {
      throw new OrderError(`Produto ${item.productId} não encontrado.`, 404);
    }

    if (product.status !== "active") {
      throw new OrderError(`O produto "${product.title}" não está mais disponível.`, 409);
    }
  }

  return byId;
}

export async function createOrder(buyerId: number, items: OrderItemInput[], shipping: ShippingInput) {
  if (items.length === 0) {
    throw new OrderError("O pedido precisa ter ao menos um item.", 422);
  }

  const productsById = await loadProductsForOrder(items);

  const decremented: OrderItemInput[] = [];

  try {
    for (const item of items) {
      try {
        await decrementStock(item.productId, item.quantity);
        decremented.push(item);
      } catch (error) {
        const message = error instanceof Error ? error.message : "";
        if (message.includes("INSUFFICIENT_STOCK")) {
          const title = productsById.get(item.productId)?.title ?? item.productId;
          throw new OrderError(`Estoque insuficiente para "${title}".`, 409);
        }
        throw error;
      }
    }

    const total = items.reduce((sum, item) => {
      const product = productsById.get(item.productId)!;
      return sum + Number(product.price) * item.quantity;
    }, 0);

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        id_user: buyerId,
        status: "pending",
        total,
        shipping_cep: shipping.cep,
        shipping_address: shipping.address,
        shipping_city: shipping.city,
        shipping_state: shipping.state,
      })
      .select("id_orders, status, total, creation_date")
      .single();

    if (orderError) {
      throw new Error(orderError.message);
    }

    const orderItemsPayload = items.map(item => {
      const product = productsById.get(item.productId)!;
      return {
        id_orders: order.id_orders,
        id_products: product.id_products,
        id_seller: product.id_user,
        title: product.title,
        unit_price: product.price,
        quantity: item.quantity,
      };
    });

    const { error: itemsError } = await supabase.from("order_items").insert(orderItemsPayload);

    if (itemsError) {
      await supabase.from("orders").delete().eq("id_orders", order.id_orders);
      throw new Error(itemsError.message);
    }

    return {
      id: order.id_orders as number,
      status: order.status as string,
      total: Number(order.total),
      creationDate: order.creation_date as string,
    };
  } catch (error) {
    for (const item of decremented) {
      await restockProduct(item.productId, item.quantity).catch(() => undefined);
    }
    throw error;
  }
}

export async function setOrderPreference(orderId: number, preferenceId: string) {
  const { error } = await supabase
    .from("orders")
    .update({ mp_preference_id: preferenceId, update_date: new Date().toISOString() })
    .eq("id_orders", orderId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function updateOrderStatus(orderId: number, status: string) {
  const { error } = await supabase
    .from("orders")
    .update({ status, update_date: new Date().toISOString() })
    .eq("id_orders", orderId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function getOrderItems(orderId: number) {
  const { data, error } = await supabase
    .from("order_items")
    .select("id_order_items, id_products, id_seller, title, unit_price, quantity")
    .eq("id_orders", orderId);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(row => ({
    id: row.id_order_items,
    productId: row.id_products,
    sellerId: row.id_seller,
    title: row.title,
    unitPrice: Number(row.unit_price),
    quantity: row.quantity,
  }));
}

export async function getOrderById(orderId: number) {
  const { data: order, error } = await supabase
    .from("orders")
    .select(
      "id_orders, id_user, status, total, creation_date, update_date, shipping_cep, shipping_address, shipping_city, shipping_state, mp_preference_id",
    )
    .eq("id_orders", orderId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!order) return null;

  const items = await getOrderItems(orderId);

  return {
    id: order.id_orders,
    buyerId: order.id_user,
    status: order.status,
    total: Number(order.total),
    creationDate: order.creation_date,
    updateDate: order.update_date,
    shipping: {
      cep: order.shipping_cep,
      address: order.shipping_address,
      city: order.shipping_city,
      state: order.shipping_state,
    },
    mpPreferenceId: order.mp_preference_id,
    items,
  };
}

export async function listOrdersByBuyer(buyerId: number) {
  const { data, error } = await supabase
    .from("orders")
    .select("id_orders, status, total, creation_date")
    .eq("id_user", buyerId)
    .order("creation_date", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(row => ({
    id: row.id_orders,
    status: row.status,
    total: Number(row.total),
    creationDate: row.creation_date,
  }));
}

export async function listOrdersBySeller(sellerId: number) {
  const { data, error } = await supabase
    .from("order_items")
    .select(
      `id_order_items, title, unit_price, quantity,
       order:id_orders ( id_orders, status, creation_date, shipping_city, shipping_state )`,
    )
    .eq("id_seller", sellerId)
    .order("id_order_items", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row: any) => ({
    orderId: row.order?.id_orders,
    status: row.order?.status,
    creationDate: row.order?.creation_date,
    shippingCity: row.order?.shipping_city,
    shippingState: row.order?.shipping_state,
    item: {
      title: row.title,
      unitPrice: Number(row.unit_price),
      quantity: row.quantity,
    },
  }));
}

export async function isOrderParticipant(order: { buyerId: number; items: { sellerId: number }[] }, userId: number) {
  return order.buyerId === userId || order.items.some(item => item.sellerId === userId);
}
