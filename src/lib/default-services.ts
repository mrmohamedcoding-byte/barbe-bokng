export type DefaultService = {
  id: string;
  name: string;
  description: string;
  price_cents: number;
  duration_minutes: number;
  active: boolean;
  sort_order: number;
};

export const DEFAULT_SERVICES: DefaultService[] = [
  {
    id: "default-classic-haircut",
    name: "Classic Haircut",
    description: "Precision haircut tailored to your style.",
    price_cents: 3500,
    duration_minutes: 45,
    active: true,
    sort_order: 1,
  },
  {
    id: "default-skin-fade",
    name: "Skin Fade",
    description: "Clean fade with sharp detailing.",
    price_cents: 4000,
    duration_minutes: 45,
    active: true,
    sort_order: 2,
  },
  {
    id: "default-buzz-cut",
    name: "Buzz Cut",
    description: "Low-maintenance uniform clipper cut.",
    price_cents: 2500,
    duration_minutes: 30,
    active: true,
    sort_order: 3,
  },
  {
    id: "default-scissor-cut",
    name: "Scissor Cut",
    description: "Textured scissor work for natural shape.",
    price_cents: 4500,
    duration_minutes: 60,
    active: true,
    sort_order: 4,
  },
  {
    id: "default-beard-sculpting",
    name: "Beard Sculpting",
    description: "Beard trim and contour shaping.",
    price_cents: 2500,
    duration_minutes: 30,
    active: true,
    sort_order: 5,
  },
  {
    id: "default-hot-towel-shave",
    name: "Hot Towel Shave",
    description: "Traditional hot towel shave.",
    price_cents: 4000,
    duration_minutes: 45,
    active: true,
    sort_order: 6,
  },
];
