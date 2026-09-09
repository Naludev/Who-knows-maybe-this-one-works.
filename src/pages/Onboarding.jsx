import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Check, ChevronRight, Heart } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Image } from "@/components/ui/image";
import { COUNTRIES } from "@/lib/countries";

export default function Onboarding() {
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [country, setCountry] = useState("");
  const [age, setAge] = useState("");
  const [countryQ, setCountryQ] = useState("");
  const [ships, setShips] = useState([]);
  const [allShips, setAllShips] = useState([]);
  const [shipQ, setShipQ] = useState("");
  const [allSeries, setAllSeries] = useState([]);
  const [favSeries, setFavSeries] = useState([]);
  const [seriesQ, setSeriesQ] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.entities.Ship.list().then(setAllShips).catch(() => {});
    base44.entities.Series.list().then(setAllSeries).catch(() => {});
  }, []);

  const filteredCountries = COUNTRIES.filter((c) => c.name.toLowerCase().includes(countryQ.toLowerCase()));
  const filteredShips = allShips.filter((s) => s.name.toLowerCase().includes(shipQ.toLowerCase()) && !ships.find((x) => x.id === s.id));
  const filteredSeries = allSeries.filter((s) => s.title.toLowerCase().includes(seriesQ.toLowerCase()));

  const canNext = step === 0 ? !!country : step === 1 ? Number(age) >= 12 : step === 2 ? ships.length === 3 : step === 3 ? favSeries.length > 0 : true;

  const finish = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe({
        country, age: Number(age),
        favorite_ships: ships.map((s) => s.name),
        favorite_series: favSeries.map((s) => s.title),
        onboarded: true,
      });
      nav("/");
    } finally {
      setSaving(false);
    }
  };

  const next = () => {
    if (step < 3) setStep(step + 1);
    else finish();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex gap-1.5 p-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-muted"}`} />
        ))}
      </div>

      <div className="flex-1 px-6 pb-32 max-w-md mx-auto w-full">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="c" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h1 className="font-heading text-2xl font-bold mb-1">What country are you from?</h1>
              <p className="text-muted-foreground text-sm mb-5">We'll tailor recommendations to your region.</p>
              <div className="relative mb-4">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input value={countryQ} onChange={(e) => setCountryQ(e.target.value)} placeholder="Search countries"
                  className="w-full bg-card rounded-2xl pl-10 pr-4 py-3 text-sm outline-none ring-1 ring-border focus:ring-primary" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {filteredCountries.map((c) => (
                  <button key={c.name} onClick={() => setCountry(c.name)}
                    className={`flex items-center gap-2 p-3 rounded-2xl ring-1 transition-all ${country === c.name ? "ring-primary bg-primary/10" : "ring-border bg-card hover:ring-primary/50"}`}>
                    <span className="text-2xl">{c.flag}</span>
                    <span className="text-sm font-medium">{c.name}</span>
                    {country === c.name && <Check size={16} className="ml-auto text-primary" />}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
          {step === 1 && (
            <motion.div key="a" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h1 className="font-heading text-2xl font-bold mb-1">How old are you?</h1>
              <p className="text-muted-foreground text-sm mb-5">BL World is available for users aged 12 and older.</p>
              <input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="Enter your age"
                className="w-full bg-card rounded-2xl px-4 py-4 text-center text-2xl font-bold outline-none ring-1 ring-border focus:ring-primary" />
              {age && Number(age) < 12 && (
                <p className="mt-4 text-sm text-destructive bg-destructive/10 rounded-2xl p-3">
                  BL World is currently available only for users aged 12 and older.
                </p>
              )}
            </motion.div>
          )}
          {step === 2 && (
            <motion.div key="s" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h1 className="font-heading text-2xl font-bold mb-1">Choose your Top 3 favorite ships</h1>
              <p className="text-muted-foreground text-sm mb-5">{ships.length}/3 selected</p>
              <div className="relative mb-4">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input value={shipQ} onChange={(e) => setShipQ(e.target.value)} placeholder="Search couples"
                  className="w-full bg-card rounded-2xl pl-10 pr-4 py-3 text-sm outline-none ring-1 ring-border focus:ring-primary" />
              </div>
              <div className="space-y-2">
                {filteredShips.slice(0, 8).map((s) => (
                  <button key={s.id} disabled={ships.length >= 3} onClick={() => setShips([...ships, s])}
                    className="flex items-center gap-3 w-full p-2.5 rounded-2xl ring-1 ring-border bg-card hover:ring-primary/50 disabled:opacity-40 text-left">
                    <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
                      <Image src={allSeries.find((x) => x.title === s.series_title)?.poster_url || s.image_url} alt={s.name} fittingType="fill" className="w-full h-full" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.series_title}</p>
                    </div>
                  </button>
                ))}
              </div>
              {ships.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {ships.map((s) => (
                    <span key={s.id} className="flex items-center gap-1.5 bg-primary/15 text-primary text-xs px-3 py-1.5 rounded-full">
                      <Heart size={11} className="fill-primary" /> {s.name}
                      <button onClick={() => setShips(ships.filter((x) => x.id !== s.id))} className="ml-1 opacity-70 hover:opacity-100">✕</button>
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          )}
          {step === 3 && (
            <motion.div key="f" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h1 className="font-heading text-2xl font-bold mb-1">Select your favorite BL series</h1>
              <p className="text-muted-foreground text-sm mb-5">{favSeries.length} selected · pick as many as you like</p>
              <div className="relative mb-4">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input value={seriesQ} onChange={(e) => setSeriesQ(e.target.value)} placeholder="Search series"
                  className="w-full bg-card rounded-2xl pl-10 pr-4 py-3 text-sm outline-none ring-1 ring-border focus:ring-primary" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {filteredSeries.slice(0, 15).map((s) => {
                  const sel = favSeries.find((x) => x.id === s.id);
                  return (
                    <button key={s.id} onClick={() => setFavSeries(sel ? favSeries.filter((x) => x.id !== s.id) : [...favSeries, s])}
                      className={`relative rounded-xl overflow-hidden ring-2 transition-all ${sel ? "ring-primary" : "ring-transparent"}`}>
                      <div className="aspect-[2/3]">
                        <Image src={s.poster_url} alt={s.title} fittingType="fill" className="w-full h-full" />
                      </div>
                      {sel && <div className="absolute top-1 right-1 bg-primary rounded-full p-0.5"><Check size={12} className="text-white" /></div>}
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 to-transparent p-1.5">
                        <p className="text-[10px] font-semibold text-white line-clamp-1">{s.title}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="fixed bottom-0 inset-x-0 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] bg-gradient-to-t from-background to-transparent">
        <div className="max-w-md mx-auto flex gap-2">
          {step > 0 && <Button variant="secondary" className="rounded-full glass border-border/60 px-6" onClick={() => setStep(step - 1)}>Back</Button>}
          <Button disabled={!canNext || saving} onClick={next} className="flex-1 rounded-full bg-primary hover:bg-primary/90 text-white font-semibold">
            {step < 3 ? <>Continue <ChevronRight size={18} /></> : saving ? "Saving…" : "Enter BL World"}
          </Button>
        </div>
      </div>
    </div>
  );
}