import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search as SearchIcon, SlidersHorizontal, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import SeriesCard from "@/components/SeriesCard";

const COUNTRIES = ["Thailand","South Korea","Japan","Taiwan","China","Philippines","Vietnam"];
const GENRES = ["Romance","School","Fantasy","Historical","Action","Comedy","Drama","Mystery","Supernatural","Slice of Life"];
const STATUSES = ["Airing","Completed","Upcoming"];

export default function Search() {
  const [params, setParams] = useSearchParams();
  const [all, setAll] = useState([]);
  const [q, setQ] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [country, setCountry] = useState(params.get("country") || "");
  const [genre, setGenre] = useState(params.get("genre") || "");
  const [status, setStatus] = useState("");
  const [minRating, setMinRating] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Series.list("-trending_score", 1000).then((s) => { setAll(s); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    setCountry(params.get("country") || "");
    setGenre(params.get("genre") || "");
  }, [params]);

  let results = all.filter((s) => {
    if (q && !s.title.toLowerCase().includes(q.toLowerCase()) && !(s.alt_title || "").toLowerCase().includes(q.toLowerCase())) return false;
    if (country && s.country !== country) return false;
    if (genre && !(s.genres || []).includes(genre)) return false;
    if (status && s.status !== status) return false;
    if (minRating && (s.trending_score || 0) / 20 < minRating) return false;
    return true;
  });

  const clearFilters = () => { setCountry(""); setGenre(""); setStatus(""); setMinRating(0); setParams({}); };

  return (
    <div className="px-4 pt-4 pb-24">
      <div className="relative mb-3">
        <SearchIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search series, actors, ships…"
          className="w-full bg-card rounded-2xl pl-10 pr-10 py-3 text-sm outline-none ring-1 ring-border focus:ring-primary" />
        {q && <button onClick={() => setQ("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"><X size={16} /></button>}
      </div>

      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <SlidersHorizontal size={16} /> Filters
          {(country || genre || status || minRating) ? <span className="bg-primary text-white text-[10px] rounded-full px-1.5 py-0.5">on</span> : null}
        </button>
        {(country || genre || status || minRating) && <button onClick={clearFilters} className="text-xs text-primary">Clear all</button>}
      </div>

      {showFilters && (
        <div className="bg-card rounded-2xl p-4 ring-1 ring-border mb-4 space-y-4">
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">COUNTRY</p>
            <div className="flex flex-wrap gap-2">
              {COUNTRIES.map((c) => <button key={c} onClick={() => setCountry(country === c ? "" : c)} className={`px-3 py-1.5 rounded-full text-xs ${country === c ? "bg-primary text-white" : "bg-background ring-1 ring-border"}`}>{c}</button>)}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">GENRE</p>
            <div className="flex flex-wrap gap-2">
              {GENRES.map((g) => <button key={g} onClick={() => setGenre(genre === g ? "" : g)} className={`px-3 py-1.5 rounded-full text-xs ${genre === g ? "bg-secondary text-white" : "bg-background ring-1 ring-border"}`}>{g}</button>)}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">STATUS</p>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map((s) => <button key={s} onClick={() => setStatus(status === s ? "" : s)} className={`px-3 py-1.5 rounded-full text-xs ${status === s ? "bg-primary text-white" : "bg-background ring-1 ring-border"}`}>{s}</button>)}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">MIN RATING: {minRating}</p>
            <input type="range" min={0} max={5} value={minRating} onChange={(e) => setMinRating(Number(e.target.value))} className="w-full accent-primary" />
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground mb-3">{loading ? "Loading…" : `${results.length} series found`}</p>
      <div className="grid grid-cols-3 gap-3">
        {results.map((s) => <SeriesCard key={s.id} series={s} className="w-full" />)}
      </div>
      {!loading && results.length === 0 && <p className="text-center text-muted-foreground py-12">No series match your search.</p>}
    </div>
  );
}