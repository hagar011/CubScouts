/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Users } from 'lucide-react';
import { CubAvatar } from './UI/ScoutUI';

interface PodiumProps {
  items: any[];
  type: 'cubs' | 'sextets';
}

export const Podium: React.FC<PodiumProps> = ({ items, type }) => {
  const top3 = items.slice(0, 3);
  if (top3.length < 1) return null;

  const displayOrder: any[] = [];
  if (top3[1]) displayOrder.push({ ...top3[1], rank: 2 });
  if (top3[0]) displayOrder.push({ ...top3[0], rank: 1 });
  if (top3[2]) displayOrder.push({ ...top3[2], rank: 3 });

  return (
    <div className="flex items-end justify-center gap-2 md:gap-6 pt-16 pb-8 px-4 font-sans">
      {displayOrder.map((item) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: (item.rank || 0) * 0.2 }}
          className="flex flex-col items-center"
        >
          <div className="relative mb-4">
            {type === 'cubs' ? (
              <CubAvatar emoji={item.avatar} size={item.rank === 1 ? 'xl' : 'lg'} ring={item.rank === 1} />
            ) : (
              <div className={`
                ${item.rank === 1 ? 'w-24 h-24 text-4xl' : 'w-20 h-20 text-3xl'}
                ${item.color} rounded-3xl flex items-center justify-center text-white shadow-xl ring-4 ring-white
              `}>
                <Users size={item.rank === 1 ? 40 : 32} />
              </div>
            )}
            <div className={`
              absolute -top-3 -right-3 w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-2 border-white font-black text-lg
              ${item.rank === 1 ? 'bg-amber-400 text-slate-800 scale-125' : 
                item.rank === 2 ? 'bg-slate-300 text-slate-700' : 'bg-orange-400 text-white'}
            `}>
              {item.rank}
            </div>
          </div>
          <div className={`
            w-24 md:w-32 rounded-t-3xl shadow-lg flex flex-col items-center justify-end p-4 border-x-2 border-t-2 border-white/20
            ${item.rank === 1 ? 'h-48 bg-gradient-to-b from-amber-400 to-amber-500 order-2' : 
              item.rank === 2 ? 'h-36 bg-gradient-to-b from-slate-200 to-slate-200 order-1' : 
              'h-28 bg-gradient-to-b from-orange-300 to-orange-400 order-3'}
          `}>
            <p className="font-black text-slate-800 text-center truncate w-full px-1 text-sm">{item.name}</p>
            <div className="mt-2 bg-white/30 px-3 py-1 rounded-full text-[10px] font-black text-slate-900 shadow-sm border border-white/50">
              {type === 'sextets' ? item.totalPoints : item.points} نقطة
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
