import type { EventRecord, ParticipantRecord } from "../database/schema";

// Real situations the plans should handle well. Add one whenever a plan comes
// out wrong, so the evals catch it if it comes back.
export interface ProposalScenario {
  name: string;
  event: Pick<
    EventRecord,
    "id" | "title" | "city" | "date" | "description" | "latitude" | "longitude"
  >;
  participants: Pick<ParticipantRecord, "name" | "budget" | "preferences">[];
}

// Not a saved event: a typed place's coordinates are never written anywhere.
const id = "00000000-0000-0000-0000-000000000000";

export const proposalScenarios: ProposalScenario[] = [
  {
    name: "aniversario-san-cristobal",
    event: {
      id,
      title: "Salida a cenar el sábado de aniversario",
      city: "San Cristóbal, Mixco, Guatemala",
      date: "2026-10-17",
      description: "Cumplimos 3 años, es necesario ir a cenar juntos",
      latitude: 14.601199,
      longitude: -90.593186,
    },
    participants: [
      { name: "Kevin", budget: "medium", preferences: "sushi, cine" },
      { name: "Ana", budget: "medium", preferences: "algo tranquilo y romántico" },
    ],
  },
  {
    name: "cumpleanos-zona-10",
    event: {
      id,
      title: "Cumpleaños de Diego",
      city: "Zona 10, Ciudad de Guatemala",
      date: "2026-10-23",
      description: "Somos 6, la idea es celebrar en la noche",
      latitude: 14.5995,
      longitude: -90.51,
    },
    participants: [
      { name: "Diego", budget: "medium", preferences: "karaoke, cerveza artesanal" },
      { name: "Sofía", budget: "low", preferences: "soy vegetariana" },
      { name: "Luis", budget: "high", preferences: "buenos cócteles" },
      { name: "Marta", budget: "low", preferences: null },
    ],
  },
  {
    name: "domingo-familiar-antigua",
    event: {
      id,
      title: "Domingo en familia",
      city: "Antigua Guatemala",
      date: "2026-10-25",
      description: "Vamos con dos niños de 5 y 8 años",
      latitude: 14.5586,
      longitude: -90.7295,
    },
    participants: [
      { name: "Carla", budget: "low", preferences: "comida típica, algo para los niños" },
      { name: "Jorge", budget: "medium", preferences: "caminar por el centro" },
    ],
  },
  {
    name: "desayuno-trabajo-zona-4",
    event: {
      id,
      title: "Desayuno con el equipo",
      city: "Zona 4, Ciudad de Guatemala",
      date: "2026-10-19",
      description: "Antes de la oficina, tenemos una hora",
      latitude: 14.6229,
      longitude: -90.516,
    },
    participants: [
      { name: "Paula", budget: "medium", preferences: "café de especialidad" },
      { name: "Andrés", budget: "medium", preferences: "algo rápido" },
    ],
  },
  {
    // A typed name only: the center comes from geocoding it.
    name: "sabado-amigos-xela",
    event: {
      id,
      title: "Sábado con amigos en Xela",
      city: "Quetzaltenango",
      date: "2026-10-24",
      description: null,
      latitude: null,
      longitude: null,
    },
    participants: [
      { name: "Fer", budget: "low", preferences: "caminata, naturaleza" },
      { name: "Raúl", budget: "low", preferences: "cerveza y comida barata" },
      { name: "Lucía", budget: "medium", preferences: "fotos bonitas" },
    ],
  },
  {
    name: "dia-de-lago-panajachel",
    event: {
      id,
      title: "Día de lago",
      city: "Panajachel, Sololá",
      date: "2026-11-01",
      description: "Queremos ver el atardecer",
      latitude: 14.7408,
      longitude: -91.1567,
    },
    participants: [
      { name: "Elena", budget: "medium", preferences: "kayak o lancha" },
      { name: "Tomás", budget: "medium", preferences: "comer rico frente al lago" },
    ],
  },
  {
    name: "noche-de-tragos-cayala",
    event: {
      id,
      title: "Noche de tragos",
      city: "Paseo Cayalá, Ciudad de Guatemala",
      date: "2026-10-22",
      description: null,
      latitude: 14.6095,
      longitude: -90.487,
    },
    participants: [
      { name: "Gaby", budget: "high", preferences: "coctelería" },
      { name: "Nico", budget: "high", preferences: "comida japonesa, música en vivo" },
    ],
  },
  {
    name: "estudiantes-centro-historico",
    event: {
      id,
      title: "Tarde de museo",
      city: "Zona 1, Ciudad de Guatemala",
      date: "2026-10-21",
      description: "Somos estudiantes",
      latitude: 14.6417,
      longitude: -90.5133,
    },
    participants: [
      { name: "Iris", budget: "low", preferences: "museos, historia" },
      { name: "Pablo", budget: "low", preferences: "comida callejera" },
    ],
  },
];
