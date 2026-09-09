import React from "react";
import { Link } from "react-router-dom";
import { Star, Bookmark, Eye, ChevronRight } from "lucide-react";
import { Image } from "@/components/ui/image";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

export default function HeroBanner({ series, onAction }) {
  const [busy, setBusy] = React.useState("");
  if (!series) return null;

  const act = async (type) => {
    setBusy(type);
    try {
      const me = await base44.auth.me();
      if (type === "watchlist") {
        await base44.entities.WatchlistItem.create({ user_id: me.id, series_id: series.id, series_title: series.title, poster_url: series.poster_url });
      } else if (type === "seen") {
        await base44.entities.SeenEntry.create({ user_id: me.id, series_id: series.id, series_title: series.title, poster_url: series.poster_url, rating: 5, date_watched: new Date().toISOString().slice(0,10) });
      }
      onAction?.(type);
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="relative w-full h-[440px] rounded-3xl overflow-hidden ring-1 ring-border/60">
      <Image src={series.cover_url} alt={series.title} fittingType="fill" className="absolute inset-0 w-full h-full" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/40 to-transparent" />
      <div className="relative h-full flex flex-col justify-end p-6 max-w-xl">
        <span className="text-[11px] font-semibold tracking-widest text-primary uppercase mb-2">Featured</span>
        <h1 className="font-heading text-3xl font-extrabold leading-tight mb-1">{series.title}</h1>
        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
          <span className="flex items-center gap-1 text-warning font-semibold">
            <Star size={14} className="fill-warning" /> {(series.trending_score / 20).toFixed(1)}
          </span>
          <span>{series.release_year}</span>
          <span>· {series.episode_count} eps</span>
          <span>· {series.country}</span>
        </div>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {series.genres?.slice(0, 3).map((g) => (
            <span key={g} className="text-[11px] px-2.5 py-1 rounded-full bg-white/10 text-white/90 backdrop-blur-sm">{g}</span>
          ))}
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{series.synopsis}</p>
        <div className="flex items-center gap-2">
          <Link to={`/series/${series.id}`}>
            <Button size="sm" className="rounded-full bg-primary hover:bg-primary/90 text-white font-semibold px-5">
              View Details <ChevronRight size={16} />
            </Button>
          </Link>
          <Button size="sm" variant="secondary" className="rounded-full glass border-border/60" disabled={busy === "watchlist"} onClick={() => act("watchlist")}>
            <Bookmark size={16} className="mr-1" /> Watchlist
          </Button>
          <Button size="sm" variant="secondary" className="rounded-full glass border-border/60" disabled={busy === "seen"} onClick={() => act("seen")}>
            <Eye size={16} className="mr-1" /> Seen
          </Button>
        </div>
      </div>
    </div>
  );
}