const CATEGORIES = [
  { id: "shade",   label: "to the shade",       color: "#968AAB" },
  { id: "water",   label: "toward the water",   color: "#47C178" },
  { id: "someone", label: "closer to someone",  color: "#F9EA32" },
  { id: "away",    label: "away from everyone", color: "#8F8102" },
  { id: "still",   label: "did not move it",    color: "#FF5229" }
];

const ENTRIES = {
  shade: [
    { id: "sh1", text: "The waves are quiet and calm today, I might come back to this spot tomorrow.", photo: null, date: "October 11th, 2026" },
    { id: "sh2", text: "There is this tree close to the stones that I really like. It creates a nice shade and I can hear the waves.", photo: "img/messages/img_9741.jpg", date: "October 9th, 2026", seed: true },
    { id: "sh3", text: null, photo: "img/messages/img_9754.jpg", date: "October 12th, 2026", seed: true },
    { id: "sh4", text: "I come here during the lunch break. The walk from Tandon is a little long, but it is worth it.", photo: null, date: "October 6th, 2026", seed: true },
    { id: "sh5", text: null, photo: "img/messages/img_9751.jpg", date: "October 13th, 2026", seed: true }
  ],

  water: [
    { id: "wa1", text: "I moved this chair closer to the stones to stretch my legs on them and relax. Waves are quiet today. I can see someone setting up a birthday party table for their kid at the waterfront walk.", photo: null, date: "October 10th, 2026" },
    { id: "wa2", text: null, photo: "img/messages/img_9570.jpg", date: "October 12th, 2026", seed: true },
    { id: "wa3", text: "Counted seven runners in 10 minutes. Maybe I should get back to Sunday morning runs, too.", photo: "img/messages/img_9573.jpg", date: "October 8th, 2026", seed: true },
    { id: "wa4", text: null, photo: "img/messages/img_9753.jpg", date: "October 13th, 2026", seed: true },
    { id: "wa5", text: "Turned the chair away from the city to face the trees instead. I like it this way.", photo: null, date: "October 5th, 2026", seed: true },
    { id: "wa6", text: null, photo: "img/messages/img_9752.jpg", date: "October 7th, 2026", seed: true }
  ],

  someone: [
    { id: "so1", text: "I pulled this chair around to watch ferries with my friend. We stayed until it started raining.", photo: null, date: "October 11th, 2026" },
    { id: "so2", text: null, photo: "img/messages/img_9740.jpg", date: "October 9th, 2026", seed: true },
    { id: "so3", text: "My mom will visit me in November, I will definitely bring her here.", photo: null, date: "October 4th, 2026", seed: true },
    { id: "so4", text: null, photo: "img/messages/img_9755.jpg", date: "October 12th, 2026", seed: true },
    { id: "so5", text: "Dragged a second chair to put my bag on it. Someone looks like they fell asleep on a chair next to the stones.", photo: "img/messages/img_9749.jpg", date: "October 2nd, 2026", seed: true }
  ],

  away: [
    { id: "aw1", text: "Last time I was here it was raining.", photo: null, date: "October 10th, 2026" },
    { id: "aw2", text: null, photo: "img/messages/img_9751.jpg", date: "October 13th, 2026", seed: true },
    { id: "aw3", text: "Did not want to talk to anyone today.", photo: null, date: "October 7th, 2026", seed: true },
    { id: "aw4", text: null, photo: "img/messages/img_9744.jpg", date: "October 11th, 2026", seed: true },
    { id: "aw5", text: "Sometimes I push the chair around for a while just to live fun traces.", photo: "img/messages/img_9571.jpg", date: "October 3rd, 2026", seed: true },
    { id: "aw6", text: null, photo: "img/messages/img_9739.jpg", date: "October 8th, 2026", seed: true }
  ],

  still: []
};

const PAST_MAPS = [
  { date: "October 17th, 2026", img: "img/maps/2026-10-17.jpg", color: "#FF5229" },
  { date: "October 16th, 2026", img: "img/maps/2026-10-16.jpg", color: "#968AAB" },
  { date: "October 15th, 2026", img: "img/maps/2026-10-15.jpg", color: "#F9EA32" },
  { date: "October 14th, 2026", img: "img/maps/2026-10-14.jpg", color: "#47C178" }
];