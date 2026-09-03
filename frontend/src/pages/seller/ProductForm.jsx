import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Trash2 } from "lucide-react";
import Field from "../../components/Field";
import { listCategoriesRequest } from "../../services/categories";
import {
  createProductRequest,
  deleteProductImageRequest,
  getProductRequest,
  updateProductRequest,
  uploadProductImagesRequest,
} from "../../services/products";

const EMPTY_FORM = {
  title: "",
  price: "",
  quantity: "1",
  description: "",
  condition: "usado",
  year: "",
  model: "",
  categoryId: "",
};

export default function ProductForm() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY_FORM);
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    listCategoriesRequest().then(response => setCategories(response.categories)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEditing) return;

    getProductRequest(id)
      .then(response => {
        const product = response.product;
        setForm({
          title: product.title,
          price: String(product.price),
          quantity: String(product.quantity),
          description: product.description,
          condition: product.condition,
          year: product.year ? String(product.year) : "",
          model: product.model ?? "",
          categoryId: product.category?.id ? String(product.category.id) : "",
        });
        setImages(product.images);
      })
      .catch(requestError => setError(requestError.message))
      .finally(() => setLoading(false));
  }, [id, isEditing]);

  const change = event => {
    const { name, value } = event.target;
    setForm(current => ({ ...current, [name]: value }));
    setErrors(current => ({ ...current, [name]: undefined }));
  };

  const submit = async event => {
    event.preventDefault();
    setError("");
    setSaving(true);

    const payload = {
      title: form.title,
      price: Number(form.price),
      quantity: Number(form.quantity),
      description: form.description,
      condition: form.condition,
      year: form.year ? Number(form.year) : null,
      model: form.model || null,
      categoryId: form.categoryId ? Number(form.categoryId) : null,
    };

    try {
      if (isEditing) {
        await updateProductRequest(id, payload);
        navigate("/seller/products");
      } else {
        const response = await createProductRequest(payload);
        navigate(`/seller/products/${response.product.id}/edit`, { replace: true });
      }
    } catch (requestError) {
      setErrors(requestError.errors || {});
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const uploadImages = async event => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const response = await uploadProductImagesRequest(id, files);
      setImages(current => [...current, ...response.images]);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const removeImage = async imageId => {
    await deleteProductImageRequest(id, imageId).catch(requestError => setError(requestError.message));
    setImages(current => current.filter(image => image.id !== imageId));
  };

  if (loading) return <div className="card p-6 text-slate-500">Carregando produto...</div>;

  return (
    <div className="card p-6">
      <h2 className="font-black">{isEditing ? "Editar produto" : "Novo produto"}</h2>
      <form onSubmit={submit} className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="Título" error={errors.title}>
          <input className="input" name="title" value={form.title} onChange={change} maxLength={150} disabled={saving} />
        </Field>
        <Field label="Categoria" error={errors.categoryId}>
          <select className="input" name="categoryId" value={form.categoryId} onChange={change} disabled={saving}>
            <option value="">Selecione</option>
            {categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        </Field>
        <Field label="Preço (R$)" error={errors.price}>
          <input className="input" name="price" type="number" min="0" step="0.01" value={form.price} onChange={change} disabled={saving} />
        </Field>
        <Field label="Quantidade em estoque" error={errors.quantity}>
          <input className="input" name="quantity" type="number" min="0" value={form.quantity} onChange={change} disabled={saving} />
        </Field>
        <Field label="Estado" error={errors.condition}>
          <select className="input" name="condition" value={form.condition} onChange={change} disabled={saving}>
            <option value="usado">Usado</option>
            <option value="novo">Novo</option>
          </select>
        </Field>
        <Field label="Modelo (opcional)" error={errors.model}>
          <input className="input" name="model" value={form.model} onChange={change} disabled={saving} />
        </Field>
        <Field label="Ano (opcional)" error={errors.year}>
          <input className="input" name="year" type="number" value={form.year} onChange={change} disabled={saving} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Descrição" error={errors.description}>
            <textarea className="input" name="description" rows={5} value={form.description} onChange={change} disabled={saving} />
          </Field>
        </div>

        {error && <p role="alert" className="sm:col-span-2 text-sm text-red-600">{error}</p>}

        <button className="btn-primary sm:col-span-2" disabled={saving}>{saving ? "Salvando..." : isEditing ? "Salvar alterações" : "Criar anúncio"}</button>
      </form>

      {isEditing && (
        <div className="mt-8 border-t pt-6">
          <h3 className="font-black">Fotos</h3>
          <p className="mt-1 text-sm text-slate-500">Até 8 imagens.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            {images.map(image => (
              <div key={image.id} className="group relative h-24 w-24 overflow-hidden rounded-xl border">
                <img src={image.url} alt="" className="h-full w-full object-cover" />
                <button onClick={() => removeImage(image.id)} className="absolute right-1 top-1 rounded-full bg-white/90 p-1 text-red-600 opacity-0 transition group-hover:opacity-100">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {images.length < 8 && (
              <label className="flex h-24 w-24 cursor-pointer items-center justify-center rounded-xl border border-dashed text-xs font-semibold text-slate-500 hover:bg-slate-50">
                {uploading ? "Enviando..." : "+ Adicionar"}
                <input type="file" accept="image/*" multiple className="hidden" onChange={uploadImages} disabled={uploading} />
              </label>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
