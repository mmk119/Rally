import React, { useState } from 'react';
import { PlayerRank } from '../types';
import { RANKINGS_DATA } from '../data/mockData';

interface RankingsViewProps {
  onChallengePlayer: (playerName: string) => void;
}

export const RankingsView: React.FC<RankingsViewProps> = ({ onChallengePlayer }) => {
  const [filterTier, setFilterTier] = useState<string>('all');

  const filteredList =
    filterTier === 'all'
      ? RANKINGS_DATA
      : RANKINGS_DATA.filter((p) => p.tier.toLowerCase().includes(filterTier));

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-10 py-6 md:py-8 pb-28 md:pb-12 flex flex-col gap-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-condensed text-3xl md:text-4xl font-bold tracking-tight text-white">
            Club Ladder & Rankings
          </h2>
          <p className="text-sm text-[#c3c9b2] mt-0.5">
            Official Rally Club Elo Ratings and match standings for the current season.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-[#141A16] border border-[#232B27] p-1 rounded-lg self-start sm:self-auto">
          {['all', 'elite', 'master', 'challenger'].map((tier) => (
            <button
              key={tier}
              onClick={() => setFilterTier(tier)}
              className={`px-3 py-1 rounded text-xs uppercase font-bold tracking-wider transition-colors cursor-pointer ${
                filterTier === tier
                  ? 'bg-[#bef264] text-[#0B0F0C]'
                  : 'text-[#c3c9b2] hover:text-white'
              }`}
            >
              {tier}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard Table / Cards */}
      <div className="bg-[#141A16]/90 border border-[#232B27] rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#232B27] text-xs text-[#c3c9b2] bg-[#0c0f0e]/50">
                <th className="py-4 px-6 font-semibold">Rank</th>
                <th className="py-4 px-6 font-semibold">Player</th>
                <th className="py-4 px-6 font-semibold">Tier</th>
                <th className="py-4 px-6 font-semibold">Elo Rating</th>
                <th className="py-4 px-6 font-semibold">Win Rate</th>
                <th className="py-4 px-6 font-semibold">Matches</th>
                <th className="py-4 px-6 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#232B27]/60">
              {filteredList.map((player) => (
                <tr key={player.name} className="hover:bg-[#1B2320]/50 transition-colors">
                  {/* Rank */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-condensed text-xl font-bold ${
                          player.rank === 1
                            ? 'text-[#bef264]'
                            : player.rank === 2
                            ? 'text-[#e1e3e0]'
                            : player.rank === 3
                            ? 'text-[#d4af37]'
                            : 'text-[#5d6562]'
                        }`}
                      >
                        #{player.rank}
                      </span>
                      {player.trend === 'up' && (
                        <span className="material-symbols-outlined text-[16px] text-[#bef264]">
                          arrow_upward
                        </span>
                      )}
                      {player.trend === 'down' && (
                        <span className="material-symbols-outlined text-[16px] text-[#ffb4ab]">
                          arrow_downward
                        </span>
                      )}
                      {player.trend === 'steady' && (
                        <span className="material-symbols-outlined text-[16px] text-[#5d6562]">
                          remove
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Player Name and Avatar */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <img
                        src={player.avatar}
                        alt={player.name}
                        className="w-10 h-10 rounded-full object-cover border border-[#232B27]"
                      />
                      <div>
                        <span className="font-semibold text-white block">{player.name}</span>
                        <span className="text-[11px] text-[#5d6562]">Verified Member</span>
                      </div>
                    </div>
                  </td>

                  {/* Tier */}
                  <td className="py-4 px-6">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold tracking-wider ${
                        player.tier === 'Elite Pro'
                          ? 'bg-[#bef264]/15 text-[#bef264] border border-[#bef264]/30'
                          : player.tier === 'Master'
                          ? 'bg-[#5e851a]/20 text-[#a4d64c] border border-[#5e851a]/40'
                          : 'bg-[#272B29] text-[#c3c9b2] border border-[#434938]'
                      }`}
                    >
                      {player.tier}
                    </span>
                  </td>

                  {/* Elo */}
                  <td className="py-4 px-6">
                    <span className="font-condensed text-lg font-bold text-white">
                      {player.elo}
                    </span>
                  </td>

                  {/* Win Rate */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 rounded-full bg-[#0c0f0e] border border-[#232B27] overflow-hidden">
                        <div
                          className="h-full bg-[#bef264]"
                          style={{ width: `${player.winRate}%` }}
                        />
                      </div>
                      <span className="font-semibold text-xs text-white">{player.winRate}%</span>
                    </div>
                  </td>

                  {/* Matches */}
                  <td className="py-4 px-6 text-[#c3c9b2] text-xs font-medium">
                    {player.matchesPlayed} games
                  </td>

                  {/* Action */}
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => onChallengePlayer(player.name)}
                      className="bg-[#1B2320] hover:bg-[#bef264] text-[#c3c9b2] hover:text-[#0B0F0C] border border-[#232B27] hover:border-[#bef264] px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(190,242,100,0.3)]"
                    >
                      Challenge
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
