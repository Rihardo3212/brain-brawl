// Multiple-choice trivia pool, shared by Brain Board and Wedge Rush.
// Each category has 20 questions. Within every block of 10, the questions go
// easiest to hardest in pairs: index % 10 → 0-1 = tier 0 (100 points) … 8-9 = tier 4 (500).
// "a" is the correct answer, "w" are three wrong options.

export const CATEGORIES = [
  {
    id: "world", name: "Around the World", icon: "🌍",
    questions: [
      { q: "What is the capital of Japan?", a: "Tokyo", w: ["Kyoto", "Osaka", "Seoul"] },
      { q: "Which country is shaped like a boot?", a: "Italy", w: ["Greece", "Spain", "Portugal"] },
      { q: "Which river flows through Cairo?", a: "Nile", w: ["Danube", "Tigris", "Congo"] },
      { q: "Which is the largest ocean?", a: "Pacific", w: ["Atlantic", "Indian", "Arctic"] },
      { q: "In which country is Machu Picchu?", a: "Peru", w: ["Chile", "Mexico", "Bolivia"] },
      { q: "What is the capital of Canada?", a: "Ottawa", w: ["Toronto", "Vancouver", "Montreal"] },
      { q: "What is the smallest country in the world?", a: "Vatican City", w: ["Monaco", "San Marino", "Liechtenstein"] },
      { q: "Which country has the most islands?", a: "Sweden", w: ["Indonesia", "Philippines", "Japan"] },
      { q: "Counting its overseas territories, which country has the most time zones?", a: "France", w: ["Russia", "USA", "China"] },
      { q: "Lake Baikal, the deepest lake on Earth, is in which country?", a: "Russia", w: ["Mongolia", "Kazakhstan", "China"] },
      { q: "Which city is home to the Eiffel Tower?", a: "Paris", w: ["Lyon", "Brussels", "Monaco"] },
      { q: "On which continent is Kenya?", a: "Africa", w: ["Asia", "South America", "Oceania"] },
      { q: "What is the currency of Japan?", a: "Yen", w: ["Won", "Yuan", "Ringgit"] },
      { q: "In which country is Barcelona?", a: "Spain", w: ["Italy", "Portugal", "France"] },
      { q: "What is the capital of Australia?", a: "Canberra", w: ["Sydney", "Melbourne", "Perth"] },
      { q: "Which is the longest river in South America?", a: "Amazon", w: ["Paraná", "Orinoco", "Magdalena"] },
      { q: "Transylvania is a region of which country?", a: "Romania", w: ["Hungary", "Bulgaria", "Serbia"] },
      { q: "Riga is the capital of which country?", a: "Latvia", w: ["Lithuania", "Estonia", "Finland"] },
      { q: "Which country has three capital cities?", a: "South Africa", w: ["Bolivia", "Netherlands", "Malaysia"] },
      { q: "In which country is Mount Kilimanjaro?", a: "Tanzania", w: ["Kenya", "Uganda", "Ethiopia"] }
    ]
  },
  {
    id: "science", name: "Science Stuff", icon: "🧪",
    questions: [
      { q: "Which planet is known as the Red Planet?", a: "Mars", w: ["Jupiter", "Venus", "Mercury"] },
      { q: "At sea level, water boils at…", a: "100 °C", w: ["90 °C", "120 °C", "80 °C"] },
      { q: "Which gas do plants take in from the air?", a: "Carbon dioxide", w: ["Oxygen", "Nitrogen", "Helium"] },
      { q: "What is the closest star to Earth?", a: "The Sun", w: ["Proxima Centauri", "Sirius", "Polaris"] },
      { q: "How many bones does an adult human have?", a: "206", w: ["186", "226", "256"] },
      { q: "Which part of a cell holds most of its DNA?", a: "Nucleus", w: ["Ribosome", "Membrane", "Mitochondria"] },
      { q: "What is the chemical symbol for gold?", a: "Au", w: ["Ag", "Gd", "Go"] },
      { q: "Roughly how fast does light travel?", a: "300,000 km per second", w: ["30,000 km per second", "3,000 km per second", "3 million km per second"] },
      { q: "Roughly how long does sunlight take to reach Earth?", a: "About 8 minutes", w: ["About 8 seconds", "About 1 hour", "About 8 hours"] },
      { q: "Which element has the chemical symbol K?", a: "Potassium", w: ["Krypton", "Calcium", "Carbon"] },
      { q: "What do bees collect from flowers to make honey?", a: "Nectar", w: ["Pollen", "Sap", "Dew"] },
      { q: "What is the largest planet in our solar system?", a: "Jupiter", w: ["Saturn", "Neptune", "Earth"] },
      { q: "What is the hardest natural substance?", a: "Diamond", w: ["Quartz", "Iron", "Granite"] },
      { q: "Which force keeps us on the ground?", a: "Gravity", w: ["Magnetism", "Friction", "Inertia"] },
      { q: "Which gas makes up most of Earth's air?", a: "Nitrogen", w: ["Oxygen", "Carbon dioxide", "Argon"] },
      { q: "How many chambers does the human heart have?", a: "4", w: ["2", "3", "6"] },
      { q: "What is called the powerhouse of the cell?", a: "Mitochondria", w: ["Nucleus", "Ribosome", "Golgi apparatus"] },
      { q: "Which blood type is the universal donor?", a: "O negative", w: ["AB positive", "A negative", "B positive"] },
      { q: "Which metal is liquid at room temperature?", a: "Mercury", w: ["Gallium", "Lead", "Sodium"] },
      { q: "Absolute zero is roughly…", a: "−273 °C", w: ["−100 °C", "−459 °C", "−373 °C"] }
    ]
  },
  {
    id: "food", name: "Food Fight", icon: "🍕",
    questions: [
      { q: "Which fruit is guacamole made from?", a: "Avocado", w: ["Lime", "Kiwi", "Green apple"] },
      { q: "Which country is famous for sushi?", a: "Japan", w: ["China", "Thailand", "Korea"] },
      { q: "What is the main ingredient in hummus?", a: "Chickpeas", w: ["Lentils", "White beans", "Peas"] },
      { q: "Which cheese goes on a classic Margherita pizza?", a: "Mozzarella", w: ["Cheddar", "Feta", "Brie"] },
      { q: "Which nut is marzipan made from?", a: "Almond", w: ["Hazelnut", "Walnut", "Cashew"] },
      { q: "What is tofu made from?", a: "Soybeans", w: ["Rice", "Chickpeas", "Wheat"] },
      { q: "What is sushi rice seasoned with?", a: "Rice vinegar", w: ["Soy sauce", "Lemon juice", "Fish sauce"] },
      { q: "The croissant grew out of the kipferl, a pastry from which country?", a: "Austria", w: ["France", "Germany", "Belgium"] },
      { q: "Which spice is the most expensive by weight?", a: "Saffron", w: ["Vanilla", "Cardamom", "Cinnamon"] },
      { q: "Which fruit is the spirit kirsch made from?", a: "Cherries", w: ["Plums", "Pears", "Apples"] },
      { q: "Which fruit is dried to make raisins?", a: "Grapes", w: ["Plums", "Figs", "Cranberries"] },
      { q: "What are Italian potato dumplings called?", a: "Gnocchi", w: ["Ravioli", "Tortellini", "Arancini"] },
      { q: "Which country is famous for tacos?", a: "Mexico", w: ["Spain", "Peru", "Colombia"] },
      { q: "Which drink is made from fermented tea?", a: "Kombucha", w: ["Kefir", "Kvass", "Mead"] },
      { q: "Which vegetable gives borscht its red color?", a: "Beetroot", w: ["Red cabbage", "Carrot", "Tomato"] },
      { q: "Real wasabi is made from…", a: "A plant root", w: ["Green chili", "Seaweed", "Mustard seeds"] },
      { q: "Which country does halloumi cheese come from?", a: "Cyprus", w: ["Greece", "Turkey", "Lebanon"] },
      { q: "The Latvian dish 'pelēkie zirņi' is made from…", a: "Grey peas", w: ["Rye bread", "Beetroot", "Herring"] },
      { q: "Which nuts go into classic Genovese pesto?", a: "Pine nuts", w: ["Walnuts", "Almonds", "Cashews"] },
      { q: "Which of these peppers is the hottest?", a: "Carolina Reaper", w: ["Jalapeño", "Habanero", "Cayenne"] }
    ]
  },
  {
    id: "screen", name: "Screen Time", icon: "🎬",
    questions: [
      { q: "What color is Pac-Man?", a: "Yellow", w: ["Red", "Blue", "Green"] },
      { q: "What is the name of the cowboy toy in Toy Story?", a: "Woody", w: ["Buzz", "Rex", "Hamm"] },
      { q: "In which movie does a clownfish dad search for his son?", a: "Finding Nemo", w: ["Shark Tale", "The Little Mermaid", "Moana"] },
      { q: "Which school of magic does Harry Potter attend?", a: "Hogwarts", w: ["Durmstrang", "Beauxbatons", "Ilvermorny"] },
      { q: "What is the name of the kingdom in Frozen?", a: "Arendelle", w: ["Corona", "Agrabah", "DunBroch"] },
      { q: "In The Lion King, what is Simba's father called?", a: "Mufasa", w: ["Scar", "Rafiki", "Zazu"] },
      { q: "In which game do you hide from Creepers in a world made of blocks?", a: "Minecraft", w: ["Roblox", "Terraria", "Fortnite"] },
      { q: "Tetris was created in which country?", a: "Soviet Union", w: ["Japan", "USA", "Finland"] },
      { q: "Which film won the very first Oscar for Best Picture?", a: "Wings", w: ["Sunrise", "The Jazz Singer", "Metropolis"] },
      { q: "Which was the first feature film made entirely with computer animation?", a: "Toy Story", w: ["Shrek", "A Bug's Life", "Antz"] },
      { q: "What is the name of Ash's yellow electric Pokémon partner?", a: "Pikachu", w: ["Raichu", "Jigglypuff", "Togepi"] },
      { q: "Which streaming service made Stranger Things?", a: "Netflix", w: ["HBO", "Disney+", "Hulu"] },
      { q: "In Among Us, what are the bad guys called?", a: "Impostors", w: ["Traitors", "Saboteurs", "Hunters"] },
      { q: "In which town is Stranger Things set?", a: "Hawkins", w: ["Riverdale", "Springfield", "Twin Peaks"] },
      { q: "In Breaking Bad, what subject does Walter White teach?", a: "Chemistry", w: ["Physics", "Biology", "Math"] },
      { q: "In which game do players jump out of a Battle Bus?", a: "Fortnite", w: ["PUBG", "Apex Legends", "Warzone"] },
      { q: "What is the paper company in The Office (US)?", a: "Dunder Mifflin", w: ["Wernham Hogg", "Sabre", "Staples"] },
      { q: "In Squid Game, what color do the guards wear?", a: "Pink", w: ["Red", "Green", "Black"] },
      { q: "Which was the first video game played in space?", a: "Tetris", w: ["Pong", "Pac-Man", "Space Invaders"] },
      { q: "Who directed the film Spirited Away?", a: "Hayao Miyazaki", w: ["Isao Takahata", "Makoto Shinkai", "Mamoru Hosoda"] }
    ]
  },
  {
    id: "sports", name: "Sports Arena", icon: "⚽",
    questions: [
      { q: "How many players does a football (soccer) team have on the field?", a: "11", w: ["10", "9", "12"] },
      { q: "What color is the center of an archery target?", a: "Yellow", w: ["Red", "Blue", "Black"] },
      { q: "In which sport do you do a slam dunk?", a: "Basketball", w: ["Volleyball", "Handball", "Tennis"] },
      { q: "How many rings are on the Olympic flag?", a: "5", w: ["4", "6", "7"] },
      { q: "In tennis, what is a score of zero called?", a: "Love", w: ["Nil", "Duck", "Zip"] },
      { q: "How many points is a touchdown worth, before the extra point?", a: "6", w: ["3", "7", "5"] },
      { q: "How long is a marathon?", a: "42.195 km", w: ["40 km", "45.5 km", "38.6 km"] },
      { q: "In which country did judo begin?", a: "Japan", w: ["China", "Korea", "Brazil"] },
      { q: "In which year were the first modern Olympic Games held?", a: "1896", w: ["1900", "1888", "1912"] },
      { q: "Which country hosted the first FIFA World Cup in 1930?", a: "Uruguay", w: ["Brazil", "Italy", "France"] },
      { q: "How many players does a volleyball team have on court?", a: "6", w: ["5", "7", "4"] },
      { q: "Which sport uses a shuttlecock?", a: "Badminton", w: ["Tennis", "Squash", "Table tennis"] },
      { q: "How many holes does a standard golf course have?", a: "18", w: ["9", "12", "21"] },
      { q: "Which country is sumo wrestling from?", a: "Japan", w: ["China", "Mongolia", "Korea"] },
      { q: "In which sport do you do an 'ollie'?", a: "Skateboarding", w: ["Surfing", "BMX", "Ice skating"] },
      { q: "How many periods are in an ice hockey game?", a: "3", w: ["2", "4", "5"] },
      { q: "In which sport is the Ryder Cup played?", a: "Golf", w: ["Tennis", "Sailing", "Cricket"] },
      { q: "What is the maximum break in snooker (without free balls)?", a: "147", w: ["155", "100", "180"] },
      { q: "Who won the first Rugby World Cup in 1987?", a: "New Zealand", w: ["Australia", "England", "South Africa"] },
      { q: "What is the highest score with three darts?", a: "180", w: ["150", "170", "200"] }
    ]
  },
  {
    id: "animals", name: "Animal Kingdom", icon: "🐙",
    questions: [
      { q: "What is the largest animal on Earth?", a: "Blue whale", w: ["African elephant", "Giraffe", "Great white shark"] },
      { q: "What do giant pandas mostly eat?", a: "Bamboo", w: ["Fish", "Berries", "Insects"] },
      { q: "How many legs does a spider have?", a: "8", w: ["6", "10", "12"] },
      { q: "Which bird is a classic symbol of peace?", a: "Dove", w: ["Eagle", "Owl", "Swan"] },
      { q: "What is a group of lions called?", a: "A pride", w: ["A pack", "A herd", "A flock"] },
      { q: "What is a baby kangaroo called?", a: "A joey", w: ["A kit", "A cub", "A calf"] },
      { q: "Which mammal can truly fly?", a: "Bat", w: ["Flying squirrel", "Sugar glider", "Flying lemur"] },
      { q: "Which continent has no native ants?", a: "Antarctica", w: ["Australia", "Europe", "South America"] },
      { q: "How many hearts does an octopus have?", a: "3", w: ["1", "2", "8"] },
      { q: "A group of crows is called a…", a: "Murder", w: ["Parliament", "Gaggle", "Pod"] },
      { q: "What is the fastest land animal?", a: "Cheetah", w: ["Lion", "Pronghorn", "Greyhound"] },
      { q: "Which animal is called the king of the jungle?", a: "Lion", w: ["Tiger", "Gorilla", "Elephant"] },
      { q: "What do caterpillars turn into?", a: "Butterflies or moths", w: ["Beetles", "Dragonflies", "Bees"] },
      { q: "Which African animal has black and white stripes all over?", a: "Zebra", w: ["Skunk", "Tapir", "Panda"] },
      { q: "How many legs does an insect have?", a: "6", w: ["8", "4", "10"] },
      { q: "What is the largest species of shark alive today?", a: "Whale shark", w: ["Great white", "Hammerhead", "Tiger shark"] },
      { q: "What is a male duck called?", a: "Drake", w: ["Gander", "Cob", "Buck"] },
      { q: "Which bird can fly backwards?", a: "Hummingbird", w: ["Swift", "Kingfisher", "Kestrel"] },
      { q: "What color is a polar bear's skin?", a: "Black", w: ["White", "Pink", "Grey"] },
      { q: "How many eyes does a honeybee have?", a: "5", w: ["2", "4", "8"] }
    ]
  },
  {
    id: "history", name: "History Mystery", icon: "🏛️",
    questions: [
      { q: "Who was the first person to walk on the Moon?", a: "Neil Armstrong", w: ["Buzz Aldrin", "Yuri Gagarin", "Michael Collins"] },
      { q: "In which country are the pyramids of Giza?", a: "Egypt", w: ["Mexico", "Peru", "Greece"] },
      { q: "Which ship sank on its first voyage in 1912?", a: "Titanic", w: ["Lusitania", "Britannic", "Mayflower"] },
      { q: "Which wall came down in 1989?", a: "The Berlin Wall", w: ["The Great Wall", "Hadrian's Wall", "The Western Wall"] },
      { q: "Who painted the Mona Lisa?", a: "Leonardo da Vinci", w: ["Michelangelo", "Raphael", "Botticelli"] },
      { q: "Which Roman city was buried by Mount Vesuvius in 79 AD?", a: "Pompeii", w: ["Athens", "Carthage", "Troy"] },
      { q: "In which year did World War II end?", a: "1945", w: ["1944", "1946", "1939"] },
      { q: "Who was the first emperor of Rome?", a: "Augustus", w: ["Julius Caesar", "Nero", "Caligula"] },
      { q: "Which empire built Machu Picchu?", a: "The Inca", w: ["The Aztecs", "The Maya", "The Olmecs"] },
      { q: "The Hundred Years' War was fought between England and…", a: "France", w: ["Spain", "Scotland", "The Netherlands"] },
      { q: "Who was the first President of the USA?", a: "George Washington", w: ["Abraham Lincoln", "Thomas Jefferson", "John Adams"] },
      { q: "Which people sailed in longships?", a: "Vikings", w: ["Romans", "Aztecs", "Mongols"] },
      { q: "In which country did the ancient Olympic Games begin?", a: "Greece", w: ["Italy", "Egypt", "Turkey"] },
      { q: "Which Egyptian queen allied with Mark Antony?", a: "Cleopatra", w: ["Nefertiti", "Hatshepsut", "Boudica"] },
      { q: "In which year did humans first land on the Moon?", a: "1969", w: ["1965", "1972", "1959"] },
      { q: "Which country gave the Statue of Liberty to the USA?", a: "France", w: ["UK", "Spain", "Netherlands"] },
      { q: "Who was the first woman to win a Nobel Prize?", a: "Marie Curie", w: ["Ada Lovelace", "Rosalind Franklin", "Florence Nightingale"] },
      { q: "In which year did Latvia first declare independence?", a: "1918", w: ["1991", "1905", "1940"] },
      { q: "What was the first artificial satellite called?", a: "Sputnik 1", w: ["Explorer 1", "Vostok 1", "Telstar"] },
      { q: "Genghis Khan founded which empire?", a: "The Mongol Empire", w: ["The Ottoman Empire", "The Persian Empire", "The Han dynasty"] }
    ]
  },
  {
    id: "music", name: "Music Mania", icon: "🎵",
    questions: [
      { q: "How many strings does a standard guitar have?", a: "6", w: ["4", "5", "8"] },
      { q: "Which instrument has black and white keys?", a: "Piano", w: ["Violin", "Flute", "Drums"] },
      { q: "Which band was John Lennon in?", a: "The Beatles", w: ["The Rolling Stones", "Queen", "ABBA"] },
      { q: "Which country does the band ABBA come from?", a: "Sweden", w: ["Norway", "Denmark", "Netherlands"] },
      { q: "How many musicians play in a quartet?", a: "4", w: ["3", "5", "6"] },
      { q: "Which composer kept writing music after going deaf?", a: "Beethoven", w: ["Mozart", "Bach", "Chopin"] },
      { q: "What does 'forte' mean in music?", a: "Loud", w: ["Soft", "Fast", "Slow"] },
      { q: "What does a timpanist play?", a: "Kettle drums", w: ["Harp", "Trumpet", "Cello"] },
      { q: "How many keys does a standard piano have?", a: "88", w: ["76", "92", "64"] },
      { q: "Which country is the tango from?", a: "Argentina", w: ["Spain", "Cuba", "Brazil"] },
      { q: "Which singer is known for The Eras Tour?", a: "Taylor Swift", w: ["Beyoncé", "Adele", "Dua Lipa"] },
      { q: "How many members does BTS have?", a: "7", w: ["5", "6", "9"] },
      { q: "Which rapper's real name is Marshall Mathers?", a: "Eminem", w: ["Drake", "Kanye West", "Jay-Z"] },
      { q: "Which instrument has pipes and is often found in churches?", a: "Organ", w: ["Harpsichord", "Accordion", "Harp"] },
      { q: "K-pop comes from which country?", a: "South Korea", w: ["Japan", "China", "Thailand"] },
      { q: "Who released the album Thriller?", a: "Michael Jackson", w: ["Prince", "Madonna", "Whitney Houston"] },
      { q: "Daft Punk is a duo from which country?", a: "France", w: ["Germany", "Belgium", "Netherlands"] },
      { q: "What is the highest female singing voice?", a: "Soprano", w: ["Alto", "Mezzo-soprano", "Contralto"] },
      { q: "Who composed The Four Seasons?", a: "Vivaldi", w: ["Bach", "Handel", "Haydn"] },
      { q: "How many lines does a music staff have?", a: "5", w: ["4", "6", "7"] }
    ]
  },
  {
    id: "words", name: "Word Nerd", icon: "🔤",
    questions: [
      { q: "What is the opposite of 'ancient'?", a: "Modern", w: ["Old", "Antique", "Classic"] },
      { q: "How many letters are in the English alphabet?", a: "26", w: ["24", "28", "25"] },
      { q: "Which word means the same as 'happy'?", a: "Joyful", w: ["Gloomy", "Tired", "Grumpy"] },
      { q: "A word that reads the same backwards is a…", a: "Palindrome", w: ["Anagram", "Acronym", "Homonym"] },
      { q: "Which letter is used most in English?", a: "E", w: ["A", "T", "S"] },
      { q: "What does the French word 'bonjour' mean?", a: "Hello", w: ["Goodbye", "Thank you", "Please"] },
      { q: "Which language has the most native speakers?", a: "Mandarin Chinese", w: ["English", "Spanish", "Hindi"] },
      { q: "What does the 'S' in NASA stand for?", a: "Space", w: ["Science", "Satellite", "Systems"] },
      { q: "'Schadenfreude' comes from which language?", a: "German", w: ["Dutch", "Danish", "Swedish"] },
      { q: "How many vowels are in the word 'onomatopoeia'?", a: "8", w: ["6", "7", "9"] },
      { q: "What is the plural of 'mouse' (the animal)?", a: "Mice", w: ["Mouses", "Meese", "Mousen"] },
      { q: "What does 'BRB' stand for?", a: "Be right back", w: ["Bring real bread", "Big red button", "Be really brave"] },
      { q: "Which word is spelled correctly?", a: "Necessary", w: ["Neccessary", "Necesary", "Neccesary"] },
      { q: "In slang, what does 'GOAT' mean?", a: "Greatest of all time", w: ["Good old American talk", "Going on a trip", "Gets offended at things"] },
      { q: "What is the opposite of a synonym?", a: "Antonym", w: ["Homonym", "Pseudonym", "Acronym"] },
      { q: "What does 'ciao' mean in Italian?", a: "Hello and goodbye", w: ["Thank you", "Please", "Good night"] },
      { q: "How many letters does the Latvian alphabet have?", a: "33", w: ["26", "29", "36"] },
      { q: "What is the fear of spiders called?", a: "Arachnophobia", w: ["Acrophobia", "Claustrophobia", "Agoraphobia"] },
      { q: "'The quick brown fox jumps over the lazy dog' is a…", a: "Pangram", w: ["Palindrome", "Anagram", "Haiku"] },
      { q: "What does 'déjà vu' literally mean?", a: "Already seen", w: ["Already lived", "Never seen", "Seen twice"] }
    ]
  },
  {
    id: "tech", name: "Tech & Games", icon: "💻",
    questions: [
      { q: "What does 'www' stand for?", a: "World Wide Web", w: ["World Web Wide", "Wide World Web", "Web World Wide"] },
      { q: "Which company makes the iPhone?", a: "Apple", w: ["Samsung", "Google", "Nokia"] },
      { q: "Which company created Windows?", a: "Microsoft", w: ["Apple", "IBM", "Intel"] },
      { q: "In which game series do you catch creatures in Poké Balls?", a: "Pokémon", w: ["Digimon", "Monster Hunter", "Yo-kai Watch"] },
      { q: "What does 'CPU' stand for?", a: "Central Processing Unit", w: ["Computer Personal Unit", "Central Program Utility", "Core Power Unit"] },
      { q: "How many bits are in a byte?", a: "8", w: ["4", "16", "10"] },
      { q: "Which programming language is named after a comedy group?", a: "Python", w: ["Java", "Ruby", "Swift"] },
      { q: "In which year was the first iPhone released?", a: "2007", w: ["2005", "2009", "2010"] },
      { q: "Who is often called the first computer programmer?", a: "Ada Lovelace", w: ["Alan Turing", "Grace Hopper", "Charles Babbage"] },
      { q: "What does 'HTTP' stand for?", a: "HyperText Transfer Protocol", w: ["High Tech Text Protocol", "HyperText Transmission Process", "Home Tool Transfer Protocol"] },
      { q: "Which company owns Instagram?", a: "Meta", w: ["Google", "Microsoft", "Snap"] },
      { q: "What color is the classic YouTube play button?", a: "Red", w: ["Blue", "Green", "Black"] },
      { q: "Which company makes the PlayStation?", a: "Sony", w: ["Microsoft", "Nintendo", "Sega"] },
      { q: "Which game character is a fast blue hedgehog?", a: "Sonic", w: ["Knuckles", "Crash", "Spyro"] },
      { q: "What does 'AI' stand for?", a: "Artificial intelligence", w: ["Automated internet", "Advanced input", "Analog interface"] },
      { q: "Which app has a ghost logo and disappearing photos?", a: "Snapchat", w: ["Instagram", "TikTok", "BeReal"] },
      { q: "In which year did the original Nintendo Switch launch?", a: "2017", w: ["2015", "2019", "2016"] },
      { q: "What does 'USB' stand for?", a: "Universal Serial Bus", w: ["United System Board", "Universal Storage Box", "Ultra Speed Bus"] },
      { q: "Who co-founded Microsoft with Bill Gates?", a: "Paul Allen", w: ["Steve Wozniak", "Larry Page", "Steve Ballmer"] },
      { q: "What was Twitter renamed to in 2023?", a: "X", w: ["Threads", "Bluesky", "Chirp"] }
    ]
  }
];

export const tierOf = (index) => Math.floor((index % 10) / 2);

export function questionsForTier(catId, tier) {
  const cat = CATEGORIES.find((c) => c.id === catId);
  return cat.questions.map((_, i) => i).filter((i) => tierOf(i) === tier);
}

export function getQuestion(catId, index) {
  return CATEGORIES.find((c) => c.id === catId).questions[index];
}
