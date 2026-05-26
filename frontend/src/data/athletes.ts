export type Athlete = {
  id: string;
  name: string;
  detail: string;
  imageUrl: string;
};

export type Roster = {
  sport: string;
  athletes: Athlete[];
};

const IMAGE_POOL = [
  "/avatar-placeholder.svg",
  "/avatar-placeholder.svg",
  "/avatar-placeholder.svg",
  "/avatar-placeholder.svg",
  "/avatar-placeholder.svg",
];

export const rosters: Roster[] = [
  {
    sport: "Football",
    athletes: [
      { id: "football-1", name: "Patrick Mahomes", detail: "Quarterback", imageUrl: IMAGE_POOL[0] },
      { id: "football-2", name: "Travis Kelce", detail: "Tight End", imageUrl: IMAGE_POOL[1] },
      { id: "football-3", name: "Lamar Jackson", detail: "Quarterback", imageUrl: IMAGE_POOL[2] },
      { id: "football-4", name: "Josh Allen", detail: "Quarterback", imageUrl: IMAGE_POOL[3] },
      { id: "football-5", name: "Justin Jefferson", detail: "Wide Receiver", imageUrl: IMAGE_POOL[4] },
      { id: "football-6", name: "Christian McCaffrey", detail: "Running Back", imageUrl: IMAGE_POOL[0] },
      { id: "football-7", name: "Tyreek Hill", detail: "Wide Receiver", imageUrl: IMAGE_POOL[1] },
      { id: "football-8", name: "Joe Burrow", detail: "Quarterback", imageUrl: IMAGE_POOL[2] },
      { id: "football-9", name: "Micah Parsons", detail: "Linebacker", imageUrl: IMAGE_POOL[3] },
      { id: "football-10", name: "T. J. Watt", detail: "Outside Linebacker", imageUrl: IMAGE_POOL[4] },
      { id: "football-11", name: "Saquon Barkley", detail: "Running Back", imageUrl: IMAGE_POOL[0] },
      { id: "football-12", name: "Jalen Hurts", detail: "Quarterback", imageUrl: IMAGE_POOL[1] },
      { id: "football-13", name: "Aaron Rodgers", detail: "Quarterback", imageUrl: IMAGE_POOL[2] },
      { id: "football-14", name: "Derrick Henry", detail: "Running Back", imageUrl: IMAGE_POOL[3] },
      { id: "football-15", name: "Davante Adams", detail: "Wide Receiver", imageUrl: IMAGE_POOL[4] },
      { id: "football-16", name: "Stefon Diggs", detail: "Wide Receiver", imageUrl: IMAGE_POOL[0] },
      { id: "football-17", name: "Nick Bosa", detail: "Defensive End", imageUrl: IMAGE_POOL[1] },
      { id: "football-18", name: "Myles Garrett", detail: "Defensive End", imageUrl: IMAGE_POOL[2] },
      { id: "football-19", name: "Jared Goff", detail: "Quarterback", imageUrl: IMAGE_POOL[3] },
      { id: "football-20", name: "CeeDee Lamb", detail: "Wide Receiver", imageUrl: IMAGE_POOL[4] },
    ],
  },
  {
    sport: "Soccer",
    athletes: [
      { id: "soccer-1", name: "Lionel Messi", detail: "Forward", imageUrl: IMAGE_POOL[0] },
      { id: "soccer-2", name: "Cristiano Ronaldo", detail: "Forward", imageUrl: IMAGE_POOL[1] },
      { id: "soccer-3", name: "Kylian Mbappé", detail: "Forward", imageUrl: IMAGE_POOL[2] },
      { id: "soccer-4", name: "Erling Haaland", detail: "Forward", imageUrl: IMAGE_POOL[3] },
      { id: "soccer-5", name: "Vinícius Júnior", detail: "Forward", imageUrl: IMAGE_POOL[4] },
      { id: "soccer-6", name: "Jude Bellingham", detail: "Midfielder", imageUrl: IMAGE_POOL[0] },
      { id: "soccer-7", name: "Kevin De Bruyne", detail: "Midfielder", imageUrl: IMAGE_POOL[1] },
      { id: "soccer-8", name: "Mohamed Salah", detail: "Forward", imageUrl: IMAGE_POOL[2] },
      { id: "soccer-9", name: "Harry Kane", detail: "Forward", imageUrl: IMAGE_POOL[3] },
      { id: "soccer-10", name: "Robert Lewandowski", detail: "Forward", imageUrl: IMAGE_POOL[4] },
      { id: "soccer-11", name: "Luka Modrić", detail: "Midfielder", imageUrl: IMAGE_POOL[0] },
      { id: "soccer-12", name: "Bukayo Saka", detail: "Forward", imageUrl: IMAGE_POOL[1] },
      { id: "soccer-13", name: "Neymar", detail: "Forward", imageUrl: IMAGE_POOL[2] },
      { id: "soccer-14", name: "Karim Benzema", detail: "Forward", imageUrl: IMAGE_POOL[3] },
      { id: "soccer-15", name: "Rodri", detail: "Midfielder", imageUrl: IMAGE_POOL[4] },
      { id: "soccer-16", name: "Phil Foden", detail: "Midfielder", imageUrl: IMAGE_POOL[0] },
      { id: "soccer-17", name: "Lautaro Martínez", detail: "Forward", imageUrl: IMAGE_POOL[1] },
      { id: "soccer-18", name: "Antoine Griezmann", detail: "Forward", imageUrl: IMAGE_POOL[2] },
      { id: "soccer-19", name: "Son Heung-min", detail: "Forward", imageUrl: IMAGE_POOL[3] },
      { id: "soccer-20", name: "Bruno Fernandes", detail: "Midfielder", imageUrl: IMAGE_POOL[4] },
    ],
  },
  {
    sport: "Swimming",
    athletes: [
      { id: "swimming-1", name: "Michael Phelps", detail: "Butterfly", imageUrl: IMAGE_POOL[0] },
      { id: "swimming-2", name: "Katie Ledecky", detail: "Freestyle", imageUrl: IMAGE_POOL[1] },
      { id: "swimming-3", name: "Caeleb Dressel", detail: "Freestyle", imageUrl: IMAGE_POOL[2] },
      { id: "swimming-4", name: "Adam Peaty", detail: "Breaststroke", imageUrl: IMAGE_POOL[3] },
      { id: "swimming-5", name: "Sarah Sjöström", detail: "Freestyle", imageUrl: IMAGE_POOL[4] },
      { id: "swimming-6", name: "Ryan Murphy", detail: "Backstroke", imageUrl: IMAGE_POOL[0] },
      { id: "swimming-7", name: "Léon Marchand", detail: "Individual Medley", imageUrl: IMAGE_POOL[1] },
      { id: "swimming-8", name: "Penny Oleksiak", detail: "Freestyle", imageUrl: IMAGE_POOL[2] },
      { id: "swimming-9", name: "David Popovici", detail: "Freestyle", imageUrl: IMAGE_POOL[3] },
      { id: "swimming-10", name: "Kaylee McKeown", detail: "Backstroke", imageUrl: IMAGE_POOL[4] },
      { id: "swimming-11", name: "Cate Campbell", detail: "Freestyle", imageUrl: IMAGE_POOL[0] },
      { id: "swimming-12", name: "Emma McKeon", detail: "Freestyle", imageUrl: IMAGE_POOL[1] },
      { id: "swimming-13", name: "Sun Yang", detail: "Freestyle", imageUrl: IMAGE_POOL[2] },
      { id: "swimming-14", name: "Katinka Hosszú", detail: "Individual Medley", imageUrl: IMAGE_POOL[3] },
      { id: "swimming-15", name: "Florent Manaudou", detail: "Freestyle", imageUrl: IMAGE_POOL[4] },
      { id: "swimming-16", name: "Pan Zhanle", detail: "Freestyle", imageUrl: IMAGE_POOL[0] },
      { id: "swimming-17", name: "Bobby Finke", detail: "Distance Freestyle", imageUrl: IMAGE_POOL[1] },
      { id: "swimming-18", name: "Federica Pellegrini", detail: "Freestyle", imageUrl: IMAGE_POOL[2] },
      { id: "swimming-19", name: "Simone Manuel", detail: "Freestyle", imageUrl: IMAGE_POOL[3] },
      { id: "swimming-20", name: "Regan Smith", detail: "Backstroke", imageUrl: IMAGE_POOL[4] },
    ],
  },
];
