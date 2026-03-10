export const MOTIVATIONAL_QUOTES = [
  {
    quote:
      "The purpose of life is to live it, to taste experience to the utmost, to reach out eagerly and without fear for newer and richer experience.",
    author: "Eleanor Roosevelt",
  },
  {
    quote: "Life is either a daring adventure or nothing at all.",
    author: "Helen Keller",
  },
  {
    quote:
      "Twenty years from now you will be more disappointed by the things you didn't do than by the ones you did do.",
    author: "Mark Twain",
  },
  {
    quote:
      "The biggest adventure you can ever take is to live the life of your dreams.",
    author: "Oprah Winfrey",
  },
  { quote: "Not all those who wander are lost.", author: "J.R.R. Tolkien" },
  {
    quote:
      "To live is the rarest thing in the world. Most people exist, that is all.",
    author: "Oscar Wilde",
  },
  {
    quote: "Life begins at the end of your comfort zone.",
    author: "Neale Donald Walsch",
  },
  { quote: "Adventure is worthwhile in itself.", author: "Amelia Earhart" },
  {
    quote:
      "The world is a book and those who do not travel read only one page.",
    author: "Saint Augustine",
  },
  {
    quote:
      "Do not follow where the path may lead. Go instead where there is no path and leave a trail.",
    author: "Ralph Waldo Emerson",
  },
  { quote: "Together is a wonderful place to be.", author: "Unknown" },
  {
    quote: "In all the world, there is no heart for me like yours.",
    author: "Maya Angelou",
  },
  {
    quote: "The best thing to hold onto in life is each other.",
    author: "Audrey Hepburn",
  },
  {
    quote:
      "Love is not about how many days, months, or years you have been together. Love is about how much you love each other every single day.",
    author: "Unknown",
  },
  {
    quote: "Grow old with me, the best is yet to be.",
    author: "Robert Browning",
  },
];

export const RANDOM_BUCKET_IDEAS = [
  {
    title: "Watch a sunrise together",
    category: "Romance",
    description:
      "Wake up early and find the perfect spot to watch the sun come up",
  },
  {
    title: "Cook a 5-course meal",
    category: "Food",
    description: "Plan and prepare an elaborate dinner together at home",
  },
  {
    title: "Go stargazing",
    category: "Adventure",
    description:
      "Find a dark sky location and spend the night looking at stars",
  },
  {
    title: "Learn a new language together",
    category: "Learning",
    description: "Pick a language and practice together every day",
  },
  {
    title: "Visit a farmers market",
    category: "Food",
    description: "Explore local produce and try something new",
  },
  {
    title: "Take a dance class",
    category: "Learning",
    description: "Learn salsa, bachata, or any dance style together",
  },
  {
    title: "Plant a garden together",
    category: "Creative",
    description: "Start a small herb or flower garden",
  },
  {
    title: "Go on a road trip",
    category: "Travel",
    description: "Pick a destination and drive there together",
  },
  {
    title: "Write a bucket list song",
    category: "Creative",
    description: "Compose a silly song about your dreams together",
  },
  {
    title: "Have a movie marathon",
    category: "Personal",
    description: "Watch an entire movie series in one sitting",
  },
  {
    title: "Try a new sport together",
    category: "Health",
    description: "Sign up for tennis, badminton, or rock climbing",
  },
  {
    title: "Volunteer together",
    category: "Social",
    description: "Find a local charity and spend a day helping out",
  },
  {
    title: "Build something together",
    category: "Creative",
    description: "A bookshelf, a birdhouse, or anything DIY",
  },
  {
    title: "Have a picnic under the stars",
    category: "Romance",
    description: "Pack a blanket and snacks for an evening outdoor date",
  },
  {
    title: "Take a pottery class",
    category: "Learning",
    description: "Learn to make something beautiful with clay",
  },
  {
    title: "Go snorkeling or diving",
    category: "Adventure",
    description: "Explore underwater worlds together",
  },
  {
    title: "Create a scrapbook",
    category: "Creative",
    description: "Document your favorite memories in a physical book",
  },
  {
    title: "Ride a hot air balloon",
    category: "Adventure",
    description: "See the world from above together",
  },
  {
    title: "Have breakfast in bed",
    category: "Romance",
    description: "Surprise each other with a lovingly prepared breakfast",
  },
  {
    title: "Visit a museum together",
    category: "Learning",
    description: "Explore art, history, or science exhibits hand in hand",
  },
  {
    title: "Go camping",
    category: "Adventure",
    description: "Spend a night in nature under the open sky",
  },
  {
    title: "Bake cookies together",
    category: "Food",
    description: "Pick a recipe and make a batch of homemade cookies",
  },
  {
    title: "Take matching photos",
    category: "Personal",
    description: "Create a fun photoshoot with matching outfits",
  },
  {
    title: "Visit a botanical garden",
    category: "Travel",
    description: "Stroll through beautiful gardens together",
  },
  {
    title: "Write love letters",
    category: "Romance",
    description: "Express your feelings through heartfelt written words",
  },
  {
    title: "Learn to make sushi",
    category: "Food",
    description: "Master the art of sushi rolling at home",
  },
  {
    title: "Go kayaking",
    category: "Adventure",
    description: "Paddle through scenic waterways together",
  },
  {
    title: "Stargaze and name a star",
    category: "Romance",
    description: "Name a star after your relationship",
  },
  {
    title: "Complete a puzzle together",
    category: "Personal",
    description: "Work on a 1000-piece puzzle as a team",
  },
  {
    title: "Try zip-lining",
    category: "Adventure",
    description: "Get an adrenaline rush soaring through the trees",
  },
];

export function getRandomQuote() {
  return MOTIVATIONAL_QUOTES[
    Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)
  ];
}

export function getRandomBucketIdea() {
  return RANDOM_BUCKET_IDEAS[
    Math.floor(Math.random() * RANDOM_BUCKET_IDEAS.length)
  ];
}
