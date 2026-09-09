import React from "react";
import { Link } from "react-router-dom";
import { Star, MapPin } from "lucide-react";
import { Image } from "@/components/ui/image";

export default function SeriesCard({ series, className }) {
  return (
    <Link
      to={`/series/${series.id}`}
      className={`group block w-[150px] shrink-0 snap-start-card ${className || ""}`}
    >
      <div className="relative overflow-hidden rounded-2xl bg-card aspect-[2/3] ring-1 ring-border/60 transition-all duration-300 group-hover:ring-primary/70 group-hover:-translate-y-1">
        <Image
          src={series.poster_url}
          alt={series.title}
          fittingType="fill"
          className="w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-2.5">
          <div className="flex items-center gap-1 text-warning text-xs font-semibold">
            <Star size={12} className="fill-warning" />
            <span>{series.trending_score ? (series.trending_score / 20).toFixed(1) : "—"}</span>
          </div>
        </div>
      </div>
      <div className="mt-2 px-0.5">
        <h3 className="font-heading font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
          {series.title}
        </h3>
        <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-0.5">
          <MapPin size={9} /> {series.country} · {series.release_year}
        </p>
      </div>
    </Link>
  );
}