import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { useAlarms, useProfile } from "@/hooks/useData";
import { alarmAudio } from "@/lib/audio";
import { useToast } from "@/hooks/use-toast";

interface AlarmContextType {
  activeAlarm: { id: string; label: string; time: string; type?: "study" } | null;
  snoozeAlarm: () => void;
  stopAlarm: () => void;
}

const AlarmContext = createContext<AlarmContextType | undefined>(undefined);

export function AlarmProvider({ children }: { children: React.ReactNode }) {
  const { data: alarms = [] } = useAlarms();
  const { data: profile } = useProfile();
  const [activeAlarm, setActiveAlarm] = useState<AlarmContextType["activeAlarm"]>(null);
  const [snoozedUntil, setSnoozedUntil] = useState<Map<string, number>>(new Map());
  const triggeredRef = useRef<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    const checkAlarms = () => {
      if (activeAlarm) return;

      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const timestamp = now.getTime();
      
      const ALL_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const currentDay = ALL_DAYS[now.getDay() === 0 ? 6 : now.getDay() - 1];

      // 1. Check Personal Study Reminder
      if (profile?.study_reminders && profile?.preferred_start_time) {
        const reminderTime = profile.preferred_start_time.slice(0, 5);
        if (reminderTime === currentTime && !triggeredRef.current.has(`study-reminder-${currentTime}`)) {
          triggeredRef.current.add(`study-reminder-${currentTime}`);
          setActiveAlarm({ id: "study-reminder", label: "Focused Study Session", time: reminderTime, type: "study" });
          alarmAudio.start();
          if ("vibrate" in navigator) navigator.vibrate([500, 300, 500]);
          return; // Priority for study reminder
        }
      }

      // 2. Check General Alarms
      alarms.forEach((alarm) => {
        if (!alarm.enabled) return;

        const alarmTime = alarm.time.slice(0, 5);
        const snoozeTime = snoozedUntil.get(alarm.id);

        let shouldTrigger = false;

        // Regular trigger
        if (alarmTime === currentTime && !triggeredRef.current.has(`${alarm.id}-${currentTime}`)) {
          if (alarm.days.length === 0 || alarm.days.includes(currentDay)) {
            shouldTrigger = true;
          }
        }

        // Snooze trigger
        if (snoozeTime && timestamp >= snoozeTime) {
          shouldTrigger = true;
          setSnoozedUntil((prev) => {
            const next = new Map(prev);
            next.delete(alarm.id);
            return next;
          });
        }

        if (shouldTrigger) {
          triggeredRef.current.add(`${alarm.id}-${currentTime}`);
          setActiveAlarm({ id: alarm.id, label: alarm.label, time: alarm.time });
          alarmAudio.start();
          
          if ("vibrate" in navigator) {
            navigator.vibrate([500, 300, 500, 300, 500]);
          }

          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("⏰ Study Alarm", {
              body: alarm.label || "Time to study!",
              requireInteraction: true,
            });
          }
        }
      });

      // Cleanup triggeredRef for old minutes
      if (now.getSeconds() === 0) {
        triggeredRef.current.forEach((key) => {
          if (!key.endsWith(currentTime)) triggeredRef.current.delete(key);
        });
      }
    };

    const interval = setInterval(checkAlarms, 1000);
    return () => clearInterval(interval);
  }, [alarms, activeAlarm, snoozedUntil]);

  const snoozeAlarm = () => {
    if (!activeAlarm) return;
    const snoozeMinutes = 5;
    setSnoozedUntil((prev) => new Map(prev).set(activeAlarm.id, Date.now() + snoozeMinutes * 60000));
    stopAlarm();
    toast({
      title: "Alarm Snoozed",
      description: `We'll remind you again in ${snoozeMinutes} minutes.`,
    });
  };

  const stopAlarm = () => {
    setActiveAlarm(null);
    alarmAudio.stop();
    if ("vibrate" in navigator) navigator.vibrate(0);
  };

  return (
    <AlarmContext.Provider value={{ activeAlarm, snoozeAlarm, stopAlarm }}>
      {children}
    </AlarmContext.Provider>
  );
}

export function useAlarm() {
  const context = useContext(AlarmContext);
  if (!context) throw new Error("useAlarm must be used within AlarmProvider");
  return context;
}
