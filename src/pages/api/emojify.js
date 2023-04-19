import natural from "natural";
import nextConnect from "next-connect";

import emojiData from "@/data/emoji.json";

const handler = nextConnect();

handler.post(async (req, res) => {
  const { text } = JSON.parse(req.body);
  const result = emojify({
    text,
    stopWords: [
      "button",
      "get",
      "handle",
      "right",
      "left",
      "up",
      "down",
      "open",
      "new",
      "user",
      "not",
      "when",
      "so",
      "help",
      "medium",
      "train",
      "no",
      "limit",
      "light",
    ],
    augment: {
      ai: "🤖",
      react: "⚛️",
      communication: "💬",
      project: "🚧",
      code: "👨‍💻",
    },
    frequency: 2,
  });
  res.status(200).json({ result });
});

export default handler;

function emojify({
  text = "",
  stopWords = [],
  augment = {},
  frequency = 1,
} = {}) {
  const emojiDict = {};
  const stopWordsSet = new Set(stopWords);
  for (let i = 0; i < emojiData.length; i++) {
    const tags = emojiData[i].tags;
    for (let j = 0; j < tags.length; j++) {
      const tag = tags[j];
      if (!emojiDict[tag]) {
        emojiDict[tag] = [emojiData[i].emoji];
      } else {
        emojiDict[tag].push(emojiData[i].emoji);
      }
      const synonyms = natural.PorterStemmer.tokenizeAndStem(
        emojiData[i].description
      );
      for (let k = 0; k < synonyms.length; k++) {
        const synonym = synonyms[k];
        if (
          !stopWordsSet.has(tag) &&
          !stopWordsSet.has(synonym) &&
          !augment[synonym]
        ) {
          if (!emojiDict[synonym]) {
            emojiDict[synonym] = [emojiData[i].emoji];
          } else {
            emojiDict[synonym].push(emojiData[i].emoji);
          }
        }
      }
    }
  }
  Object.keys(augment).forEach((word) => {
    emojiDict[word] = [augment[word]];
  });
  const sentences = text.match(/[^.!?]+[.!?]+/g);
  let result = "";
  let lastEmoji = null;
  let sentenceCount = 0;
  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];
    const words = sentence.split(/(\b|\s|(?<!-)-[^\W_])/);
    let hyphenated = false;
    for (let j = 0; j < words.length; j++) {
      const word = words[j];
      if (word.includes("-")) {
        hyphenated = true;
        result += word;
        continue;
      }
      let emoji = "";
      if (emojiDict[word] && !stopWordsSet.has(word) && !hyphenated) {
        emoji = emojiDict[word][0];
      } else {
        const stems = natural.PorterStemmer.tokenizeAndStem(word);
        for (let k = 0; k < stems.length; k++) {
          const stem = stems[k];
          if (emojiDict[stem] && !stopWordsSet.has(stem) && !hyphenated) {
            emoji = emojiDict[stem][0];
            break;
          }
        }
      }
      if (!hyphenated) {
        if (sentenceCount % frequency === 0 && emoji && emoji !== lastEmoji) {
          result = result.replace(/(\b|\s)$/, " " + emoji);
          lastEmoji = emoji;
        }
        result += word;
      } else {
        if (emoji && emoji !== lastEmoji) {
          result = result.replace(/(\b|\s)-[^\W_]+/, " $& " + emoji);
          lastEmoji = emoji;
        } else {
          result += word;
        }
      }
      hyphenated = false;
    }
    sentenceCount++;
    if (i < sentences.length - 1) {
      result += " ";
    }
  }
  return result.trim();
}
