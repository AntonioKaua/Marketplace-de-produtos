import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ImageOff } from "lucide-react";
import { listFavoritesRequest, removeFavoriteRequest } from "../../services/favorites";
import { money } from "../../utils/money";

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listFavoritesRequest()
      .then(response => setFavorites(response.favorites))
      .catch(error => console.error("Erro ao listar favoritos:", error))
      .finally(() => setLoading(false));
  }, []);

  const remove = async productId => {
    await removeFavoriteRequest(productId).catch(error => console.error("Erro ao remover favorito:", error));
    setFavorites(current => current.filter(favorite => favorite.product?.id !== productId));
  };

  if (loading) return <div className="card p-6 text-slate-500">Carregando favoritos...</div>;
  if (favorites.length === 0) return <div className="card p-6 text-slate-500">Você ainda não favoritou nenhum produto.</div>;

  return (
    <div className="space-y-3">
      {favorites.map(favorite => (
        <div key={favorite.favoriteId} className="card flex items-center gap-4 p-4">
          {favorite.product?.image ? (
            <img src={favorite.product.image} className="h-20 w-20 rounded-xl object-cover" alt="" />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-slate-100 text-slate-300"><ImageOff size={24} /></div>
          )}
          <div className="min-w-0 flex-1">
            <Link to={`/products/${favorite.product?.id}`} className="font-bold hover:text-dts-600">{favorite.product?.title}</Link>
            <p className="mt-1 text-sm text-slate-500">{money(favorite.product?.price)}</p>
          </div>
          <button onClick={() => remove(favorite.product?.id)} className="text-sm font-semibold text-red-600">Remover</button>
        </div>
      ))}
    </div>
  );
}
