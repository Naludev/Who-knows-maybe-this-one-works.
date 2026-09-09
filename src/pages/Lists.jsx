import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Eye, Bookmark, Plus, Trash2, FolderPlus, Globe, Lock, Users } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import { Button } from "@/components/ui/button";
import StarRating from "@/components/StarRating";

const VIS = [
  { id: "public", label: "Public", icon: Globe },
  { id: "friends", label: "Friends", icon: Users },
  { id: "private", label: "Private", icon: Lock },
];

export default function Lists() {
  const [me, setMe] = useState(null);
  const [tab, setTab] = useState("seen");
  const [seen, setSeen] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [customLists, setCustomLists] = useState([]);
  const [sort, setSort] = useState("date");
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newVis, setNewVis] = useState("public");

  const load = async () => {
    const u = await base44.auth.me();
    setMe(u);
    const [s, w, cl] = await Promise.all([
      base44.entities.SeenEntry.filter({ user_id: u.id }),
      base44.entities.WatchlistItem.filter({ user_id: u.id }),
      base44.entities.CustomList.filter({ user_id: u.id }),
    ]);
    setSeen(s); setWatchlist(w); setCustomLists(cl);
  };

  useEffect(() => { load(); }, []);

  const sortedSeen = [...seen].sort((a, b) => {
    if (sort === "rating") return (b.rating || 0) - (a.rating || 0);
    if (sort === "alpha") return (a.series_title || "").localeCompare(b.series_title || "");
    return new Date(b.created_date || 0) - new Date(a.created_date || 0);
  });

  const removeSeen = async (id) => { await base44.entities.SeenEntry.delete(id); load(); };
  const removeWl = async (id) => { await base44.entities.WatchlistItem.delete(id); load(); };
  const moveToSeen = async (w) => {
    await base44.entities.SeenEntry.create({ user_id: me.id, series_id: w.series_id, series_title: w.series_title, poster_url: w.poster_url, rating: 5, date_watched: new Date().toISOString().slice(0, 10) });
    await base44.entities.WatchlistItem.delete(w.id);
    load();
  };
  const deleteList = async (id) => { await base44.entities.CustomList.delete(id); load(); };

  const createList = async () => {
    if (!newName.trim()) return;
    await base44.entities.CustomList.create({ user_id: me.id, user_name: me.display_name, name: newName, visibility: newVis, series_ids: [] });
    setNewName(""); setCreating(false); load();
  };

  return (
    <div className="px-4 pt-4 pb-24">
      <h1 className="font-heading text-2xl font-extrabold mb-4">My Lists</h1>

      <div className="flex gap-1 mb-4 border-b border-border">
        {[
          { id: "seen", label: "Seen", icon: Eye, count: seen.length },
          { id: "watchlist", label: "Watchlist", icon: Bookmark, count: watchlist.length },
          { id: "custom", label: "Custom", icon: FolderPlus, count: customLists.length },
        ].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}>
            <t.icon size={14} /> {t.label} <span className="text-xs opacity-60">{t.count}</span>
          </button>
        ))}
      </div>

      {tab === "seen" && (
        <>
          <div className="flex gap-2 mb-3">
            {[["date","Recent"],["rating","Rating"],["alpha","A-Z"]].map(([v, l]) => (
              <button key={v} onClick={() => setSort(v)} className={`px-3 py-1.5 rounded-full text-xs ${sort === v ? "bg-primary text-white" : "bg-card ring-1 ring-border"}`}>{l}</button>
            ))}
          </div>
          <div className="space-y-2">
            {sortedSeen.map((s) => (
              <div key={s.id} className="flex items-center gap-3 bg-card rounded-2xl p-2.5 ring-1 ring-border">
                <Link to={`/series/${s.series_id}`} className="w-10 h-14 rounded-lg overflow-hidden shrink-0"><Image src={s.poster_url} fittingType="fill" className="w-full h-full" /></Link>
                <div className="flex-1">
                  <Link to={`/series/${s.series_id}`} className="text-sm font-semibold">{s.series_title}</Link>
                  <div className="mt-0.5"><StarRating value={s.rating} size={12} /></div>
                  <p className="text-[10px] text-muted-foreground">{s.date_watched}</p>
                </div>
                <button onClick={() => removeSeen(s.id)} className="text-muted-foreground hover:text-destructive p-1"><Trash2 size={16} /></button>
              </div>
            ))}
            {seen.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Nothing seen yet. Browse and mark series as seen!</p>}
          </div>
        </>
      )}

      {tab === "watchlist" && (
        <div className="space-y-2">
          {watchlist.map((w) => (
            <div key={w.id} className="flex items-center gap-3 bg-card rounded-2xl p-2.5 ring-1 ring-border">
              <Link to={`/series/${w.series_id}`} className="w-10 h-14 rounded-lg overflow-hidden shrink-0"><Image src={w.poster_url} fittingType="fill" className="w-full h-full" /></Link>
              <div className="flex-1"><Link to={`/series/${w.series_id}`} className="text-sm font-semibold">{w.series_title}</Link></div>
              <button onClick={() => moveToSeen(w)} className="text-xs text-success flex items-center gap-1 px-2 py-1.5 rounded-full bg-success/10"><Eye size={13} /> Seen</button>
              <button onClick={() => removeWl(w.id)} className="text-muted-foreground hover:text-destructive p-1"><Trash2 size={16} /></button>
            </div>
          ))}
          {watchlist.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Your watchlist is empty. Save series to watch later!</p>}
        </div>
      )}

      {tab === "custom" && (
        <div className="space-y-3">
          {creating ? (
            <div className="bg-card rounded-2xl p-4 ring-1 ring-border space-y-3">
              <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="List name (e.g. Best Thai BLs)" className="w-full bg-background rounded-xl px-3 py-2.5 text-sm outline-none ring-1 ring-border focus:ring-primary" />
              <div className="flex gap-2">
                {VIS.map((v) => (
                  <button key={v.id} onClick={() => setNewVis(v.id)} className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs ${newVis === v.id ? "bg-primary text-white" : "bg-background ring-1 ring-border"}`}><v.icon size={12} /> {v.label}</button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button onClick={createList} className="rounded-full bg-primary text-white">Create</Button>
                <Button variant="secondary" className="rounded-full glass border-border/60" onClick={() => setCreating(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <button onClick={() => setCreating(true)} className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-border text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors">
              <Plus size={16} /> Create new list
            </button>
          )}
          {customLists.map((cl) => (
            <div key={cl.id} className="bg-card rounded-2xl p-4 ring-1 ring-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-heading font-bold">{cl.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{cl.series_ids?.length || 0} series · {cl.visibility}</p>
                </div>
                <button onClick={() => deleteList(cl.id)} className="text-muted-foreground hover:text-destructive p-1"><Trash2 size={16} /></button>
              </div>
              {cl.description && <p className="text-sm text-muted-foreground mt-2">{cl.description}</p>}
            </div>
          ))}
          {customLists.length === 0 && !creating && <p className="text-sm text-muted-foreground text-center py-8">Create custom collections like "Comfort Shows" or "Emotional Damage".</p>}
        </div>
      )}
    </div>
  );
}