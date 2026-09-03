import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Store } from "lucide-react";
import StarRating from "../components/StarRating";
import { useAuth } from "../context/AuthContext";
import { createSellerReviewRequest, getSellerRequest, listSellerReviewsRequest } from "../services/reviews";

export default function SellerProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const [seller, setSeller] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getSellerRequest(id).then(response => setSeller(response.seller)).catch(error => console.error(error));
    listSellerReviewsRequest(id).then(response => setReviews(response.reviews)).catch(error => console.error(error));
  }, [id]);

  const submit = async event => {
    event.preventDefault();
    setError("");

    if (rating < 1) {
      setError("Escolha uma nota de 1 a 5.");
      return;
    }

    setLoading(true);
    try {
      await createSellerReviewRequest(id, { rating, comment });
      const response = await listSellerReviewsRequest(id);
      setReviews(response.reviews);
      setRating(0);
      setComment("");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  if (!seller) return <main className="container-dts py-16 text-center text-slate-500">Carregando...</main>;

  const isSelf = user?.id === seller.id;

  return (
    <main className="container-dts py-10">
      <div className="card flex items-center gap-4 p-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-dts-100 text-dts-700"><Store size={28} /></div>
        <div>
          <h1 className="text-2xl font-black">{seller.name}</h1>
          <StarRating value={seller.rating.average} count={seller.rating.count} />
          <p className="mt-1 text-sm text-slate-500">{seller.activeProducts} produto(s) anunciado(s)</p>
        </div>
      </div>

      <div className="card mt-6 p-6">
        <h2 className="text-xl font-black">Avaliações</h2>

        {user && !isSelf && (
          <form onSubmit={submit} className="mt-5 space-y-3 border-b pb-6">
            <StarRating value={rating} onChange={setRating} size={22} />
            <textarea className="input" rows={3} placeholder="Como foi negociar com este vendedor? (opcional)" value={comment} onChange={e => setComment(e.target.value)} />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button className="btn-primary" disabled={loading}>{loading ? "Enviando..." : "Enviar avaliação"}</button>
          </form>
        )}

        <div className="mt-5 space-y-4">
          {reviews.length === 0 && <p className="text-sm text-slate-500">Este vendedor ainda não tem avaliações.</p>}
          {reviews.map((review, index) => (
            <div key={index} className="border-b pb-4 last:border-none">
              <div className="flex items-center justify-between">
                <b>{review.author?.name ?? "Usuário"}</b>
                <StarRating value={review.rating} size={14} />
              </div>
              {review.comment && <p className="mt-1 text-sm text-slate-600">{review.comment}</p>}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
