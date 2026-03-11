import { motion, AnimatePresence } from "framer-motion";
import { Bell, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAlarm } from "@/context/AlarmContext";

export default function AlarmOverlay() {
  const { activeAlarm, snoozeAlarm, stopAlarm } = useAlarm();

  return (
    <AnimatePresence>
      {activeAlarm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-xl p-6"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-md text-center space-y-8"
          >
            <div className="relative mx-auto w-32 h-32">
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, -10, 10, -10, 10, 0],
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="flex items-center justify-center w-full h-full rounded-full bg-primary text-primary-foreground shadow-2xl shadow-primary/40"
              >
                <Bell className="w-16 h-16" />
              </motion.div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-black uppercase tracking-[0.3em] text-primary animate-pulse">
                Alarm Ringing
              </p>
              <h2 className="text-6xl font-black tracking-tighter text-foreground">
                {activeAlarm.time.slice(0, 5)}
              </h2>
              <p className="text-xl font-medium text-muted-foreground">
                {activeAlarm.type === "study" ? "Time for your Focused Study Session!" : (activeAlarm.label || "Alarm Reminder")}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                size="lg"
                className="h-16 rounded-2xl text-lg font-bold border-2"
                onClick={snoozeAlarm}
              >
                <Clock className="mr-2 h-5 w-5" /> Snooze
              </Button>
              <Button
                size="lg"
                className="h-16 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20"
                onClick={stopAlarm}
              >
                Stop Alarm
              </Button>
            </div>

            <p className="text-sm text-muted-foreground animate-pulse">
              Stay focused. Start your study session now.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
