const CHAIRS = [
  {
    id: 1,
    slug: "blue1",
    color: "#7087F0",
    trait: "forgetful",
    voice: {
      greet: "Chair one: the forgetful one. Have we met? They fix the gravel every morning and I lose track.",
      ask: "Remind me, how did you move me?",
      still: "You did not move me. Or you did and I have already forgotten. Either way, I will wait here.",
      coll: "Other people did the same thing. I wrote theirs down so I would not lose them.",
      map: "This is today, I think. Drag me somewhere and I will try to stick to the line.",
      thanks: "Saved. Which is just as well, because by tomorrow I will not remember any of it."
    }
  },
  {
    id: 2,
    slug: "yellow",
    color: "#F9EA32",
    trait: "excited",
    voice: {
      greet: "Chair two: the excited one. Someone is finally sitting down!",
      ask: "Tell me, how did you move me?",
      still: "You did not move me? Not even a little? I will wait then.",
      coll: "Plenty of people moved a chair the same way. Here is everything they left.",
      map: "Here is the gravel. Drag me. Anywhere! I want to see the line.",
      thanks: "Got it. Someone is going to discover your note, and I cannot wait!"
    }
  },
  {
    id: 3,
    slug: "green2",
    color: "#47C178",
    trait: "talkative",
    voice: {
      greet: "Chair three: the talkative one. Busy morning: four people, one dog, somebody's birthday down on the walk.",
      ask: "Anyway, how did you move me?",
      still: "Did not move me? That is alright. I will wait, I have plenty of things to deal with.",
      coll: "Oh, loads of people moved a chair that way. Here is what they all left.",
      map: "Right, the gravel. Everyone has been through here today, look at the state of it. Drag me.",
      thanks: "Saved. I will tell the next one all about this move."
    }
  },
  {
    id: 4,
    slug: "green1",
    color: "#8F8102",
    trait: "curious",
    voice: {
      greet: "Chair four: the curious one. I was wondering who would sit down next.",
      ask: "So how did you move me?",
      still: "You left me where I was. This is fine, but I would rather see where you think I belong. I will wait.",
      coll: "Other people pulled a chair the same way. Here is what they left.",
      map: "This is the gravel today. Drag me, and I will remember the line you make.",
      thanks: "Noted. I will keep it for whoever sits here next."
    }
  },
  {
    id: 5,
    slug: "pink",
    color: "#F393C1",
    trait: "grumpy",
    voice: {
      greet: "Chair five: the grumpy one. Pink. I did not choose the color.",
      ask: "Okay, how did you move me?",
      still: "Fine. You did not move me. Nobody moves me these days. I will be here when you change your mind.",
      coll: "Same move as these. Check their messages out if you want.",
      map: "The gravel. It gets raked every morning, so none of these last. Drag me anyway.",
      thanks: "Fine. It is saved. Thank you, next."
    }
  },
  {
    id: 6,
    slug: "orange",
    color: "#FF5229",
    trait: "cautious",
    voice: {
      greet: "Chair six: the cautious one. Mind the gravel, it moves around.",
      ask: "First of all, how did you move me?",
      still: "You left me where I was. No worries, I will be here when you are ready.",
      coll: "A few others moved a chair this way. Read what they left for you.",
      map: "This is the gravel today. You can drag me around, nothing goes anywhere but here.",
      thanks: "Kept. Only the message and the trace, nothing about you personally."
    }
  },
  {
    id: 7,
    slug: "purple",
    color: "#968AAB",
    trait: "quiet",
    voice: {
      greet: "Chair seven: the quiet one.",
      ask: "How did you move me?",
      still: "You left me where I was. That is alright, I will wait.",
      coll: "Others moved a chair the same way, here.",
      map: "Today's gravel. Drag me.",
      thanks: "Kept."
    }
  },
  {
    id: 8,
    slug: "blue2",
    color: "#9BC7F4",
    trait: "relaxed",
    voice: {
      greet: "Chair eight: the relaxed one. No rush.",
      ask: "Whenever you are ready - how did you move me?",
      still: "You left me where I was. Honestly, fine by me. I will be here.",
      coll: "Other people moved a chair the same way. Take your time with these.",
      map: "The gravel for today. Drag me around if you feel like it.",
      thanks: "Kept. That will find someone eventually."
    }
  }
];
