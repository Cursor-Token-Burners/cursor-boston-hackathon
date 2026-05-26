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

export const rosters: Roster[] = [
  {
    sport: "Football",
    athletes: [
      { id: "football-1", name: "Patrick Mahomes", detail: "QB · Chiefs", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Patrick_Mahomes_%2851615475056%29.jpg/330px-Patrick_Mahomes_%2851615475056%29.jpg" },
      { id: "football-2", name: "Travis Kelce", detail: "TE · Chiefs", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Travis_Kelce_in_the_Oval_Office_of_the_White_House_on_June_5%2C_2023_-_P20230605AS-0902_%28cropped%29.jpg/330px-Travis_Kelce_in_the_Oval_Office_of_the_White_House_on_June_5%2C_2023_-_P20230605AS-0902_%28cropped%29.jpg" },
      { id: "football-3", name: "Lamar Jackson", detail: "QB · Ravens", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/149th_Preakness_%2853731145142%29_%28cropped%29.jpg/330px-149th_Preakness_%2853731145142%29_%28cropped%29.jpg" },
      { id: "football-4", name: "Josh Allen", detail: "QB · Bills", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Josh_Allen_SEPT2021_%28cropped2%29.jpg/330px-Josh_Allen_SEPT2021_%28cropped2%29.jpg" },
      { id: "football-5", name: "Justin Jefferson", detail: "WR · Vikings", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Jefferson_2022.jpg/330px-Jefferson_2022.jpg" },
      { id: "football-6", name: "Christian McCaffrey", detail: "RB · 49ers", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Christian_McCaffrey_2019.jpg/330px-Christian_McCaffrey_2019.jpg" },
      { id: "football-7", name: "Tyreek Hill", detail: "WR · Dolphins", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Tyreek_Hill_OCT2021_%28cropped%29.jpg/330px-Tyreek_Hill_OCT2021_%28cropped%29.jpg" },
      { id: "football-8", name: "Joe Burrow", detail: "QB · Bengals", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Joe_Burrow_-_Lordstown_interview_-_1_%28cropped%29.png/330px-Joe_Burrow_-_Lordstown_interview_-_1_%28cropped%29.png" },
      { id: "football-9", name: "Micah Parsons", detail: "LB · Packers", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/2025_Commanders_at_Packers_Micah_Parsons_%28cropped%29.jpg/330px-2025_Commanders_at_Packers_Micah_Parsons_%28cropped%29.jpg" },
      { id: "football-10", name: "T. J. Watt", detail: "OLB · Steelers", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/T.J._Watt_%2851653079007%29_Cropped.jpg/330px-T.J._Watt_%2851653079007%29_Cropped.jpg" },
      { id: "football-11", name: "Saquon Barkley", detail: "RB · Eagles", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Saquon_Barkley_112024.jpg/330px-Saquon_Barkley_112024.jpg" },
      { id: "football-12", name: "Jalen Hurts", detail: "QB · Eagles", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Jalen_Hurts_11-14-22_%28cropped%29.jpg/330px-Jalen_Hurts_11-14-22_%28cropped%29.jpg" },
      { id: "football-13", name: "Aaron Rodgers", detail: "QB · Steelers", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Aaron_Rodgers_OCT2022_%28cropped%29.jpg/330px-Aaron_Rodgers_OCT2022_%28cropped%29.jpg" },
      { id: "football-14", name: "Derrick Henry", detail: "RB · Ravens", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Derrick_Henry_OCT2022_%28cropped%29.jpg/330px-Derrick_Henry_OCT2022_%28cropped%29.jpg" },
      { id: "football-15", name: "Davante Adams", detail: "WR · Rams", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Davante_Adams_Packers_vs_WFT_OCT2021_%28cropped%29.jpg/330px-Davante_Adams_Packers_vs_WFT_OCT2021_%28cropped%29.jpg" },
      { id: "football-16", name: "Stefon Diggs", detail: "WR · Patriots", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Stefon_Diggs_SEP2021_%28cropped%29.jpg/330px-Stefon_Diggs_SEP2021_%28cropped%29.jpg" },
      { id: "football-17", name: "Nick Bosa", detail: "DE · 49ers", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Nick_Bosa_vs_Redskins_2019.jpg/330px-Nick_Bosa_vs_Redskins_2019.jpg" },
      { id: "football-18", name: "Myles Garrett", detail: "DE · Browns", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Myles_Garrett_%282021%29.jpg/330px-Myles_Garrett_%282021%29.jpg" },
      { id: "football-19", name: "Jared Goff", detail: "QB · Lions", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Jared_Goff_2022.jpg/330px-Jared_Goff_2022.jpg" },
      { id: "football-20", name: "CeeDee Lamb", detail: "WR · Cowboys", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/CeeDee_Lamb_by_Gage_Skidmore_%28cropped%29.jpg/330px-CeeDee_Lamb_by_Gage_Skidmore_%28cropped%29.jpg" },
    ],
  },
  {
    sport: "Soccer",
    athletes: [
      { id: "soccer-1", name: "Lionel Messi", detail: "FW · Inter Miami", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Lionel_Messi_White_House_2026_%283x4_cropped%29.jpg/330px-Lionel_Messi_White_House_2026_%283x4_cropped%29.jpg" },
      { id: "soccer-2", name: "Cristiano Ronaldo", detail: "FW · Al Nassr", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/President_Donald_Trump_meets_with_Cristiano_Ronaldo_in_the_Oval_Office_%2854933344262%29_%28cropped_and_rotated%29.jpg/330px-President_Donald_Trump_meets_with_Cristiano_Ronaldo_in_the_Oval_Office_%2854933344262%29_%28cropped_and_rotated%29.jpg" },
      { id: "soccer-3", name: "Kylian Mbappé", detail: "FW · Real Madrid", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Picture_with_Mbapp%C3%A9_%28cropped_and_rotated%29.jpg/330px-Picture_with_Mbapp%C3%A9_%28cropped_and_rotated%29.jpg" },
      { id: "soccer-4", name: "Erling Haaland", detail: "FW · Man City", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Erling_Haaland_June_2025.jpg/330px-Erling_Haaland_June_2025.jpg" },
      { id: "soccer-5", name: "Vinícius Júnior", detail: "FW · Real Madrid", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/2023_05_06_Final_de_la_Copa_del_Rey_-_52879242230_%28cropped%29.jpg/330px-2023_05_06_Final_de_la_Copa_del_Rey_-_52879242230_%28cropped%29.jpg" },
      { id: "soccer-6", name: "Jude Bellingham", detail: "MF · Real Madrid", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/25th_Laureus_World_Sports_Awards_-_Red_Carpet_-_Jude_Bellingham_-_240422_190551-2_%28cropped%29.jpg/330px-25th_Laureus_World_Sports_Awards_-_Red_Carpet_-_Jude_Bellingham_-_240422_190551-2_%28cropped%29.jpg" },
      { id: "soccer-7", name: "Kevin De Bruyne", detail: "MF · Napoli", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Kevin_De_Bruyne_USMNT_v_Belgium_Mar_28_2026-64_%28cropped%29.jpg/330px-Kevin_De_Bruyne_USMNT_v_Belgium_Mar_28_2026-64_%28cropped%29.jpg" },
      { id: "soccer-8", name: "Mohamed Salah", detail: "FW · Liverpool", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Mohamed_Salah_2018.jpg/330px-Mohamed_Salah_2018.jpg" },
      { id: "soccer-9", name: "Harry Kane", detail: "FW · Bayern Munich", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Harry_Kane_on_October_10%2C_2023.jpg/330px-Harry_Kane_on_October_10%2C_2023.jpg" },
      { id: "soccer-10", name: "Robert Lewandowski", detail: "FW · Barcelona", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/2019147183134_2019-05-27_Fussball_1.FC_Kaiserslautern_vs_FC_Bayern_M%C3%BCnchen_-_Sven_-_1D_X_MK_II_-_0228_-_B70I8527_%28cropped%29.jpg/330px-2019147183134_2019-05-27_Fussball_1.FC_Kaiserslautern_vs_FC_Bayern_M%C3%BCnchen_-_Sven_-_1D_X_MK_II_-_0228_-_B70I8527_%28cropped%29.jpg" },
      { id: "soccer-11", name: "Luka Modrić", detail: "MF · AC Milan", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Ofrenda_de_la_Liga_y_la_Champions-57-L.Mill%C3%A1n_%2852109310843%29_%28Luka_Modri%C4%87%29.jpg/330px-Ofrenda_de_la_Liga_y_la_Champions-57-L.Mill%C3%A1n_%2852109310843%29_%28Luka_Modri%C4%87%29.jpg" },
      { id: "soccer-12", name: "Bukayo Saka", detail: "FW · Arsenal", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/1_bukayo_saka_arsenal_2025_%28cropped%29.jpg/330px-1_bukayo_saka_arsenal_2025_%28cropped%29.jpg" },
      { id: "soccer-13", name: "Neymar", detail: "FW · Santos", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Neymar_Jr._with_Al_Hilal%2C_3_October_2023_-_03_%28cropped%29.jpg/330px-Neymar_Jr._with_Al_Hilal%2C_3_October_2023_-_03_%28cropped%29.jpg" },
      { id: "soccer-14", name: "Karim Benzema", detail: "FW · Al Ittihad", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Karim_Benzema_Pick.jpg/330px-Karim_Benzema_Pick.jpg" },
      { id: "soccer-15", name: "Rodri", detail: "MF · Man City", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/RODRI_-_SWE_vs_ESP_-_UEFA_EURO_2020_QUALIFIERS_-_2019.10.15_%28cropped%29.jpg/330px-RODRI_-_SWE_vs_ESP_-_UEFA_EURO_2020_QUALIFIERS_-_2019.10.15_%28cropped%29.jpg" },
      { id: "soccer-16", name: "Phil Foden", detail: "MF · Man City", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/2023-10-04_Fu%C3%9Fball%2C_M%C3%A4nner%2C_UEFA_Champions_League%2C_RB_Leipzig_-_Manchester_City_FC_1DX_2613%2C_Phil_Foden.jpg/330px-2023-10-04_Fu%C3%9Fball%2C_M%C3%A4nner%2C_UEFA_Champions_League%2C_RB_Leipzig_-_Manchester_City_FC_1DX_2613%2C_Phil_Foden.jpg" },
      { id: "soccer-17", name: "Lautaro Martínez", detail: "FW · Inter Milan", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Lautaro_Martinez_ARGENTINA_VS_VENEZUELA_2017.jpg/330px-Lautaro_Martinez_ARGENTINA_VS_VENEZUELA_2017.jpg" },
      { id: "soccer-18", name: "Antoine Griezmann", detail: "FW · Atlético Madrid", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/FRA-ARG_%2810%29_%28cropped%29.jpg/330px-FRA-ARG_%2810%29_%28cropped%29.jpg" },
      { id: "soccer-19", name: "Son Heung-min", detail: "FW · LAFC", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/BFA_2023_-2_Heung-Min_Son_%28cropped%29.jpg/330px-BFA_2023_-2_Heung-Min_Son_%28cropped%29.jpg" },
      { id: "soccer-20", name: "Bruno Fernandes", detail: "MF · Man United", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Bruno_Fernandes_USMNT_v_Portugal_Mar_31_2026-27_%28cropped%29.jpg/330px-Bruno_Fernandes_USMNT_v_Portugal_Mar_31_2026-27_%28cropped%29.jpg" },
    ],
  },
  {
    sport: "Swimming",
    athletes: [
      { id: "swimming-1", name: "Michael Phelps", detail: "Butterfly · USA", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Michael_Phelps_Rio_Olympics_2016.jpg/330px-Michael_Phelps_Rio_Olympics_2016.jpg" },
      { id: "swimming-2", name: "Katie Ledecky", detail: "Freestyle · USA", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Katie_Ledecky_at_the_2023_Golden_Goggle_Awards.jpg/330px-Katie_Ledecky_at_the_2023_Golden_Goggle_Awards.jpg" },
      { id: "swimming-3", name: "Caeleb Dressel", detail: "Freestyle · USA", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Caeleb_Dressel_before_winning_100_fly_%2842769914221%29_%28cropped%29.jpg/330px-Caeleb_Dressel_before_winning_100_fly_%2842769914221%29_%28cropped%29.jpg" },
      { id: "swimming-4", name: "Adam Peaty", detail: "Breaststroke · GB", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Adam_Peaty_Olympics_2016_%28cropped%29.jpg/330px-Adam_Peaty_Olympics_2016_%28cropped%29.jpg" },
      { id: "swimming-5", name: "Sarah Sjöström", detail: "Freestyle · Sweden", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Sarah_Sj%C3%B6str%C3%B6m_2013_%28cropped%29.jpg/330px-Sarah_Sj%C3%B6str%C3%B6m_2013_%28cropped%29.jpg" },
      { id: "swimming-6", name: "Ryan Murphy", detail: "Backstroke · USA", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Ryan_Murphy_poses_after_winning_200_back_-_vertical_%2842052325364%29.jpg/330px-Ryan_Murphy_poses_after_winning_200_back_-_vertical_%2842052325364%29.jpg" },
      { id: "swimming-7", name: "Léon Marchand", detail: "IM · France", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/L%C3%A9on_Marchand%2C_2023_Pac-12_Championships%2C_400_yard_individual_medley_preliminaries_-_3_March_2023_%28cropped%29.jpg/330px-L%C3%A9on_Marchand%2C_2023_Pac-12_Championships%2C_400_yard_individual_medley_preliminaries_-_3_March_2023_%28cropped%29.jpg" },
      { id: "swimming-8", name: "Penny Oleksiak", detail: "Freestyle · Canada", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Penny_Oleksiak_JUNE2023_%28cropped%29.jpg/330px-Penny_Oleksiak_JUNE2023_%28cropped%29.jpg" },
      { id: "swimming-9", name: "David Popovici", detail: "Freestyle · Romania", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/David_Popovici_%28ROM%29_2024.jpg/330px-David_Popovici_%28ROM%29_2024.jpg" },
      { id: "swimming-10", name: "Kaylee McKeown", detail: "Backstroke · Australia", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/2018-10-10_Swimming_Training_at_2018_Summer_Youth_Olympics_by_Sandro_Halank%E2%80%93009.jpg/330px-2018-10-10_Swimming_Training_at_2018_Summer_Youth_Olympics_by_Sandro_Halank%E2%80%93009.jpg" },
      { id: "swimming-11", name: "Cate Campbell", detail: "Freestyle · Australia", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e9/Cate_Campbell_-_Kazan_2015_-_Victory_Ceremony_100m_freestyle.jpg" },
      { id: "swimming-12", name: "Emma McKeon", detail: "Freestyle · Australia", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Emma_McKeon_-_2021_World_Cup_-_01.jpg/330px-Emma_McKeon_-_2021_World_Cup_-_01.jpg" },
      { id: "swimming-13", name: "Sun Yang", detail: "Freestyle · China", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Incheon_AsianGames_Swimming_34.jpg/330px-Incheon_AsianGames_Swimming_34.jpg" },
      { id: "swimming-14", name: "Katinka Hosszú", detail: "IM · Hungary", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Kazan_2015_-_Hossz%C3%BA_Katinka_200m_backstroke.JPG/330px-Kazan_2015_-_Hossz%C3%BA_Katinka_200m_backstroke.JPG" },
      { id: "swimming-15", name: "Florent Manaudou", detail: "Freestyle · France", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Florent_Manaudou_%28FRA%29_2015.JPG/330px-Florent_Manaudou_%28FRA%29_2015.JPG" },
      { id: "swimming-16", name: "Pan Zhanle", detail: "Freestyle · China", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Pan_Zhanle_%28%E6%BD%98%E5%B1%95%E4%B9%90%29_at_the_2024_Summer_Olympics_in_Paris_in_August_2024.jpg/330px-Pan_Zhanle_%28%E6%BD%98%E5%B1%95%E4%B9%90%29_at_the_2024_Summer_Olympics_in_Paris_in_August_2024.jpg" },
      { id: "swimming-17", name: "Bobby Finke", detail: "Distance · USA", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Robert_Finke_%28USA%29_2018.jpg/330px-Robert_Finke_%28USA%29_2018.jpg" },
      { id: "swimming-18", name: "Federica Pellegrini", detail: "Freestyle · Italy", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Federica_Pellegrini_e_Luca_Marin_%28cropped%29.jpg/330px-Federica_Pellegrini_e_Luca_Marin_%28cropped%29.jpg" },
      { id: "swimming-19", name: "Simone Manuel", detail: "Freestyle · USA", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Kazan_2015_-_Simone_Manuel.jpg/330px-Kazan_2015_-_Simone_Manuel.jpg" },
      { id: "swimming-20", name: "Regan Smith", detail: "Backstroke · USA", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Regan_Smith_%28USA%29_2018.jpg/330px-Regan_Smith_%28USA%29_2018.jpg" },
    ],
  },
];
