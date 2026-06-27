"use client";

import { motion } from "motion/react";
import { Clock, ChefHat, CheckCircle2, AlertCircle } from "lucide-react";

interface KitchenStatsProps {
  pendingCount: number;
  preparingCount: number;
  readyCount: number;
  avgPrepTime: string;
}

export function KitchenStats({ pendingCount, preparingCount, readyCount, avgPrepTime }: KitchenStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <StatCard 
        title="Pending Tickets" 
        value={pendingCount} 
        icon={<Clock className="w-5 h-5 text-warning" />} 
        color="border-warning/20 bg-warning/5"
      />
      <StatCard 
        title="Cooking Now" 
        value={preparingCount} 
        icon={<ChefHat className="w-5 h-5 text-info" />} 
        color="border-info/20 bg-info/5"
      />
      <StatCard 
        title="Ready for Pickup" 
        value={readyCount} 
        icon={<CheckCircle2 className="w-5 h-5 text-success" />} 
        color="border-success/20 bg-success/5"
      />
      <StatCard 
        title="Avg Prep Time" 
        value={avgPrepTime} 
        icon={<AlertCircle className="w-5 h-5 text-primary" />} 
        color="border-primary/20 bg-primary/5"
      />
    </div>
  );
}

function StatCard({ title, value, icon, color }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-xl border ${color} flex items-center justify-between shadow-sm`}
    >
      <div>
        <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
        <p className="text-2xl font-black tracking-tight">{value}</p>
      </div>
      <div className="p-3 bg-background rounded-full shadow-sm">
        {icon}
      </div>
    </motion.div>
  );
}
