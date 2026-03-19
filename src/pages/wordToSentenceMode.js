import audioPlayer from '../utils/audio.js';

// 单词造句模式
export class WordToSentenceMode {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.questionsPerRound = 10;
    this.questions = [];
    this.currentIndex = 0;
    this.score = 0;
    this.answers = [];
    this.selectedAnswer = null;
    // 添加选择状态跟踪
    this.questionStates = {}; // 记录每题的选择状态
    this.hasAnswered = false; // 当前题目是否已回答
  }

  init() {
    this.generateQuestions();
    this.renderQuiz();
    this.bindEvents();
  }

  generateQuestions() {
    // 单词造句素材
    const wordSentenceQuestions = [
      {
        word: "one",
        wordChinese: "一",
        englishSentences: [
          "I've got one cat. It's a black cat.",
          "Look! One red toy is on the chair.",
          "How many cats have you got? I've got one."
        ],
        chineseSentences: [
          "我有一只猫。它是一只黑色的猫。",
          "看！一个红色的玩具在椅子上。",
          "你有多少只猫？我有一只。"
        ]
      },
      {
        word: "two",
        wordChinese: "二",
        englishSentences: [
          "I've got two black eyes.",
          "Two potatoes are on the table.",
          "The dog has two short legs."
        ],
        chineseSentences: [
          "我有两只黑色的眼睛。",
          "桌子上有两个土豆。",
          "看那只狗！它有两条短腿。"
        ]
      },
      {
        word: "three",
        wordChinese: "三",
        englishSentences: [
          "I've got three green toy cars.",
          "Three dolls are on the sofa.",
          "How many eggs are in the kitchen? Three."
        ],
        chineseSentences: [
          "我有三个绿色的玩具汽车。",
          "沙发上坐着三个洋娃娃。",
          "厨房里有多少个鸡蛋？三个。"
        ]
      },
      {
        word: "four",
        wordChinese: "四",
        englishSentences: [
          "Four books are on the chair.",
          "Look at the frog! It's got four legs.",
          "Our family has four people. They are my mother, father, sister and me."
        ],
        chineseSentences: [
          "椅子上有四本书。",
          "看那只青蛙！它有四条腿。",
          "我家有四口人。他们是我的妈妈、爸爸、妹妹和我。"
        ]
      },
      {
        word: "five",
        wordChinese: "五",
        englishSentences: [
          "I've got five fingers on my hand.",
          "Pass me the five red tomatoes, please.",
          "Look at the spider! It's got eight legs, but it hasn't got five legs."
        ],
        chineseSentences: [
          "我有五个手指。",
          "请给我五个红色的西红柿。",
          "看那只蜘蛛！它有八条腿，不是五条。"
        ]
      },
      {
        word: "six",
        wordChinese: "六",
        englishSentences: [
          "I've got six yellow erasers.",
          "How many balls are under the bed? Six.",
          "That robot has got six arms."
        ],
        chineseSentences: [
          "我有六个黄色的橡皮。",
          "床下有多少个球？六个。",
          "那个机器人有六只手臂。"
        ]
      },
      {
        word: "seven",
        wordChinese: "七",
        englishSentences: [
          "Look! Seven pink birds are on the house.",
          "My grandfather is seventy-one. He is old, but he is happy.",
          "How many orange toys have you got? I've got seven."
        ],
        chineseSentences: [
          "看！七只粉色的鸟在房子上。",
          "我的爷爷七十一岁。他很老，但是很快乐。",
          "你有多少个橙色的玩具？我有七个。"
        ]
      },
      {
        word: "eight",
        wordChinese: "八",
        englishSentences: [
          "A spider has got eight legs.",
          "I've got eight pencils in my bag.",
          "Look at the fish! Eight fish can swim."
        ],
        chineseSentences: [
          "蜘蛛有八条腿。",
          "我的书包里有八支铅笔。",
          "看那些鱼！八条鱼会游泳。"
        ]
      },
      {
        word: "nine",
        wordChinese: "九",
        englishSentences: [
          "I've got nine white erasers.",
          "How old are you? I'm nine.",
          "Nine cakes are on the table. I like cake!"
        ],
        chineseSentences: [
          "我有九个白色的橡皮。",
          "你几岁了？我九岁。",
          "桌上有九块蛋糕。我喜欢蛋糕！"
        ]
      },
      {
        word: "ten",
        wordChinese: "十",
        englishSentences: [
          "I've got ten fingers.",
          "Look! Ten toy cars are on the floor.",
          "How many purple toys are on the chair? Ten."
        ],
        chineseSentences: [
          "我有十根手指。",
          "看！十辆玩具汽车在地板上。",
          "多少个紫色的玩具在椅子上？十个。"
        ]
      },
      {
        word: "red",
        wordChinese: "红色",
        englishSentences: [
          "My favourite color is red.",
          "I've got a red apple. It's on the table.",
          "Pass me the red pencil, please."
        ],
        chineseSentences: [
          "我最喜欢的颜色是红色。",
          "我有一个红色的苹果。它在桌子上。",
          "请把那个红色的铅笔给我。"
        ]
      },
      {
        word: "white",
        wordChinese: "白色",
        englishSentences: [
          "Look at the white bird! It can fly.",
          "I've got a white cat and a black dog.",
          "An egg is white. I like eggs."
        ],
        chineseSentences: [
          "看那只白色的鸟！它会飞。",
          "我有一只白色的猫和一只黑色的狗。",
          "鸡蛋是白色的。我喜欢鸡蛋。"
        ]
      },
      {
        word: "black",
        wordChinese: "黑色",
        englishSentences: [
          "My father has got a black car.",
          "The black spider is small.",
          "I like black and white."
        ],
        chineseSentences: [
          "我的爸爸有一辆黑色的车。",
          "那只黑色的蜘蛛很小。",
          "我喜欢黑色和白色。"
        ]
      },
      {
        word: "blue",
        wordChinese: "蓝色",
        englishSentences: [
          "My eyes are blue.",
          "My eraser is blue.",
          "What's your favourite color? My favourite color is blue."
        ],
        chineseSentences: [
          "我的眼睛是蓝色的。",
          "我的橡皮是蓝色的。",
          "你最喜欢的颜色是什么？我最喜欢的颜色是蓝色。"
        ]
      },
      {
        word: "yellow",
        wordChinese: "黄色",
        englishSentences: [
          "I've got a yellow toy car.",
          "Bananas are yellow. They are fruit.",
          "Color the yellow bag blue."
        ],
        chineseSentences: [
          "我有一辆黄色的玩具汽车。",
          "香蕉是黄色的。它们是水果。",
          "把那个黄色的书包涂成蓝色。"
        ]
      },
      {
        word: "green",
        wordChinese: "绿色",
        englishSentences: [
          "Look at the green frog! It can jump.",
          "My pencil is green.",
          "I've got a green apple. It's under the chair."
        ],
        chineseSentences: [
          "看那只绿色的青蛙！它会跳。",
          "我的铅笔是绿色的。",
          "我有一个绿色的苹果。它在椅子下面。"
        ]
      },
      {
        word: "pink",
        wordChinese: "粉色",
        englishSentences: [
          "I've got a pink doll. She's beautiful.",
          "My sister likes pink.",
          "Pass me the pink pencil, please."
        ],
        chineseSentences: [
          "我有一个粉色的洋娃娃。她很漂亮。",
          "我的妹妹喜欢粉色。",
          "请把那支粉色的铅笔给我。"
        ]
      },
      {
        word: "orange",
        wordChinese: "橙色",
        englishSentences: [
          "Oranges are orange.",
          "Look at the orange bag! It's big.",
          "I've got an orange cat. It's beautiful."
        ],
        chineseSentences: [
          "橙子是橙色的。",
          "看那个橙色的书包！它很大。",
          "我有一只橙色的猫。它很漂亮。"
        ]
      },
      {
        word: "purple",
        wordChinese: "紫色",
        englishSentences: [
          "I've got a purple robot. It's small.",
          "Grapes are purple. I like grapes.",
          "Color the purple chair black."
        ],
        chineseSentences: [
          "我有一个紫色的机器人。它很小。",
          "葡萄是紫色的。我喜欢葡萄。",
          "把那个紫色的椅子涂成黑色。"
        ]
      },
      {
        word: "color",
        wordChinese: "颜色",
        englishSentences: [
          "What's your favourite color?",
          "Color the bird yellow.",
          "Look at the toys! What color are they?"
        ],
        chineseSentences: [
          "你最喜欢的颜色是什么？",
          "把那只鸟涂成黄色。",
          "看这些玩具！它们是什么颜色？"
        ]
      },
      {
        word: "listen",
        wordChinese: "听",
        englishSentences: [
          "Listen to your mother.",
          "Listen, and point to your head.",
          "Listen, and point to the book."
        ],
        chineseSentences: [
          "听你妈妈的话。",
          "听，并指着你的头。",
          "听，指着书。"
        ]
      },
      {
        word: "look",
        wordChinese: "看",
        englishSentences: [
          "Look! The cat is on the sofa.",
          "Look! That tiger is big.",
          "Look at the book."
        ],
        chineseSentences: [
          "看！那只猫在沙发上。",
          "看！那只老虎很大。",
          "看着书。"
        ]
      },
      {
        word: "point",
        wordChinese: "指",
        englishSentences: [
          "Point to your eyes.",
          "Point to the red toy car.",
          "Listen, and point to the door."
        ],
        chineseSentences: [
          "指着你的眼睛。",
          "指着那辆红色的玩具汽车。",
          "听，并指着门。"
        ]
      },
      {
        word: "sit down",
        wordChinese: "坐下",
        englishSentences: [
          "Sit down on the chair, please.",
          "The teacher says, Sit down.",
          "Sit down and look at the book."
        ],
        chineseSentences: [
          "请坐在椅子上。",
          "老师说：坐下。",
          "坐下，并看着书。"
        ]
      },
      {
        word: "stand up",
        wordChinese: "站起来",
        englishSentences: [
          "Stand up, please.",
          "The teacher says  Stand up.",
          "Stand up and point to the door."
        ],
        chineseSentences: [
          "请站起来。",
          "老师说：站起来。",
          "站起来，并指着门。"
        ]
      },
      {
        word: "open",
        wordChinese: "打开",
        englishSentences: [
          "Open your book, please.",
          "Open the door.",
          "Look! That boy is opening his bag."
        ],
        chineseSentences: [
          "请打开你的书。",
          "打开门。",
          "看！那个男孩在打开他的书包。"
        ]
      },
      {
        word: "close",
        wordChinese: "关闭",
        englishSentences: [
          "Close your book, please.",
          "Close the door.",
          "Look! That girl is closing the door."
        ],
        chineseSentences: [
          "请关上你的书。",
          "关上门。",
          "看！那个女孩在关门。"
        ]
      },
      {
        word: "hello",
        wordChinese: "你好",
        englishSentences: [
          "Hello, mother!",
          "Say hello to your friend.",
          "Hello! What's your name?"
        ],
        chineseSentences: [
          "你好，妈妈！",
          "对你的朋友说你好。",
          "你好！你叫什么名字？"
        ]
      },
      {
        word: "talk",
        wordChinese: "说话",
        englishSentences: [
          "Please don't talk in class.",
          "Look! Those two girls are talking.",
          "My bird can talk."
        ],
        chineseSentences: [
          "请不要在课堂上讲话。",
          "看！那两个女孩在说话。",
          "我的鸟会说话。"
        ]
      },
      {
        word: "jump",
        wordChinese: "跳",
        englishSentences: [
          "Look at the frog! It can jump.",
          "I can jump, but I can't fly.",
          "That dog can jump."
        ],
        chineseSentences: [
          "看那只青蛙！它会跳。",
          "我会跳，但我不会飞。",
          "那只狗会跳。"
        ]
      },
      {
        word: "fly",
        wordChinese: "飞",
        englishSentences: [
          "Look at the bird! It can fly.",
          "Spiders can't fly, but birds can fly.",
          "I've got a kite. It's red. It can fly."
        ],
        chineseSentences: [
          "看那只鸟！它会飞。",
          "蜘蛛不会飞，但鸟会飞。",
          "我有一个风筝。它是红色的。它会飞。"
        ]
      },
      {
        word: "swim",
        wordChinese: "游泳",
        englishSentences: [
          "Fish can swim.",
          "I can swim, but I can't fly.",
          "Look at the duck! It can swim."
        ],
        chineseSentences: [
          "鱼会游泳。",
          "我会游泳，但我不会飞。",
          "看那只鸭子！它会游泳。"
        ]
      },
      {
        word: "food",
        wordChinese: "食物",
        englishSentences: [
          "I like food. Cake is my favourite.",
          "Food is in the kitchen.",
          "What's your favourite food? It's chips."
        ],
        chineseSentences: [
          "我喜欢食物。蛋糕是我的最爱。",
          "厨房里有食物。",
          "你最喜欢的食物是什么？是薯条。"
        ]
      },
      {
        word: "cake",
        wordChinese: "蛋糕",
        englishSentences: [
          "I like cake. It's food.",
          "A big cake is on the table.",
          "Here's a cake for you. Thank you."
        ],
        chineseSentences: [
          "我喜欢蛋糕。它是食物。",
          "桌子上有一个大蛋糕。",
          "给你一个蛋糕。谢谢。"
        ]
      },
      {
        word: "potato",
        wordChinese: "土豆",
        englishSentences: [
          "Potatoes are food. I like potatoes.",
          "Look at the potatoes! They are on the table.",
          "How many potatoes have I got? I've got five."
        ],
        chineseSentences: [
          "土豆是食物。我喜欢土豆。",
          "看那些土豆！它们在桌子上。",
          "我有多少土豆？我有五个。"
        ]
      },
      {
        word: "tomato",
        wordChinese: "西红柿",
        englishSentences: [
          "Tomatoes are red.",
          "I don't like tomatoes.",
          "How many tomatoes are on the table? Six."
        ],
        chineseSentences: [
          "西红柿是红色的。",
          "我不喜欢西红柿。",
          "桌子上有多少个西红柿？六个。"
        ]
      },
      {
        word: "chips",
        wordChinese: "薯片",
        englishSentences: [
          "I like chips. They are food.",
          "Pass me the chips, please.",
          "Look! The chips are on the table."
        ],
        chineseSentences: [
          "我喜欢薯条。它们是食物。",
          "请给我一些薯条。",
          "看！薯条在桌子上。"
        ]
      },
      {
        word: "fruit",
        wordChinese: "水果",
        englishSentences: [
          "I like fruit. Apples are my favourite.",
          "Look at the fruit! They are apples and bananas.",
          "What's your favourite food? It's fruit."
        ],
        chineseSentences: [
          "我喜欢水果。苹果是我的最爱。",
          "看这些水果！它们是苹果和香蕉。",
          "你最喜欢的食物是什么？是水果。"
        ]
      },
      {
        word: "milk",
        wordChinese: "牛奶",
        englishSentences: [
          "I like milk.",
          "Milk is in the kitchen.",
          "Look at the white cat! It likes milk."
        ],
        chineseSentences: [
          "我喜欢牛奶。",
          "牛奶在厨房里。",
          "看那只白色的猫！它喜欢牛奶。"
        ]
      },
      {
        word: "egg",
        wordChinese: "鸡蛋",
        englishSentences: [
          "Eggs are white.",
          "I don't like eggs.",
          "How many eggs are on the table? Three."
        ],
        chineseSentences: [
          "鸡蛋是白色的。",
          "我不喜欢鸡蛋。",
          "桌上有多少个鸡蛋？三个。"
        ]
      },
      {
        word: "in",
        wordChinese: "在...里面",
        englishSentences: [
          "My pencil is in my bag.",
          "My cat is in the house.",
          "The book is in the bag."
        ],
        chineseSentences: [
          "我的铅笔在书包里。",
          "我的猫在房子里。",
          "书在书包里。"
        ]
      },
      {
        word: "on",
        wordChinese: "在...上面",
        englishSentences: [
          "The book is on the table.",
          "Look at the bird! It's on the house.",
          "My toy car is on the bed."
        ],
        chineseSentences: [
          "书在桌子上。",
          "看那只鸟！它在房子上。",
          "我的玩具汽车在床上。"
        ]
      },
      {
        word: "under",
        wordChinese: "在...下面",
        englishSentences: [
          "My cat is under the chair.",
          "Look! The ball is under the bed.",
          "Where's my pencil? It's under the book."
        ],
        chineseSentences: [
          "我的猫在椅子下面。",
          "看！那个球在床下面。",
          "我的铅笔在哪里？它在书下面。"
        ]
      },
      {
        word: "body",
        wordChinese: "身体",
        englishSentences: [
          "I've got a head, arms, and legs. This is my body.",
          "Point to your body.",
          "My body is big."
        ],
        chineseSentences: [
          "我有头、手臂和腿。这是我的身体。",
          "指着你的身体。",
          "我的身体很大。"
        ]
      },
      {
        word: "eye",
        wordChinese: "眼睛",
        englishSentences: [
          "I've got two blue eyes.",
          "Point to your eyes.",
          "Look at the cat! It's got green eyes."
        ],
        chineseSentences: [
          "我有两只蓝色的眼睛。",
          "指着你的眼睛。",
          "看那只猫！它有绿色的眼睛。"
        ]
      },
      {
        word: "mouth",
        wordChinese: "嘴巴",
        englishSentences: [
          "Point to your mouth.",
          "Open your mouth.",
          "Look at the dog! Its mouth is big."
        ],
        chineseSentences: [
          "指着你的嘴巴。",
          "张开你的嘴巴。",
          "看那只狗！它的嘴巴很大。"
        ]
      },
      {
        word: "hand",
        wordChinese: "手",
        englishSentences: [
          "I've got two hands.",
          "Point to your hand.",
          "My hand is small."
        ],
        chineseSentences: [
          "我有两只手。",
          "指着你的手。",
          "我的手很小。"
        ]
      },
      {
        word: "leg",
        wordChinese: "腿",
        englishSentences: [
          "I've got two legs.",
          "Point to your legs.",
          "That spider has got eight legs."
        ],
        chineseSentences: [
          "我有两条腿。",
          "指着你的腿。",
          "那只蜘蛛有八条腿。"
        ]
      },
      {
        word: "arm",
        wordChinese: "胳膊",
        englishSentences: [
          "I've got two arms.",
          "Point to your arms.",
          "That robot has got long arms."
        ],
        chineseSentences: [
          "我有两条手臂。",
          "指着你的手臂。",
          "那个机器人有长手臂。"
        ]
      },
      {
        word: "head",
        wordChinese: "头",
        englishSentences: [
          "Point to your head.",
          "My head is big.",
          "Look at the tiger! Its head is big."
        ],
        chineseSentences: [
          "指着你的头。",
          "我的头很大。",
          "看那只老虎！它的头很大。"
        ]
      },
      {
        word: "house",
        wordChinese: "房子",
        englishSentences: [
          "Look at my house! It's red.",
          "My house is big.",
          "That cat is on the house."
        ],
        chineseSentences: [
          "看我的房子！它是红色的。",
          "我的房子很大。",
          "那只猫在房子上。"
        ]
      },
      {
        word: "sofa",
        wordChinese: "沙发",
        englishSentences: [
          "The cat is on the sofa.",
          "Look at the sofa! It's big.",
          "My doll is under the sofa."
        ],
        chineseSentences: [
          "猫在沙发上。",
          "看那个沙发！它很大。",
          "我的洋娃娃在沙发下面。"
        ]
      },
      {
        word: "door",
        wordChinese: "门",
        englishSentences: [
          "The door is black.",
          "Close the door, please.",
          "Look! A black spider is on the door."
        ],
        chineseSentences: [
          "门是黑色的。",
          "请关上门。",
          "看！一只黑色的蜘蛛在门上。"
        ]
      },
      {
        word: "bed",
        wordChinese: "床",
        englishSentences: [
          "My bed is blue.",
          "The cat is under the bed.",
          "A big bed is in my bedroom."
        ],
        chineseSentences: [
          "我的床是蓝色的。",
          "猫在床下面。",
          "我的卧室里有一张大床。"
        ]
      },
      {
        word: "living room",
        wordChinese: "客厅",
        englishSentences: [
          "A sofa and a chair are in the living room.",
          "My family are in the living room.",
          "Look at the cat! It's in the living room."
        ],
        chineseSentences: [
          "客厅里有沙发和椅子。",
          "我的家人在客厅里。",
          "看那只猫！它在客厅里。"
        ]
      },
      {
        word: "bedroom",
        wordChinese: "卧室",
        englishSentences: [
          "This is my bedroom. It's small.",
          "The bed is in the bedroom.",
          "Look at my bedroom! It's beautiful."
        ],
        chineseSentences: [
          "这是我的卧室。它很小。",
          "床在卧室里。",
          "看我的卧室！它很漂亮。"
        ]
      },
      {
        word: "kitchen",
        wordChinese: "厨房",
        englishSentences: [
          "Food is in the kitchen.",
          "My mother is in the kitchen.",
          "Look at the kitchen! It's big."
        ],
        chineseSentences: [
          "食物在厨房里。",
          "我的妈妈在厨房里。",
          "看那个厨房！它很大。"
        ]
      },
      {
        word: "animal",
        wordChinese: "动物",
        englishSentences: [
          "I like animals. Cats are my favourite.",
          "Look at the animals! They are tigers, ducks, and fish.",
          "What's your favourite animal? It's a dog."
        ],
        chineseSentences: [
          "我喜欢动物。猫是我的最爱。",
          "看那些动物！它们是老虎、鸭子和鱼。",
          "你最喜欢的动物是什么？是狗。"
        ]
      },
      {
        word: "cat",
        wordChinese: "猫",
        englishSentences: [
          "I've got a white cat.",
          "Look at the cat! It's on the sofa.",
          "I like cats. They are beautiful."
        ],
        chineseSentences: [
          "我有一只白色的猫。",
          "看那只猫！它在沙发上。",
          "我喜欢猫。它们很漂亮。"
        ]
      },
      {
        word: "fish",
        wordChinese: "鱼",
        englishSentences: [
          "Look at the fish! They can swim.",
          "I've got a cat. It likes fish.",
          "Fish are animals."
        ],
        chineseSentences: [
          "看那些鱼！它们会游泳。",
          "我有一只猫。它喜欢鱼。",
          "鱼是动物。"
        ]
      },
      {
        word: "bird",
        wordChinese: "鸟",
        englishSentences: [
          "Look at the bird! It's red.",
          "Birds can fly.",
          "I've got a bird. It's beautiful."
        ],
        chineseSentences: [
          "看那只鸟！它是红色的。",
          "鸟会飞。",
          "我有一只鸟。它很漂亮。"
        ]
      },
      {
        word: "duck",
        wordChinese: "鸭子",
        englishSentences: [
          "Look at the duck! It's yellow.",
          "Ducks can swim.",
          "Ducks have got two legs."
        ],
        chineseSentences: [
          "看那只鸭子！它是黄色的。",
          "鸭子会游泳。",
          "鸭子有两条腿。"
        ]
      },
      {
        word: "tiger",
        wordChinese: "老虎",
        englishSentences: [
          "Look at the tiger! It's big.",
          "Tigers are orange.",
          "I don't like tigers. They are ugly."
        ],
        chineseSentences: [
          "看那只老虎！它很大。",
          "老虎是橙色的。",
          "我不喜欢老虎。它们很丑。"
        ]
      },
      {
        word: "dog",
        wordChinese: "狗",
        englishSentences: [
          "I've got a black dog.",
          "Look at the dog! It's got four short legs.",
          "I like dogs."
        ],
        chineseSentences: [
          "我有一只黑色的狗。",
          "看那只狗！它有四条短腿。",
          "我喜欢狗。"
        ]
      },
      {
        word: "frog",
        wordChinese: "青蛙",
        englishSentences: [
          "Look at the green frog! It can jump.",
          "Frogs have got two long legs.",
          "I like frogs."
        ],
        chineseSentences: [
          "看那只绿色的青蛙！它会跳。",
          "青蛙有两条长腿。",
          "我喜欢青蛙。"
        ]
      },
      {
        word: "spider",
        wordChinese: "蜘蛛",
        englishSentences: [
          "Look at the spider! It's got eight legs.",
          "I don't like spiders. They are ugly.",
          "A black spider is on the door."
        ],
        chineseSentences: [
          "看那只蜘蛛！它有八条腿。",
          "我不喜欢蜘蛛。它们很丑。",
          "一只黑色的蜘蛛在门上。"
        ]
      },
      {
        word: "bag",
        wordChinese: "书包",
        englishSentences: [
          "My bag is blue.",
          "Look! The bag is under the chair.",
          "What's in my bag? A pencil and an eraser."
        ],
        chineseSentences: [
          "我的书包是蓝色的。",
          "看！那个包在椅子下面。",
          "我的书包里有什么？一支铅笔和一个橡皮。"
        ]
      },
      {
        word: "table",
        wordChinese: "桌子",
        englishSentences: [
          "The book is on the table.",
          "Look at the table! It's big.",
          "My toy car is under the table."
        ],
        chineseSentences: [
          "书在桌子上。",
          "看那张桌子！它很大。",
          "我的玩具汽车在桌子下面。"
        ]
      },
      {
        word: "eraser",
        wordChinese: "橡皮",
        englishSentences: [
          "I've got a white eraser.",
          "My eraser is in my bag.",
          "Pass me the eraser, please."
        ],
        chineseSentences: [
          "我有一个白色的橡皮。",
          "我的橡皮在书包里。",
          "请给我那个橡皮。"
        ]
      },
      {
        word: "pencil",
        wordChinese: "铅笔",
        englishSentences: [
          "I've got a yellow pencil.",
          "My pencil is under the book.",
          "How many pencils have you got? I've got five."
        ],
        chineseSentences: [
          "我有一支黄色的铅笔。",
          "我的铅笔在书下面。",
          "你有多少支铅笔？我有五支。"
        ]
      },
      {
        word: "book",
        wordChinese: "书",
        englishSentences: [
          "Look at my book! It's red.",
          "The book is on the table.",
          "Open your book, please."
        ],
        chineseSentences: [
          "看我的书！它是红色的。",
          "书在桌子上。",
          "请打开你的书。"
        ]
      },
      {
        word: "chair",
        wordChinese: "椅子",
        englishSentences: [
          "The chair is black.",
          "The cat is on the chair.",
          "Sit down on the chair, please."
        ],
        chineseSentences: [
          "椅子是黑色的。",
          "猫在椅子上。",
          "请坐在椅子上。"
        ]
      },
      {
        word: "toy",
        wordChinese: "玩具",
        englishSentences: [
          "I've got many toys. They are in my bedroom.",
          "Look at the toys! They are cars, a doll, and a ball.",
          "What's your favourite toy? It's a robot."
        ],
        chineseSentences: [
          "我有很多玩具。它们在我的房间里。",
          "看那些玩具！它们是汽车、洋娃娃和一个球。",
          "你最喜欢的玩具是什么？是机器人。"
        ]
      },
      {
        word: "kite",
        wordChinese: "风筝",
        englishSentences: [
          "I've got a kite. It's blue.",
          "Look at the kite! It can fly.",
          "Where's my kite? It's on the house."
        ],
        chineseSentences: [
          "我有一个风筝。它是蓝色的。",
          "看那只风筝！它会飞。",
          "我的风筝在哪里？它在房子上。"
        ]
      },
      {
        word: "ball",
        wordChinese: "球",
        englishSentences: [
          "I've got a red ball.",
          "The ball is under the chair.",
          "Look at the ball! It's big."
        ],
        chineseSentences: [
          "我有一个红色的球。",
          "球在椅子下面。",
          "看那个球！它很大。"
        ]
      },
      {
        word: "car",
        wordChinese: "汽车",
        englishSentences: [
          "I've got a blue toy car.",
          "Look at the car! It's red.",
          "My toy car is under the table."
        ],
        chineseSentences: [
          "我有一辆蓝色的玩具汽车。",
          "看那辆汽车！它是红色的。",
          "我的玩具汽车在桌子下面。"
        ]
      },
      {
        word: "doll",
        wordChinese: "洋娃娃",
        englishSentences: [
          "I've got a beautiful doll. She's beautiful.",
          "My doll is on the sofa.",
          "Look at the doll! She's got big eyes."
        ],
        chineseSentences: [
          "我有一个漂亮的洋娃娃。她很漂亮。",
          "我的洋娃娃在沙发上。",
          "看那个洋娃娃！她有大大的眼睛。"
        ]
      },
      {
        word: "bike",
        wordChinese: "自行车",
        englishSentences: [
          "I've got a blue bike.",
          "Look at the bike! It's small.",
          "Where's my bike? It's next to the house."
        ],
        chineseSentences: [
          "我有一辆蓝色的自行车。",
          "看那辆自行车！它很小。",
          "我的自行车在哪里？它在房子旁边。"
        ]
      },
      {
        word: "robot",
        wordChinese: "机器人",
        englishSentences: [
          "I've got a toy robot. It's small.",
          "Look at the robot! It's got a long arm.",
          "What's your favourite toy? It's a robot."
        ],
        chineseSentences: [
          "我有一个玩具机器人。它很小。",
          "看那个机器人！它有一条长长的金属手臂。",
          "你最喜欢的玩具是什么？是机器人。"
        ]
      },
      {
        word: "mother",
        wordChinese: "妈妈",
        englishSentences: [
          "Who's that? She's my mother.",
          "My mother is in the kitchen.",
          "I love my mother."
        ],
        chineseSentences: [
          "那是谁？她是我妈妈。",
          "我的妈妈在厨房里。",
          "我爱我的妈妈。"
        ]
      },
      {
        word: "father",
        wordChinese: "爸爸",
        englishSentences: [
          "Who's that? He's my father.",
          "My father has got a black car.",
          "I love my father."
        ],
        chineseSentences: [
          "那是谁？他是我爸爸。",
          "我的爸爸有一辆黑色的汽车。",
          "我爱我的爸爸。"
        ]
      },
      {
        word: "grandmother",
        wordChinese: "奶奶",
        englishSentences: [
          "Who's that? She's my grandmother.",
          "My grandmother is old, but she is happy.",
          "I love my grandmother."
        ],
        chineseSentences: [
          "那是谁？她是我奶奶。",
          "我的奶奶很老了，但是她很快乐。",
          "我爱我的奶奶。"
        ]
      },
      {
        word: "grandfather",
        wordChinese: "爷爷",
        englishSentences: [
          "Who's that? He's my grandfather.",
          "My grandfather is seventy-one. He is old.",
          "I love my grandfather."
        ],
        chineseSentences: [
          "那是谁？他是我爷爷。",
          "我的爷爷七十一岁。他很老。",
          "我爱我的爷爷。"
        ]
      },
      {
        word: "sister",
        wordChinese: "姐姐",
        englishSentences: [
          "Who's that? She's my sister.",
          "My sister is young. She is two.",
          "I love my sister."
        ],
        chineseSentences: [
          "那是谁？她是我姐姐。",
          "我的妹妹很小。她两岁。",
          "我爱我的妹妹。"
        ]
      },
      {
        word: "brother",
        wordChinese: "哥哥",
        englishSentences: [
          "Who's that? He's my brother.",
          "My brother has got a red robot.",
          "I love my brother."
        ],
        chineseSentences: [
          "那是谁？他是我哥哥。",
          "我的哥哥有一个红色的机器人。",
          "我爱我的哥哥。"
        ]
      },
      {
        word: "horse",
        wordChinese: "马",
        englishSentences: [
          "Look at the horse! It's big.",
          "Horses have got long legs.",
          "I like horses. They are beautiful."
        ],
        chineseSentences: [
          "看那匹马！它很大。",
          "马有长长的腿。",
          "我喜欢马。它们很漂亮。"
        ]
      },
      {
        word: "clean",
        wordChinese: "干净",
        englishSentences: [
          "Look at my hands! They are clean.",
          "That table is clean.",
          "My bedroom is clean."
        ],
        chineseSentences: [
          "看我的手！它们是干净的。",
          "那个桌子是干净的。",
          "我的房间是干净的。"
        ]
      },
      {
        word: "dirty",
        wordChinese: "脏",
        englishSentences: [
          "Look at the dog! It's dirty.",
          "My hands are dirty.",
          "That chair is dirty."
        ],
        chineseSentences: [
          "看那只狗！它是脏的。",
          "我的手是脏的。",
          "那个凳子是脏的。"
        ]
      },
      {
        word: "small",
        wordChinese: "小",
        englishSentences: [
          "Look at the spider! It's small.",
          "My hands are small.",
          "The purple robot is small."
        ],
        chineseSentences: [
          "看那只蜘蛛！它很小。",
          "我的手很小。",
          "那个紫色的机器人很小。"
        ]
      },
      {
        word: "big",
        wordChinese: "大",
        englishSentences: [
          "Look at the tiger! It's big.",
          "My head is big.",
          "The robot is big."
        ],
        chineseSentences: [
          "看那只老虎！它很大。",
          "我的头很大。",
          "那个机器人很大。"
        ]
      },
      {
        word: "long",
        wordChinese: "长",
        englishSentences: [
          "Look at the dog! It's got long legs.",
          "My pencil is long.",
          "That robot has long arms."
        ],
        chineseSentences: [
          "看那只狗！它有长长的腿。",
          "我的铅笔很长。",
          "那个机器人有长长的手臂。"
        ]
      },
      {
        word: "short",
        wordChinese: "短",
        englishSentences: [
          "Look at the dog! It's got short legs.",
          "My pencil is short.",
          "My grandfather is short."
        ],
        chineseSentences: [
          "看那只狗！它有短短的腿。",
          "我的铅笔很短。",
          "我的爷爷很矮。"
        ]
      },
      {
        word: "our",
        wordChinese: "我们的",
        englishSentences: [
          "This is our house.",
          "Our bedroom is big.",
          "Our cat is black."
        ],
        chineseSentences: [
          "这是我们的房子。",
          "我们的卧室很大",
          "我们的猫是黑色的。"
        ]
      },
      {
        word: "they",
        wordChinese: "他们",
        englishSentences: [
          "Look at the birds! They are red.",
          "My grandfather and grandmother. They are old.",
          "Those are toys. They are in my bedroom."
        ],
        chineseSentences: [
          "看那些鸟！它们是红色的。",
          "我的爷爷和奶奶。他们很老。",
          "那些是玩具。它们在我的房间里。"
        ]
      },
      {
        word: "computer",
        wordChinese: "电脑",
        englishSentences: [
          "Look at the computer! It's small.",
          "The computer is on the table.",
          "My father has got a computer."
        ],
        chineseSentences: [
          "看那台电脑！它很小。",
          "电脑在桌子上。",
          "我的爸爸有一台电脑。"
        ]
      },
      {
        word: "train",
        wordChinese: "火车",
        englishSentences: [
          "I've got a toy train. It's blue.",
          "Look at the train! It's long.",
          "What's your favourite toy? It's a train."
        ],
        chineseSentences: [
          "我有一辆玩具火车。它是蓝色的。",
          "看那辆火车！它很长。",
          "你最喜欢的玩具是什么？是火车。"
        ]
      },
      {
        word: "beautiful",
        wordChinese: "漂亮",
        englishSentences: [
          "Look at the doll! She's beautiful.",
          "My mother is beautiful.",
          "That kite is beautiful."
        ],
        chineseSentences: [
          "看那个洋娃娃！她很漂亮。",
          "我的妈妈很漂亮。",
          "那个风筝是漂亮的。"
        ]
      },
      {
        word: "ugly",
        wordChinese: "丑",
        englishSentences: [
          "I don't like that spider. It's ugly.",
          "Look at the ugly toy! I don't like it.",
          "That dog is ugly, but it's happy."
        ],
        chineseSentences: [
          "我不喜欢那只蜘蛛。它很丑。",
          "看那个丑陋的玩具！我不喜欢它。",
          "那只狗很丑，但是很快乐。"
        ]
      },
      {
        word: "happy",
        wordChinese: "快乐",
        englishSentences: [
          "I am happy today.",
          "Look at the happy dog!",
          "My grandfather is happy."
        ],
        chineseSentences: [
          "我今天很快乐。",
          "看那只快乐的狗！",
          "我的爷爷很快乐。"
        ]
      },
      {
        word: "sad",
        wordChinese: "伤心",
        englishSentences: [
          "My cat isn't here. I am sad.",
          "The cat looks sad.",
          "Don't be sad. It's ok."
        ],
        chineseSentences: [
          "我的猫不在这里。我很伤心。",
          "这只猫看起来很伤心。",
          "别伤心，没事的。"
        ]
      },
      {
        word: "old",
        wordChinese: "老",
        englishSentences: [
          "My grandfather is old.",
          "Look at the old car! It's small.",
          "That house is old."
        ],
        chineseSentences: [
          "我的爷爷很老。",
          "看那辆老汽车！它很小。",
          "那个房子很老。"
        ]
      },
      {
        word: "young",
        wordChinese: "年轻",
        englishSentences: [
          "My sister is young. She is two.",
          "The cat is young.",
          "My mother is young."
        ],
        chineseSentences: [
          "我的妹妹很年轻。她两岁。",
          "小猫很年轻。",
          "我的妈妈很年轻。"
        ]
      },
      {
        word: "mouse",
        wordChinese: "老鼠",
        englishSentences: [
          "The mouse is small.",
          "Cats like mice.",
          "A black mouse is under the chair."
        ],
        chineseSentences: [
          "老鼠很小。",
          "猫喜欢老鼠。",
          "一只黑色的老鼠在椅子下面。"
        ]
      }
    ];

    // 随机选择题目
    const shuffledQuestions = [...wordSentenceQuestions].sort(() => Math.random() - 0.5);
    this.questions = shuffledQuestions.slice(0, Math.min(this.questionsPerRound, shuffledQuestions.length));
  }

  renderQuiz() {
    const currentQuestion = this.questions[this.currentIndex];

    this.container.innerHTML = `
      <div class="quiz-container word-to-sentence-container">
        <div class="quiz-header">
          <div class="quiz-progress">
            题目 <span class="current">${this.currentIndex + 1}</span> / ${this.questions.length}
          </div>
          <div class="quiz-score">得分: <span class="score">${this.score}</span></div>
        </div>

        <div class="word-display">
          <div class="word-main">
            <h2 class="word-text">${currentQuestion.word}</h2>
            <button class="audio-button word-audio" id="play-word-audio">🔊</button>
          </div>
          <p class="word-chinese">${currentQuestion.wordChinese}</p>
        </div>

        <div class="sentence-options">
          ${currentQuestion.chineseSentences.map((chineseSentence, index) => {
            const englishSentence = currentQuestion.englishSentences[index];
            return `
              <div class="sentence-card">
                <p class="sentence-chinese">${chineseSentence}</p>
                <div class="sentence-buttons">
                  <button class="sentence-check-btn" data-sentence-index="${index}" data-translation="${englishSentence}">查看英文</button>
                  <button class="sentence-hide-btn" data-sentence-index="${index}" style="display: none;">隐藏英文</button>
                  <button class="sentence-correct-btn" data-sentence-index="${index}">答对了</button>
                </div>
                <div class="sentence-translation" id="translation-${index}" style="display: none;">
                  <p class="sentence-english">${englishSentence}</p>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <div class="quiz-navigation">
          <button class="quiz-nav-btn" id="prev-question" ${this.currentIndex === 0 ? 'disabled' : ''}>
            ← 上一题
          </button>
          <div class="quiz-feedback" id="quiz-feedback"></div>
          <button class="quiz-nav-btn" id="next-question">
            下一题 →
          </button>
        </div>

        ${this.currentIndex === this.questions.length - 1 ? `
          <div class="quiz-summary" id="quiz-summary" style="display: none;">
            <h3>📊 测试完成！</h3>
            <p>最终得分: <span class="final-score">${this.score}</span> / ${this.questions.length}</p>
            <p>正确率: <span class="accuracy">${Math.round((this.score / this.questions.length) * 100)}%</span></p>
            <button class="quiz-nav-btn" id="restart-quiz">重新开始</button>
          </div>
        ` : ''}
      </div>
    `;
  }

  bindEvents() {
    // 单词发音按钮
    const playWordAudioButton = document.getElementById('play-word-audio');
    if (playWordAudioButton) {
      playWordAudioButton.addEventListener('click', (e) => {
        e.stopPropagation();
        this.playWordAudio();
      });
    }

    // 查看英文翻译按钮
    const checkButtons = document.querySelectorAll('.sentence-check-btn');
    checkButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        const sentenceIndex = button.dataset.sentenceIndex;
        const translationDiv = document.getElementById(`translation-${sentenceIndex}`);
        const hideButton = button.parentElement.querySelector('.sentence-hide-btn');
        
        if (translationDiv && hideButton) {
          translationDiv.style.display = 'block';
          button.style.display = 'none';
          hideButton.style.display = 'inline-block';
        }
      });
    });

    // 隐藏英文翻译按钮
    const hideButtons = document.querySelectorAll('.sentence-hide-btn');
    hideButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        const sentenceIndex = button.dataset.sentenceIndex;
        const translationDiv = document.getElementById(`translation-${sentenceIndex}`);
        const checkButton = button.parentElement.querySelector('.sentence-check-btn');
        
        if (translationDiv && checkButton) {
          translationDiv.style.display = 'none';
          button.style.display = 'none';
          checkButton.style.display = 'inline-block';
        }
      });
    });

    // 答对了按钮
    const correctButtons = document.querySelectorAll('.sentence-correct-btn');
    correctButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();

        // 如果当前题目已经回答过，不允许再次选择
        if (this.hasAnswered) {
          return;
        }

        // 禁用按钮，确保只能点击一次
        button.disabled = true;
        button.classList.add('disabled');
        this.hasAnswered = true;

        // 保存当前题目的选择状态
        this.questionStates[this.currentIndex] = {
          hasAnswered: true,
          isCorrect: true,
          answeredButton: 'correct'
        };

        // 播放答对音效
        this.playSoundEffect(true);

        // 加5分
        const points = 5;
        this.score += points;
        this.container.querySelector('.score').textContent = this.score;

        // 添加积分
        if (window.router && window.router.addPoints) {
          window.router.addPoints(points);
        }

        // 显示反馈
        const feedback = document.getElementById('quiz-feedback');
        feedback.textContent = `✅ 答对了！+${points}分`;
        feedback.className = 'quiz-feedback correct';

        // 清除反馈
        setTimeout(() => {
          feedback.textContent = '';
          feedback.className = 'quiz-feedback';
        }, 2000);
      });
    });

    // 导航按钮
    document.getElementById('prev-question')?.addEventListener('click', () => {
      if (this.currentIndex > 0) {
        this.goToQuestion(this.currentIndex - 1);
      }
    });

    document.getElementById('next-question')?.addEventListener('click', () => {
      if (this.currentIndex < this.questions.length - 1) {
        const nextIndex = this.currentIndex + 1;
        this.currentIndex = nextIndex;
        this.renderQuiz();
        this.bindEvents();
      }
    });

    document.getElementById('restart-quiz')?.addEventListener('click', () => this.restart());
  }

  playWordAudio() {
    const currentQuestion = this.questions[this.currentIndex];
    if (currentQuestion && currentQuestion.word) {
      audioPlayer.speakWord(currentQuestion.word).then(() => {
        console.log('Word audio played successfully');
      }).catch(error => {
        console.error('Error playing word audio:', error);
      });
    }
  }

  playSoundEffect(isCorrect) {
    // 使用Web Audio API播放简短音效
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      if (isCorrect) {
        // 正确答案：更明亮、更响亮的音效
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1320, audioContext.currentTime + 0.1);
        oscillator.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.8, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      } else {
        // 错误答案：更低沉的音效
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(150, audioContext.currentTime + 0.15);
        gainNode.gain.setValueAtTime(0.8, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      }

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.warn('Failed to play sound effect:', error);
    }
  }

  goToQuestion(index) {
    if (index < 0 || index >= this.questions.length) return;

    this.currentIndex = index;
    this.hasAnswered = false;

    // 恢复当前题目的选择状态
    const state = this.questionStates[index];
    if (state && state.hasAnswered) {
      this.hasAnswered = true;
    }

    this.renderQuiz();
    this.bindEvents();

    // 如果有保存的状态，恢复视觉显示
    if (state && state.hasAnswered) {
      this.restoreQuestionState(state);
    }
  }

  restoreQuestionState(state) {
    if (state.answeredButton === 'correct') {
      const correctButtons = document.querySelectorAll('.sentence-correct-btn');
      correctButtons.forEach(button => {
        button.disabled = true;
        button.classList.add('disabled');
      });
    }
  }

  restart() {
    this.currentIndex = 0;
    this.score = 0;
    this.answers = [];
    this.questionStates = {}; // 清空选择状态
    this.hasAnswered = false;
    this.generateQuestions();
    this.renderQuiz();
    this.bindEvents();
  }
}

export function initWordToSentenceMode() {
  new WordToSentenceMode('word-to-sentence-content').init();
}