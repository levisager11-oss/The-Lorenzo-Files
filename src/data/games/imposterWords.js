export const imposterCategories = [
    {
        id: 'foods',
        label: 'FOODS',
        words: [
            'Pizza', 'Sushi', 'Tacos', 'Pancakes', 'Spaghetti', 'Hamburger',
            'Croissant', 'Curry', 'Lasagna', 'Ramen', 'Falafel', 'Risotto',
            'Pho', 'Burrito', 'Dumplings', 'Paella', 'Kebab', 'Pad Thai',
            'Tiramisu', 'Pretzel',
        ],
    },
    {
        id: 'animals',
        label: 'ANIMALS',
        words: [
            'Lion', 'Penguin', 'Octopus', 'Kangaroo', 'Eagle', 'Dolphin',
            'Crocodile', 'Panda', 'Cheetah', 'Hedgehog', 'Owl', 'Koala',
            'Wolf', 'Giraffe', 'Otter', 'Raccoon', 'Flamingo', 'Walrus',
            'Sloth', 'Squirrel',
        ],
    },
    {
        id: 'movies',
        label: 'MOVIES',
        words: [
            'Inception', 'Titanic', 'Avatar', 'Gladiator', 'Joker', 'Frozen',
            'Shrek', 'Interstellar', 'Up', 'Whiplash', 'Coco', 'Tenet',
            'Casablanca', 'Goodfellas', 'Memento', 'Parasite', 'Oppenheimer',
            'Barbie', 'Dune', 'Matrix',
        ],
    },
    {
        id: 'places',
        label: 'PLACES',
        words: [
            'Paris', 'Tokyo', 'Reykjavik', 'Cairo', 'Sydney', 'Mumbai',
            'Marrakech', 'Berlin', 'Lagos', 'Vienna', 'Bangkok', 'Lisbon',
            'Istanbul', 'Toronto', 'Dubai', 'Prague', 'Buenos Aires',
            'Singapore', 'Edinburgh', 'Helsinki',
        ],
    },
    {
        id: 'sports',
        label: 'SPORTS',
        words: [
            'Football', 'Basketball', 'Tennis', 'Cricket', 'Rugby', 'Boxing',
            'Surfing', 'Skiing', 'Volleyball', 'Golf', 'Cycling', 'Archery',
            'Bowling', 'Karate', 'Fencing', 'Sailing', 'Hockey', 'Climbing',
            'Curling', 'Skateboarding',
        ],
    },
    {
        id: 'professions',
        label: 'PROFESSIONS',
        words: [
            'Astronaut', 'Detective', 'Surgeon', 'Pilot', 'Chef', 'Architect',
            'Firefighter', 'Journalist', 'Plumber', 'Mechanic', 'Lawyer',
            'Teacher', 'Sailor', 'Photographer', 'Magician', 'Farmer',
            'Programmer', 'Dentist', 'Diplomat', 'Barber',
        ],
    },
    {
        id: 'objects',
        label: 'OBJECTS',
        words: [
            'Umbrella', 'Telescope', 'Compass', 'Lantern', 'Mirror', 'Helmet',
            'Backpack', 'Anchor', 'Hammer', 'Microphone', 'Paintbrush', 'Globe',
            'Suitcase', 'Stopwatch', 'Binoculars', 'Crown', 'Trumpet', 'Lockbox',
            'Bicycle', 'Sword',
        ],
    },
    {
        id: 'delos',
        label: 'DELOS FILES',
        words: [
            'Karaoke', 'Lorenzo', 'Watchlist', 'Surveillance', 'Dossier',
            'Codename', 'Operative', 'Briefcase', 'Cipher', 'Stakeout',
            'Asset', 'Intercept', 'Burner', 'Dead Drop', 'Safehouse',
            'Encryption', 'Tradecraft', 'Disguise', 'Handler', 'Extraction',
        ],
    },
];

export function pickRandomCategory() {
    return imposterCategories[Math.floor(Math.random() * imposterCategories.length)];
}

export function getCategoryById(id) {
    return imposterCategories.find(c => c.id === id) || null;
}

export function pickWordPair(categoryId, mode) {
    const cat = getCategoryById(categoryId) || pickRandomCategory();
    const pool = cat.words;
    const word = pool[Math.floor(Math.random() * pool.length)];
    if (mode === 'decoy') {
        let decoy = word;
        let attempts = 0;
        while (decoy === word && attempts < 10) {
            decoy = pool[Math.floor(Math.random() * pool.length)];
            attempts += 1;
        }
        return { word, decoyWord: decoy, categoryLabel: cat.label };
    }
    return { word, decoyWord: '???', categoryLabel: cat.label };
}
