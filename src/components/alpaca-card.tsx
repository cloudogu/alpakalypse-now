import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { formatMoney } from "#/lib/format";

export function AlpacaCard({
  alpaca,
}: {
  alpaca: {
    id: string;
    name: string;
    bio: string;
    furColor: string;
    dailyRate: number;
    imageUrl: string | null;
  };
}) {
  return (
    <article className="alpaca-card">
      <div className="alpaca-image-wrap">
        {alpaca.imageUrl ? (
          <img src={alpaca.imageUrl} alt={`Alpaka ${alpaca.name}`} />
        ) : (
          <div className="image-fallback">🦙</div>
        )}
        <span className="price-tag">{formatMoney(alpaca.dailyRate)} / Tag</span>
      </div>
      <div className="alpaca-card-body">
        <span className="eyebrow">Fellfarbe · {alpaca.furColor}</span>
        <h2 className="display-title">{alpaca.name}</h2>
        <p>{alpaca.bio}</p>
        <Link to="/alpacas/$alpacaId" params={{ alpacaId: alpaca.id }} className="text-link">
          Steckbrief ansehen <ArrowUpRight />
        </Link>
      </div>
    </article>
  );
}
