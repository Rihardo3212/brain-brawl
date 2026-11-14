// Question sets. Each category has 5 questions, easiest first.
// "a" is the correct answer, "w" are three wrong options.

export const CATEGORIES = [
  {
    id: 'world',
    name: 'Around the World',
    icon: '🌍',
    questions: [
      { q: 'What is the capital of Japan?', a: 'Tokyo', w: ['Kyoto', 'Osaka', 'Seoul'] },
      { q: 'Which river flows through Cairo?', a: 'Nile', w: ['Danube', 'Tigris', 'Congo'] },
      { q: 'In which country is Machu Picchu?', a: 'Peru', w: ['Chile', 'Mexico', 'Bolivia'] },
      { q: 'What is the smallest country in the world?', a: 'Vatican City', w: ['Monaco', 'San Marino', 'Liechtenstein'] },
      { q: 'Counting its overseas territories, which country has the most time zones?', a: 'France', w: ['Russia', 'USA', 'China'] }
    ]
  },
  {
    id: 'science',
    name: 'Science Stuff',
    icon: '🧪',
    questions: [
      { q: 'Which planet is known as the Red Planet?', a: 'Mars', w: ['Jupiter', 'Venus', 'Mercury'] },
      { q: 'Which gas do plants take in from the air?', a: 'Carbon dioxide', w: ['Oxygen', 'Nitrogen', 'Helium'] },
      { q: 'How many bones does an adult human have?', a: '206', w: ['186', '226', '256'] },
      { q: 'What is the chemical symbol for gold?', a: 'Au', w: ['Ag', 'Gd', 'Go'] },
      { q: 'Roughly how long does sunlight take to reach Earth?', a: 'About 8 minutes', w: ['About 8 seconds', 'About 1 hour', 'About 8 hours'] }
    ]
  },
  {
    id: 'food',
    name: 'Food Fight',
    icon: '🍕',
    questions: [
      { q: 'Which fruit is guacamole made from?', a: 'Avocado', w: ['Lime', 'Kiwi', 'Green apple'] },
      { q: 'What is the main ingredient in hummus?', a: 'Chickpeas', w: ['Lentils', 'White beans', 'Peas'] },
      { q: 'Which nut is marzipan made from?', a: 'Almond', w: ['Hazelnut', 'Walnut', 'Cashew'] },
      { q: 'What is sushi rice seasoned with?', a: 'Rice vinegar', w: ['Soy sauce', 'Lemon juice', 'Fish sauce'] },
      { q: 'Which spice is the most expensive by weight?', a: 'Saffron', w: ['Vanilla', 'Cardamom', 'Cinnamon'] }
    ]
  },
  {
    id: 'screen',
    name: 'Screen Time',
    icon: '🎬',
    questions: [
      { q: 'What color is Pac-Man?', a: 'Yellow', w: ['Red', 'Blue', 'Green'] },
      { q: 'In which movie does a clownfish dad search for his son?', a: 'Finding Nemo', w: ['Shark Tale', 'The Little Mermaid', 'Moana'] },
      { q: 'What is the name of the kingdom in Frozen?', a: 'Arendelle', w: ['Corona', 'Agrabah', 'DunBroch'] },
      { q: 'In which game do you hide from Creepers in a world made of blocks?', a: 'Minecraft', w: ['Roblox', 'Terraria', 'Fortnite'] },
      { q: 'Which film won the very first Oscar for Best Picture?', a: 'Wings', w: ['Sunrise', 'The Jazz Singer', 'Metropolis'] }
    ]
  },
  {
    id: 'sports',
    name: 'Sports Arena',
    icon: '⚽',
    questions: [
      { q: 'How many players does a football (soccer) team have on the field?', a: '11', w: ['10', '9', '12'] },
      { q: 'In which sport do you do a slam dunk?', a: 'Basketball', w: ['Volleyball', 'Handball', 'Tennis'] },
      { q: 'In tennis, what is a score of zero called?', a: 'Love', w: ['Nil', 'Duck', 'Zip'] },
      { q: 'How long is a marathon?', a: '42.195 km', w: ['40 km', '45.5 km', '38.6 km'] },
      { q: 'In which year were the first modern Olympic Games held?', a: '1896', w: ['1900', '1888', '1912'] }
    ]
  },
  {
    id: 'animals',
    name: 'Animal Kingdom',
    icon: '🐙',
    questions: [
      { q: 'What is the largest animal on Earth?', a: 'Blue whale', w: ['African elephant', 'Giraffe', 'Great white shark'] },
      { q: 'How many legs does a spider have?', a: '8', w: ['6', '10', '12'] },
      { q: 'What is a group of lions called?', a: 'A pride', w: ['A pack', 'A herd', 'A flock'] },
      { q: 'Which mammal can truly fly?', a: 'Bat', w: ['Flying squirrel', 'Sugar glider', 'Flying lemur'] },
      { q: 'How many hearts does an octopus have?', a: '3', w: ['1', '2', '8'] }
    ]
  }
];

export const LENGTHS = {
  quick: { label: 'Quick', detail: '4 categories × 4 · about 15 min', cats: 4, rows: 4 },
  full: { label: 'Full', detail: '6 categories × 5 · about 30 min', cats: 6, rows: 5 }
};

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function getQuestion(catId, row) {
  const cat = CATEGORIES.find((c) => c.id === catId);
  return cat.questions[row];
}
