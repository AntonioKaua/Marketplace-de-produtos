-- Aplicar no Supabase antes de publicar o backend.
-- As funções só podem ser chamadas pela chave de serviço do backend.
begin;

create or replace function public.restock_product(product_id integer, amount integer)
returns void language plpgsql security definer set search_path = public as $$
begin
  if amount <= 0 then
    raise exception 'INVALID_QUANTITY';
  end if;
  update products set quantity = quantity + amount where id_products = product_id;
end;
$$;

create or replace function public.transition_order_status(order_id integer, next_status text)
returns void language plpgsql security definer set search_path = public as $$
declare
  current_status text;
begin
  if next_status not in ('paid', 'cancelled') then
    raise exception 'INVALID_ORDER_STATUS';
  end if;
  select status into current_status from orders where id_orders = order_id for update;
  -- O bloqueio serializa webhooks concorrentes; pedidos terminais não repõem duas vezes.
  if not found or current_status <> 'pending' then
    return;
  end if;
  if next_status = 'cancelled' then
    update products p set quantity = p.quantity + i.quantity
    from (select id_products, sum(quantity) as quantity from order_items
          where id_orders = order_id group by id_products) i
    where p.id_products = i.id_products;
  end if;
  update orders set status = next_status, update_date = now() where id_orders = order_id;
end;
$$;

revoke all on function public.restock_product(integer, integer) from public, anon, authenticated;
revoke all on function public.transition_order_status(integer, text) from public, anon, authenticated;
grant execute on function public.restock_product(integer, integer) to service_role;
grant execute on function public.transition_order_status(integer, text) to service_role;
commit;
