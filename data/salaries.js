// 自動生成ファイル（手で編集しない）。.claude/skills/nba-data-update/salaries.mjs で更新する。
// 各チームの今季の年俸（サラリーキャップ上の金額）。total: チーム合計（デッドマネー込み）、deadMoney: うちウェイブした選手の分、players: 金額の大きい順
// players[].until: 契約の最終シーズンが終わる年（2026-27 で切れるなら 2027。分からなければ null）、option: 最終シーズンのオプション（PO / TO / MO。あるときだけ）
window.NBA_SALARIES = {
 "updatedAt": "2026-11-20",
 "season": "2026-27",
 "sourceAsOf": "2026-11-17",
 "source": {
  "name": "Over the Apron",
  "url": "https://overtheapron.com/league"
 },
 "crossCheck": {
  "name": "Hoops Nightly",
  "url": "https://hoopsnightly.com/",
  "compared": 430,
  "matched": 388
 },
 "entries": 435,
 "teams": {
  "ATL": {
   "total": 198669512,
   "deadMoney": 5158080,
   "players": [
    {
     "name": "Jalen Johnson",
     "salary": 30000000,
     "type": "RK-EXT",
     "nonGuaranteed": false,
     "until": 2030
    },
    {
     "name": "Dyson Daniels",
     "salary": 25000000,
     "type": "RK-EXT",
     "nonGuaranteed": false,
     "until": 2030
    },
    {
     "name": "C.J. McCollum",
     "salary": 21000000,
     "type": "VET-EXT",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Luguentz Dort",
     "salary": 17722222,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Onyeka Okongwu",
     "salary": 16120000,
     "type": "RK-EXT",
     "nonGuaranteed": false,
     "until": 2028
    },
    {
     "name": "Nickeil Alexander-Walker",
     "salary": 14403710,
     "type": "S&T",
     "nonGuaranteed": false,
     "until": 2029
    },
    {
     "name": "Dorian Finney-Smith",
     "salary": 14196974,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2029
    },
    {
     "name": "Jock Landale",
     "salary": 14100000,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Corey Kispert",
     "salary": 13975000,
     "type": "RK-EXT",
     "nonGuaranteed": false,
     "until": 2029
    },
    {
     "name": "Aaron Wiggins",
     "salary": 9028038,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2029
    },
    {
     "name": "Kingston Flemings",
     "salary": 7348680,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2030
    },
    {
     "name": "Zuby Ejiofor",
     "salary": 3453360,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2030
    },
    {
     "name": "Asa Newell",
     "salary": 3399480,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2029
    },
    {
     "name": "Mouhamed Gueye",
     "salary": 2406205,
     "type": "RK-2ND",
     "nonGuaranteed": true,
     "until": 2027
    },
    {
     "name": "Henri Veesaar",
     "salary": 1357763,
     "type": "RK-2ND",
     "nonGuaranteed": false,
     "until": 2030,
     "option": "TO"
    }
   ]
  },
  "BKN": {
   "total": 160056358,
   "deadMoney": 0,
   "players": [
    {
     "name": "Michael Porter Jr.",
     "salary": 40806150,
     "type": "DRK-EXT",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Julius Randle",
     "salary": 33333334,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2028
    },
    {
     "name": "Terance Mann",
     "salary": 15500000,
     "type": "VET-EXT",
     "nonGuaranteed": false,
     "until": 2028
    },
    {
     "name": "Day'Ron Sharpe",
     "salary": 10000000,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2028,
     "option": "TO"
    },
    {
     "name": "Keon Ellis",
     "salary": 9000000,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2028,
     "option": "MO"
    },
    {
     "name": "Moritz Wagner",
     "salary": 9000000,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2028,
     "option": "MO"
    },
    {
     "name": "Mikel Brown Jr.",
     "salary": 8787000,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2030
    },
    {
     "name": "Egor Demin",
     "salary": 7233720,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": null
    },
    {
     "name": "Noah Clowney",
     "salary": 5414034,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Josh Minott",
     "salary": 4500000,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2028,
     "option": "TO"
    },
    {
     "name": "Nolan Traore",
     "salary": 4002000,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2029
    },
    {
     "name": "Drake Powell",
     "salary": 3540600,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2029
    },
    {
     "name": "Ben Saraf",
     "salary": 3028560,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2029
    },
    {
     "name": "Joshua Jefferson",
     "salary": 2969520,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2030
    },
    {
     "name": "Danny Wolf",
     "salary": 2941440,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2029
    }
   ]
  },
  "BOS": {
   "total": 198722406,
   "deadMoney": 0,
   "players": [
    {
     "name": "Jayson Tatum",
     "salary": 58456566,
     "type": "DVET-EXT",
     "nonGuaranteed": false,
     "until": 2030
    },
    {
     "name": "Paul George",
     "salary": 54126380,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2028
    },
    {
     "name": "Derrick White",
     "salary": 30348000,
     "type": "VET-EXT",
     "nonGuaranteed": false,
     "until": 2029
    },
    {
     "name": "Mitchell Robinson",
     "salary": 15044000,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2029,
     "option": "PO"
    },
    {
     "name": "Sam Hauser",
     "salary": 10848215,
     "type": "VET-EXT",
     "nonGuaranteed": false,
     "until": 2029
    },
    {
     "name": "Payton Pritchard",
     "salary": 7767857,
     "type": "RK-EXT",
     "nonGuaranteed": false,
     "until": 2030,
     "option": "MO"
    },
    {
     "name": "Ron Harper Jr.",
     "salary": 3150752,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2030,
     "option": "TO"
    },
    {
     "name": "Chris Cenac Jr.",
     "salary": 2988120,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2030
    },
    {
     "name": "Hugo Gonzalez",
     "salary": 2923560,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2029
    },
    {
     "name": "Luka Garza",
     "salary": 2801346,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Baylor Scheierman",
     "salary": 2744040,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2028
    },
    {
     "name": "Neemias Queta",
     "salary": 2667944,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2031
    },
    {
     "name": "Mike Conley",
     "salary": 2449421,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Jordan Walsh",
     "salary": 2406205,
     "type": "RK-2ND",
     "nonGuaranteed": false,
     "until": 2030,
     "option": "TO"
    }
   ]
  },
  "CHA": {
   "total": 170732110,
   "deadMoney": 9040237,
   "players": [
    {
     "name": "Coby White",
     "salary": 26811593,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2029
    },
    {
     "name": "Naz Reid",
     "salary": 23275862,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2030
    },
    {
     "name": "Grayson Allen",
     "salary": 18125000,
     "type": "VET-EXT",
     "nonGuaranteed": false,
     "until": 2028
    },
    {
     "name": "Brandon Miller",
     "salary": 15104626,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2032
    },
    {
     "name": "Dennis Schröder",
     "salary": 14809200,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2028
    },
    {
     "name": "Grant Williams",
     "salary": 14265750,
     "type": "S&T",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Royce O'Neale",
     "salary": 10875000,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2028
    },
    {
     "name": "Kon Knueppel",
     "salary": 10516560,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2029
    },
    {
     "name": "Tidjane Salaun",
     "salary": 8237880,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Hannes Steinbach",
     "salary": 5227200,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2030
    },
    {
     "name": "Christian Anderson",
     "salary": 4257480,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2030
    },
    {
     "name": "Liam McNeeley",
     "salary": 2902080,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2029
    },
    {
     "name": "Moussa Diabate",
     "salary": 2461462,
     "type": "ROS",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Ryan Kalkbrenner",
     "salary": 2411090,
     "type": "RK-2ND",
     "nonGuaranteed": false,
     "until": 2029
    },
    {
     "name": "Sion James",
     "salary": 2411090,
     "type": "RK-2ND",
     "nonGuaranteed": false,
     "until": 2029
    }
   ]
  },
  "CHI": {
   "total": 167881653,
   "deadMoney": 1061382,
   "players": [
    {
     "name": "Josh Giddey",
     "salary": 25000000,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2029
    },
    {
     "name": "Nicolas Claxton",
     "salary": 23320738,
     "type": "FA",
     "nonGuaranteed": false,
     "until": null
    },
    {
     "name": "Norman Powell",
     "salary": 21500000,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2028,
     "option": "TO"
    },
    {
     "name": "Patrick Williams",
     "salary": 18000000,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2029
    },
    {
     "name": "Isaac Okoro",
     "salary": 11814814,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Caleb Wilson",
     "salary": 10683720,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2030
    },
    {
     "name": "Buddy Hield",
     "salary": 9658536,
     "type": "S&T",
     "nonGuaranteed": false,
     "until": 2028
    },
    {
     "name": "Jalen Smith",
     "salary": 9428571,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Zach Collins",
     "salary": 8500000,
     "type": "VET-EXT",
     "nonGuaranteed": false,
     "until": 2028,
     "option": "TO"
    },
    {
     "name": "Tre Jones",
     "salary": 8000000,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2028
    },
    {
     "name": "Matas Buzelis",
     "salary": 5715360,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2028
    },
    {
     "name": "Noa Essengue",
     "salary": 5701200,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2029
    },
    {
     "name": "Dailyn Swain",
     "salary": 4965480,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2030
    },
    {
     "name": "Leonard Miller",
     "salary": 2406205,
     "type": "RK-2ND",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Orlando Robinson",
     "salary": 2125647,
     "type": "ROS",
     "nonGuaranteed": true,
     "until": 2027
    }
   ]
  },
  "CLE": {
   "total": 208969955,
   "deadMoney": 2244109,
   "players": [
    {
     "name": "Donovan Mitchell",
     "salary": 50105628,
     "type": "VET-EXT",
     "nonGuaranteed": false,
     "until": 2031,
     "option": "PO"
    },
    {
     "name": "Evan Mobley",
     "salary": 50105628,
     "type": "DRK-EXT",
     "nonGuaranteed": false,
     "until": 2030
    },
    {
     "name": "James Harden",
     "salary": 30647619,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2029,
     "option": "PO"
    },
    {
     "name": "Jarrett Allen",
     "salary": 28000000,
     "type": "VET-EXT",
     "nonGuaranteed": false,
     "until": 2029
    },
    {
     "name": "Peyton Watson",
     "salary": 20465116,
     "type": "S&T",
     "nonGuaranteed": false,
     "until": null
    },
    {
     "name": "Sam Merrill",
     "salary": 9160715,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2029
    },
    {
     "name": "Jaylon Tyson",
     "salary": 3658560,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2028
    },
    {
     "name": "Mario Hezonja",
     "salary": 2449421,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Thomas Bryant",
     "salary": 2449421,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Nae'qwan Tomlin",
     "salary": 2411090,
     "type": "ROS",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Craig Porter Jr.",
     "salary": 2406205,
     "type": "ROS",
     "nonGuaranteed": true,
     "until": 2027
    },
    {
     "name": "Tyrese Proctor",
     "salary": 2150917,
     "type": "RK-2ND",
     "nonGuaranteed": false,
     "until": 2029
    },
    {
     "name": "Khalifa Diop",
     "salary": 1357763,
     "type": "RK-2ND",
     "nonGuaranteed": false,
     "until": 2030,
     "option": "TO"
    },
    {
     "name": "Meleek Thomas",
     "salary": 1357763,
     "type": "RK-2ND",
     "nonGuaranteed": false,
     "until": 2030
    }
   ]
  },
  "DAL": {
   "total": 189066094,
   "deadMoney": 11871532,
   "players": [
    {
     "name": "Kyrie Irving",
     "salary": 39491282,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2028
    },
    {
     "name": "PJ Washington",
     "salary": 19813044,
     "type": "VET-EXT",
     "nonGuaranteed": false,
     "until": 2030
    },
    {
     "name": "Daniel Gafford",
     "salary": 17263584,
     "type": "VET-EXT",
     "nonGuaranteed": false,
     "until": 2029
    },
    {
     "name": "Santi Aldama",
     "salary": 17007043,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2028
    },
    {
     "name": "Cooper Flagg",
     "salary": 14517480,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2029
    },
    {
     "name": "Zaccharie Risacher",
     "salary": 13826040,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2028
    },
    {
     "name": "Caleb Martin",
     "salary": 10001494,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2028
    },
    {
     "name": "Naji Marshall",
     "salary": 9428571,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2030
    },
    {
     "name": "Max Christie",
     "salary": 8285714,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2028
    },
    {
     "name": "Dereck Lively II",
     "salary": 7239131,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Morez Johnson Jr.",
     "salary": 6754800,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2030
    },
    {
     "name": "Marcus Sasser",
     "salary": 5198983,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Sergio de Larrea",
     "salary": 3182280,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2030
    },
    {
     "name": "Tarik Biberovic",
     "salary": 3000000,
     "type": "RK",
     "nonGuaranteed": false,
     "until": 2028,
     "option": "TO"
    },
    {
     "name": "Moussa Cisse",
     "salary": 2185116,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2028
    }
   ]
  },
  "DEN": {
   "total": 218127179,
   "deadMoney": 666667,
   "players": [
    {
     "name": "Nikola Jokic",
     "salary": 59033114,
     "type": "DVET-EXT",
     "nonGuaranteed": false,
     "until": 2028
    },
    {
     "name": "Jamal Murray",
     "salary": 50105628,
     "type": "VET-EXT",
     "nonGuaranteed": false,
     "until": 2029
    },
    {
     "name": "Aaron Gordon",
     "salary": 31978037,
     "type": "VET-EXT",
     "nonGuaranteed": false,
     "until": 2029
    },
    {
     "name": "Cameron Johnson",
     "salary": 23062500,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Christian Braun",
     "salary": 21551726,
     "type": "RK-EXT",
     "nonGuaranteed": false,
     "until": 2031
    },
    {
     "name": "Zeke Nnaji",
     "salary": 7466667,
     "type": "RK-EXT",
     "nonGuaranteed": false,
     "until": 2028
    },
    {
     "name": "Spencer Jones",
     "salary": 6000000,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2028
    },
    {
     "name": "Julian Strawther",
     "salary": 4826931,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "DaRon Holmes II",
     "salary": 3372120,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "DeMar DeRozan",
     "salary": 2449421,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Marvin Bagley III",
     "salary": 2449421,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Tyus Jones",
     "salary": 2449421,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Alpha Diallo",
     "salary": 1357763,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Trevon Brazile",
     "salary": 1357763,
     "type": "RK-2ND",
     "nonGuaranteed": false,
     "until": 2030
    }
   ]
  },
  "DET": {
   "total": 194498178,
   "deadMoney": 3815861,
   "players": [
    {
     "name": "Cade Cunningham",
     "salary": 50105628,
     "type": "DRK-EXT",
     "nonGuaranteed": false,
     "until": 2030
    },
    {
     "name": "Jalen Duren",
     "salary": 40160643,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2031
    },
    {
     "name": "John Collins",
     "salary": 17000000,
     "type": "S&T",
     "nonGuaranteed": false,
     "until": 2029
    },
    {
     "name": "Duncan Robinson",
     "salary": 15992957,
     "type": "S&T",
     "nonGuaranteed": false,
     "until": 2028
    },
    {
     "name": "Isaiah Joe",
     "salary": 11323006,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2028
    },
    {
     "name": "Ausar Thompson",
     "salary": 11117925,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2032
    },
    {
     "name": "Kevin Huerter",
     "salary": 9507042,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2029,
     "option": "TO"
    },
    {
     "name": "Ron Holland II",
     "salary": 9069600,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2028
    },
    {
     "name": "Paul Reed",
     "salary": 5602689,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Ebuka Okorie",
     "salary": 4481280,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2030
    },
    {
     "name": "Daniss Jenkins",
     "salary": 4000000,
     "type": "ROS",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Javonte Green",
     "salary": 3943679,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Taurean Prince",
     "salary": 3815861,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Tolu Smith III",
     "salary": 2411090,
     "type": "ROS",
     "nonGuaranteed": true,
     "until": 2027
    },
    {
     "name": "Chaz Lanier",
     "salary": 2150917,
     "type": "RK-2ND",
     "nonGuaranteed": false,
     "until": 2029
    }
   ]
  },
  "GSW": {
   "total": 220838432,
   "deadMoney": 0,
   "players": [
    {
     "name": "Stephen Curry",
     "salary": 62587158,
     "type": "VET-EXT",
     "nonGuaranteed": false,
     "until": 2029,
     "option": "PO"
    },
    {
     "name": "Jimmy Butler",
     "salary": 56832773,
     "type": "VET-EXT",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Draymond Green",
     "salary": 27678571,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Kristaps Porzingis",
     "salary": 20000000,
     "type": "VET-EXT",
     "nonGuaranteed": false,
     "until": 2028,
     "option": "PO"
    },
    {
     "name": "Moses Moody",
     "salary": 12500000,
     "type": "RK-EXT",
     "nonGuaranteed": false,
     "until": 2028
    },
    {
     "name": "Al Horford",
     "salary": 6822000,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2028,
     "option": "PO"
    },
    {
     "name": "Yaxel Lendeborg",
     "salary": 6096240,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2030
    },
    {
     "name": "De'Anthony Melton",
     "salary": 6064000,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2028,
     "option": "PO"
    },
    {
     "name": "Brandin Podziemski",
     "salary": 5679459,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2032,
     "option": "PO"
    },
    {
     "name": "Gui Santos",
     "salary": 4629630,
     "type": "VET-EXT",
     "nonGuaranteed": false,
     "until": 2029
    },
    {
     "name": "Brandon Williams",
     "salary": 2449421,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Charles Bassey",
     "salary": 2449421,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Gary Payton II",
     "salary": 2449421,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Georges Niang",
     "salary": 2449421,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Will Richard",
     "salary": 2150917,
     "type": "RK-2ND",
     "nonGuaranteed": false,
     "until": 2029
    }
   ]
  },
  "HOU": {
   "total": 200413923,
   "deadMoney": 0,
   "players": [
    {
     "name": "Kevin Durant",
     "salary": 43902439,
     "type": "VET-EXT",
     "nonGuaranteed": false,
     "until": 2028
    },
    {
     "name": "Alperen Sengun",
     "salary": 35642202,
     "type": "RK-EXT",
     "nonGuaranteed": false,
     "until": 2030
    },
    {
     "name": "Fred VanVleet",
     "salary": 25000000,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Jabari Smith Jr.",
     "salary": 23643411,
     "type": "RK-EXT",
     "nonGuaranteed": false,
     "until": 2031
    },
    {
     "name": "Tari Eason",
     "salary": 14053356,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2031,
     "option": "PO"
    },
    {
     "name": "Steven Adams",
     "salary": 13000000,
     "type": "VET-EXT",
     "nonGuaranteed": false,
     "until": 2028
    },
    {
     "name": "Amen Thompson",
     "salary": 12258609,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2032
    },
    {
     "name": "Reed Sheppard",
     "salary": 11108880,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2028
    },
    {
     "name": "Clint Capela",
     "salary": 7035000,
     "type": "S&T",
     "nonGuaranteed": false,
     "until": 2028
    },
    {
     "name": "Marcus Smart",
     "salary": 6064000,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2028,
     "option": "PO"
    },
    {
     "name": "Bogdan Bogdanovic",
     "salary": 2449421,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Isaiah Crawford",
     "salary": 2449421,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2030,
     "option": "TO"
    },
    {
     "name": "Jae’Sean Tate",
     "salary": 2449421,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Bruce Thornton",
     "salary": 1357763,
     "type": "RK-2ND",
     "nonGuaranteed": false,
     "until": 2030,
     "option": "TO"
    }
   ]
  },
  "IND": {
   "total": 206299934,
   "deadMoney": 0,
   "players": [
    {
     "name": "Pascal Siakam",
     "salary": 48924624,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2028
    },
    {
     "name": "Tyrese Haliburton",
     "salary": 48924624,
     "type": "DRK-EXT",
     "nonGuaranteed": false,
     "until": 2029
    },
    {
     "name": "Ivica Zubac",
     "salary": 20342140,
     "type": "VET-EXT",
     "nonGuaranteed": false,
     "until": 2028
    },
    {
     "name": "Andrew Nembhard",
     "salary": 19550160,
     "type": "VET-EXT",
     "nonGuaranteed": false,
     "until": 2028
    },
    {
     "name": "Obi Toppin",
     "salary": 15000000,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2028
    },
    {
     "name": "Aaron Nesmith",
     "salary": 11000000,
     "type": "RK-EXT",
     "nonGuaranteed": false,
     "until": 2029
    },
    {
     "name": "T.J. McConnell",
     "salary": 11000000,
     "type": "VET-EXT",
     "nonGuaranteed": false,
     "until": 2029
    },
    {
     "name": "Jarace Walker",
     "salary": 8478542,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Kelly Oubre Jr.",
     "salary": 8050000,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2028
    },
    {
     "name": "Ben Sheppard",
     "salary": 5031669,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Jay Huff",
     "salary": 2667944,
     "type": "",
     "nonGuaranteed": false,
     "until": 2028
    },
    {
     "name": "Quenton Jackson",
     "salary": 2584539,
     "type": "ROS",
     "nonGuaranteed": false,
     "until": 2028
    },
    {
     "name": "Larry Nance Jr.",
     "salary": 2449421,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Johnny Furphy",
     "salary": 2296271,
     "type": "RK-2ND",
     "nonGuaranteed": false,
     "until": 2028
    }
   ]
  },
  "LAC": {
   "total": 183207324,
   "deadMoney": 2291688,
   "players": [
    {
     "name": "Darius Garland",
     "salary": 42166510,
     "type": "DRK-EXT",
     "nonGuaranteed": false,
     "until": 2028
    },
    {
     "name": "Brandon Ingram",
     "salary": 40000000,
     "type": "VET-EXT",
     "nonGuaranteed": false,
     "until": 2028
    },
    {
     "name": "Max Strus",
     "salary": 16660836,
     "type": "S&T",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Rui Hachimura",
     "salary": 14000000,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2028,
     "option": "TO"
    },
    {
     "name": "Derrick Jones Jr.",
     "salary": 10476190,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Keaton Wagler",
     "salary": 9674760,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2030
    },
    {
     "name": "Brook Lopez",
     "salary": 9187500,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Gradey Dick",
     "salary": 7131511,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Isaiah Jackson",
     "salary": 7000000,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2028
    },
    {
     "name": "Bradley Beal",
     "salary": 6424800,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2028,
     "option": "TO"
    },
    {
     "name": "Kris Dunn",
     "salary": 5684800,
     "type": "S&T",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Jordan Miller",
     "salary": 5300000,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2029,
     "option": "TO"
    },
    {
     "name": "Yanic Konan Niederhauser",
     "salary": 2880960,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2029
    },
    {
     "name": "Kobe Sanders",
     "salary": 2622139,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2030
    },
    {
     "name": "Baba Miller",
     "salary": 1705630,
     "type": "RK-2ND",
     "nonGuaranteed": false,
     "until": 2030,
     "option": "TO"
    }
   ]
  },
  "LAL": {
   "total": 200897322,
   "deadMoney": 4201080,
   "players": [
    {
     "name": "Luka Doncic",
     "salary": 49488300,
     "type": "VET-EXT",
     "nonGuaranteed": false,
     "until": 2029
    },
    {
     "name": "Austin Reaves",
     "salary": 41240250,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2030,
     "option": "PO"
    },
    {
     "name": "Walker Kessler",
     "salary": 30108821,
     "type": "S&T",
     "nonGuaranteed": false,
     "until": null
    },
    {
     "name": "Quentin Grimes",
     "salary": 13953489,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2030,
     "option": "PO"
    },
    {
     "name": "Sandro Mamukelashvili",
     "salary": 13000000,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2030,
     "option": "PO"
    },
    {
     "name": "Jarred Vanderbilt",
     "salary": 12428571,
     "type": "VET-EXT",
     "nonGuaranteed": false,
     "until": 2028
    },
    {
     "name": "Collin Sexton",
     "salary": 9366000,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2028,
     "option": "PO"
    },
    {
     "name": "Jaden Hardy",
     "salary": 6000000,
     "type": "VET-EXT",
     "nonGuaranteed": false,
     "until": 2028
    },
    {
     "name": "Jake LaRavia",
     "salary": 6000000,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Cameron Carr",
     "salary": 3315360,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2030
    },
    {
     "name": "Kevon Looney",
     "salary": 2449421,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Matisse Thybulle",
     "salary": 2449421,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Ziaire Williams",
     "salary": 2449421,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Bronny James",
     "salary": 2296271,
     "type": "RK-2ND",
     "nonGuaranteed": false,
     "until": 2028
    },
    {
     "name": "Adou Thiero",
     "salary": 2150917,
     "type": "RK-2ND",
     "nonGuaranteed": false,
     "until": 2028
    }
   ]
  },
  "MEM": {
   "total": 161113773,
   "deadMoney": 40562721,
   "players": [
    {
     "name": "Jerami Grant",
     "salary": 34206898,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2028
    },
    {
     "name": "Isaiah Stewart",
     "salary": 15000000,
     "type": "RK-EXT",
     "nonGuaranteed": false,
     "until": 2028
    },
    {
     "name": "Cameron Boozer",
     "salary": 11849760,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2030
    },
    {
     "name": "Ty Jerome",
     "salary": 9220050,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2028
    },
    {
     "name": "Quinten Post",
     "salary": 9000000,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2029
    },
    {
     "name": "Taylor Hendricks",
     "salary": 7805900,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Zach Edey",
     "salary": 6332760,
     "type": "RK-1ST",
     "nonGuaranteed": true,
     "until": 2028
    },
    {
     "name": "Cedric Coward",
     "salary": 6001080,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2029
    },
    {
     "name": "Kris Murray",
     "salary": 5315004,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Karim Lopez",
     "salary": 3746760,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2030
    },
    {
     "name": "Olivier-Maxence Prosper",
     "salary": 2497812,
     "type": "ROS",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Scotty Pippen Jr.",
     "salary": 2461462,
     "type": "",
     "nonGuaranteed": false,
     "until": 2028
    },
    {
     "name": "Cam Spencer",
     "salary": 2411090,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2029
    },
    {
     "name": "G.G. Jackson",
     "salary": 2406205,
     "type": "ROS",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Jaylen Wells",
     "salary": 2296271,
     "type": "RK-2ND",
     "nonGuaranteed": false,
     "until": 2028
    }
   ]
  },
  "MIA": {
   "total": 206189256,
   "deadMoney": 0,
   "players": [
    {
     "name": "Giannis Antetokounmpo",
     "salary": 58456566,
     "type": "VET-EXT",
     "nonGuaranteed": false,
     "until": 2028
    },
    {
     "name": "Bam Adebayo",
     "salary": 49488300,
     "type": "VET-EXT",
     "nonGuaranteed": false,
     "until": 2029
    },
    {
     "name": "Andrew Wiggins",
     "salary": 30169644,
     "type": "VET-EXT",
     "nonGuaranteed": false,
     "until": 2029,
     "option": "PO"
    },
    {
     "name": "Nikola Jovic",
     "salary": 16200000,
     "type": "RK-EXT",
     "nonGuaranteed": false,
     "until": 2030
    },
    {
     "name": "Bobby Portis",
     "salary": 14521414,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2028
    },
    {
     "name": "Davion Mitchell",
     "salary": 12400000,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Tim Hardaway Jr.",
     "salary": 6065000,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Klay Thompson",
     "salary": 5600000,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2028,
     "option": "PO"
    },
    {
     "name": "Dru Smith",
     "salary": 2584539,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2028
    },
    {
     "name": "Nick Richards",
     "salary": 2449421,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Simone Fontecchio",
     "salary": 2449421,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Pelle Larsson",
     "salary": 2296271,
     "type": "RK-2ND",
     "nonGuaranteed": false,
     "until": 2031,
     "option": "MO"
    },
    {
     "name": "Myron Gardner",
     "salary": 2150917,
     "type": "ROS",
     "nonGuaranteed": false,
     "until": 2028
    },
    {
     "name": "Ryan Conwell",
     "salary": 1357763,
     "type": "RK-2ND",
     "nonGuaranteed": false,
     "until": 2029,
     "option": "TO"
    }
   ]
  },
  "MIL": {
   "total": 188966340,
   "deadMoney": 28573970,
   "players": [
    {
     "name": "Tyler Herro",
     "salary": 33000000,
     "type": "RK-EXT",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Myles Turner",
     "salary": 26584164,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2029
    },
    {
     "name": "Kyle Kuzma",
     "salary": 20490152,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Gary Trent Jr.",
     "salary": 15200000,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2030
    },
    {
     "name": "Caris LeVert",
     "salary": 14809200,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "AJ Green",
     "salary": 10044644,
     "type": "VET-EXT",
     "nonGuaranteed": false,
     "until": 2030
    },
    {
     "name": "Brayden Burries",
     "salary": 6417360,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2030
    },
    {
     "name": "Jaime Jaquez Jr.",
     "salary": 5939141,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Ousmane Dieng",
     "salary": 5750000,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2029,
     "option": "TO"
    },
    {
     "name": "Nate Ament",
     "salary": 5502000,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2030
    },
    {
     "name": "Kel'el Ware",
     "salary": 4654920,
     "type": "RK-1ST",
     "nonGuaranteed": true,
     "until": 2028
    },
    {
     "name": "Ryan Rollins",
     "salary": 4000000,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2028
    },
    {
     "name": "Kasparas Jakucionis",
     "salary": 3841680,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2029
    },
    {
     "name": "Jericho Sims",
     "salary": 2801346,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Bogoljub Marković",
     "salary": 1357763,
     "type": "RK-2ND",
     "nonGuaranteed": false,
     "until": 2030,
     "option": "TO"
    }
   ]
  },
  "MIN": {
   "total": 214930955,
   "deadMoney": 2055001,
   "players": [
    {
     "name": "Anthony Edwards",
     "salary": 48924624,
     "type": "DRK-EXT",
     "nonGuaranteed": false,
     "until": 2029
    },
    {
     "name": "LaMelo Ball",
     "salary": 40770520,
     "type": "DRK-EXT",
     "nonGuaranteed": false,
     "until": 2029
    },
    {
     "name": "Rudy Gobert",
     "salary": 36500000,
     "type": "VET-EXT",
     "nonGuaranteed": false,
     "until": 2028
    },
    {
     "name": "Jaden McDaniels",
     "salary": 26200000,
     "type": "RK-EXT",
     "nonGuaranteed": false,
     "until": 2030
    },
    {
     "name": "Ayo Dosunmu",
     "salary": 19310345,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2031,
     "option": "PO"
    },
    {
     "name": "Donte DiVincenzo",
     "salary": 12535000,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Jonathan Kuminga",
     "salary": 6064000,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2028,
     "option": "PO"
    },
    {
     "name": "Cody Williams",
     "salary": 6015600,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Joan Beringer",
     "salary": 4411200,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2029
    },
    {
     "name": "Jaylen Clark",
     "salary": 3086420,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2029
    },
    {
     "name": "Terrence Shannon Jr.",
     "salary": 2801640,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2028
    },
    {
     "name": "Nah'Shon Hyland",
     "salary": 2449421,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Trey Lyles",
     "salary": 2449421,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Isaiah Evans",
     "salary": 1357763,
     "type": "RK-2ND",
     "nonGuaranteed": false,
     "until": 2030,
     "option": "TO"
    }
   ]
  },
  "NOP": {
   "total": 196369877,
   "deadMoney": 148828,
   "players": [
    {
     "name": "Zion Williamson",
     "salary": 42166510,
     "type": "DRK-EXT",
     "nonGuaranteed": false,
     "until": 2028
    },
    {
     "name": "Jordan Poole",
     "salary": 34044642,
     "type": "RK-EXT",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Dejounte Murray",
     "salary": 32785071,
     "type": "VET-EXT",
     "nonGuaranteed": false,
     "until": 2028
    },
    {
     "name": "Trey Murphy III",
     "salary": 27000000,
     "type": "RK-EXT",
     "nonGuaranteed": false,
     "until": 2029
    },
    {
     "name": "Herb Jones",
     "salary": 14898786,
     "type": "FA",
     "nonGuaranteed": false,
     "until": null
    },
    {
     "name": "Jeremiah Fears",
     "salary": 7896240,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2029
    },
    {
     "name": "Bennedict Mathurin",
     "salary": 7500000,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2028,
     "option": "PO"
    },
    {
     "name": "Saddiq Bey",
     "salary": 6557080,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2030
    },
    {
     "name": "Derik Queen",
     "salary": 5416080,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2029
    },
    {
     "name": "DeAndre Jordan",
     "salary": 3876529,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2028
    },
    {
     "name": "Yves Missi",
     "salary": 3512760,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2028
    },
    {
     "name": "AJ Johnson",
     "salary": 3237120,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": null
    },
    {
     "name": "Bryce McGowens",
     "salary": 2584539,
     "type": "ROS",
     "nonGuaranteed": false,
     "until": 2028
    },
    {
     "name": "Trendon Watford",
     "salary": 2449421,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Karlo Matkovic",
     "salary": 2296271,
     "type": "RK-2ND",
     "nonGuaranteed": false,
     "until": 2027
    }
   ]
  },
  "NYK": {
   "total": 220861653,
   "deadMoney": 0,
   "players": [
    {
     "name": "Karl-Anthony Towns",
     "salary": 57078728,
     "type": "DVET-EXT",
     "nonGuaranteed": false,
     "until": 2028
    },
    {
     "name": "OG Anunoby",
     "salary": 42500000,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2029
    },
    {
     "name": "Jalen Brunson",
     "salary": 37739521,
     "type": "VET-EXT",
     "nonGuaranteed": false,
     "until": 2029
    },
    {
     "name": "Mikal Bridges",
     "salary": 33482145,
     "type": "VET-EXT",
     "nonGuaranteed": false,
     "until": 2030
    },
    {
     "name": "Josh Hart",
     "salary": 20923760,
     "type": "VET-EXT",
     "nonGuaranteed": false,
     "until": 2028
    },
    {
     "name": "Landry Shamet",
     "salary": 5490967,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2030,
     "option": "PO"
    },
    {
     "name": "Jose Alvarado",
     "salary": 4439656,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2029
    },
    {
     "name": "Miles McBride",
     "salary": 3956523,
     "type": "VET-EXT",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Pacome Dadiet",
     "salary": 2983680,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Mohamed Diawara",
     "salary": 2622139,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2030,
     "option": "TO"
    },
    {
     "name": "Andre Drummond",
     "salary": 2449421,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "James Wiseman",
     "salary": 2449421,
     "type": "FA",
     "nonGuaranteed": true,
     "until": 2027
    },
    {
     "name": "Jordan Clarkson",
     "salary": 2449421,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Tyler Kolek",
     "salary": 2296271,
     "type": "RK-2ND",
     "nonGuaranteed": false,
     "until": 2028
    }
   ]
  },
  "OKC": {
   "total": 217648521,
   "deadMoney": 105629,
   "players": [
    {
     "name": "Chet Holmgren",
     "salary": 41240250,
     "type": "rookie-maximum-extension",
     "nonGuaranteed": false,
     "until": 2031
    },
    {
     "name": "Jalen Williams",
     "salary": 41240250,
     "type": "DRK-EXT",
     "nonGuaranteed": false,
     "until": 2031
    },
    {
     "name": "Shai Gilgeous-Alexander",
     "salary": 40806150,
     "type": "DRK-EXT",
     "nonGuaranteed": false,
     "until": 2031
    },
    {
     "name": "Isaiah Hartenstein",
     "salary": 23148148,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2029,
     "option": "MO"
    },
    {
     "name": "Alex Caruso",
     "salary": 19550160,
     "type": "VET-EXT",
     "nonGuaranteed": false,
     "until": 2029
    },
    {
     "name": "Jaylin Williams",
     "salary": 7774648,
     "type": "VET-EXT",
     "nonGuaranteed": false,
     "until": 2028
    },
    {
     "name": "Cason Wallace",
     "salary": 7420806,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2032
    },
    {
     "name": "Aday Mara",
     "salary": 5791680,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2030
    },
    {
     "name": "Nikola Topic",
     "salary": 5429760,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Kenrich Williams",
     "salary": 5000000,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Thomas Sorber",
     "salary": 4887720,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2029
    },
    {
     "name": "Bennett Stirtz",
     "salary": 4717320,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2030
    },
    {
     "name": "Jared McCain",
     "salary": 4422600,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2028
    },
    {
     "name": "Nique Clifford",
     "salary": 3263400,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2029
    },
    {
     "name": "Ajay Mitchell",
     "salary": 2850000,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2028
    }
   ]
  },
  "ORL": {
   "total": 217865321,
   "deadMoney": 8000000,
   "players": [
    {
     "name": "Franz Wagner",
     "salary": 41754690,
     "type": "DRK-EXT",
     "nonGuaranteed": false,
     "until": 2030
    },
    {
     "name": "Paolo Banchero",
     "salary": 41240250,
     "type": "DRK-EXT",
     "nonGuaranteed": false,
     "until": 2031
    },
    {
     "name": "Desmond Bane",
     "salary": 39446090,
     "type": "RK-EXT",
     "nonGuaranteed": false,
     "until": 2029
    },
    {
     "name": "Jalen Suggs",
     "salary": 32400000,
     "type": "RK-EXT",
     "nonGuaranteed": false,
     "until": 2030
    },
    {
     "name": "Wendell Carter Jr.",
     "salary": 18102000,
     "type": "VET-EXT",
     "nonGuaranteed": false,
     "until": 2029
    },
    {
     "name": "Anthony Black",
     "salary": 10106316,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Goga Bitadze",
     "salary": 7608696,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Tristan Da Silva",
     "salary": 3991200,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2028
    },
    {
     "name": "Jase Richardson",
     "salary": 3132360,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2029
    },
    {
     "name": "Jamal Cain",
     "salary": 2584539,
     "type": "ROS",
     "nonGuaranteed": true,
     "until": 2027
    },
    {
     "name": "Jevon Carter",
     "salary": 2449421,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Jonathan Isaac",
     "salary": 2449421,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Nikola Vucevic",
     "salary": 2449421,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Noah Penda",
     "salary": 2150917,
     "type": "RK-2ND",
     "nonGuaranteed": false,
     "until": 2029
    }
   ]
  },
  "PHI": {
   "total": 207186472,
   "deadMoney": 0,
   "players": [
    {
     "name": "Joel Embiid",
     "salary": 57985752,
     "type": "VET-EXT",
     "nonGuaranteed": false,
     "until": 2029
    },
    {
     "name": "Jaylen Brown",
     "salary": 57736350,
     "type": "DVET-EXT",
     "nonGuaranteed": false,
     "until": 2029
    },
    {
     "name": "Tyrese Maxey",
     "salary": 40770520,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2029
    },
    {
     "name": "VJ Edgecombe",
     "salary": 11663880,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2029
    },
    {
     "name": "Dean Wade",
     "salary": 9000000,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2030
    },
    {
     "name": "Anfernee Simons",
     "salary": 6000000,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2028,
     "option": "PO"
    },
    {
     "name": "LeBron James",
     "salary": 3876529,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2028,
     "option": "PO"
    },
    {
     "name": "Labaron Philon Jr.",
     "salary": 3597120,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2030
    },
    {
     "name": "Dominick Barlow",
     "salary": 3415000,
     "type": "ROS",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Ariel Hukporti",
     "salary": 3400000,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Jabari Walker",
     "salary": 2584539,
     "type": "ROS",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Kentavious Caldwell-Pope",
     "salary": 2449421,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Justin Edwards",
     "salary": 2411090,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2028
    },
    {
     "name": "Adem Bona",
     "salary": 2296271,
     "type": "RK-2ND",
     "nonGuaranteed": false,
     "until": 2028
    }
   ]
  },
  "PHX": {
   "total": 213776085,
   "deadMoney": 23197051,
   "players": [
    {
     "name": "Devin Booker",
     "salary": 57078728,
     "type": "DVET-EXT",
     "nonGuaranteed": false,
     "until": 2030
    },
    {
     "name": "Jalen Green",
     "salary": 36251166,
     "type": "RK-EXT",
     "nonGuaranteed": false,
     "until": 2028
    },
    {
     "name": "Miles Bridges",
     "salary": 22826087,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Dillon Brooks",
     "salary": 20992727,
     "type": "S&T",
     "nonGuaranteed": false,
     "until": 2030
    },
    {
     "name": "Mark Williams",
     "salary": 11728395,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2029
    },
    {
     "name": "Collin Gillespie",
     "salary": 10714286,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2030
    },
    {
     "name": "Khaman Maluach",
     "salary": 6316680,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2029
    },
    {
     "name": "Luke Kennard",
     "salary": 6064000,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2028,
     "option": "PO"
    },
    {
     "name": "Jordan Goodwin",
     "salary": 5864198,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2029
    },
    {
     "name": "Koa Peat",
     "salary": 2926800,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2030
    },
    {
     "name": "Ryan Dunn",
     "salary": 2784240,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2028
    },
    {
     "name": "Jamaree Bouyea",
     "salary": 2584539,
     "type": "ROS",
     "nonGuaranteed": true,
     "until": 2027
    },
    {
     "name": "Oso Ighodaro",
     "salary": 2296271,
     "type": "RK-2ND",
     "nonGuaranteed": false,
     "until": 2031
    },
    {
     "name": "Rasheer Fleming",
     "salary": 2150917,
     "type": "RK-2ND",
     "nonGuaranteed": false,
     "until": 2029
    }
   ]
  },
  "POR": {
   "total": 192093473,
   "deadMoney": 268032,
   "players": [
    {
     "name": "Ja Morant",
     "salary": 42166510,
     "type": "DRK-EXT",
     "nonGuaranteed": false,
     "until": 2028
    },
    {
     "name": "Jrue Holiday",
     "salary": 34800000,
     "type": "VET-EXT",
     "nonGuaranteed": false,
     "until": 2028
    },
    {
     "name": "Shaedon Sharpe",
     "salary": 20089287,
     "type": "RK-EXT",
     "nonGuaranteed": false,
     "until": 2030
    },
    {
     "name": "Toumani Camara",
     "salary": 18080358,
     "type": "VET-EXT",
     "nonGuaranteed": false,
     "until": 2030
    },
    {
     "name": "Robert Williams III",
     "salary": 14000000,
     "type": "VET-EXT",
     "nonGuaranteed": false,
     "until": null
    },
    {
     "name": "Scoot Henderson",
     "salary": 13585523,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Damian Lillard",
     "salary": 13398800,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2028
    },
    {
     "name": "Deni Avdija",
     "salary": 13125000,
     "type": "RK-EXT",
     "nonGuaranteed": false,
     "until": 2028
    },
    {
     "name": "Donovan Clingan",
     "salary": 7519920,
     "type": "RK-1ST",
     "nonGuaranteed": true,
     "until": 2028
    },
    {
     "name": "Yang Hansen",
     "salary": 4643520,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2029
    },
    {
     "name": "Micah Potter",
     "salary": 2801346,
     "type": "ROS",
     "nonGuaranteed": true,
     "until": 2027
    },
    {
     "name": "Vit Krejci",
     "salary": 2667944,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2028
    },
    {
     "name": "Sidy Cissoko",
     "salary": 2497812,
     "type": "ROS",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Branden Carlson",
     "salary": 2449421,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2027
    }
   ]
  },
  "SAC": {
   "total": 196156481,
   "deadMoney": 3333332,
   "players": [
    {
     "name": "Zach LaVine",
     "salary": 48967380,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Domantas Sabonis",
     "salary": 45472000,
     "type": "VET-EXT",
     "nonGuaranteed": false,
     "until": 2028
    },
    {
     "name": "De'Andre Hunter",
     "salary": 24910714,
     "type": "RK-EXT",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Keegan Murray",
     "salary": 24137936,
     "type": "RK-EXT",
     "nonGuaranteed": false,
     "until": 2031
    },
    {
     "name": "Malik Monk",
     "salary": 20190035,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2028
    },
    {
     "name": "Darius Acuff Jr.",
     "salary": 8021640,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2030
    },
    {
     "name": "Precious Achiuwa",
     "salary": 5477000,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2028
    },
    {
     "name": "Alex Karaban",
     "salary": 2948280,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2030
    },
    {
     "name": "Ben Simmons",
     "salary": 2449421,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Daeqwon Plowden",
     "salary": 2449421,
     "type": "FA",
     "nonGuaranteed": false,
     "until": null
    },
    {
     "name": "Maxime Raynaud",
     "salary": 2150918,
     "type": "RK-2ND",
     "nonGuaranteed": false,
     "until": 2028
    },
    {
     "name": "Dylan Cardwell",
     "salary": 2150917,
     "type": "ROS",
     "nonGuaranteed": false,
     "until": 2028
    },
    {
     "name": "Mason Plumlee",
     "salary": 2139724,
     "type": "ROS",
     "nonGuaranteed": true,
     "until": 2027
    },
    {
     "name": "Emanuel Sharp",
     "salary": 1357763,
     "type": "RK-2ND",
     "nonGuaranteed": false,
     "until": 2029,
     "option": "TO"
    }
   ]
  },
  "SAS": {
   "total": 198279967,
   "deadMoney": 0,
   "players": [
    {
     "name": "De'Aaron Fox",
     "salary": 49488300,
     "type": "VET-EXT",
     "nonGuaranteed": false,
     "until": 2030
    },
    {
     "name": "Devin Vassell",
     "salary": 27500000,
     "type": "RK-EXT",
     "nonGuaranteed": false,
     "until": 2029
    },
    {
     "name": "Keldon Johnson",
     "salary": 18000000,
     "type": "RK-EXT",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Victor Wembanyama",
     "salary": 16868246,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2032,
     "option": "PO"
    },
    {
     "name": "Julian Champagnie",
     "salary": 15350000,
     "type": "VET-EXT",
     "nonGuaranteed": false,
     "until": null
    },
    {
     "name": "Tobias Harris",
     "salary": 15044000,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2028
    },
    {
     "name": "Dylan Harper",
     "salary": 12989040,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2029
    },
    {
     "name": "Luke Kornet",
     "salary": 10450000,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2029
    },
    {
     "name": "Stephon Castle",
     "salary": 10015920,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2028
    },
    {
     "name": "Harrison Barnes",
     "salary": 8000000,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Carter Bryant",
     "salary": 5145360,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2029
    },
    {
     "name": "Jayden Quaintance",
     "salary": 3902760,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2030
    },
    {
     "name": "Tarris Reed Jr.",
     "salary": 3076920,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2030
    },
    {
     "name": "Jordan McLaughlin",
     "salary": 2449421,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2027
    }
   ]
  },
  "TOR": {
   "total": 201188888,
   "deadMoney": 0,
   "players": [
    {
     "name": "Kawhi Leonard",
     "salary": 50300000,
     "type": "VET-EXT",
     "nonGuaranteed": false,
     "until": 2029,
     "option": "PO"
    },
    {
     "name": "Scottie Barnes",
     "salary": 41754690,
     "type": "DRK-EXT",
     "nonGuaranteed": false,
     "until": 2030
    },
    {
     "name": "Immanuel Quickley",
     "salary": 32500000,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2029
    },
    {
     "name": "R.J. Barrett",
     "salary": 29616071,
     "type": "RK-EXT",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Jakob Poeltl",
     "salary": 19500000,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2030
    },
    {
     "name": "Collin Murray-Boyles",
     "salary": 6649560,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2029
    },
    {
     "name": "Allen Graves",
     "salary": 4065720,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2030
    },
    {
     "name": "Ja'Kobe Walter",
     "salary": 3811800,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2028
    },
    {
     "name": "Kyle Anderson",
     "salary": 2449421,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Trayce Jackson-Davis",
     "salary": 2406205,
     "type": "RK-2ND",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Jamal Shead",
     "salary": 2296271,
     "type": "RK-2ND",
     "nonGuaranteed": false,
     "until": 2030
    },
    {
     "name": "Jamison Battle",
     "salary": 2296271,
     "type": "ROS",
     "nonGuaranteed": true,
     "until": 2027
    },
    {
     "name": "Alijah Martin",
     "salary": 2185116,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2028,
     "option": "PO"
    },
    {
     "name": "Jaden Bradley",
     "salary": 1357763,
     "type": "",
     "nonGuaranteed": false,
     "until": null
    }
   ]
  },
  "UTA": {
   "total": 182965101,
   "deadMoney": 0,
   "players": [
    {
     "name": "Jaren Jackson Jr.",
     "salary": 49000000,
     "type": "VET-EXT",
     "nonGuaranteed": false,
     "until": 2030
    },
    {
     "name": "Lauri Markkanen",
     "salary": 46113154,
     "type": "VET-EXT",
     "nonGuaranteed": false,
     "until": 2029
    },
    {
     "name": "Josh Green",
     "salary": 14679012,
     "type": "RK-EXT",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Darryn Peterson",
     "salary": 13195320,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2030,
     "option": "TO"
    },
    {
     "name": "Jusuf Nurkic",
     "salary": 11458333,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2028
    },
    {
     "name": "Ace Bailey",
     "salary": 9523080,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2029
    },
    {
     "name": "Keyonte George",
     "salary": 6563925,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2032
    },
    {
     "name": "Jaxson Hayes",
     "salary": 6000000,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2028,
     "option": "TO"
    },
    {
     "name": "Josh Okogie",
     "salary": 6000000,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2028,
     "option": "TO"
    },
    {
     "name": "Brice Sensabaugh",
     "salary": 4862237,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Sviatoslav Mykhailiuk",
     "salary": 3850000,
     "type": "FA",
     "nonGuaranteed": true,
     "until": null
    },
    {
     "name": "Mohamed Bamba",
     "salary": 3506659,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2028
    },
    {
     "name": "Kyle Filipowski",
     "salary": 3000000,
     "type": "RK",
     "nonGuaranteed": true,
     "until": 2028
    },
    {
     "name": "Isaiah Collier",
     "salary": 2763960,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Tony Bradley",
     "salary": 2449421,
     "type": "Exhibit-9 Conversion to Standard",
     "nonGuaranteed": true,
     "until": 2027
    }
   ]
  },
  "WAS": {
   "total": 194462525,
   "deadMoney": 0,
   "players": [
    {
     "name": "Anthony Davis",
     "salary": 58456566,
     "type": "VET-EXT",
     "nonGuaranteed": false,
     "until": 2028
    },
    {
     "name": "Trae Young",
     "salary": 49488300,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2030,
     "option": "PO"
    },
    {
     "name": "AJ Dybantsa",
     "salary": 14748000,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2030
    },
    {
     "name": "Alex Sarr",
     "salary": 12370680,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2028
    },
    {
     "name": "Bilal Coulibaly",
     "salary": 9240012,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Tre Johnson",
     "salary": 8649600,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2029
    },
    {
     "name": "Deandre Ayton",
     "salary": 8104000,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Tre Mann",
     "salary": 8000000,
     "type": "FA",
     "nonGuaranteed": false,
     "until": 2027
    },
    {
     "name": "Khris Middleton",
     "salary": 5591122,
     "type": "S&T",
     "nonGuaranteed": false,
     "until": 2029
    },
    {
     "name": "Bub Carrington",
     "salary": 4900560,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2028
    },
    {
     "name": "Will Riley",
     "salary": 3688320,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2029
    },
    {
     "name": "Kyshawn George",
     "salary": 3108000,
     "type": "RK-1ST",
     "nonGuaranteed": false,
     "until": 2028
    },
    {
     "name": "Tristan Vukcevic",
     "salary": 3000000,
     "type": "ROS",
     "nonGuaranteed": false,
     "until": 2028
    },
    {
     "name": "Justin Champagnie",
     "salary": 2667944,
     "type": "ROS",
     "nonGuaranteed": true,
     "until": 2028
    },
    {
     "name": "Anthony Gill",
     "salary": 2449421,
     "type": "FA",
     "nonGuaranteed": true,
     "until": 2027
    }
   ]
  }
 }
};
