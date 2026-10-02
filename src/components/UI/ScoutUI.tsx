import React, { useState, memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap,
} from 'lucide-react';
import { Badge } from '../../badges.tsx';
import { UserRole } from '../../types.ts';

export const Mascot = memo(({ role, name, points }: { role?: UserRole, name?: string, points?: number }) => {
  const getMessage = () => {
    if (role === UserRole.LEADER) {
      return (
        <div className="space-y-1">
          <p className="font-black">أهلاً بك أيها القائد الحكيم!</p>
          <p className="text-[11px] opacity-80">أنت المحرك والـمُقيّم الوحيد للفرقة. من هنا تمنح الشارات، تضع التقييمات اليومية، وتدير الألعاب الكشفية.</p>
        </div>
      );
    }
    if (role === UserRole.PARENT) {
      return (
        <div className="space-y-1">
          <p className="font-black">مرحباً ولي الأمر الفاضل!</p>
          <p className="text-[11px] opacity-80">هذه نافذتك لمتابعة إنجازات {name || 'ابنك'}. شاهد شاراته وتقييماته لتفخر به وتشجعه في المنزل.</p>
        </div>
      );
    }
    
    const basicGreeting = points !== undefined && points < 100 
      ? `مرحباً يا بطل! أنا رفيقك في الغابة. العب وتعلم لترى ثمرة جهدك في سجل تقييمك!`
      : points !== undefined && points < 300 
      ? `أنت مذهل يا ${name}! انظر إلى أوسمتك الملونة، استمر في التقدم!`
      : `يا للروعة! ${name} أنت شبل خبير، كل الشارات والتقييمات تشهد بتميزك!`;

    return (
      <div className="space-y-1">
        <p className="font-black">مرحباً بك يا شبل!</p>
        <p className="text-[11px] opacity-80">{basicGreeting}</p>
      </div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-4 bg-white/80 backdrop-blur-sm p-4 rounded-[32px] border-2 border-scout-yellow/30 shadow-xl max-w-lg mb-8 relative group"
    >
      <div className="relative">
        <div className="w-20 h-20 bg-scout-yellow rounded-full flex items-center justify-center text-4xl shadow-inner animate-pulse">
          🦁
        </div>
        <div className="absolute -top-1 -right-1 bg-scout-blue text-white p-1 rounded-full border-2 border-white">
          <Zap size={12} fill="currentColor" />
        </div>
      </div>
      <div className="flex-1">
        <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rotate-45 border-r-2 border-b-2 border-scout-yellow/30 hidden md:block"></div>
        <div className="text-sm md:text-base font-black text-scout-blue leading-relaxed">
          {getMessage()}
        </div>
      </div>
    </motion.div>
  );
});

Mascot.displayName = 'Mascot';

export const CubAvatar = memo(({ 
  emoji, 
  size = 'md', 
  className = '', 
  ring = false 
}: { 
  emoji: string, 
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl', 
  className?: string,
  ring?: boolean
}) => {
  const sizes = {
    xs: 'w-6 h-6 text-sm',
    sm: 'w-8 h-8 text-lg',
    md: 'w-12 h-12 text-2xl',
    lg: 'w-16 h-16 text-4xl',
    xl: 'w-32 h-32 text-7xl'
  };

  return (
    <div className={`
      ${sizes[size]} 
      bg-white rounded-2xl flex items-center justify-center 
      shadow-sm border-2 border-scout-yellow/20 
      transition-all duration-300
      ${ring ? 'ring-4 ring-white/50' : ''}
      ${className}
    `}>
      <span className="drop-shadow-sm select-none">{emoji}</span>
    </div>
  );
});

CubAvatar.displayName = 'CubAvatar';

interface BadgeTooltipProps {
  children: React.ReactNode;
  title: string;
  description: string;
  category?: string;
  key?: React.Key;
}

export const BadgeTooltip = memo(({ children, title, description, category }: BadgeTooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative group" onMouseEnter={() => setIsVisible(true)} onMouseLeave={() => setIsVisible(false)}>
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            className="absolute z-[100] bottom-full left-1/2 -translate-x-1/2 mb-3 w-56 p-4 bg-slate-900 border border-slate-700 text-white rounded-2xl shadow-2xl pointer-events-none"
          >
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <h5 className="font-black text-sm text-scout-yellow">{title}</h5>
                {category && <span className="text-[8px] bg-white/10 px-1.5 py-0.5 rounded text-white/60">{category}</span>}
              </div>
              <p className="text-[11px] leading-relaxed text-slate-300 font-medium">{description}</p>
            </div>
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 rotate-45 border-r border-b border-slate-700"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

BadgeTooltip.displayName = 'BadgeTooltip';

export const BadgeIconDisplay = memo(({ 
  badge, 
  size = 'md', 
  isEarned = true,
  animate = false,
  className = ''
}: { 
  badge: Badge, 
  size?: 'xs' | 'sm' | 'md' | 'lg', 
  isEarned?: boolean,
  animate?: boolean,
  className?: string
}) => {
  const sizes = {
    xs: 'w-8 h-8 p-1.5',
    sm: 'w-12 h-12 p-2.5',
    md: 'w-20 h-20 p-4',
    lg: 'w-32 h-32 p-6'
  };

  const iconSizes = {
    xs: 14,
    sm: 22,
    md: 36,
    lg: 64
  };

  return (
    <motion.div 
      initial={animate ? { scale: 0.8, rotate: -10 } : false}
      animate={animate ? { 
        scale: [1, 1.1, 1],
        rotate: [0, 5, -5, 0]
      } : false}
      transition={animate ? { 
        duration: 2, 
        repeat: Infinity,
        ease: "easeInOut" 
      } : {}}
      className={`
        ${sizes[size]} 
        rounded-full flex items-center justify-center 
        shadow-lg bg-gradient-to-br transition-all duration-500
        ${isEarned ? badge.color : 'from-gray-200 to-gray-400 grayscale opacity-40'}
        ${className}
      `}
    >
      <badge.icon size={iconSizes[size]} className={`${isEarned ? 'text-white' : 'text-gray-400'} drop-shadow-md`} />
    </motion.div>
  );
});

BadgeIconDisplay.displayName = 'BadgeIconDisplay';
