import { createFileRoute } from "@tanstack/react-router";
import DinoGame from "@/components/DinoGame";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dino Run — Aventure à travers les biomes" },
      {
        name: "description",
        content:
          "Reprise du jeu du dinosaure Chrome : saute, esquive, et traverse 6 paysages qui changent à chaque niveau.",
      },
      { property: "og:title", content: "Dino Run — Aventure à travers les biomes" },
      {
        property: "og:description",
        content:
          "Joue au célèbre jeu du dino dans une version enrichie : désert, forêt, montagne, coucher de soleil, nuit et lune.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="min-h-[100dvh] bg-background text-foreground flex flex-col items-center justify-start md:justify-center px-3 sm:px-4 py-4 sm:py-8 gap-4 sm:gap-6">
      <header className="text-center max-w-2xl">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">Dino Run</h1>
        <p className="mt-2 sm:mt-3 text-sm sm:text-base text-muted-foreground">
          Traverse 10 paysages — désert, forêt, neige, coucher de soleil, nuit, lune, récif, volcan,
          cristal et forêt fongique. Tous les 150 points, le décor change.
        </p>
      </header>

      <DinoGame />

      <section className="text-xs sm:text-sm text-muted-foreground text-center max-w-xl">
        <p className="hidden md:block">
          <kbd className="px-2 py-1 rounded border border-border bg-muted">Espace</kbd> ou{" "}
          <kbd className="px-2 py-1 rounded border border-border bg-muted">↑</kbd> pour sauter ·{" "}
          <kbd className="px-2 py-1 rounded border border-border bg-muted">↓</kbd> pour s'accroupir.
        </p>
        
      </section>
    </main>
  );
}
