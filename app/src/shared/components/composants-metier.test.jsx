import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import JaugeCapacite from "./JaugeCapacite";
import ScoreFiabilite from "./ScoreFiabilite";

describe("JaugeCapacite (doc 03 §6.14, RG2)", () => {
  it("expose l'aria-label de capacité", () => {
    render(<JaugeCapacite actifs={3} />);
    expect(screen.getByRole("img", { name: "Capacité 3 sur 5" })).toBeInTheDocument();
  });

  it("à 4/5, le dernier segment est signalé or (avertissement dernière place)", () => {
    const { container } = render(<JaugeCapacite actifs={4} />);
    const segments = container.firstElementChild.querySelectorAll("span[aria-hidden]");
    expect(segments).toHaveLength(5);
    expect(segments[3].className).toContain("bg-[var(--accent-green)]");
    expect(segments[4].className).toContain("bg-[var(--accent-gold)]/25");
    expect(segments[4].className).toContain("border-[var(--accent-gold)]");
  });

  it("à 2/5, aucun segment n'est signalé or", () => {
    const { container } = render(<JaugeCapacite actifs={2} />);
    const segments = container.firstElementChild.querySelectorAll("span[aria-hidden]");
    expect(segments[4].className).not.toContain("bg-[var(--accent-gold)]/25");
  });
});

describe("ScoreFiabilite (doc 03 §6.13)", () => {
  it("expose la note formatée FR et le nombre d'avis", () => {
    render(<ScoreFiabilite score={4.6} nbAvis={12} />);
    expect(screen.getByRole("img", { name: "Note moyenne 4,6 sur 5, 12 avis" })).toBeInTheDocument();
  });

  it("sans avis : « Pas encore noté » discret", () => {
    render(<ScoreFiabilite score={null} nbAvis={0} />);
    expect(screen.getByText("Pas encore noté")).toBeInTheDocument();
  });
});
