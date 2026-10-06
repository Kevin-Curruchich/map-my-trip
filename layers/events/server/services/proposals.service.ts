import { useChatModel } from "~~/layers/trips/server/services/llm.service";
import { GeneratedProposalsSchema } from "../schemas";
import type { EventRecord, ParticipantRecord } from "../database/schema";
import type { z } from "zod";

const budgetLabels = {
  low: "económico",
  medium: "normal",
  high: "sin límite",
} as const;

export type GeneratedProposal = z.output<
  typeof GeneratedProposalsSchema
>["proposals"][number];

export async function generateProposals(
  event: Pick<EventRecord, "title" | "city" | "date" | "description">,
  participants: Pick<ParticipantRecord, "name" | "budget" | "preferences">[]
): Promise<GeneratedProposal[]> {
  const people = participants
    .map((participant) => {
      const budget =
        budgetLabels[participant.budget as keyof typeof budgetLabels] ??
        participant.budget;
      const wants = participant.preferences
        ? `quiere: ${participant.preferences}`
        : "no dijo preferencias";
      return `- ${participant.name} (presupuesto ${budget}): ${wants}`;
    })
    .join("\n");

  const { proposals } = await useChatModel()
    .withStructuredOutput(GeneratedProposalsSchema)
    .invoke(`
Eres quien ayuda a un grupo de amigos a decidir qué hacer juntos.
Propón 3 planes distintos entre sí para este evento, en español.

Evento: ${event.title}
Zona: ${event.city}
${event.date ? `Fecha: ${event.date}` : "Fecha: sin definir"}
${event.description ? `Detalles: ${event.description}` : ""}

Personas y lo que dijeron:
${people}

Reglas:
- Cada plan debe poder hacerse en la zona indicada, en un día o una tarde.
- Respeta el presupuesto del que menos puede gastar en al menos uno de los planes.
- Combina las preferencias del grupo; no ignores a nadie.
- Usa lugares reales y conocidos de la zona cuando puedas.
`);

  return proposals;
}
