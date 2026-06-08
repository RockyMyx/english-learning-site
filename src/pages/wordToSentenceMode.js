import audioPlayer from '../utils/audio.js';

// 从localStorage加载自定义题目
function loadCustomQuestions() {
  try {
    const data = localStorage.getItem('adminWordSentenceQuestions');
    return data ? JSON.parse(data) : {};
  } catch (e) {
    return {};
  }
}

// 获取合并后的题目（硬编码 + localStorage + 覆盖）
function getMergedWordSentenceQuestions() {
  const hardcoded = [
    { word: "one", wordChinese: "一", englishSentences: ["I have one cat. It's a black cat.", "Look! One red toy is on the chair.", "How many cats have you got? I have one."], chineseSentences: ["我有一只猫。它是一只黑色的猫。", "看！一个红色的玩具在椅子上。", "你有多少只猫？我有一只。"] },
    { word: "two", wordChinese: "二", englishSentences: ["I have two black eyes.", "Two potatoes are on the table.", "The dog has two short legs."], chineseSentences: ["我有两只黑色的眼睛。", "桌子上有两个土豆。", "看那只狗！它有两条短腿。"] },
    { word: "three", wordChinese: "三", englishSentences: ["I have three green toy cars.", "Three dolls are on the sofa.", "How many eggs are in the kitchen? Three."], chineseSentences: ["我有三个绿色的玩具汽车。", "沙发上坐着三个洋娃娃。", "厨房里有多少个鸡蛋？三个。"] },
    { word: "four", wordChinese: "四", englishSentences: ["Four books are on the chair.", "Look at the frog! It's got four legs.", "There are has four people. They are my mother, father, sister and me."], chineseSentences: ["椅子上有四本书。", "看那只青蛙！它有四条腿。", "我家有四口人。他们是我的妈妈、爸爸、妹妹和我。"] },
    { word: "five", wordChinese: "五", englishSentences: ["I have five fingers on my hand.", "Pass me the five red tomatoes, please.", "Look at the spider! It's got eight legs, but it hasn't got five legs."], chineseSentences: ["我有五个手指。", "请给我五个红色的西红柿。", "看那只蜘蛛！它有八条腿，不是五条。"] },
    { word: "six", wordChinese: "六", englishSentences: ["I have six yellow erasers.", "How many balls are under the bed? Six.", "That robot has got six arms."], chineseSentences: ["我有六个黄色的橡皮。", "床下有多少个球？六个。", "那个机器人有六只手臂。"] },
    { word: "seven", wordChinese: "七", englishSentences: ["Look! Seven pink birds are on the house.", "My grandfather is seventy-one. He is old, but he is happy.", "How many orange toys have you got? I have seven."], chineseSentences: ["看！七只粉色的鸟在房子上。", "我的爷爷七十一岁。他很老，但是很快乐。", "你有多少个橙色的玩具？我有七个。"] },
    { word: "eight", wordChinese: "八", englishSentences: ["A spider has got eight legs.", "I have eight pencils in my bag.", "Look at the fish! Eight fish can swim."], chineseSentences: ["蜘蛛有八条腿。", "我的书包里有八支铅笔。", "看那些鱼！八条鱼会游泳。"] },
    { word: "nine", wordChinese: "九", englishSentences: ["I have nine white erasers.", "How old are you? I'm nine.", "Nine cakes are on the table. I like cake!"], chineseSentences: ["我有九个白色的橡皮。", "你几岁了？我九岁。", "桌上有九块蛋糕。我喜欢蛋糕！"] },
    { word: "ten", wordChinese: "十", englishSentences: ["I have ten fingers.", "Look! Ten toy cars are on the floor.", "How many purple toys are on the chair? Ten."], chineseSentences: ["我有十根手指。", "看！十辆玩具汽车在地板上。", "多少个紫色的玩具在椅子上？十个。"] },
    { word: "red", wordChinese: "红色", englishSentences: ["My favourite color is red.", "I have a red apple. It's on the table.", "Pass me the red pencil, please."], chineseSentences: ["我最喜欢的颜色是红色。", "我有一个红色的苹果。它在桌子上。", "请把那个红色的铅笔给我。"] },
    { word: "white", wordChinese: "白色", englishSentences: ["Look at the white bird! It can fly.", "I have a white cat and a black dog.", "An egg is white. I like eggs."], chineseSentences: ["看那只白色的鸟！它会飞。", "我有一只白色的猫和一只黑色的狗。", "鸡蛋是白色的。我喜欢鸡蛋。"] },
    { word: "black", wordChinese: "黑色", englishSentences: ["My father has got a black car.", "The black spider is small.", "I like black and white."], chineseSentences: ["我的爸爸有一辆黑色的车。", "那只黑色的蜘蛛很小。", "我喜欢黑色和白色。"] },
    { word: "blue", wordChinese: "蓝色", englishSentences: ["My eyes are blue.", "My eraser is blue.", "What's your favourite color? My favourite color is blue."], chineseSentences: ["我的眼睛是蓝色的。", "我的橡皮是蓝色的。", "你最喜欢的颜色是什么？我最喜欢的颜色是蓝色。"] },
    { word: "yellow", wordChinese: "黄色", englishSentences: ["I have a yellow toy car.", "Bananas are yellow. They are fruit.", "Color the yellow bag blue."], chineseSentences: ["我有一辆黄色的玩具汽车。", "香蕉是黄色的。它们是水果。", "把那个黄色的书包涂成蓝色。"] },
    { word: "green", wordChinese: "绿色", englishSentences: ["Look at the green frog! It can jump.", "My pencil is green.", "I have a green apple. It's under the chair."], chineseSentences: ["看那只绿色的青蛙！它会跳。", "我的铅笔是绿色的。", "我有一个绿色的苹果。它在椅子下面。"] },
    { word: "pink", wordChinese: "粉色", englishSentences: ["I have a pink doll. She's beautiful.", "My sister likes pink.", "Pass me the pink pencil, please."], chineseSentences: ["我有一个粉色的洋娃娃。她很漂亮。", "我的妹妹喜欢粉色。", "请把那支粉色的铅笔给我。"] },
    { word: "orange", wordChinese: "橙色", englishSentences: ["Oranges are orange.", "Look at the orange bag! It's big.", "I have an orange cat. It's beautiful."], chineseSentences: ["橙子是橙色的。", "看那个橙色的书包！它很大。", "我有一只橙色的猫。它很漂亮。"] },
    { word: "purple", wordChinese: "紫色", englishSentences: ["I have a purple robot. It's small.", "Grapes are purple. I like grapes.", "Color the purple chair black."], chineseSentences: ["我有一个紫色的机器人。它很小。", "葡萄是紫色的。我喜欢葡萄。", "把那个紫色的椅子涂成黑色。"] },
    { word: "color", wordChinese: "颜色", englishSentences: ["What's your favourite color?", "Color the bird yellow.", "Look at the toys! What color are they?"], chineseSentences: ["你最喜欢的颜色是什么？", "把那只鸟涂成黄色。", "看这些玩具！它们是什么颜色？"] },
    { word: "listen", wordChinese: "听", englishSentences: ["Listen to your mother.", "Listen, and point to your head.", "Listen! The cat is on the sofa."], chineseSentences: ["听你妈妈的话。", "听，并指着你的头。", "听！那只猫在沙发上。"] },
    { word: "look", wordChinese: "看", englishSentences: ["Look! The dog is under the table.", "Look! That tiger is big.", "Look at the book."], chineseSentences: ["看！那只狗在桌子下面。", "看！那只老虎很大。", "看着书。"] },
    { word: "point", wordChinese: "指", englishSentences: ["Point to your eyes.", "Point to the red toy car.", "Listen, and point to the door."], chineseSentences: ["指着你的眼睛。", "指着那辆红色的玩具汽车。", "听，并指着门。"] },
    { word: "sit down", wordChinese: "坐下", englishSentences: ["Sit down on the chair, please.", "The teacher says, Sit down.", "Sit down and look at the book."], chineseSentences: ["请坐在椅子上。", "老师说：坐下。", "坐下，并看着书。"] },
    { word: "stand up", wordChinese: "站起来", englishSentences: ["Stand up, please.", "The teacher says  Stand up.", "Stand up and point to the door."], chineseSentences: ["请站起来。", "老师说：站起来。", "站起来，并指着门。"] },
    { word: "open", wordChinese: "打开", englishSentences: ["Open your book, please.", "Open the door.", "Look! That boy is opening his bag."], chineseSentences: ["请打开你的书。", "打开门。", "看！那个男孩在打开他的书包。"] },
    { word: "close", wordChinese: "关闭", englishSentences: ["Close your book, please.", "Close the door.", "Look! That girl is closing the door."], chineseSentences: ["请关上你的书。", "关上门。", "看！那个女孩在关门。"] },
    { word: "hello", wordChinese: "你好", englishSentences: ["Hello, mother!", "Say hello to your friend.", "Hello! What's your name?"], chineseSentences: ["你好，妈妈！", "对你的朋友说你好。", "你好！你叫什么名字？"] },
    { word: "talk", wordChinese: "说话", englishSentences: ["Please don't talk in class.", "Look! Those two girls are talking.", "My bird can talk."], chineseSentences: ["请不要在课堂上讲话。", "看！那两个女孩在说话。", "我的鸟会说话。"] },
    { word: "jump", wordChinese: "跳", englishSentences: ["Look at the frog! It can jump.", "I can jump, but I can't fly.", "That dog can jump."], chineseSentences: ["看那只青蛙！它会跳。", "我会跳，但我不会飞。", "那只狗会跳。"] },
    { word: "fly", wordChinese: "飞", englishSentences: ["Look at the bird! It can fly.", "Spiders can't fly, but birds can fly.", "I have a kite. It's red. It can fly."], chineseSentences: ["看那只鸟！它会飞。", "蜘蛛不会飞，但鸟会飞。", "我有一个风筝。它是红色的。它会飞。"] },
    { word: "swim", wordChinese: "游泳", englishSentences: ["Fish can swim.", "I can swim, but I can't fly.", "Look at the duck! It can swim."], chineseSentences: ["鱼会游泳。", "我会游泳，但我不会飞。", "看那只鸭子！它会游泳。"] },
    { word: "food", wordChinese: "食物", englishSentences: ["I like food. Cake is my favourite.", "Food is in the kitchen.", "What's your favourite food? It's chips."], chineseSentences: ["我喜欢食物。蛋糕是我的最爱。", "厨房里有食物。", "你最喜欢的食物是什么？是薯条。"] },
    { word: "cake", wordChinese: "蛋糕", englishSentences: ["I like cake. It's food.", "A big cake is on the table.", "Here's a cake for you. Thank you."], chineseSentences: ["我喜欢蛋糕。它是食物。", "桌子上有一个大蛋糕。", "给你一个蛋糕。谢谢。"] },
    { word: "potato", wordChinese: "土豆", englishSentences: ["Potatoes are food. I like potatoes.", "Look at the potatoes! They are on the table.", "How many potatoes have I got? I have five."], chineseSentences: ["土豆是食物。我喜欢土豆。", "看那些土豆！它们在桌子上。", "我有多少土豆？我有五个。"] },
    { word: "tomato", wordChinese: "西红柿", englishSentences: ["Tomatoes are red.", "I don't like tomatoes.", "How many tomatoes are on the table? Six."], chineseSentences: ["西红柿是红色的。", "我不喜欢西红柿。", "桌子上有多少个西红柿？六个。"] },
    { word: "chips", wordChinese: "薯片", englishSentences: ["I like chips. They are food.", "Pass me the chips, please.", "Look! The chips are on the table."], chineseSentences: ["我喜欢薯条。它们是食物。", "请给我一些薯条。", "看！薯条在桌子上。"] },
    { word: "fruit", wordChinese: "水果", englishSentences: ["I like fruit. Apples are my favourite.", "Look at the fruit! They are apples and bananas.", "What's your favourite food? It's fruit."], chineseSentences: ["我喜欢水果。苹果是我的最爱。", "看这些水果！它们是苹果和香蕉。", "你最喜欢的食物是什么？是水果。"] },
    { word: "milk", wordChinese: "牛奶", englishSentences: ["I like milk.", "The milk is in the kitchen.", "Look at the white cat! It likes milk."], chineseSentences: ["我喜欢牛奶。", "牛奶在厨房里。", "看那只白色的猫！它喜欢牛奶。"] },
    { word: "egg", wordChinese: "鸡蛋", englishSentences: ["Eggs are white.", "I don't like eggs.", "How many eggs are on the table? Three."], chineseSentences: ["鸡蛋是白色的。", "我不喜欢鸡蛋。", "桌上有多少个鸡蛋？三个。"] },
    { word: "in", wordChinese: "在...里面", englishSentences: ["My pencil is in my bag.", "My cat is in the house.", "The book is in the bag."], chineseSentences: ["我的铅笔在书包里。", "我的猫在房子里。", "书在书包里。"] },
    { word: "on", wordChinese: "在...上面", englishSentences: ["The book is on the table.", "Look at the bird! It's on the house.", "My toy car is on the bed."], chineseSentences: ["书在桌子上。", "看那只鸟！它在房子上。", "我的玩具汽车在床上。"] },
    { word: "under", wordChinese: "在...下面", englishSentences: ["My cat is under the chair.", "Look! The ball is under the bed.", "Where's my pencil? It's under the book."], chineseSentences: ["我的猫在椅子下面。", "看！那个球在床下面。", "我的铅笔在哪里？它在书下面。"] },
    { word: "body", wordChinese: "身体", englishSentences: ["I have a head, arms, and legs. This is my body.", "Point to your body.", "My body is big."], chineseSentences: ["我有头、手臂和腿。这是我的身体。", "指着你的身体。", "我的身体很大。"] },
    { word: "eye", wordChinese: "眼睛", englishSentences: ["I have two blue eyes.", "Point to your eyes.", "Look at the cat! It's got green eyes."], chineseSentences: ["我有两只蓝色的眼睛。", "指着你的眼睛。", "看那只猫！它有绿色的眼睛。"] },
    { word: "mouth", wordChinese: "嘴巴", englishSentences: ["Point to your mouth.", "Open your mouth.", "Look at the dog! Its mouth is big."], chineseSentences: ["指着你的嘴巴。", "张开你的嘴巴。", "看那只狗！它的嘴巴很大。"] },
    { word: "hand", wordChinese: "手", englishSentences: ["I have two hands.", "Point to your hand.", "My hand is small."], chineseSentences: ["我有两只手。", "指着你的手。", "我的手很小。"] },
    { word: "leg", wordChinese: "腿", englishSentences: ["I have two legs.", "Point to your legs.", "That spider has got eight legs."], chineseSentences: ["我有两条腿。", "指着你的腿。", "那只蜘蛛有八条腿。"] },
    { word: "arm", wordChinese: "胳膊", englishSentences: ["I have two arms.", "Point to your arms.", "That robot has got long arms."], chineseSentences: ["我有两条手臂。", "指着你的手臂。", "那个机器人有长手臂。"] },
    { word: "head", wordChinese: "头", englishSentences: ["Point to your head.", "My head is big.", "Look at the tiger! Its head is big."], chineseSentences: ["指着你的头。", "我的头很大。", "看那只老虎！它的头很大。"] },
    { word: "house", wordChinese: "房子", englishSentences: ["Look at my house! It's red.", "My house is big.", "That cat is on the house."], chineseSentences: ["看我的房子！它是红色的。", "我的房子很大。", "那只猫在房子上。"] },
    { word: "sofa", wordChinese: "沙发", englishSentences: ["The cat is on the sofa.", "Look at the sofa! It's big.", "My doll is under the sofa."], chineseSentences: ["猫在沙发上。", "看那个沙发！它很大。", "我的洋娃娃在沙发下面。"] },
    { word: "door", wordChinese: "门", englishSentences: ["The door is black.", "Close the door, please.", "Look! A black spider is on the door."], chineseSentences: ["门是黑色的。", "请关上门。", "看！一只黑色的蜘蛛在门上。"] },
    { word: "bed", wordChinese: "床", englishSentences: ["My bed is blue.", "The cat is under the bed.", "A big bed is in my bedroom."], chineseSentences: ["我的床是蓝色的。", "猫在床下面。", "我的卧室里有一张大床。"] },
    { word: "living room", wordChinese: "客厅", englishSentences: ["A sofa and a chair are in the living room.", "My family are in the living room.", "Look at the cat! It's in the living room."], chineseSentences: ["客厅里有沙发和椅子。", "我的家人在客厅里。", "看那只猫！它在客厅里。"] },
    { word: "bedroom", wordChinese: "卧室", englishSentences: ["This is my bedroom. It's small.", "The bed is in the bedroom.", "Look at my bedroom! It's beautiful."], chineseSentences: ["这是我的卧室。它很小。", "床在卧室里。", "看我的卧室！它很漂亮。"] },
    { word: "kitchen", wordChinese: "厨房", englishSentences: ["Food is in the kitchen.", "My mother is in the kitchen.", "Look at the kitchen! It's big."], chineseSentences: ["食物在厨房里。", "我的妈妈在厨房里。", "看那个厨房！它很大。"] },
    { word: "animal", wordChinese: "动物", englishSentences: ["I like animals. Cats are my favourite.", "Look at the animals! They are tigers, ducks, and fish.", "What's your favourite animal? It's a dog."], chineseSentences: ["我喜欢动物。猫是我的最爱。", "看那些动物！它们是老虎、鸭子和鱼。", "你最喜欢的动物是什么？是狗。"] },
    { word: "cat", wordChinese: "猫", englishSentences: ["I have a white cat.", "Look at the cat! It's on the sofa.", "I like cats. They are beautiful."], chineseSentences: ["我有一只白色的猫。", "看那只猫！它在沙发上。", "我喜欢猫。它们很漂亮。"] },
    { word: "fish", wordChinese: "鱼", englishSentences: ["Look at the fish! They can swim.", "I have a cat. It likes fish.", "Fish are animals."], chineseSentences: ["看那些鱼！它们会游泳。", "我有一只猫。它喜欢鱼。", "鱼是动物。"] },
    { word: "bird", wordChinese: "鸟", englishSentences: ["Look at the bird! It's red.", "Birds can fly.", "I have a bird. It's beautiful."], chineseSentences: ["看那只鸟！它是红色的。", "鸟会飞。", "我有一只鸟。它很漂亮。"] },
    { word: "duck", wordChinese: "鸭子", englishSentences: ["Look at the duck! It's yellow.", "Ducks can swim.", "Ducks have got two legs."], chineseSentences: ["看那只鸭子！它是黄色的。", "鸭子会游泳。", "鸭子有两条腿。"] },
    { word: "tiger", wordChinese: "老虎", englishSentences: ["Look at the tiger! It's big.", "Tigers are orange.", "I don't like tigers. They are ugly."], chineseSentences: ["看那只老虎！它很大。", "老虎是橙色的。", "我不喜欢老虎。它们很丑。"] },
    { word: "dog", wordChinese: "狗", englishSentences: ["I have a black dog.", "Look at the dog! It's got four short legs.", "I like dogs."], chineseSentences: ["我有一只黑色的狗。", "看那只狗！它有四条短腿。", "我喜欢狗。"] },
    { word: "frog", wordChinese: "青蛙", englishSentences: ["Look at the green frog! It can jump.", "Frogs have got two long legs.", "I like frogs."], chineseSentences: ["看那只绿色的青蛙！它会跳。", "青蛙有两条长腿。", "我喜欢青蛙。"] },
    { word: "spider", wordChinese: "蜘蛛", englishSentences: ["Look at the spider! It's got eight legs.", "I don't like spiders. They are ugly.", "A black spider is on the door."], chineseSentences: ["看那只蜘蛛！它有八条腿。", "我不喜欢蜘蛛。它们很丑。", "一只黑色的蜘蛛在门上。"] },
    { word: "bag", wordChinese: "书包", englishSentences: ["My bag is blue.", "Look! The bag is under the chair.", "What's in my bag? A pencil and an eraser."], chineseSentences: ["我的书包是蓝色的。", "看！那个包在椅子下面。", "我的书包里有什么？一支铅笔和一个橡皮。"] },
    { word: "table", wordChinese: "桌子", englishSentences: ["The book is on the table.", "Look at the table! It's big.", "My toy car is under the table."], chineseSentences: ["书在桌子上。", "看那张桌子！它很大。", "我的玩具汽车在桌子下面。"] },
    { word: "eraser", wordChinese: "橡皮", englishSentences: ["I have a white eraser.", "My eraser is in my bag.", "Pass me the eraser, please."], chineseSentences: ["我有一个白色的橡皮。", "我的橡皮在书包里。", "请给我那个橡皮。"] },
    { word: "pencil", wordChinese: "铅笔", englishSentences: ["I have a yellow pencil.", "My pencil is under the book.", "How many pencils have you got? I have five."], chineseSentences: ["我有一支黄色的铅笔。", "我的铅笔在书下面。", "你有多少支铅笔？我有五支。"] },
    { word: "book", wordChinese: "书", englishSentences: ["Look at my book! It's red.", "The book is on the table.", "Open your book, please."], chineseSentences: ["看我的书！它是红色的。", "书在桌子上。", "请打开你的书。"] },
    { word: "chair", wordChinese: "椅子", englishSentences: ["The chair is black.", "The cat is on the chair.", "Sit down on the chair, please."], chineseSentences: ["椅子是黑色的。", "猫在椅子上。", "请坐在椅子上。"] },
    { word: "toy", wordChinese: "玩具", englishSentences: ["I have many toys. They are in my bedroom.", "Look at the toys! They are cars, a doll, and a ball.", "What's your favourite toy? It's a robot."], chineseSentences: ["我有很多玩具。它们在我的房间里。", "看那些玩具！它们是汽车、洋娃娃和一个球。", "你最喜欢的玩具是什么？是机器人。"] },
    { word: "kite", wordChinese: "风筝", englishSentences: ["I have a kite. It's blue.", "Look at the kite! It can fly.", "Where's my kite? It's on the house."], chineseSentences: ["我有一个风筝。它是蓝色的。", "看那只风筝！它会飞。", "我的风筝在哪里？它在房子上。"] },
    { word: "ball", wordChinese: "球", englishSentences: ["I have a red ball.", "The ball is under the chair.", "Look at the ball! It's big."], chineseSentences: ["我有一个红色的球。", "球在椅子下面。", "看那个球！它很大。"] },
    { word: "car", wordChinese: "汽车", englishSentences: ["I have a blue toy car.", "Look at the car! It's red.", "My toy car is under the table."], chineseSentences: ["我有一辆蓝色的玩具汽车。", "看那辆汽车！它是红色的。", "我的玩具汽车在桌子下面。"] },
    { word: "doll", wordChinese: "洋娃娃", englishSentences: ["I have a beautiful doll. She's beautiful.", "My doll is on the sofa.", "Look at the doll! She's got big eyes."], chineseSentences: ["我有一个漂亮的洋娃娃。她很漂亮。", "我的洋娃娃在沙发上。", "看那个洋娃娃！她有大大的眼睛。"] },
    { word: "bike", wordChinese: "自行车", englishSentences: ["I have a blue bike.", "Look at the bike! It's small.", "Where's my bike? It's next to the house."], chineseSentences: ["我有一辆蓝色的自行车。", "看那辆自行车！它很小。", "我的自行车在哪里？它在房子旁边。"] },
    { word: "robot", wordChinese: "机器人", englishSentences: ["I have a toy robot. It's small.", "Look at the robot! It's got a long arm.", "What's your favourite toy? It's a robot."], chineseSentences: ["我有一个玩具机器人。它很小。", "看那个机器人！它有一条长长的金属手臂。", "你最喜欢的玩具是什么？是机器人。"] },
    { word: "mother", wordChinese: "妈妈", englishSentences: ["Who's that? She's my mother.", "My mother is in the kitchen.", "I love my mother."], chineseSentences: ["那是谁？她是我妈妈。", "我的妈妈在厨房里。", "我爱我的妈妈。"] },
    { word: "father", wordChinese: "爸爸", englishSentences: ["Who's that? He's my father.", "My father has got a black car.", "I love my father."], chineseSentences: ["那是谁？他是我爸爸。", "我的爸爸有一辆黑色的汽车。", "我爱我的爸爸。"] },
    { word: "grandmother", wordChinese: "奶奶", englishSentences: ["Who's that? She's my grandmother.", "My grandmother is old, but she is happy.", "I love my grandmother."], chineseSentences: ["那是谁？她是我奶奶。", "我的奶奶很老了，但是她很快乐。", "我爱我的奶奶。"] },
    { word: "grandfather", wordChinese: "爷爷", englishSentences: ["Who's that? He's my grandfather.", "My grandfather is seventy-one. He is old.", "I love my grandfather."], chineseSentences: ["那是谁？他是我爷爷。", "我的爷爷七十一岁。他很老。", "我爱我的爷爷。"] },
    { word: "sister", wordChinese: "姐姐", englishSentences: ["Who's that? She's my sister.", "My sister is young. She is two.", "I love my sister."], chineseSentences: ["那是谁？她是我姐姐。", "我的妹妹很小。她两岁。", "我爱我的妹妹。"] },
    { word: "brother", wordChinese: "哥哥", englishSentences: ["Who's that? He's my brother.", "My brother has got a red robot.", "I love my brother."], chineseSentences: ["那是谁？他是我哥哥。", "我的哥哥有一个红色的机器人。", "我爱我的哥哥。"] },
    { word: "horse", wordChinese: "马", englishSentences: ["Look at the horse! It's big.", "Horses have got long legs.", "I like horses. They are beautiful."], chineseSentences: ["看那匹马！它很大。", "马有长长的腿。", "我喜欢马。它们很漂亮。"] },
    { word: "clean", wordChinese: "干净", englishSentences: ["Look at my hands! They are clean.", "That table is clean.", "My bedroom is clean."], chineseSentences: ["看我的手！它们是干净的。", "那个桌子是干净的。", "我的房间是干净的。"] },
    { word: "dirty", wordChinese: "脏", englishSentences: ["Look at the dog! It's dirty.", "My hands are dirty.", "That chair is dirty."], chineseSentences: ["看那只狗！它是脏的。", "我的手是脏的。", "那个凳子是脏的。"] },
    { word: "small", wordChinese: "小", englishSentences: ["Look at the spider! It's small.", "My hands are small.", "The purple robot is small."], chineseSentences: ["看那只蜘蛛！它很小。", "我的手很小。", "那个紫色的机器人很小。"] },
    { word: "big", wordChinese: "大", englishSentences: ["Look at the tiger! It's big.", "My head is big.", "The robot is big."], chineseSentences: ["看那只老虎！它很大。", "我的头很大。", "那个机器人很大。"] },
    { word: "long", wordChinese: "长", englishSentences: ["Look at the dog! It's got long legs.", "My pencil is long.", "That robot has long arms."], chineseSentences: ["看那只狗！它有长长的腿。", "我的铅笔很长。", "那个机器人有长长的手臂。"] },
    { word: "short", wordChinese: "短", englishSentences: ["Look at the dog! It's got short legs.", "My pencil is short.", "My grandfather is short."], chineseSentences: ["看那只狗！它有短短的腿。", "我的铅笔很短。", "我的爷爷很矮。"] },
    { word: "our", wordChinese: "我们的", englishSentences: ["This is our house.", "Our bedroom is big.", "Our cat is black."], chineseSentences: ["这是我们的房子。", "我们的卧室很大", "我们的猫是黑色的。"] },
    { word: "they", wordChinese: "他们", englishSentences: ["Look at the birds! They are red.", "My grandfather and grandmother. They are old.", "Those are toys. They are in my bedroom."], chineseSentences: ["看那些鸟！它们是红色的。", "我的爷爷和奶奶。他们很老。", "那些是玩具。它们在我的房间里。"] },
    { word: "computer", wordChinese: "电脑", englishSentences: ["Look at the computer! It's small.", "The computer is on the table.", "My father has got a computer."], chineseSentences: ["看那台电脑！它很小。", "电脑在桌子上。", "我的爸爸有一台电脑。"] },
    { word: "train", wordChinese: "火车", englishSentences: ["I have a toy train. It's blue.", "Look at the train! It's very long.", "What's your favourite toy? It's a train."], chineseSentences: ["我有一辆玩具火车。它是蓝色的。", "看那辆火车！它很长。", "你最喜欢的玩具是什么？是火车。"] },
    { word: "beautiful", wordChinese: "漂亮", englishSentences: ["Look at the doll! She's beautiful.", "My mother is beautiful.", "That kite is beautiful."], chineseSentences: ["看那个洋娃娃！她很漂亮。", "我的妈妈很漂亮。", "那个风筝是漂亮的。"] },
    { word: "ugly", wordChinese: "丑", englishSentences: ["I don't like that spider. It's ugly.", "Look at the ugly toy! I don't like it.", "That dog is ugly, but it's happy."], chineseSentences: ["我不喜欢那只蜘蛛。它很丑。", "看那个丑陋的玩具！我不喜欢它。", "那只狗很丑，但是很快乐。"] },
    { word: "happy", wordChinese: "快乐", englishSentences: ["I am happy today.", "Look at the happy dog!", "My grandfather is happy."], chineseSentences: ["我今天很快乐。", "看那只快乐的狗！", "我的爷爷很快乐。"] },
    { word: "sad", wordChinese: "伤心", englishSentences: ["My cat isn't here. I am sad.", "The cat looks sad.", "Don't be sad. It's ok."], chineseSentences: ["我的猫不在这里。我很伤心。", "这只猫看起来很伤心。", "别伤心，没事的。"] },
    { word: "old", wordChinese: "老", englishSentences: ["My grandfather is old.", "Look at the old car! It's very small.", "That house is old."], chineseSentences: ["我的爷爷很老。", "看那辆老汽车！它很小。", "那个房子很老。"] },
    { word: "young", wordChinese: "年轻", englishSentences: ["My sister is young. She is two.", "The cat is young.", "My mother is young."], chineseSentences: ["我的妹妹很年轻。她两岁。", "小猫很年轻。", "我的妈妈很年轻。"] },
    { word: "mouse", wordChinese: "老鼠", englishSentences: ["The mouse is small.", "Cats like mice.", "A black mouse is under the chair."], chineseSentences: ["老鼠很小。", "猫喜欢老鼠。", "一只黑色的老鼠在椅子下面。"] },
    { word: "face", wordChinese: "脸", englishSentences: ["Point to your face.", "My face is clean.", "Look at that boy! His face is dirty."], chineseSentences: ["指着你的脸。", "我的脸很干净。", "看那个男孩！他的脸是脏的。"] },
    { word: "ear", wordChinese: "耳朵", englishSentences: ["I've got two ears.", "Point to your ears.", "I hear with my ears."], chineseSentences: ["我有两只耳朵。", "指着你的耳朵。", "我用耳朵听。"] },
    { word: "shoulder", wordChinese: "肩膀", englishSentences: ["Point to your shoulder.", "My shoulder is big.", "Look at that robot! It's got shoulders."], chineseSentences: ["指着你的肩膀。", "我的肩膀很大。", "看那个机器人！它有肩膀。"] },
    { word: "knee", wordChinese: "膝盖", englishSentences: ["Point to your knee.", "My knee is dirty.", "Look at that dog! Its knee is dirty."], chineseSentences: ["指着你的膝盖。", "我的膝盖很脏。", "看那只狗！它的膝盖脏了。"] },
    { word: "toe", wordChinese: "脚趾", englishSentences: ["I've got ten toes.", "Point to your toes.", "My toes are small."], chineseSentences: ["我有十个脚趾。", "指着你的脚趾。", "我的脚趾很小。"] },
    { word: "monster", wordChinese: "怪物", englishSentences: ["Look at that monster! It's ugly.", "I don't like monsters.", "That monster has got a big green head."], chineseSentences: ["看那个怪物！它很丑。", "我不喜欢怪物。", "那个怪物有绿色的大头。"] },
    { word: "hair", wordChinese: "头发", englishSentences: ["My hair is black.", "That doll has got long hair.", "Point to your hair."], chineseSentences: ["我的头发是黑色的。", "那个洋娃娃有长头发。", "指着你的头发。"] },
    { word: "but", wordChinese: "但是", englishSentences: ["I like cats, but I don't like spiders.", "My grandfather is old, but he is happy.", "I can swim, but I can't fly."], chineseSentences: ["我喜欢猫，但是我不喜欢蜘蛛。", "我的爷爷很老，但是他很快乐。", "我会游泳，但是我不会飞。"] },
    { word: "teeth", wordChinese: "牙齿", englishSentences: ["I've got teeth. They are white.", "Look at that tiger! It's got big teeth.", "I can brush my teeth."], chineseSentences: ["我有牙齿。它们是白色的。", "看那只老虎！它有大的牙齿。", "我会刷牙。"] },
    { word: "nose", wordChinese: "鼻子", englishSentences: ["Point to your nose.", "My nose is small.", "I smell with my nose."], chineseSentences: ["指着你的鼻子。", "我的鼻子很小。", "我用鼻子闻。"] },
    { word: "show", wordChinese: "展示", englishSentences: ["Show me your toy.", "Show me that book, please.", "Show me your hand."], chineseSentences: ["给我看看你的玩具。", "请给我看看那本书。", "给我看看你的手。"] },
    { word: "boy", wordChinese: "男孩", englishSentences: ["That boy is my brother.", "Look at that boy! He is happy.", "I am a boy."], chineseSentences: ["那个男孩是我的哥哥。", "看那个男孩！他很快乐。", "我是一个男孩。"] },
    { word: "girl", wordChinese: "女孩", englishSentences: ["That girl is my sister.", "Look at that girl! She is beautiful.", "I am a girl."], chineseSentences: ["那个女孩是我的妹妹。", "看那个女孩！她很漂亮。", "我是一个女孩。"] },
    { word: "too", wordChinese: "也", englishSentences: ["I've got a cat. My sister has got a cat too.", "I like apples. I like bananas too.", "I am happy. My sister is happy too."], chineseSentences: ["我有一只猫。我妹妹也有一只猫。", "我喜欢苹果。我也喜欢香蕉。", "我很高兴。我妹妹也很高兴。"] },
    { word: "very", wordChinese: "非常", englishSentences: ["That tiger is very big.", "My mother is very beautiful.", "I am very happy."], chineseSentences: ["那只老虎非常大。", "我的妈妈非常漂亮。", "我非常快乐。"] },
    { word: "sea", wordChinese: "大海", englishSentences: ["Look at the sea! It's blue.", "Fish are in the sea.", "I like the sea."], chineseSentences: ["看那片海！它是蓝色的。", "鱼在海里。", "我喜欢海。"] },
    { word: "smell", wordChinese: "闻", englishSentences: ["I smell with my nose.", "Smell this cake. It is big.", "This dog can smell the ball."], chineseSentences: ["我用鼻子闻。", "闻一闻这个蛋糕。它很大。", "这只狗在闻球。"] },
    { word: "taste", wordChinese: "尝", englishSentences: ["I taste with my mouth.", "Taste this red apple.", "I like to taste food."], chineseSentences: ["我用嘴巴尝。", "尝一尝这个红色的苹果", "我喜欢尝食物。"] },
    { word: "touch", wordChinese: "触摸", englishSentences: ["I touch with my hands.", "Touch this cat. It is small.", "Don't touch that spider!"], chineseSentences: ["我用手触摸。", "摸一摸这只猫。它很小。", "不要摸那个蜘蛛！"] },
    { word: "brush", wordChinese: "刷", englishSentences: ["I can brush my teeth.", "Brush your hair, please.", "Look! That girl is brushing her teeth."], chineseSentences: ["我会刷牙。", "请刷你的头发。", "看！那个女孩在刷牙。"] },
    { word: "walk", wordChinese: "走路", englishSentences: ["I can walk.", "Look! That boy is walking.", "My dog can walk."], chineseSentences: ["我会走路。", "看！那个男孩在走路。", "我的狗会走路。"] },
    { word: "wash", wordChinese: "洗", englishSentences: ["I can wash my hands.", "Wash your face, please.", "Look! That girl is washing an apple."], chineseSentences: ["我会洗手。", "请洗你的脸。", "看！那个女孩在洗苹果。"] },
    { word: "feed", wordChinese: "喂养", englishSentences: ["I can feed my cat.", "Feed that bird, please.", "Look! That boy is feeding the dog."], chineseSentences: ["我会喂我的猫。", "请喂那只鸟。", "看！那个男孩在喂狗。"] },
    { word: "elephant", wordChinese: "大象", englishSentences: ["Look at the elephant! It's big.", "Elephants have got long noses.", "I like elephants."], chineseSentences: ["看那头大象！它很大。", "大象有长鼻子。", "我喜欢大象。"] },
    { word: "wild", wordChinese: "野生的", englishSentences: ["Tigers are wild animals.", "I don't like wild animals.", "Look at those wild animals!"], chineseSentences: ["老虎是野生动物。", "我不喜欢野生动物。", "看那些野生动物！"] },
    { word: "hippo", wordChinese: "河马", englishSentences: ["Look at the hippo! It's big.", "Hippos have got big mouths.", "I like hippos."], chineseSentences: ["看那只河马！它很大。", "河马有大的嘴。", "我喜欢河马。"] },
    { word: "monkey", wordChinese: "猴子", englishSentences: ["Look at the monkey! It's got long arms.", "Monkeys can jump.", "I like monkeys."], chineseSentences: ["看那只猴子！它有长手臂。", "猴子会跳。", "我喜欢猴子。"] },
    { word: "snake", wordChinese: "蛇", englishSentences: ["Look at the snake! It's long.", "I don't like snakes.", "That snake is green."], chineseSentences: ["看那条蛇！它很长。", "我不喜欢蛇。", "那条蛇是绿色的。"] },
    { word: "crocodile", wordChinese: "鳄鱼", englishSentences: ["Look at the crocodile! It's got a big mouth.", "Crocodiles have got long legs.", "I don't like crocodiles."], chineseSentences: ["看那只鳄鱼！它有大的嘴。", "鳄鱼有长腿。", "我不喜欢鳄鱼。"] },
    { word: "these", wordChinese: "这些", englishSentences: ["These are my books.", "These books are my favourite.", "I like these apples."], chineseSentences: ["这些是我的书。", "这些是我最喜欢的书。", "我喜欢这些苹果。"] },
    { word: "those", wordChinese: "那些", englishSentences: ["Those are her toys.", "Look at those birds!", "I don't like crocodiles."], chineseSentences: ["那些是她的玩具。", "看那些鸟！", "我不喜欢那些蜘蛛。"] },
    { word: "tail", wordChinese: "尾巴", englishSentences: ["Look at that cat! It's got a long tail.", "That dog has got a short tail.", "The monkey's tail is very long."], chineseSentences: ["看那只猫！它有一条长尾巴。", "那只狗有一条短尾巴。", "猴子的尾巴很长。"] },
    { word: "clothes", wordChinese: "衣服", englishSentences: ["These are my clothes. They are clean.", "I like red clothes.", "Those clothes are dirty. Please wash them."], chineseSentences: ["这些是我的衣服。它们是干净的。", "我喜欢红色的衣服。", "那些衣服是脏的。请洗它们。"] },
    { word: "shoes", wordChinese: "鞋子", englishSentences: ["My shoes are under the bed.", "I've got a pair of black shoes.", "Look! His shoes are big."], chineseSentences: ["我的鞋子在床下面。", "我有一双黑色的鞋子。", "看！他的鞋子很大。"] },
    { word: "trousers", wordChinese: "裤子", englishSentences: ["These are my trousers. They are blue.", "Your trousers are on the chair.", "I don't like those trousers. They are ugly."], chineseSentences: ["这些是我的裤子。它们是蓝色的。", "你的裤子在椅子上。", "我不喜欢那条裤子。它很丑。"] },
    { word: "skirt", wordChinese: "裙子", englishSentences: ["My sister has got a pink skirt.", "This skirt is beautiful.", "Where's your skirt? It's in the bedroom."], chineseSentences: ["我妹妹有一条粉色的裙子。", "这条裙子很漂亮。", "你的裙子在哪里？它在卧室里。"] },
    { word: "jacket", wordChinese: "夹克", englishSentences: ["I've got a red jacket.", "His jacket is on the sofa.", "That jacket is small."], chineseSentences: ["我有一件红色的夹克。", "他的夹克在沙发上。", "那件夹克很小。"] },
    { word: "t-shirt", wordChinese: "T恤", englishSentences: ["I like this white t-shirt.", "Your t-shirt is dirty. Please wash it.", "My brother has got a blue t-shirt."], chineseSentences: ["我喜欢这件白色的T恤。", "你的T恤是脏的。请洗它。", "我哥哥有一件蓝色的T恤。"] },
    { word: "ask", wordChinese: "问", englishSentences: ["Can I ask you a question?", "I ask my mother: Where is my bag?", "The teacher says: Please ask me."], chineseSentences: ["我可以问你一个问题吗？", "我问妈妈：\"我的书包在哪里？\"", "老师说：请问我。"] },
    { word: "catch", wordChinese: "接住、抓住", englishSentences: ["I can catch the ball.", "Look! That cat can catch a mouse.", "Please catch my hand."], chineseSentences: ["我能接住球", "我问妈妈：\"我的书包在哪里？\"", "请抓住我的手。"] },
    { word: 'children', wordChinese: '孩子们', englishSentences: [
      'How many children are in the livingroom?',
      'I can see five children under the tree.',
      'The children have got big red balls',
      'The children are sitting on the sofa.'
    ], chineseSentences: [
      '客厅里有多少个孩子？',
      '我能看见五个孩子在树下。',
      '孩子们有又大又红的球',
      '孩子们正坐在沙发上。'
    ] },
    { word: 'school', wordChinese: '学校', englishSentences: [
      'Where is your school?',
      'My dad drive me to the school.',
      'I am walking to the school.'
    ], chineseSentences: [
      '你的学校在哪里？',
      '我的爸爸开车送我去学校',
      '我正在走路去上学.'
    ] },
        { word: 'river', wordChinese: '河流', englishSentences: [
      'I can swim in the river.',
      'How many ducks are in the river?',
      'My house is next to the river.',
      'The river is long and clean.',
      'The frog jumps into the river.',
      'Can you see the boat on the river?'
    ], chineseSentences: [
      '我可以在河里游泳。',
      '河里有几只鸭子？',
      '我的房子在河边。',
      '这条河又长又干净。',
      '青蛙跳进河里。',
      '你能看见河上的船吗？'
    ] },
        { word: 'plain', wordChinese: '平原', englishSentences: [
      'The horse runs on the plain.',
      'Can you see the plain?',
      'Look at the big and green plain!',
      'The elephants are walking on the plain.'
    ], chineseSentences: [
      '马在平原上奔跑。',
      '你能看见平原吗？',
      '看那大大的绿色的平原！',
      '那群大象们正在平原上走'
    ] },
        { word: 'forest', wordChinese: '森林', englishSentences: [
      'The forest has many trees.',
      'The forest is very big and beautiful.',
      'We find a red flower in the forest.'
    ], chineseSentences: [
      '森林里有很多树。',
      '森林非常大而且美丽。',
      '我们在森林里找到一朵红色的花。'
    ] },
        { word: 'go', wordChinese: '走', englishSentences: [
      'I go to school every day.',
      'Let\'s go to school.',
      'The cat goes under the bed.',
      'Let\'s go running.'
    ], chineseSentences: [
      '我每天去上学。',
      '我们去学校吧.',
      '猫走到床底下去了。',
      '我们去跑步吧'
    ] },
        { word: 'play', wordChinese: '玩', englishSentences: [
      'Can you play tennis with me?',
      'We play games in the living room.',
      'The cat plays with a red toy.',
      'Don\'t play in the street!'
    ], chineseSentences: [
      '你能和我一起打网球吗？',
      '我们在客厅玩游戏。',
      '猫在玩一个红色的玩具。',
      '不要在马路上玩！'
    ] },
        { word: 'piano', wordChinese: '钢琴', englishSentences: [
      'My sister has a pink piano.',
      'The piano is in the living room.',
      'Can you play the piano?',
      'I like the piano, but I like the guitar too.',
      'My mother plays the piano every day.',
      'I have a piano at home.'
    ], chineseSentences: [
      '我妹妹有一架粉色的钢琴。',
      '钢琴在客厅里。',
      '你会弹钢琴吗？',
      '我喜欢钢琴，但我也喜欢吉他。',
      '我妈妈每天弹钢琴。',
      '我家里有一架钢琴。'
    ] },
        { word: 'tennis', wordChinese: '网球', englishSentences: [
      'I like to play tennis.',
      'Do you have a tennis ball?',
      'Can you play tennis ?'
    ], chineseSentences: [
      '我喜欢打网球。',
      '你有一个网球吗？',
      '你会打网球吗？'
    ] },
        { word: 'ride', wordChinese: '骑', englishSentences: [
      'Can you ride a horse?',
      'Look at the boy riding a motorbike',
      'He is riding a horse on the plain.',
      'We ride bikes to the zoo.',
      'Can you ride a bike to school?'
    ], chineseSentences: [
      '你会骑马吗？',
      '看那个骑摩托车的男孩！',
      '他正在平原上骑马。',
      '我们骑自行车去动物园。',
      '你能骑自行车去上学吗？'
    ] },
        { word: 'drive', wordChinese: '驾驶', englishSentences: [
      'I can drive a car.',
      'Drive the car to the school.',
      'Don\'t drive too fast.',
      'My father drives to work every day.',
      'My mother drives me to school.'
    ], chineseSentences: [
      '我会开小汽车。',
      '把小汽车开到学校。',
      '不要开得太快。',
      '我爸爸每天开车去上班。',
      '我妈妈开车送我去学校。'
    ] },
        { word: 'guitar', wordChinese: '吉他', englishSentences: [
      'This is my guitar.',
      'Can you play the guitar?',
      'I like the guitar and the piano.',
      'He is playing the guitar.'
    ], chineseSentences: [
      '这是我的吉他。',
      '你会弹吉他吗？',
      '我喜欢吉他和钢琴。',
      '他正在弹吉他。'
    ] },
        { word: 'basketball', wordChinese: '篮球', englishSentences: [
      'I like to play basketball.',
      'The basketball is under the chair.',
      'I have a basketball in my bag.',
      'That boy is playing basketball.',
      'Pass me the basketball, please.'
    ], chineseSentences: [
      '我喜欢打篮球。',
      '篮球在椅子下面。',
      '我的书包里有一个篮球。',
      '哪个男孩正在打篮球。',
      '请把篮球递给我。'
    ] },
        { word: 'stand', wordChinese: '站', englishSentences: [
      'I can stand on one foot.',
      'Stand next to the chair.',
      'Don\'t stand on the bed.',
      'The cat is standing on the sofa.'
    ], chineseSentences: [
      '我能单脚站立。',
      '站在椅子旁边。',
      '不要站在床上。',
      '这只猫正站在沙发上。'
    ] },
        { word: 'sit', wordChinese: '坐', englishSentences: [
      'The cat sits on the sofa.',
      'Don\'t sit on the floor.',
      'The dog sits under the table.',
      'Sit down and open your book.'
    ], chineseSentences: [
      '猫坐在沙发上。',
      '不要坐在地板上。',
      '狗坐在桌子底下。',
      '坐下并打开你的书。'
    ] },
        { word: 'me', wordChinese: '我', englishSentences: [
      'Pass me the book.',
      'Can you help me?',
      'Show me your toy.'
    ], chineseSentences: [
      '把书递给我。',
      '你能帮我吗？',
      '给我看看你的玩具。'
    ] },
        { word: 'lorry', wordChinese: '卡车', englishSentences: [
      'I see a big lorry.',
      'My father is driving a blue lorry.',
      'I like the biglorry.',
      'The lorry is big and long.'
    ], chineseSentences: [
      '我看到一辆大卡车。',
      '我的爸爸正在开一辆蓝色的卡车。',
      '我喜欢那辆大卡车。',
      '这辆卡车又大又长。'
    ] },
        { word: 'plane', wordChinese: '飞机', englishSentences: [
      'My toy plane is on the table.',
      'I like the blue plane.',
      'How many planes do you see?'
    ], chineseSentences: [
      '我的玩具飞机在桌子上。',
      '我喜欢那架蓝色的飞机。',
      '你看到几架飞机？'
    ] },
        { word: 'boat', wordChinese: '船', englishSentences: [
      'The boat is on the water.',
      'Can you see the blue boat?',
      'I like to play with my toy boat.',
      'How many boats are in the sea?'
    ], chineseSentences: [
      '船在水上。',
      '你能看到那艘蓝色的船吗？',
      '我喜欢玩我的玩具船。',
      '海上有多少艘船？'
    ] },
        { word: 'motorbike', wordChinese: '摩托车', englishSentences: [
      'My father has a red motorbike.',
      'I don\'t like the dirty motorbike.',
      'Can you ride a motorbike?',
      'My brother rides a motorbike to school.'
    ], chineseSentences: [
      '我爸爸有一辆红色的摩托车。',
      '我不喜欢那辆脏摩托车。',
      '你会骑摩托车吗？',
      '我哥哥骑摩托车去上学。'
    ] },
        { word: 'helicopter', wordChinese: '直升机', englishSentences: [
      'The helicopter can fly.',
      'Can you see the helicopter?',
      'The helicopter is flying.',
      'The helicopter has two doors.'
    ], chineseSentences: [
      '直升机可以飞。',
      '你能看见直升机吗？',
      '直升机正在飞。',
      '这架直升机有两个门。'
    ] },
        { word: 'bus', wordChinese: '公交车', englishSentences: [
      'I go to school by bus.',
      'Look at the big and yellow bus.',
      'My father is driving a bus.',
      'How many buses are there?',
      'The bus is coming.'
    ], chineseSentences: [
      '我坐公交车去上学。',
      '看那辆大的黄色的公交车.',
      '我爸爸正在开公交车。',
      '那里有多少辆公交车？',
      '公交车来了.'
    ] },
        { word: 'now', wordChinese: '现在', englishSentences: [
      'I am very happy now.',
      'What are you doing now?',
      'Can you help me now?',
      'My mother is at home now.'
    ], chineseSentences: [
      '我现在很开心。',
      '你现在在做什么？',
      '你现在能帮我吗？',
      '我妈妈现在在家。'
    ] },
        { word: 'help', wordChinese: '帮助/救命', englishSentences: [
      'Can you help me?',
      'Help! I am in the water.',
      'I help my mother at home.',
      'Please help me open the door.',
      'Help me find my red pencil.',
      'I can help you clean the table.',
      'She helps her grandfather cross the street.'
    ], chineseSentences: [
      '你能帮助我吗？',
      '救命！我在水里。',
      '我在家帮助妈妈。',
      '请帮我开门。',
      '帮我找到我的红色铅笔。',
      '我可以帮你擦桌子。',
      '她帮助她的爷爷过马路。'
    ] },
        { word: 'pick up', wordChinese: '拿起/捡起/接（人）', englishSentences: [
      'Can you pick up the ball?',
      'He goes to school to pick up his sister.',
      'We pick up the books on the table.',
      'They pick up the kite on the tree.'
    ], chineseSentences: [
      '你能捡起球吗？',
      '他去学校接他的妹妹。',
      '我们拿起桌子上的书。',
      '他们从树上取下风筝。'
    ] },
        { word: 'see', wordChinese: '看见', englishSentences: [
      'We see many fish in the river.',
      'Do you see the toy on the table?',
      'I see a small cat under the chair.',
      'They see a yellow plane in the sky.',
      'The boy sees a long snake in the forest.'
    ], chineseSentences: [
      '我们在河里看见许多鱼。',
      '你看见桌子上的玩具了吗？',
      '我看见椅子下面有一只小猫。',
      '他们看见天空中有一架黄色的飞机。',
      '那个男孩在森林里看见一条长蛇。'
    ] },
        { word: 'hero', wordChinese: '英雄', englishSentences: [
      'My father is my hero.',
      'The hero helps the children.',
      'I like the hero in the book.'
    ], chineseSentences: [
      '我的爸爸是我的英雄。',
      '英雄帮助孩子们。',
      '我喜欢书里的英雄。'
    ] },
        { word: 'cross', wordChinese: '穿过', englishSentences: [
      'I cross the street with my mother.',
      'Can you cross the river?',
      'Don\'t cross the street now!'
    ], chineseSentences: [
      '我和妈妈一起过马路。',
      '你能过河吗？',
      '现在不要过马路！'
    ] },
        { word: 'street', wordChinese: '街道', englishSentences: [
      'My school is on this street.',
      'How many trees are on the street?',
      'The dog is walking on the street.',
      'I see a red bike on the street.',
      'Can you cross the street with me?'
    ], chineseSentences: [
      '我的学校在这条街上。',
      '街上有多少棵树？',
      '狗正在街上走。',
      '我看到街上有一辆红色的自行车。',
      '你能和我一起过马路吗？'
    ] },
        { word: 'table-tennis', wordChinese: '乒乓球', englishSentences: [
      'We play table-tennis at school.',
      'The table-tennis table is blue.',
      'I play table-tennis with my father.',
      'Do you like table-tennis?',
      'I can play tennis, but I can\'t play table-tennis .'
    ], chineseSentences: [
      '我们在学校打乒乓球。',
      '这个乒乓球桌是蓝色的.',
      '我和爸爸一起打乒乓球。',
      '你喜欢乒乓球吗？',
      '我会打网球，但我不会打乒乓球。'
    ] },
        { word: 'sail', wordChinese: '航行', englishSentences: [
      'The boat sails on the sea.',
      'I don\'t like to sail.',
      'The boat has a white sail.'
    ], chineseSentences: [
      '船在海上航行。',
      '我不喜欢航行。',
      '这艘船有一个白色的帆。'
    ] },
        { word: 'team', wordChinese: '团队', englishSentences: [
      'My team has five boys.',
      'I am in the school running team.',
      'We are a good team.'
    ], chineseSentences: [
      '我的团队有五个男孩。',
      '我在我们学校的跑步队.',
      '我们是一个好团队。'
    ] },
        { word: 'hot', wordChinese: '热', englishSentences: [
      'It\'s very hot today.',
      'Is the milk hot?',
      'The water is very hot.',
      'It\'s hot in the kitchen.'
    ], chineseSentences: [
      '今天天气很热。',
      '牛奶是热的吗？',
      '水非常热。',
      '厨房里很热。'
    ] },
        { word: 'water', wordChinese: '水', englishSentences: [
      'I drink water every day.',
      'The water is cold.',
      'Pass me the water, please.',
      'He is drinking a bottle of water.'
    ], chineseSentences: [
      '我每天喝水。',
      '水是冷的。',
      '请把水递给我。',
      '他正在喝一瓶水。'
    ] },
        { word: 'some/any', wordChinese: '一些', englishSentences: [
      'I have some apples.',
      'Do you have any milk?',
      'I don\'t have any toys.',
      'Can I have some water?',
      'Are there any cats in the house?',
      'I want some cake, please.',
      'She doesn\'t have any pens.',
      'We have some red pencils.',
      'Has he got any brothers?'
    ], chineseSentences: [
      '我有一些苹果。',
      '你有一些牛奶吗？',
      '我没有一些玩具。',
      '我能要一些水吗？',
      '房子里有一些猫吗？',
      '我想要一些蛋糕。',
      '她没有一些钢笔。',
      '我们有一些红色的铅笔。',
      '他有一些兄弟吗？'
    ] },
        { word: 'home', wordChinese: '家', englishSentences: [
      'This is my home.',
      'Is your home big?',
      'She is at home now.',
      'Where is your home?',
      'The cat is in my home.'
    ], chineseSentences: [
      '这是我的家。',
      '你的家大吗？',
      '她现在在家。',
      '你的家在哪里？',
      '这只猫在我的家里。'
    ] },
        { word: 'everybody', wordChinese: '每个人', englishSentences: [
      'Everybody can jump.',
      'Hello, everybody!',
      'Everybody has a pencil.',
      'Everybody is happy now.',
      'Does everybody have a book?'
    ], chineseSentences: [
      '每个人都会跳。',
      '大家好！',
      '每个人都有一支铅笔。',
      '每个人现在都很开心。',
      '每个人都有书吗？'
    ] },
        { word: 'her', wordChinese: '她的', englishSentences: [
      'This is her pencil.',
      'I like her cat.',
      'Pass me her book, please.',
      'She is her sister.',
      'Her hair is long.',
      'I can help her.',
      'Her dog is under the table.'
    ], chineseSentences: [
      '这是她的铅笔。',
      '我喜欢她的猫。',
      '请把她的书递给我。',
      '她是她的姐姐。',
      '她的头发很长。',
      '我可以帮助她。',
      '她的狗在桌子下面。'
    ] },
        { word: 'his', wordChinese: '他的', englishSentences: [
      'This is his bag.',
      'His cat is very small.',
      'I like his toy car.',
      'Where is his pencil?',
      'His mother is a teacher.',
      'He is brushing his teeth.',
      'This is his book and that is his eraser.'
    ], chineseSentences: [
      '这是他的书包。',
      '他的猫非常小。',
      '我喜欢他的玩具车。',
      '他的铅笔在哪里？',
      '他的妈妈是一名老师。',
      '他正在刷牙。',
      '这是他的书，那是他的橡皮。'
    ] },
        { word: 'their', wordChinese: '他们的', englishSentences: [
      'Their cat is very cute.',
      'I like their blue schoolbag.',
      'Their mother is in the kitchen.',
      'I don\'t like their food.'
    ], chineseSentences: [
      '他们的猫非常可爱。',
      '我喜欢他们蓝色的书包。',
      '他们的妈妈在厨房里。',
      '我不喜欢他们的食物。'
    ] },
        { word: 'our', wordChinese: '我们的', englishSentences: [
      'Our home is clean.',
      'I like our school.',
      'Where is our basketball?',
      'Our teacher is happy.',
      'Our mother has a red skirt.'
    ], chineseSentences: [
      '我们的家很干净。',
      '我喜欢我们的学校。',
      '我们的篮球在哪里？',
      '我们的老师很开心。',
      '我们的妈妈有一条红裙子。'
    ] },
        { word: 'hall', wordChinese: '大厅', englishSentences: [
      'The hall is next to the kitchen.',
      'The hall has got a big door.',
      'I am in the hall now.',
      'The children are in the hall.'
    ], chineseSentences: [
      '大厅在厨房旁边。',
      '大厅有一扇大门。',
      '我现在在大厅里。',
      '孩子们在大厅里。'
    ] },
        { word: 'bathroom', wordChinese: '卫生间', englishSentences: [
      'I am cleaning the bathroom.',
      'Where is the bathroom?',
      'Don\'t play in the bathroom.',
      'Is the bathroom clean?',
      'I wash my hands in the bathroom.',
      'The bathroom door is white.'
    ], chineseSentences: [
      '我正在打扫卫生间。',
      '卫生间在哪里？',
      '不要在卫生间里玩。',
      '卫生间干净吗？',
      '我在卫生间洗手。',
      '卫生间的门是白色的。'
    ] },
        { word: 'dining room', wordChinese: '餐厅/饭厅', englishSentences: [
      'We eat in the dining room.',
      'I can see a big table in the dining room.',
      'My mother is in the dining room.',
      'They are eating in the dining room now.'
    ], chineseSentences: [
      '我们在餐厅吃饭。',
      '我能看到餐厅里有一张大桌子。',
      '我妈妈在餐厅里。',
      '他们现在正在餐厅吃饭。'
    ] },
        { word: 'music', wordChinese: '音乐', englishSentences: [
      'Can you play music?',
      'Listen to the music.',
      'She is playing music now.',
      'I\'ve got some music books.',
      'What\'s your favourite music?',
      'He can play music on the piano.'
    ], chineseSentences: [
      '你会演奏音乐吗？',
      '听音乐。',
      '她正在演奏音乐。',
      '我有一些音乐书。',
      '你最喜欢的音乐是什么？',
      '他可以用钢琴演奏音乐。'
    ] },
        { word: 'watch', wordChinese: '看', englishSentences: [
      'She is watching TV.',
      'We watch a film at home.',
      'Don\'t watch TV too long.',
      'They are watching the fish.'
    ], chineseSentences: [
      '她正在看电视。',
      '我们在家看一部电影。',
      '不要看电视太久。',
      '他们正在看鱼。'
    ] },
        { word: 'read', wordChinese: '阅读', englishSentences: [
      'Can you read this word?',
      'I like to read.',
      'He is reading now.',
      'What are you reading?'
    ], chineseSentences: [
      '你能读这个单词吗？',
      '我喜欢阅读。',
      '他现在正在阅读。',
      '你在读什么？'
    ] },
        { word: 'eat', wordChinese: '吃', englishSentences: [
      'I eat an apple every day.',
      'The cat eats fish.',
      'She is eating a big cake.',
      'He don\'t like to eat potatoes.',
      'Can I eat some fruit?',
      'They are eating now.'
    ], chineseSentences: [
      '我每天吃一个苹果。',
      '猫吃鱼。',
      '她正在吃一个大蛋糕。',
      '他不喜欢吃土豆。',
      '我可以吃一些水果吗？',
      '他们正在吃饭。'
    ] },
        { word: 'find', wordChinese: '寻找', englishSentences: [
      'I find my book on the table.',
      'Can you find the red ball?',
      'Where do you find your pencil?',
      'He finds his toy under the bed.',
      'They find some fruit in the kitchen.',
      'Help me find my blue shoes, please.',
      'We find a big frog in the river.'
    ], chineseSentences: [
      '我在桌子上找到了我的书。',
      '你能找到红色的球吗？',
      '你在哪里找到你的铅笔？',
      '他在床下找到了他的玩具。',
      '他们在厨房里找到了一些水果。',
      '请帮我找到我的蓝色鞋子。',
      '我们在河里找到了一只大青蛙。'
    ] },
  ];

  const custom = loadCustomQuestions();

  // 合并自定义题目
  hardcoded.forEach(item => {
    const customItem = custom[item.word];
    if (customItem) {
      // 应用覆盖
      if (customItem._overrides) {
        Object.keys(customItem._overrides).forEach(idx => {
          const override = customItem._overrides[idx];
          const i = parseInt(idx);
          if (i >= 0 && i < item.englishSentences.length) {
            item.englishSentences[i] = override.english;
            item.chineseSentences[i] = override.chinese;
          }
        });
      }
      // 追加新题目
      if (customItem.englishSentences && customItem.englishSentences.length > 0) {
        item.englishSentences = [...item.englishSentences, ...customItem.englishSentences];
        item.chineseSentences = [...item.chineseSentences, ...customItem.chineseSentences];
      }
    }
  });

  // 添加全新单词的题目
  Object.keys(custom).forEach(word => {
    if (!hardcoded.some(h => h.word === word)) {
      const item = custom[word];
      if (item.englishSentences && item.englishSentences.length > 0) {
        hardcoded.push({
          word: item.word,
          wordChinese: item.wordChinese || word,
          englishSentences: [...item.englishSentences],
          chineseSentences: [...item.chineseSentences]
        });
      }
    }
  });

  return hardcoded;
}

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
    // 单词造句素材（自动合并localStorage中的自定义题目）
    const wordSentenceQuestions = getMergedWordSentenceQuestions();

    // 随机选择题目
    const shuffledQuestions = [...wordSentenceQuestions].sort(() => Math.random() - 0.5);
    this.questions = shuffledQuestions.slice(0, Math.min(this.questionsPerRound, shuffledQuestions.length));
  }

  renderQuiz() {
    const currentQuestion = this.questions[this.currentIndex];
    
    // 检查当前题目是否已有答题状态
    const currentState = this.questionStates[this.currentIndex];
    const hasAnswered = currentState && currentState.hasAnswered;
    const answeredIndex = hasAnswered ? currentState.answeredSentenceIndex : -1;

    this.container.innerHTML = `
      <div class="sentence-practice-container">
        <!-- 单词卡片 -->
        <div class="word-card">
          <div class="word-content">
            <div class="word-header">
              <span class="word-number">${this.currentIndex + 1}</span>
              <h2 class="word-title">${currentQuestion.word}</h2>
            </div>
            <p class="word-pronunciation">${currentQuestion.wordChinese}</p>
          </div>
          <div class="word-actions">
            <span class="word-progress">${this.currentIndex + 1} / ${this.questions.length}</span>
            <button class="word-audio-btn" id="play-word-audio" title="播放发音">
              <i class="fas fa-volume-up"></i>
            </button>
          </div>
        </div>

        <!-- 句子练习区 -->
        <div class="sentences-area">
          <h3 class="sentences-title">
            <i class="fas fa-language"></i>
            选择一句中文，说出对应的英文
          </h3>
          
          <div class="sentences-list">
            ${currentQuestion.chineseSentences.map((chineseSentence, index) => {
              const englishSentence = currentQuestion.englishSentences[index];
              // 根据保存的状态设置按钮样式
              const isAnswered = hasAnswered && answeredIndex === index;
              const isDisabled = hasAnswered;
              const correctBtnClass = isAnswered ? 'result-btn correct-btn clicked correct-clicked' : 
                                     (isDisabled ? 'result-btn correct-btn disabled' : 'result-btn correct-btn');
              const correctBtnContent = isAnswered ? 
                '<i class="fas fa-check"></i><span>答对</span>' : '<span>答对</span>';
              const correctBtnDisabled = isDisabled ? 'disabled' : '';
              
              return `
                <div class="sentence-item ${isAnswered ? 'answered' : ''}" data-index="${index}">
                  <div class="sentence-row">
                    <div class="sentence-content">
                      <p class="sentence-chinese-text"><span class="sentence-num">${index + 1}.</span>${chineseSentence}</p>
                    </div>
                    <div class="sentence-actions">
                      <button class="result-btn answer-btn" data-sentence-index="${index}" data-sentence="${englishSentence}">
                        <i class="fas fa-eye"></i>
                        <span>查看答案</span>
                      </button>
                      <button class="${correctBtnClass}" data-sentence-index="${index}" ${correctBtnDisabled}>
                        ${correctBtnContent}
                      </button>
                    </div>
                  </div>
                  <div class="sentence-answer-panel" id="answer-panel-${index}" style="display: none;">
                    <div class="sentence-answer-content">
                      <p class="sentence-answer-text">${englishSentence}</p>
                      <button class="sentence-audio-btn" data-sentence="${englishSentence}" title="播放发音">
                        <i class="fas fa-volume-up"></i>
                      </button>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- 反馈区域 -->
        <div class="sentence-feedback" id="sentence-feedback"></div>

        <!-- 导航按钮 -->
        <div class="sentence-navigation">
          <button class="nav-btn prev-btn" id="prev-question" ${this.currentIndex === 0 ? 'disabled' : ''}>
            <i class="fas fa-arrow-left"></i>
            <span>上一题</span>
          </button>
          <button class="nav-btn next-btn" id="next-question" ${this.currentIndex === this.questions.length - 1 ? 'data-finish="true"' : ''}>
            <span>${this.currentIndex === this.questions.length - 1 ? '完成' : '下一题'}</span>
            <i class="fas fa-arrow-right"></i>
          </button>
        </div>

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

    // 查看答案按钮（与听写页面一致）
    const answerButtons = this.container.querySelectorAll('.result-btn.answer-btn');
    answerButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        const sentence = button.dataset.sentence;
        const sentenceIndex = button.dataset.sentenceIndex;
        this.showSentenceAnswer(sentenceIndex, sentence, button);
      });
    });

    // 答对按钮（与听写页面一致）
    const correctButtons = this.container.querySelectorAll('.result-btn.correct-btn');
    correctButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        const sentenceIndex = button.dataset.sentenceIndex;
        this.markSentenceResult(sentenceIndex, button);
      });
    });

    // 句子发音按钮（在答案面板中）
    const sentenceAudioButtons = this.container.querySelectorAll('.sentence-audio-btn');
    sentenceAudioButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        const sentence = button.dataset.sentence;
        this.playSentenceAudio(sentence);
      });
    });

    // 导航按钮 - 使用 this.container.querySelector 确保只获取当前模式的按钮
    const prevButton = this.container.querySelector('#prev-question');
    const nextButton = this.container.querySelector('#next-question');
    
    prevButton?.addEventListener('click', () => {
      if (this.currentIndex > 0) {
        this.goToQuestion(this.currentIndex - 1);
      }
    });

    nextButton?.addEventListener('click', () => {
      if (this.currentIndex < this.questions.length - 1) {
        // 不是最后一题，正常下一题
        const nextIndex = this.currentIndex + 1;
        this.currentIndex = nextIndex;
        this.renderQuiz();
        this.bindEvents();
      } else {
        // 最后一题，点击完成按钮
        this.showQuizSummary();
      }
    });

    this.container.querySelector('#restart-quiz')?.addEventListener('click', () => this.restart());
  }

  playWordAudio() {
    const currentQuestion = this.questions[this.currentIndex];
    if (currentQuestion && currentQuestion.word) {
      audioPlayer.speak(currentQuestion.word);
    }
  }

  playSentenceAudio(sentence) {
    if (sentence) {
      audioPlayer.speak(sentence, { speed: 0.5 });
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
        // 正确答案：更高音的音效，更响亮
        oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(660, audioContext.currentTime + 0.15);
        gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.25);
      } else {
        // 错误答案：更明显的错误音效，更响亮
        oscillator.frequency.setValueAtTime(220, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(110, audioContext.currentTime + 0.15);
        gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.25);
      }

      oscillator.type = 'sine';
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.25);
    } catch (error) {
      // console.warn('Failed to play sound effect:', error);
    }
  }

  // 显示句子答案（支持显示/隐藏切换）
  showSentenceAnswer(sentenceIndex, sentence, button) {
    const answerPanel = document.getElementById(`answer-panel-${sentenceIndex}`);
    const buttonSpan = button.querySelector('span');
    const buttonIcon = button.querySelector('i');

    if (answerPanel.style.display === 'none') {
      // 显示答案
      answerPanel.style.display = 'block';
      buttonSpan.textContent = '隐藏答案';
      buttonIcon.className = 'fas fa-eye-slash';
    } else {
      // 隐藏答案
      answerPanel.style.display = 'none';
      buttonSpan.textContent = '查看答案';
      buttonIcon.className = 'fas fa-eye';
    }
  }

  // 标记句子结果（与听写页面一致）
  markSentenceResult(sentenceIndex, button) {
    // 如果按钮已被禁用，直接返回
    if (button.disabled) return;

    // 检查当前题目是否已经有选中的句子
    const currentQuestionIndex = this.currentIndex;
    if (this.questionStates[currentQuestionIndex] && this.questionStates[currentQuestionIndex].answeredSentenceIndex !== undefined) {
      // 已经答过这题了，不能重复选择
      return;
    }

    // 保存答题状态
    this.questionStates[currentQuestionIndex] = {
      answeredSentenceIndex: parseInt(sentenceIndex),
      hasAnswered: true
    };

    // 禁用当前题目的所有"答对"按钮
    const allCorrectButtons = this.container.querySelectorAll('.result-btn.correct-btn');
    allCorrectButtons.forEach((btn, index) => {
      btn.disabled = true;
      if (index === parseInt(sentenceIndex)) {
        // 选中的按钮显示勾选标记
        btn.classList.add('clicked', 'correct-clicked');
        btn.innerHTML = `
          <i class="fas fa-check"></i>
          <span>答对</span>
        `;
      } else {
        // 未选中的按钮显示为禁用状态
        btn.classList.add('disabled');
      }
    });

    // 播放答对音效
    this.playSoundEffect(true);

    // 增加本轮得分
    this.score += 5;

    // 加分到全局积分
    if (window.router && window.router.addPoints) {
      window.router.addPoints(5);
    }

    // 显示反馈
    const feedback = document.getElementById('sentence-feedback');
    if (feedback) {
      feedback.innerHTML = `
        <div class="feedback-content correct">
          <i class="fas fa-check-circle"></i>
          <span>答对了！+5分</span>
        </div>
      `;
      feedback.className = 'sentence-feedback show';

      // 3秒后清除反馈
      setTimeout(() => {
        feedback.className = 'sentence-feedback';
      }, 3000);
    }
  }

  goToQuestion(index) {
    if (index < 0 || index >= this.questions.length) return;

    this.currentIndex = index;
    
    // 检查当前题目是否已答题
    const state = this.questionStates[index];
    this.hasAnswered = state && state.hasAnswered;

    // renderQuiz 会自动根据 questionStates 恢复状态
    this.renderQuiz();
    this.bindEvents();
  }

  restart() {
    // 清理弹框
    const summary = document.getElementById('quiz-summary');
    if (summary) {
      summary.remove();
    }

    this.currentIndex = 0;
    this.score = 0;
    this.answers = [];
    this.questionStates = {}; // 清空选择状态
    this.hasAnswered = false;
    this.generateQuestions();
    this.renderQuiz();
    this.bindEvents();
  }

  showQuizSummary() {
    // 创建弹框DOM
    const summary = document.createElement('div');
    summary.className = 'quiz-summary';
    summary.id = 'quiz-summary';

    summary.innerHTML = `
      <div class="summary-content">
        <div class="summary-icon">🎉</div>
        <h3>练习完成！</h3>
        <div class="summary-stats">
          <div class="stat-box stat-box-score">
            <span class="stat-value">${this.score}</span>
            <span class="stat-label">本轮得分</span>
          </div>
        </div>
        <div class="goal-message" id="goal-message">
          <!-- 动态插入目标提示信息 -->
        </div>
        <div class="result-actions">
          <button class="restart-btn" id="restart-quiz">
            <i class="fas fa-redo"></i>
            再练一次
          </button>
          <button class="restart-btn secondary" id="back-to-home">
            <i class="fas fa-home"></i>
            回到首页
          </button>
        </div>
      </div>
    `;

    // 添加到body中
    document.body.appendChild(summary);

    // 设置目标提示信息
    const goalMessage = summary.querySelector('#goal-message');
    if (goalMessage) {
      try {
        let message = '';

        if (window.router && typeof window.router.getGoalProgress === 'function') {
          const progress = window.router.getGoalProgress();
          if (progress && typeof progress.current !== 'undefined' && typeof progress.goal !== 'undefined') {
            const remaining = Math.max(0, progress.goal - progress.current);

            if (remaining > 0) {
              message = `💪 加油，还差${remaining}分就完成了！`;
            } else {
              message = `🎊 太棒了！你已经完成今日目标！`;
            }
          } else {
            message = '🎯 继续加油学习吧！';
          }
        } else {
          message = '🎯 继续加油学习吧！';
        }

        goalMessage.innerHTML = `<p class="goal-text">${message}</p>`;
      } catch (error) {
        // console.error('生成目标提示失败:', error);
        goalMessage.innerHTML = `<p class="goal-text">🎯 继续加油学习吧！</p>`;
      }
    }

    // 绑定事件
    const restartBtn = summary.querySelector('#restart-quiz');
    const backToHomeBtn = summary.querySelector('#back-to-home');
    
    if (restartBtn) {
      restartBtn.addEventListener('click', () => this.restart());
    }

    if (backToHomeBtn) {
      backToHomeBtn.addEventListener('click', () => {
        // 移除弹框
        summary.remove();
        
        // 导航回首页
        if (window.router && window.router.navigate) {
          window.router.navigate('/');
        }
      });
    }
  }

  cleanup() {
    // 清理弹框
    const summary = document.getElementById('quiz-summary');
    if (summary) {
      summary.remove();
    }

    // 只清理当前容器的DOM状态，避免影响其他页面
    if (this.container) {
      const options = this.container.querySelectorAll('.quiz-option');
      options.forEach(option => {
        option.classList.remove('selected', 'correct', 'incorrect');
        option.style.pointerEvents = 'auto';
      });

      // 重置导航按钮状态
      const prevButton = this.container.querySelector('#prev-question');
      const nextButton = this.container.querySelector('#next-question');
      const feedback = this.container.querySelector('#quiz-feedback');

      if (prevButton) prevButton.disabled = true;
      if (nextButton) nextButton.disabled = true;
      if (feedback) {
        feedback.textContent = '';
        feedback.className = 'quiz-feedback';
      }
    }

    // 停止音频播放
    audioPlayer.stop();

    // 清理状态
    this.currentIndex = 0;
    this.score = 0;
    this.answers = [];
    this.selectedAnswer = null;
    this.questionStates = {};
    this.hasAnswered = false;

    // console.log('单词造句模式已清理，当前实例状态已重置');
  }
}

export function initWordToSentenceMode() {
  const wordToSentence = new WordToSentenceMode('word-to-sentence-content');
  wordToSentence.init();
  return wordToSentence;
}
