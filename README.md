**WORK IN PROGRESS**

⚠️ Project is in developement state and isn't released yet. ⚠️

This repository is created for Telegram Bot F-Cards-Bot for adding and memorizing staff using flash cards concept. 

# Purpose 

 Bot is designed to help you remember and keep in memory things that you want to learn. To my experience, best way to learn stufff (is it new english words, exam questions or technology updates you read about) is to write them down in a form of questions that you will answer again and again untill they firmly stuck in your memory. This is similar to [Flashcards](https://en.wikipedia.org/wiki/Flashcard) idea with [Leitner sytem](https://en.wikipedia.org/wiki/Leitner_system).
 

### Existing products 

There are plenty of different telegram bots with flash cards functionality: 

 - [Memcards Bot](https://t.me/memcards_bot) - well-written bot based on Ebbinghaus Forgetting Curve and Spaced Repetition principle.

 - [Oppi Words Bot](https://t.me/OppiWords) - another bot with strong idea in basis. Bot can not only show you cards, but also check your answers. Bot is focused on language learning and is synchronized with Wiktionary, that makes process a lot easier. 

Other flash cards bots that aren't that great, but also deserve a look. You can find them by typing "Flash cards" or "Memorize cards" in Telegram search input.

### Differences 

Main thing that I missed when exploring other products was ability to add "not answered" questions. This feature may be useful when you are preparing for the exam and have a list of questions, so you can add them to the system and track your progress when solving them one-by-one.

Other big thing is the ability to add extended information to your answers. [Contextual learning](https://en.wikipedia.org/wiki/Contextual_learning) plays key role in memorizing process, so it is useful to add comments and personal experience notes to the card. 


### Why Telegram?

They are tons of products in application stores that are made for this purposes. Bad news are, that users spend 80% of their time for three favorite applications. So, to my experience, even if you have memorizing apps installed on your phone, you will forget about them pretty soon (what an irony, huh).
Push notifications can help apps last on your horizon a little longer, but they don't solve the main problem. 

Telegram bots seem to be the best soluiton here: 
- I open Telegram constantly over the day to chat with friends and colleagues, read news and receive work notifications
- User doesn't need to install anything to start working with bot
- Developement is also a lot easier - you don't have to thing about authentication, notifications and other stuff that often causes problems

# Get started 

Open your telegram, find _"F-Cards Bot"_ via searchbar, or open [direct link](https://t.me/f_cards_bot)

type `/start` to shake bot's hand

`/use CATEGORY_NAME`  to select a category. If category doesn't exists (none exists at the beginning), new category will be created. 
_category is a group of cards, combined with one team. E.g. "english words", "math exam", etc._

`/add` to start adding questions. You will be ased to provide question, anwer and description (or the quesion only). Fields can contain text, photo, video and audio. 

run `/learn` to start practicing in current category. 

`/info` will output list of existing categories and progress by each of them. 

