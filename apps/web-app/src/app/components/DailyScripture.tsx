import { useLayout } from "../contexts/LayoutContext";
import { Sparkles, Book, CheckCircle2, Loader2 } from "lucide-react";
import { useAuth } from "../providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyMetadata, getScriptureHistory, getTodayScripture, markScriptureAsRead } from "@/api/individual/individual";
import { toast } from "react-hot-toast";
import { useEffect, useState } from "react";
import { Card } from "./ui/card";

export function DailyScripture() {
  const { setHeader } = useLayout();
  useEffect(() => {
    setHeader("Daily Scripture", "Start your day with God's Word.");
  }, []);

  const { user } = useAuth();
  const userId = user?.id || "";
  const queryClient = useQueryClient();
  const [isMarking, setIsMarking] = useState(false);

  // Fetch today's global scripture
  const { data: scripture, isLoading: isScriptureLoading } = useQuery({
    queryKey: ["today-scripture"],
    queryFn: getTodayScripture,
  });

  const { data: scriptureHistory, isLoading: isScriptureHistoryLoading } = useQuery({
    queryKey: ["scripture-history", userId],
    queryFn: () => getScriptureHistory({}),
  });

  const isLoading = isScriptureLoading;

  const { mutate: markAsRead } = useMutation({
    mutationFn: (scriptureId: string) =>
      markScriptureAsRead(scriptureId),
    onSuccess: () => {
      toast.success("Scripture marked as read!");
      queryClient.invalidateQueries({
        queryKey: ["individual-metadata", userId],
      });
    },
    onError: () => {
      toast.error("Failed to update progress");
    },
    onSettled: () => setIsMarking(false),
  });

  const handleMarkAsRead = () => {
    setIsMarking(true);
    if (scripture?.id) markAsRead(scripture.id);
  };

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      <div className="p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          {isLoading ? (
            <Card className="p-12 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-10 h-10 text-accent animate-spin" />
              <p className="text-muted-foreground">Preparing today's word...</p>
            </Card>
          ) : (
            <Card
              padding="none"
              className="bg-gradient-to-br from-accent/10 to-accent/5 rounded-lg border-accent/20 shadow-xl shadow-accent/5 relative overflow-hidden"
            >
              <div className="p-6 md:p-12">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 p-10 opacity-[0.03]">
                  <Sparkles className="w-48 h-48 text-accent" />
                </div>

                <div className="relative z-10 text-center">
                  {/* Icon */}
                  <div className="flex justify-center mb-8">
                    <div className="w-20 h-20 rounded-lg bg-card flex items-center justify-center border border-accent/20 shadow-lg">
                      <Sparkles className="w-10 h-10 text-accent" />
                    </div>
                  </div>

                  {/* Date */}
                  <p className="text-sm text-muted-foreground mb-6 uppercase tracking-[0.2em] opacity-70">
                    {today}
                  </p>

                  {/* Scripture */}
                  <blockquote className="mb-8 sm:mb-10">
                    <p className="text-xl sm:text-2xl md:text-3xl font-serif text-foreground leading-relaxed mb-6 italic px-2 sm:px-0">
                      "{scripture?.content || scripture?.scriptureReference || "For I know the plans I have for you..."}"
                    </p>
                    <footer className="flex items-center justify-center gap-2 sm:gap-3 text-accent bg-accent/5 py-1.5 sm:py-2 px-3 sm:px-4 rounded-full w-fit mx-auto text-sm sm:text-base">
                      <Book className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <cite className="not-italic font-bold">
                        {scripture?.scriptureReference || "Jeremiah 29:11"}
                      </cite>
                    </footer>
                  </blockquote>

                  {/* Encouragement */}
                  {/* <div className="bg-card/50 backdrop-blur-sm rounded-lg p-4 sm:p-6 mb-8 sm:mb-10 border border-neutral-200 shadow-inner">
                    <p className="text-muted-foreground leading-relaxed italic text-xs sm:text-sm md:text-base">
                      {scripture?.encouragement ||
                        "Today, remember that God has a beautiful plan for your life. Even when the path seems unclear, trust that He is working all things together for your good."}
                    </p>
                  </div> */}

                  {/* Action Buttons */}
                  <div className="grid sm:grid-cols-2 gap-4 items-center">
                    <Button
                      onClick={handleMarkAsRead}
                      isLoading={isMarking}
                    >
                      {!isMarking && <CheckCircle2 className="w-5 h-5" />}
                      Mark as Read
                    </Button>
                    <Button
                      variant="secondary"
                      href="/sunday-journal"
                    >
                      Reflect & Journal
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Weekly Scripture Card */}
          <Card className="mt-12">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Book className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground">
                This Week's Focus
              </h3>
            </div>

            <div className="space-y-4">
              {scriptureHistory?.data?.map((item, idx) => {
                const isActive = new Date(item.date) === new Date();
                console.log(isActive)

                return <Card
                  key={idx}
                  variant={isActive ? "accent" : "default"}
                  padding="none"
                  className={isActive ? "ring-1 ring-accent/20" : "hover:border-accent/30"}
                >
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-start gap-4">
                      <div
                        className="w-2 h-2 rounded-full mt-2"
                      ></div>
                      <div>
                        <p
                          className={`text-sm ${isActive ? "text-foreground font-bold" : "text-muted-foreground"}`}
                        >
                          {item.scriptureReference}
                        </p>
                        <p className="text-xs text-muted-foreground/60">
                          {item.date}
                        </p>
                      </div>
                    </div>
                    {item.isCompleted && (
                      <CheckCircle2 className="w-4 h-4 text-success opacity-60" />
                    )}
                    {isActive && (
                      <span className="text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded uppercase font-bold">
                        Today
                      </span>
                    )}
                  </div>
                </Card>
              }
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
