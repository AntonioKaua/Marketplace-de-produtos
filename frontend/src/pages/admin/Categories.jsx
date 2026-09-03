import { useEffect, useState } from "react";
import Field from "../../components/Field";
import {
  createCategoryRequest,
  deleteCategoryRequest,
  listCategoriesRequest,
  updateCategoryRequest,
} from "../../services/categories";

const EMPTY_FORM = { name: "", description: "", parentId: "" };

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const load = () => {
    listCategoriesRequest().then(response => setCategories(response.categories)).catch(() => {});
  };

  useEffect(load, []);

  const change = event => {
    const { name, value } = event.target;
    setForm(current => ({ ...current, [name]: value }));
  };

  const edit = category => {
    setEditingId(category.id);
    setForm({ name: category.name, description: category.description ?? "", parentId: category.parentId ? String(category.parentId) : "" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const submit = async event => {
    event.preventDefault();
    setSaving(true);
    setErrors({});

    const payload = {
      name: form.name,
      description: form.description,
      parentId: form.parentId ? Number(form.parentId) : null,
    };

    try {
      if (editingId) {
        await updateCategoryRequest(editingId, payload);
      } else {
        await createCategoryRequest(payload);
      }
      cancelEdit();
      load();
    } catch (error) {
      setErrors(error.errors || {});
    } finally {
      setSaving(false);
    }
  };

  const remove = async id => {
    if (!window.confirm("Remover esta categoria?")) return;
    await deleteCategoryRequest(id).catch(error => console.error("Erro ao remover categoria:", error));
    load();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="card overflow-x-auto p-4">
        <table className="w-full min-w-[500px] text-left text-sm">
          <thead>
            <tr className="border-b text-slate-500">
              <th className="p-3">Nome</th>
              <th className="p-3">Categoria pai</th>
              <th className="p-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(category => (
              <tr key={category.id} className="border-b last:border-none">
                <td className="p-3 font-semibold">{category.name}</td>
                <td className="p-3 text-slate-500">{categories.find(c => c.id === category.parentId)?.name ?? "—"}</td>
                <td className="p-3 space-x-3">
                  <button onClick={() => edit(category)} className="font-semibold text-dts-600">Editar</button>
                  <button onClick={() => remove(category.id)} className="font-semibold text-red-600">Remover</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form onSubmit={submit} className="card h-fit space-y-4 p-6">
        <h2 className="font-black">{editingId ? "Editar categoria" : "Nova categoria"}</h2>
        <Field label="Nome" error={errors.name}>
          <input className="input" name="name" value={form.name} onChange={change} disabled={saving} />
        </Field>
        <Field label="Descrição">
          <textarea className="input" name="description" rows={3} value={form.description} onChange={change} disabled={saving} />
        </Field>
        <Field label="Categoria pai (opcional)">
          <select className="input" name="parentId" value={form.parentId} onChange={change} disabled={saving}>
            <option value="">Nenhuma</option>
            {categories.filter(category => category.id !== editingId).map(category => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </Field>
        <div className="flex gap-2">
          <button className="btn-primary" disabled={saving}>{saving ? "Salvando..." : editingId ? "Salvar" : "Criar"}</button>
          {editingId && <button type="button" onClick={cancelEdit} className="btn-secondary">Cancelar</button>}
        </div>
      </form>
    </div>
  );
}
