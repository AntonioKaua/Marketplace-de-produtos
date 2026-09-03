import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Heart, ImageOff, MessageCircle, ShieldCheck, Truck } from "lucide-react";
import StarRating from "../components/StarRating";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { startConversationRequest } from "../services/chat";
import { addFavoriteRequest, getFavoriteStatusRequest, removeFavoriteRequest } from "../services/favorites";
import { getProductRequest } from "../services/products";
import { createProductReviewRequest, listProductReviewsRequest } from "../services/reviews";
import { money } from "../utils/money";

export default function ProductDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const { add } = useCart();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [favorite, setFavorite] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    setProduct(null);
    setActiveImage(0);

    getProductRequest(id)
      .then(response => setProduct(response.product))
      .catch(error => console.error("Erro ao carregar produto:", error));

    listProductReviewsRequest(id)
      .then(response => setReviews(response.reviews))
      .catch(error => console.error("Erro ao carregar avaliações:", error));

    if (user) {
      getFavoriteStatusRequest(id)
        .then(response => setFavorite(response.isFavorite))
        .catch(() => {});
    }
  }, [id, user]);

  const toggleFavorite = async () => {
    if (!user) {
      navigate(`/login?next=/products/${id}`);
      return;
    }

    try {
      if (favorite) {
        await removeFavoriteRequest(id);
      } else {
        await addFavoriteRequest(id);
      }
      setFavorite(!favorite);
    } catch (error) {
      console.error("Erro ao favoritar produto:", error);
    }
  };

  const talkToSeller = async () => {
    if (!user) {
      navigate(`/login?next=/products/${id}`);
      return;
    }

    setStarting(true);
    try {
      const response = await startConversationRequest({ sellerId: product.seller.id, productId: product.id });
      navigate(`/account/messages?conversation=${response.conversationId}`);
    } catch (error) {
      console.error("Erro ao iniciar conversa:", error);
    } finally {
      setStarting(false);
    }
  };

  const submitReview = async event => {
    event.preventDefault();
    setReviewError("");

    if (reviewRating < 1) {
      setReviewError("Escolha uma nota de 1 a 5.");
      return;
    }

    setReviewLoading(true);
    try {
      await createProductReviewRequest(id, { rating: reviewRating, comment: reviewComment });
      const response = await listProductReviewsRequest(id);
      setReviews(response.reviews);
      setReviewComment("");
      setReviewRating(0);
    } catch (error) {
      setReviewError(error.message);
    } finally {
      setReviewLoading(false);
    }
  };

  if (!product) {
    return <main className="container-dts py-16 text-center text-slate-500">Carregando produto...</main>;
  }

  const isOwner = user?.id === product.seller?.id;
  const currentImage = product.images?.[activeImage]?.url;

  return (
    <main className="container-dts py-10">
      <div className="mb-6 text-sm text-slate-400">Home / {product.category?.name ?? "Produto"} / {product.title}</div>
      <div className="grid gap-10 rounded-3xl border bg-white p-5 shadow-sm md:grid-cols-2 md:p-8">
        <div>
          <div className="overflow-hidden rounded-2xl bg-slate-100">
            {currentImage ? (
              <img src={currentImage} alt={product.title} className="aspect-square h-full w-full object-cover" />
            ) : (
              <div className="flex aspect-square items-center justify-center text-slate-300"><ImageOff size={64} /></div>
            )}
          </div>
          {product.images?.length > 1 && (
            <div className="mt-3 flex gap-2">
              {product.images.map((image, index) => (
                <button key={image.id} onClick={() => setActiveImage(index)} className={`h-16 w-16 overflow-hidden rounded-xl border-2 ${index === activeImage ? "border-dts-600" : "border-transparent"}`}>
                  <img src={image.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          <span className="text-sm font-semibold text-slate-400">{product.category?.name ?? "Sem categoria"}</span>
          <h1 className="mt-2 text-3xl font-black">{product.title}</h1>
          <div className="mt-3"><StarRating value={product.rating?.average ?? 0} count={product.rating?.count ?? 0} /></div>
          <div className="mt-8 text-4xl font-black">{money(product.price)}</div>
          <p className="mt-2 text-sm font-medium text-slate-500">{product.condition === "novo" ? "Produto novo" : "Produto usado"} {product.quantity > 0 ? `• ${product.quantity} disponível(is)` : "• fora de estoque"}</p>

          <div className="my-8 rounded-2xl bg-slate-50 p-4">
            <div className="flex gap-3">
              <Truck className="text-dts-600" />
              <div><b>Entrega</b><p className="text-sm text-slate-500">Combine local e forma de entrega com o vendedor pelo chat.</p></div>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => add(product)} disabled={product.quantity <= 0} className="btn-primary flex-1">Adicionar ao carrinho</button>
            <button onClick={toggleFavorite} className={`btn-secondary px-4 ${favorite ? "border-red-300 text-red-600" : ""}`} aria-label="Favoritar">
              <Heart size={18} className={favorite ? "fill-red-500 text-red-500" : ""} />
            </button>
          </div>

          {!isOwner && (
            <button onClick={talkToSeller} disabled={starting} className="btn-secondary mt-3 w-full">
              <MessageCircle size={18} className="mr-2" /> Falar com vendedor
            </button>
          )}

          {product.seller && (
            <Link to={`/sellers/${product.seller.id}`} className="mt-5 flex items-center gap-2 text-sm text-slate-500 hover:text-dts-600">
              <ShieldCheck size={16} /> Vendido por <b className="text-slate-700">{product.seller.name}</b>
            </Link>
          )}
        </div>
      </div>

      <div className="mt-8 rounded-3xl border bg-white p-6">
        <h2 className="text-xl font-black">Descrição</h2>
        <p className="mt-3 whitespace-pre-line leading-7 text-slate-600">{product.description}</p>
        {product.model && <p className="mt-3 text-sm text-slate-500">Modelo: {product.model}</p>}
        {product.year && <p className="text-sm text-slate-500">Ano: {product.year}</p>}
      </div>

      <div className="mt-8 rounded-3xl border bg-white p-6">
        <h2 className="text-xl font-black">Avaliações do produto</h2>

        {user && !isOwner && (
          <form onSubmit={submitReview} className="mt-5 space-y-3 border-b pb-6">
            <StarRating value={reviewRating} onChange={setReviewRating} size={22} />
            <textarea
              className="input"
              rows={3}
              placeholder="Conte como foi sua experiência com o produto (opcional)"
              value={reviewComment}
              onChange={e => setReviewComment(e.target.value)}
            />
            {reviewError && <p className="text-sm text-red-600">{reviewError}</p>}
            <button className="btn-primary" disabled={reviewLoading}>{reviewLoading ? "Enviando..." : "Enviar avaliação"}</button>
          </form>
        )}

        <div className="mt-5 space-y-4">
          {reviews.length === 0 && <p className="text-sm text-slate-500">Este produto ainda não tem avaliações.</p>}
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
