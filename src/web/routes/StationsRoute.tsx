import React, { useState, useMemo } from "react";
import StationsData from "../../dataStore/stations.json";
import { useSelectedStations } from "../hooks/useSelectedStations";

interface StationItem {
    id: string;
    name: string;
    country?: string;
}

const allStations = StationsData as StationItem[];

export function StationsRoute() {
    const [searchQuery, setSearchQuery] = useState("");
    const { isSelected, addStation, removeStation, selectedStations } =
        useSelectedStations();

    const filteredStations = useMemo(() => {
        const q = searchQuery.toLowerCase().trim();
        if (!q) return allStations.slice(0, 150);
        return allStations
            .filter(
                (s) =>
                    s.id.toLowerCase().includes(q) ||
                    s.name.toLowerCase().includes(q),
            )
            .slice(0, 150);
    }, [searchQuery]);

    return (
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-lg font-semibold text-slate-100">
                        Swedish Railway Stations
                    </h2>
                    <p className="text-xs text-slate-400">
                        Search stations and add them to your scanner selection
                        <span className="text-cyan-400 font-semibold">
                            {" "}
                            ({selectedStations.length} selected)
                        </span>
                        .
                    </p>
                </div>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search station name or code..."
                    className="w-full sm:w-72 bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-cyan-500"
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[550px] overflow-y-auto pr-1">
                {filteredStations.length === 0 ? (
                    <div className="col-span-full text-center text-slate-500 py-8 text-sm">
                        No stations match "{searchQuery}".
                    </div>
                ) : (
                    filteredStations.map((s) => {
                        const selected = isSelected(s.id);
                        return (
                            <div
                                key={s.id}
                                className={`p-3 bg-slate-950/60 border rounded-xl flex items-center justify-between gap-2 transition ${selected ? "border-cyan-800/70" : "border-slate-800/80 hover:border-slate-700"}`}
                            >
                                <div className="min-w-0">
                                    <div className="text-sm font-semibold text-slate-200 truncate">
                                        {s.name}
                                    </div>
                                    <div className="text-xs font-mono text-cyan-400 font-bold">
                                        {s.id}{" "}
                                        <span className="text-slate-600">
                                            · {s.country || "SE"}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() =>
                                        selected
                                            ? removeStation(s.id)
                                            : addStation(s.id)
                                    }
                                    aria-label={
                                        selected
                                            ? `Remove ${s.name} from selection`
                                            : `Add ${s.name} to selection`
                                    }
                                    className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-bold border transition ${
                                        selected
                                            ? "bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20"
                                            : "bg-cyan-500/10 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/20"
                                    }`}
                                >
                                    {selected ? "− Remove" : "+ Add"}
                                </button>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
