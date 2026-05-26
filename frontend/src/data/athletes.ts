export type Athlete = {
  id: number;
  name: string;
  sport: string;
  country: string;
  avatarId: number;
};

export const athletes: Athlete[] = [
  { id: 1, name: "Maya Hernandez", sport: "Track & Field", country: "USA", avatarId: 5 },
  { id: 2, name: "Liam Okafor", sport: "Basketball", country: "Nigeria", avatarId: 12 },
  { id: 3, name: "Sofia Rossi", sport: "Tennis", country: "Italy", avatarId: 25 },
  { id: 4, name: "Kenji Tanaka", sport: "Gymnastics", country: "Japan", avatarId: 33 },
  { id: 5, name: "Aaliyah Brooks", sport: "Swimming", country: "USA", avatarId: 47 },
  { id: 6, name: "Mateo García", sport: "Soccer", country: "Argentina", avatarId: 52 },
  { id: 7, name: "Priya Iyer", sport: "Badminton", country: "India", avatarId: 16 },
  { id: 8, name: "Noah Andersen", sport: "Cross Country", country: "Norway", avatarId: 60 },
  { id: 9, name: "Zara Mahmoud", sport: "Boxing", country: "Egypt", avatarId: 41 },
  { id: 10, name: "Lucas Müller", sport: "Cycling", country: "Germany", avatarId: 11 },
  { id: 11, name: "Chloe Dubois", sport: "Fencing", country: "France", avatarId: 49 },
  { id: 12, name: "Diego Silva", sport: "Volleyball", country: "Brazil", avatarId: 8 },
];
