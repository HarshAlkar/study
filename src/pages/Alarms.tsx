import { useState, useEffect } from "react";
import { Bell, Plus, X, Trash2, Clock, Edit2, Volume2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAlarms, useAddAlarm, useUpdateAlarm, useDeleteAlarm } from "@/hooks/useData";
import { useToast } from "@/hooks/use-toast";
import { alarmAudio } from "@/lib/audio";

const ALL_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function Alarms() {
  const { data: alarms = [], isLoading } = useAlarms();
  const addAlarm = useAddAlarm();
  const updateAlarm = useUpdateAlarm();
  const deleteAlarm = useDeleteAlarm();
  const { toast } = useToast();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newAlarm, setNewAlarm] = useState({ label: "", time: "08:00", days: [] as string[] });
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  // Live Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Request notification permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const unlockAudio = () => {
    alarmAudio.resume();
    setAudioUnlocked(true);
    toast({ title: "Audio Enabled", description: "Alarms will now play sounds reliably." });
  };

  const toggleDay = (day: string) => {
    setNewAlarm((p) => ({
      ...p,
      days: p.days.includes(day) ? p.days.filter((d) => d !== day) : [...p.days, day],
    }));
  };

  const handleOpenEdit = (alarm: any) => {
    setEditingId(alarm.id);
    setNewAlarm({ label: alarm.label, time: alarm.time.slice(0, 5), days: alarm.days });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!newAlarm.time) return;
    if (editingId) {
      updateAlarm.mutate({ id: editingId, ...newAlarm });
    } else {
      addAlarm.mutate(newAlarm);
    }
    setNewAlarm({ label: "", time: "08:00", days: [] });
    setEditingId(null);
    setShowModal(false);
  };

  const formattedTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const nextAlarm = [...alarms]
    .filter(a => a.enabled)
    .sort((a, b) => a.time.localeCompare(b.time))[0];

  return (
    <Layout>
      <div className="space-y-8" onClick={() => !audioUnlocked && unlockAudio()}>
        {/* Live Clock Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden rounded-3xl bg-primary p-8 text-primary-foreground shadow-2xl shadow-primary/20"
        >
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <p className="text-sm font-medium opacity-80 uppercase tracking-widest">Current Time</p>
              <h2 className="text-6xl md:text-7xl font-black tracking-tighter tabular-nums">
                {formattedTime}
              </h2>
              <p className="mt-2 text-primary-foreground/60 flex items-center justify-center md:justify-start gap-2">
                <Clock className="h-4 w-4" />
                {currentTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
            
            <div className="flex flex-col items-center md:items-end gap-3">
              {!audioUnlocked && (
                <Button variant="secondary" size="sm" onClick={unlockAudio} className="rounded-full bg-white/20 hover:bg-white/30 border-none text-white gap-2">
                  <Volume2 className="h-4 w-4" /> Enable Audio
                </Button>
              )}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 min-w-[200px]">
                <p className="text-xs opacity-70 mb-1">Next Alarm</p>
                {nextAlarm ? (
                  <div className="flex items-end justify-between">
                    <span className="text-2xl font-bold">{nextAlarm.time.slice(0, 5)}</span>
                    <span className="text-xs opacity-80">{nextAlarm.label || "Study Session"}</span>
                  </div>
                ) : (
                  <p className="text-sm font-medium">None scheduled</p>
                )}
              </div>
            </div>
          </div>
          {/* Decorative Background Circles */}
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-black/10 blur-3xl" />
        </motion.div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Active Alarms</h1>
            <p className="mt-1 text-muted-foreground">{alarms.filter((a) => a.enabled).length} alarms active</p>
          </div>
          <Button onClick={() => { setEditingId(null); setShowModal(true); }} className="rounded-xl px-6 h-12 shadow-lg shadow-primary/20">
            <Plus className="mr-2 h-5 w-5" /> Add Alarm
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : alarms.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-3xl bg-card border-2 border-dashed p-16 text-center">
            <div className="h-20 w-20 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
              <Bell className="h-10 w-10 text-muted-foreground/40" />
            </div>
            <h2 className="text-xl font-bold text-foreground">No alarms set yet</h2>
            <p className="text-muted-foreground mt-2 max-w-xs mx-auto">Stay on track with your study routine. Create your first alarm now.</p>
          </motion.div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
            {alarms.map((alarm, i) => (
              <motion.div key={alarm.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className={`flex items-center gap-6 rounded-3xl p-6 border-2 transition-all group ${alarm.enabled ? "bg-card border-primary/10 shadow-xl" : "bg-muted/30 border-transparent grayscale"}`}
              >
                <div className={`flex h-16 w-16 items-center justify-center rounded-2xl shadow-inner transition-colors ${alarm.enabled ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  <Bell className="h-7 w-7" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <p className="text-4xl font-black text-foreground tracking-tight tabular-nums">{alarm.time.slice(0, 5)}</p>
                    <p className={`text-sm font-bold uppercase tracking-widest ${alarm.enabled ? "text-primary" : "text-muted-foreground"}`}>
                      {Number(alarm.time.split(':')[0]) >= 12 ? 'PM' : 'AM'}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground truncate mb-2">{alarm.label || "No Label"}</p>
                  <div className="flex gap-1.5">
                    {ALL_DAYS.map((d) => (
                      <span key={d} className={`text-[10px] px-2 py-0.5 rounded-md font-bold transition-colors ${alarm.days.includes(d) ? "bg-primary/10 text-primary" : "bg-muted/50 text-muted-foreground/30"}`}>{d[0]}</span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-center gap-4">
                  <Switch checked={alarm.enabled} onCheckedChange={(checked) => updateAlarm.mutate({ id: alarm.id, enabled: checked })} />
                  <div className="flex gap-2">
                    <button onClick={() => handleOpenEdit(alarm)} className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-all">
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button onClick={() => deleteAlarm.mutate(alarm.id)} className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-background/40 backdrop-blur-md p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()} className="w-full max-w-sm rounded-[2.5rem] bg-card p-8 shadow-2xl border-4 border-muted/50 space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-foreground">{editingId ? "Edit Alarm" : "New Alarm"}</h2>
                  <p className="text-sm text-muted-foreground">Customize your reminder</p>
                </div>
                <button onClick={() => setShowModal(false)} className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"><X className="h-5 w-5" /></button>
              </div>
              
              <div className="space-y-6">
                <div className="relative">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Trigger Time</Label>
                  <Input 
                    className="mt-2 h-24 rounded-3xl text-5xl font-black text-center bg-muted/30 border-none focus-visible:ring-primary/20" 
                    type="time" 
                    value={newAlarm.time} 
                    onChange={(e) => setNewAlarm((p) => ({ ...p, time: e.target.value }))} 
                  />
                </div>

                <div>
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Alarm Label</Label>
                  <Input 
                    className="mt-2 h-12 rounded-2xl bg-muted/30 border-none" 
                    value={newAlarm.label} 
                    onChange={(e) => setNewAlarm((p) => ({ ...p, label: e.target.value }))} 
                    placeholder="e.g. History Session" 
                  />
                </div>

                <div>
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Repeat on</Label>
                  <div className="flex gap-1.5 mt-3">
                    {ALL_DAYS.map((d) => (
                      <button 
                        key={d} 
                        onClick={() => toggleDay(d)}
                        className={`h-10 w-10 rounded-xl text-xs font-bold transition-all ${newAlarm.days.includes(d) ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30" : "bg-muted/50 text-muted-foreground hover:bg-muted"}`}
                      >
                        {d[0]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="ghost" className="flex-1 h-14 rounded-2xl font-bold" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button className="flex-1 h-14 rounded-2xl font-bold shadow-xl shadow-primary/20" onClick={handleSave} disabled={addAlarm.isPending || updateAlarm.isPending}>
                  {editingId ? "Save Changes" : "Set Alarm"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
