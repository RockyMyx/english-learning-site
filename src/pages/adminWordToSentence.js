import { getAllWords, getCustomWords, addCustomWord, deleteCustomWord } from '../utils/vocabulary.js';
import { generateSentences } from '../utils/sentenceGenerator.js';

// 获取localStorage中的题目数据
function getStoredQuestions() {
  try {
    const data = localStorage.getItem('adminWordSentenceQuestions');
    return data ? JSON.parse(data) : {};
  } catch (e) {
    return {};
  }
}

// 保存题目数据到localStorage
function saveStoredQuestions(data) {
  localStorage.setItem('adminWordSentenceQuestions', JSON.stringify(data));
}

// 获取硬编码的题目（从wordToSentenceMode.js导入的副本）
function getHardcodedQuestions() {
  return [
    { word: 'one', wordChinese: '一', englishSentences: ['I have one cat. It\'s a black cat.', 'Look! One red toy is on the chair.', 'How many cats have you got? I have one.'], chineseSentences: ['我有一只猫。它是一只黑色的猫。', '看！一个红色的玩具在椅子上。', '你有多少只猫？我有一只。'] },
    { word: 'two', wordChinese: '二', englishSentences: ['I have two black eyes.', 'Two potatoes are on the table.', 'The dog has two short legs.'], chineseSentences: ['我有两只黑色的眼睛。', '桌子上有两个土豆。', '看那只狗！它有两条短腿。'] },
    { word: 'three', wordChinese: '三', englishSentences: ['I have three green toy cars.', 'Three dolls are on the sofa.', 'How many eggs are in the kitchen? Three.'], chineseSentences: ['我有三个绿色的玩具汽车。', '沙发上坐着三个洋娃娃。', '厨房里有多少个鸡蛋？三个。'] },
    { word: 'four', wordChinese: '四', englishSentences: ['Four books are on the chair.', 'Look at the frog! It\'s got four legs.', 'There are has four people. They are my mother, father, sister and me.'], chineseSentences: ['椅子上有四本书。', '看那只青蛙！它有四条腿。', '我家有四口人。他们是我的妈妈、爸爸、妹妹和我。'] },
    { word: 'five', wordChinese: '五', englishSentences: ['I have five fingers on my hand.', 'Pass me the five red tomatoes, please.', 'Look at the spider! It\'s got eight legs, but it hasn\'t got five legs.'], chineseSentences: ['我有五个手指。', '请给我五个红色的西红柿。', '看那只蜘蛛！它有八条腿，不是五条。'] },
    { word: 'six', wordChinese: '六', englishSentences: ['I have six yellow erasers.', 'How many balls are under the bed? Six.', 'That robot has got six arms.'], chineseSentences: ['我有六个黄色的橡皮。', '床下有多少个球？六个。', '那个机器人有六只手臂。'] },
    { word: 'seven', wordChinese: '七', englishSentences: ['Look! Seven pink birds are on the house.', 'My grandfather is seventy-one. He is old, but he is happy.', 'How many orange toys have you got? I have seven.'], chineseSentences: ['看！七只粉色的鸟在房子上。', '我的爷爷七十一岁。他很老，但是很快乐。', '你有多少个橙色的玩具？我有七个。'] },
    { word: 'eight', wordChinese: '八', englishSentences: ['A spider has got eight legs.', 'I have eight pencils in my bag.', 'Look at the fish! Eight fish can swim.'], chineseSentences: ['蜘蛛有八条腿。', '我的书包里有八支铅笔。', '看那些鱼！八条鱼会游泳。'] },
    { word: 'nine', wordChinese: '九', englishSentences: ['I have nine white erasers.', 'How old are you? I\'m nine.', 'Nine cakes are on the table. I like cake!'], chineseSentences: ['我有九个白色的橡皮。', '你几岁了？我九岁。', '桌上有九块蛋糕。我喜欢蛋糕！'] },
    { word: 'ten', wordChinese: '十', englishSentences: ['I have ten fingers.', 'Look! Ten toy cars are on the floor.', 'How many purple toys are on the chair? Ten.'], chineseSentences: ['我有十根手指。', '看！十辆玩具汽车在地板上。', '多少个紫色的玩具在椅子上？十个。'] },
    { word: 'red', wordChinese: '红色', englishSentences: ['My favourite color is red.', 'I have a red apple. It\'s on the table.', 'Pass me the red pencil, please.'], chineseSentences: ['我最喜欢的颜色是红色。', '我有一个红色的苹果。它在桌子上。', '请把那个红色的铅笔给我。'] },
    { word: 'white', wordChinese: '白色', englishSentences: ['Look at the white bird! It can fly.', 'I have a white cat and a black dog.', 'An egg is white. I like eggs.'], chineseSentences: ['看那只白色的鸟！它会飞。', '我有一只白色的猫和一只黑色的狗。', '鸡蛋是白色的。我喜欢鸡蛋。'] },
    { word: 'black', wordChinese: '黑色', englishSentences: ['My father has got a black car.', 'The black spider is small.', 'I like black and white.'], chineseSentences: ['我的爸爸有一辆黑色的车。', '那只黑色的蜘蛛很小。', '我喜欢黑色和白色。'] },
    { word: 'blue', wordChinese: '蓝色', englishSentences: ['My eyes are blue.', 'My eraser is blue.', 'What\'s your favourite color? My favourite color is blue.'], chineseSentences: ['我的眼睛是蓝色的。', '我的橡皮是蓝色的。', '你最喜欢的颜色是什么？我最喜欢的颜色是蓝色。'] },
    { word: 'yellow', wordChinese: '黄色', englishSentences: ['I have a yellow toy car.', 'Bananas are yellow. They are fruit.', 'Color the yellow bag blue.'], chineseSentences: ['我有一辆黄色的玩具汽车。', '香蕉是黄色的。它们是水果。', '把那个黄色的书包涂成蓝色。'] },
    { word: 'green', wordChinese: '绿色', englishSentences: ['Look at the green frog! It can jump.', 'My pencil is green.', 'I have a green apple. It\'s under the chair.'], chineseSentences: ['看那只绿色的青蛙！它会跳。', '我的铅笔是绿色的。', '我有一个绿色的苹果。它在椅子下面。'] },
    { word: 'pink', wordChinese: '粉色', englishSentences: ['I have a pink doll. She\'s beautiful.', 'My sister likes pink.', 'Pass me the pink pencil, please.'], chineseSentences: ['我有一个粉色的洋娃娃。她很漂亮。', '我的妹妹喜欢粉色。', '请把那支粉色的铅笔给我。'] },
    { word: 'orange', wordChinese: '橙色', englishSentences: ['Oranges are orange.', 'Look at the orange bag! It\'s big.', 'I have an orange cat. It\'s beautiful.'], chineseSentences: ['橙子是橙色的。', '看那个橙色的书包！它很大。', '我有一只橙色的猫。它很漂亮。'] },
    { word: 'purple', wordChinese: '紫色', englishSentences: ['I have a purple robot. It\'s small.', 'Grapes are purple. I like grapes.', 'Color the purple chair black.'], chineseSentences: ['我有一个紫色的机器人。它很小。', '葡萄是紫色的。我喜欢葡萄。', '把那个紫色的椅子涂成黑色。'] },
    { word: 'color', wordChinese: '颜色', englishSentences: ['What\'s your favourite color?', 'Color the bird yellow.', 'Look at the toys! What color are they?'], chineseSentences: ['你最喜欢的颜色是什么？', '把那只鸟涂成黄色。', '看这些玩具！它们是什么颜色？'] },
    { word: 'listen', wordChinese: '听', englishSentences: ['Listen to your mother.', 'Listen, and point to your head.', 'Listen! The cat is on the sofa.'], chineseSentences: ['听你妈妈的话。', '听，并指着你的头。', '听！那只猫在沙发上。'] },
    { word: 'look', wordChinese: '看', englishSentences: ['Look! The dog is under the table.', 'Look! That tiger is big.', 'Look at the book.'], chineseSentences: ['看！那只狗在桌子下面。', '看！那只老虎很大。', '看着书。'] },
    { word: 'point', wordChinese: '指', englishSentences: ['Point to your eyes.', 'Point to the red toy car.', 'Listen, and point to the door.'], chineseSentences: ['指着你的眼睛。', '指着那辆红色的玩具汽车。', '听，并指着门。'] },
    { word: 'sit down', wordChinese: '坐下', englishSentences: ['Sit down on the chair, please.', 'The teacher says, Sit down.', 'Sit down and look at the book.'], chineseSentences: ['请坐在椅子上。', '老师说：坐下。', '坐下，并看着书。'] },
    { word: 'stand up', wordChinese: '站起来', englishSentences: ['Stand up, please.', 'The teacher says  Stand up.', 'Stand up and point to the door.'], chineseSentences: ['请站起来。', '老师说：站起来。', '站起来，并指着门。'] },
    { word: 'open', wordChinese: '打开', englishSentences: ['Open your book, please.', 'Open the door.', 'Look! That boy is opening his bag.'], chineseSentences: ['请打开你的书。', '打开门。', '看！那个男孩在打开他的书包。'] },
    { word: 'close', wordChinese: '关闭', englishSentences: ['Close your book, please.', 'Close the door.', 'Look! That girl is closing the door.'], chineseSentences: ['请关上你的书。', '关上门。', '看！那个女孩在关门。'] },
    { word: 'hello', wordChinese: '你好', englishSentences: ['Hello, mother!', 'Say hello to your friend.', 'Hello! What\'s your name?'], chineseSentences: ['你好，妈妈！', '对你的朋友说你好。', '你好！你叫什么名字？'] },
    { word: 'talk', wordChinese: '说话', englishSentences: ['Please don\'t talk in class.', 'Look! Those two girls are talking.', 'My bird can talk.'], chineseSentences: ['请不要在课堂上讲话。', '看！那两个女孩在说话。', '我的鸟会说话。'] },
    { word: 'jump', wordChinese: '跳', englishSentences: ['Look at the frog! It can jump.', 'I can jump, but I can\'t fly.', 'That dog can jump.'], chineseSentences: ['看那只青蛙！它会跳。', '我会跳，但我不会飞。', '那只狗会跳。'] },
    { word: 'fly', wordChinese: '飞', englishSentences: ['Look at the bird! It can fly.', 'Spiders can\'t fly, but birds can fly.', 'I have a kite. It\'s red. It can fly.'], chineseSentences: ['看那只鸟！它会飞。', '蜘蛛不会飞，但鸟会飞。', '我有一个风筝。它是红色的。它会飞。'] },
    { word: 'swim', wordChinese: '游泳', englishSentences: ['Fish can swim.', 'I can swim, but I can\'t fly.', 'Look at the duck! It can swim.'], chineseSentences: ['鱼会游泳。', '我会游泳，但我不会飞。', '看那只鸭子！它会游泳。'] },
    { word: 'food', wordChinese: '食物', englishSentences: ['I like food. Cake is my favourite.', 'Food is in the kitchen.', 'What\'s your favourite food? It\'s chips.'], chineseSentences: ['我喜欢食物。蛋糕是我的最爱。', '厨房里有食物。', '你最喜欢的食物是什么？是薯条。'] },
    { word: 'cake', wordChinese: '蛋糕', englishSentences: ['I like cake. It\'s food.', 'A big cake is on the table.', 'Here\'s a cake for you. Thank you.'], chineseSentences: ['我喜欢蛋糕。它是食物。', '桌子上有一个大蛋糕。', '给你一个蛋糕。谢谢。'] },
    { word: 'potato', wordChinese: '土豆', englishSentences: ['Potatoes are food. I like potatoes.', 'Look at the potatoes! They are on the table.', 'How many potatoes have I got? I have five.'], chineseSentences: ['土豆是食物。我喜欢土豆。', '看那些土豆！它们在桌子上。', '我有多少土豆？我有五个。'] },
    { word: 'tomato', wordChinese: '西红柿', englishSentences: ['Tomatoes are red.', 'I don\'t like tomatoes.', 'How many tomatoes are on the table? Six.'], chineseSentences: ['西红柿是红色的。', '我不喜欢西红柿。', '桌子上有多少个西红柿？六个。'] },
    { word: 'chips', wordChinese: '薯片', englishSentences: ['I like chips. They are food.', 'Pass me the chips, please.', 'Look! The chips are on the table.'], chineseSentences: ['我喜欢薯条。它们是食物。', '请给我一些薯条。', '看！薯条在桌子上。'] },
    { word: 'fruit', wordChinese: '水果', englishSentences: ['I like fruit. Apples are my favourite.', 'Look at the fruit! They are apples and bananas.', 'What\'s your favourite food? It\'s fruit.'], chineseSentences: ['我喜欢水果。苹果是我的最爱。', '看这些水果！它们是苹果和香蕉。', '你最喜欢的食物是什么？是水果。'] },
    { word: 'milk', wordChinese: '牛奶', englishSentences: ['I like milk.', 'The milk is in the kitchen.', 'Look at the white cat! It likes milk.'], chineseSentences: ['我喜欢牛奶。', '牛奶在厨房里。', '看那只白色的猫！它喜欢牛奶。'] },
    { word: 'egg', wordChinese: '鸡蛋', englishSentences: ['Eggs are white.', 'I don\'t like eggs.', 'How many eggs are on the table? Three.'], chineseSentences: ['鸡蛋是白色的。', '我不喜欢鸡蛋。', '桌上有多少个鸡蛋？三个。'] },
    { word: 'in', wordChinese: '在...里面', englishSentences: ['My pencil is in my bag.', 'My cat is in the house.', 'The book is in the bag.'], chineseSentences: ['我的铅笔在书包里。', '我的猫在房子里。', '书在书包里。'] },
    { word: 'on', wordChinese: '在...上面', englishSentences: ['The book is on the table.', 'Look at the bird! It\'s on the house.', 'My toy car is on the bed.'], chineseSentences: ['书在桌子上。', '看那只鸟！它在房子上。', '我的玩具汽车在床上。'] },
    { word: 'under', wordChinese: '在...下面', englishSentences: ['My cat is under the chair.', 'Look! The ball is under the bed.', 'Where\'s my pencil? It\'s under the book.'], chineseSentences: ['我的猫在椅子下面。', '看！那个球在床下面。', '我的铅笔在哪里？它在书下面。'] },
    { word: 'body', wordChinese: '身体', englishSentences: ['I have a head, arms, and legs. This is my body.', 'Point to your body.', 'My body is big.'], chineseSentences: ['我有头、手臂和腿。这是我的身体。', '指着你的身体。', '我的身体很大。'] },
    { word: 'eye', wordChinese: '眼睛', englishSentences: ['I have two blue eyes.', 'Point to your eyes.', 'Look at the cat! It\'s got green eyes.'], chineseSentences: ['我有两只蓝色的眼睛。', '指着你的眼睛。', '看那只猫！它有绿色的眼睛。'] },
    { word: 'mouth', wordChinese: '嘴巴', englishSentences: ['Point to your mouth.', 'Open your mouth.', 'Look at the dog! Its mouth is big.'], chineseSentences: ['指着你的嘴巴。', '张开你的嘴巴。', '看那只狗！它的嘴巴很大。'] },
    { word: 'hand', wordChinese: '手', englishSentences: ['I have two hands.', 'Point to your hand.', 'My hand is small.'], chineseSentences: ['我有两只手。', '指着你的手。', '我的手很小。'] },
    { word: 'leg', wordChinese: '腿', englishSentences: ['I have two legs.', 'Point to your legs.', 'That spider has got eight legs.'], chineseSentences: ['我有两条腿。', '指着你的腿。', '那只蜘蛛有八条腿。'] },
    { word: 'arm', wordChinese: '胳膊', englishSentences: ['I have two arms.', 'Point to your arms.', 'That robot has got long arms.'], chineseSentences: ['我有两条手臂。', '指着你的手臂。', '那个机器人有长手臂。'] },
    { word: 'head', wordChinese: '头', englishSentences: ['Point to your head.', 'My head is big.', 'Look at the tiger! Its head is big.'], chineseSentences: ['指着你的头。', '我的头很大。', '看那只老虎！它的头很大。'] },
    { word: 'house', wordChinese: '房子', englishSentences: ['Look at my house! It\'s red.', 'My house is big.', 'That cat is on the house.'], chineseSentences: ['看我的房子！它是红色的。', '我的房子很大。', '那只猫在房子上。'] },
    { word: 'sofa', wordChinese: '沙发', englishSentences: ['The cat is on the sofa.', 'Look at the sofa! It\'s big.', 'My doll is under the sofa.'], chineseSentences: ['猫在沙发上。', '看那个沙发！它很大。', '我的洋娃娃在沙发下面。'] },
    { word: 'door', wordChinese: '门', englishSentences: ['The door is black.', 'Close the door, please.', 'Look! A black spider is on the door.'], chineseSentences: ['门是黑色的。', '请关上门。', '看！一只黑色的蜘蛛在门上。'] },
    { word: 'bed', wordChinese: '床', englishSentences: ['My bed is blue.', 'The cat is under the bed.', 'A big bed is in my bedroom.'], chineseSentences: ['我的床是蓝色的。', '猫在床下面。', '我的卧室里有一张大床。'] },
    { word: 'living room', wordChinese: '客厅', englishSentences: ['A sofa and a chair are in the living room.', 'My family are in the living room.', 'Look at the cat! It\'s in the living room.'], chineseSentences: ['客厅里有沙发和椅子。', '我的家人在客厅里。', '看那只猫！它在客厅里。'] },
    { word: 'bedroom', wordChinese: '卧室', englishSentences: ['This is my bedroom. It\'s small.', 'The bed is in the bedroom.', 'Look at my bedroom! It\'s beautiful.'], chineseSentences: ['这是我的卧室。它很小。', '床在卧室里。', '看我的卧室！它很漂亮。'] },
    { word: 'kitchen', wordChinese: '厨房', englishSentences: ['Food is in the kitchen.', 'My mother is in the kitchen.', 'Look at the kitchen! It\'s big.'], chineseSentences: ['食物在厨房里。', '我的妈妈在厨房里。', '看那个厨房！它很大。'] },
    { word: 'animal', wordChinese: '动物', englishSentences: ['I like animals. Cats are my favourite.', 'Look at the animals! They are tigers, ducks, and fish.', 'What\'s your favourite animal? It\'s a dog.'], chineseSentences: ['我喜欢动物。猫是我的最爱。', '看那些动物！它们是老虎、鸭子和鱼。', '你最喜欢的动物是什么？是狗。'] },
    { word: 'cat', wordChinese: '猫', englishSentences: ['I have a white cat.', 'Look at the cat! It\'s on the sofa.', 'I like cats. They are beautiful.'], chineseSentences: ['我有一只白色的猫。', '看那只猫！它在沙发上。', '我喜欢猫。它们很漂亮。'] },
    { word: 'fish', wordChinese: '鱼', englishSentences: ['Look at the fish! They can swim.', 'I have a cat. It likes fish.', 'Fish are animals.'], chineseSentences: ['看那些鱼！它们会游泳。', '我有一只猫。它喜欢鱼。', '鱼是动物。'] },
    { word: 'bird', wordChinese: '鸟', englishSentences: ['Look at the bird! It\'s red.', 'Birds can fly.', 'I have a bird. It\'s beautiful.'], chineseSentences: ['看那只鸟！它是红色的。', '鸟会飞。', '我有一只鸟。它很漂亮。'] },
    { word: 'duck', wordChinese: '鸭子', englishSentences: ['Look at the duck! It\'s yellow.', 'Ducks can swim.', 'Ducks have got two legs.'], chineseSentences: ['看那只鸭子！它是黄色的。', '鸭子会游泳。', '鸭子有两条腿。'] },
    { word: 'tiger', wordChinese: '老虎', englishSentences: ['Look at the tiger! It\'s big.', 'Tigers are orange.', 'I don\'t like tigers. They are ugly.'], chineseSentences: ['看那只老虎！它很大。', '老虎是橙色的。', '我不喜欢老虎。它们很丑。'] },
    { word: 'dog', wordChinese: '狗', englishSentences: ['I have a black dog.', 'Look at the dog! It\'s got four short legs.', 'I like dogs.'], chineseSentences: ['我有一只黑色的狗。', '看那只狗！它有四条短腿。', '我喜欢狗。'] },
    { word: 'frog', wordChinese: '青蛙', englishSentences: ['Look at the green frog! It can jump.', 'Frogs have got two long legs.', 'I like frogs.'], chineseSentences: ['看那只绿色的青蛙！它会跳。', '青蛙有两条长腿。', '我喜欢青蛙。'] },
    { word: 'spider', wordChinese: '蜘蛛', englishSentences: ['Look at the spider! It\'s got eight legs.', 'I don\'t like spiders. They are ugly.', 'A black spider is on the door.'], chineseSentences: ['看那只蜘蛛！它有八条腿。', '我不喜欢蜘蛛。它们很丑。', '一只黑色的蜘蛛在门上。'] },
    { word: 'bag', wordChinese: '书包', englishSentences: ['My bag is blue.', 'Look! The bag is under the chair.', 'What\'s in my bag? A pencil and an eraser.'], chineseSentences: ['我的书包是蓝色的。', '看！那个包在椅子下面。', '我的书包里有什么？一支铅笔和一个橡皮。'] },
    { word: 'table', wordChinese: '桌子', englishSentences: ['The book is on the table.', 'Look at the table! It\'s big.', 'My toy car is under the table.'], chineseSentences: ['书在桌子上。', '看那张桌子！它很大。', '我的玩具汽车在桌子下面。'] },
    { word: 'eraser', wordChinese: '橡皮', englishSentences: ['I have a white eraser.', 'My eraser is in my bag.', 'Pass me the eraser, please.'], chineseSentences: ['我有一个白色的橡皮。', '我的橡皮在书包里。', '请给我那个橡皮。'] },
    { word: 'pencil', wordChinese: '铅笔', englishSentences: ['I have a yellow pencil.', 'My pencil is under the book.', 'How many pencils have you got? I have five.'], chineseSentences: ['我有一支黄色的铅笔。', '我的铅笔在书下面。', '你有多少支铅笔？我有五支。'] },
    { word: 'book', wordChinese: '书', englishSentences: ['Look at my book! It\'s red.', 'The book is on the table.', 'Open your book, please.'], chineseSentences: ['看我的书！它是红色的。', '书在桌子上。', '请打开你的书。'] },
    { word: 'chair', wordChinese: '椅子', englishSentences: ['The chair is black.', 'The cat is on the chair.', 'Sit down on the chair, please.'], chineseSentences: ['椅子是黑色的。', '猫在椅子上。', '请坐在椅子上。'] },
    { word: 'toy', wordChinese: '玩具', englishSentences: ['I have many toys. They are in my bedroom.', 'Look at the toys! They are cars, a doll, and a ball.', 'What\'s your favourite toy? It\'s a robot.'], chineseSentences: ['我有很多玩具。它们在我的房间里。', '看那些玩具！它们是汽车、洋娃娃和一个球。', '你最喜欢的玩具是什么？是机器人。'] },
    { word: 'kite', wordChinese: '风筝', englishSentences: ['I have a kite. It\'s blue.', 'Look at the kite! It can fly.', 'Where\'s my kite? It\'s on the house.'], chineseSentences: ['我有一个风筝。它是蓝色的。', '看那只风筝！它会飞。', '我的风筝在哪里？它在房子上。'] },
    { word: 'ball', wordChinese: '球', englishSentences: ['I have a red ball.', 'The ball is under the chair.', 'Look at the ball! It\'s big.'], chineseSentences: ['我有一个红色的球。', '球在椅子下面。', '看那个球！它很大。'] },
    { word: 'car', wordChinese: '汽车', englishSentences: ['I have a blue toy car.', 'Look at the car! It\'s red.', 'My toy car is under the table.'], chineseSentences: ['我有一辆蓝色的玩具汽车。', '看那辆汽车！它是红色的。', '我的玩具汽车在桌子下面。'] },
    { word: 'doll', wordChinese: '洋娃娃', englishSentences: ['I have a beautiful doll. She\'s beautiful.', 'My doll is on the sofa.', 'Look at the doll! She\'s got big eyes.'], chineseSentences: ['我有一个漂亮的洋娃娃。她很漂亮。', '我的洋娃娃在沙发上。', '看那个洋娃娃！她有大大的眼睛。'] },
    { word: 'bike', wordChinese: '自行车', englishSentences: ['I have a blue bike.', 'Look at the bike! It\'s small.', 'Where\'s my bike? It\'s next to the house.'], chineseSentences: ['我有一辆蓝色的自行车。', '看那辆自行车！它很小。', '我的自行车在哪里？它在房子旁边。'] },
    { word: 'robot', wordChinese: '机器人', englishSentences: ['I have a toy robot. It\'s small.', 'Look at the robot! It\'s got a long arm.', 'What\'s your favourite toy? It\'s a robot.'], chineseSentences: ['我有一个玩具机器人。它很小。', '看那个机器人！它有一条长长的金属手臂。', '你最喜欢的玩具是什么？是机器人。'] },
    { word: 'mother', wordChinese: '妈妈', englishSentences: ['Who\'s that? She\'s my mother.', 'My mother is in the kitchen.', 'I love my mother.'], chineseSentences: ['那是谁？她是我妈妈。', '我的妈妈在厨房里。', '我爱我的妈妈。'] },
    { word: 'father', wordChinese: '爸爸', englishSentences: ['Who\'s that? He\'s my father.', 'My father has got a black car.', 'I love my father.'], chineseSentences: ['那是谁？他是我爸爸。', '我的爸爸有一辆黑色的汽车。', '我爱我的爸爸。'] },
    { word: 'grandmother', wordChinese: '奶奶', englishSentences: ['Who\'s that? She\'s my grandmother.', 'My grandmother is old, but she is happy.', 'I love my grandmother.'], chineseSentences: ['那是谁？她是我奶奶。', '我的奶奶很老了，但是她很快乐。', '我爱我的奶奶。'] },
    { word: 'grandfather', wordChinese: '爷爷', englishSentences: ['Who\'s that? He\'s my grandfather.', 'My grandfather is seventy-one. He is old.', 'I love my grandfather.'], chineseSentences: ['那是谁？他是我爷爷。', '我的爷爷七十一岁。他很老。', '我爱我的爷爷。'] },
    { word: 'sister', wordChinese: '姐姐', englishSentences: ['Who\'s that? She\'s my sister.', 'My sister is young. She is two.', 'I love my sister.'], chineseSentences: ['那是谁？她是我姐姐。', '我的妹妹很小。她两岁。', '我爱我的妹妹。'] },
    { word: 'brother', wordChinese: '哥哥', englishSentences: ['Who\'s that? He\'s my brother.', 'My brother has got a red robot.', 'I love my brother.'], chineseSentences: ['那是谁？他是我哥哥。', '我的哥哥有一个红色的机器人。', '我爱我的哥哥。'] },
    { word: 'horse', wordChinese: '马', englishSentences: ['Look at the horse! It\'s big.', 'Horses have got long legs.', 'I like horses. They are beautiful.'], chineseSentences: ['看那匹马！它很大。', '马有长长的腿。', '我喜欢马。它们很漂亮。'] },
    { word: 'clean', wordChinese: '干净', englishSentences: ['Look at my hands! They are clean.', 'That table is clean.', 'My bedroom is clean.'], chineseSentences: ['看我的手！它们是干净的。', '那个桌子是干净的。', '我的房间是干净的。'] },
    { word: 'dirty', wordChinese: '脏', englishSentences: ['Look at the dog! It\'s dirty.', 'My hands are dirty.', 'That chair is dirty.'], chineseSentences: ['看那只狗！它是脏的。', '我的手是脏的。', '那个凳子是脏的。'] },
    { word: 'small', wordChinese: '小', englishSentences: ['Look at the spider! It\'s small.', 'My hands are small.', 'The purple robot is small.'], chineseSentences: ['看那只蜘蛛！它很小。', '我的手很小。', '那个紫色的机器人很小。'] },
    { word: 'big', wordChinese: '大', englishSentences: ['Look at the tiger! It\'s big.', 'My head is big.', 'The robot is big.'], chineseSentences: ['看那只老虎！它很大。', '我的头很大。', '那个机器人很大。'] },
    { word: 'long', wordChinese: '长', englishSentences: ['Look at the dog! It\'s got long legs.', 'My pencil is long.', 'That robot has long arms.'], chineseSentences: ['看那只狗！它有长长的腿。', '我的铅笔很长。', '那个机器人有长长的手臂。'] },
    { word: 'short', wordChinese: '短', englishSentences: ['Look at the dog! It\'s got short legs.', 'My pencil is short.', 'My grandfather is short.'], chineseSentences: ['看那只狗！它有短短的腿。', '我的铅笔很短。', '我的爷爷很矮。'] },
    { word: 'our', wordChinese: '我们的', englishSentences: ['This is our house.', 'Our bedroom is big.', 'Our cat is black.'], chineseSentences: ['这是我们的房子。', '我们的卧室很大', '我们的猫是黑色的。'] },
    { word: 'they', wordChinese: '他们', englishSentences: ['Look at the birds! They are red.', 'My grandfather and grandmother. They are old.', 'Those are toys. They are in my bedroom.'], chineseSentences: ['看那些鸟！它们是红色的。', '我的爷爷和奶奶。他们很老。', '那些是玩具。它们在我的房间里。'] },
    { word: 'computer', wordChinese: '电脑', englishSentences: ['Look at the computer! It\'s small.', 'The computer is on the table.', 'My father has got a computer.'], chineseSentences: ['看那台电脑！它很小。', '电脑在桌子上。', '我的爸爸有一台电脑。'] },
    { word: 'train', wordChinese: '火车', englishSentences: ['I have a toy train. It\'s blue.', 'Look at the train! It\'s very long.', 'What\'s your favourite toy? It\'s a train.'], chineseSentences: ['我有一辆玩具火车。它是蓝色的。', '看那辆火车！它很长。', '你最喜欢的玩具是什么？是火车。'] },
    { word: 'beautiful', wordChinese: '漂亮', englishSentences: ['Look at the doll! She\'s beautiful.', 'My mother is beautiful.', 'That kite is beautiful.'], chineseSentences: ['看那个洋娃娃！她很漂亮。', '我的妈妈很漂亮。', '那个风筝是漂亮的。'] },
    { word: 'ugly', wordChinese: '丑', englishSentences: ['I don\'t like that spider. It\'s ugly.', 'Look at the ugly toy! I don\'t like it.', 'That dog is ugly, but it\'s happy.'], chineseSentences: ['我不喜欢那只蜘蛛。它很丑。', '看那个丑陋的玩具！我不喜欢它。', '那只狗很丑，但是很快乐。'] },
    { word: 'happy', wordChinese: '快乐', englishSentences: ['I am happy today.', 'Look at the happy dog!', 'My grandfather is happy.'], chineseSentences: ['我今天很快乐。', '看那只快乐的狗！', '我的爷爷很快乐。'] },
    { word: 'sad', wordChinese: '伤心', englishSentences: ['My cat isn\'t here. I am sad.', 'The cat looks sad.', 'Don\'t be sad. It\'s ok.'], chineseSentences: ['我的猫不在这里。我很伤心。', '这只猫看起来很伤心。', '别伤心，没事的。'] },
    { word: 'old', wordChinese: '老', englishSentences: ['My grandfather is old.', 'Look at the old car! It\'s very small.', 'That house is old.'], chineseSentences: ['我的爷爷很老。', '看那辆老汽车！它很小。', '那个房子很老。'] },
    { word: 'young', wordChinese: '年轻', englishSentences: ['My sister is young. She is two.', 'The cat is young.', 'My mother is young.'], chineseSentences: ['我的妹妹很年轻。她两岁。', '小猫很年轻。', '我的妈妈很年轻。'] },
    { word: 'mouse', wordChinese: '老鼠', englishSentences: ['The mouse is small.', 'Cats like mice.', 'A black mouse is under the chair.'], chineseSentences: ['老鼠很小。', '猫喜欢老鼠。', '一只黑色的老鼠在椅子下面。'] },
    { word: 'face', wordChinese: '脸', englishSentences: ['Point to your face.', 'My face is clean.', 'Look at that boy! His face is dirty.'], chineseSentences: ['指着你的脸。', '我的脸很干净。', '看那个男孩！他的脸是脏的。'] },
    { word: 'ear', wordChinese: '耳朵', englishSentences: ['I\'ve got two ears.', 'Point to your ears.', 'I hear with my ears.'], chineseSentences: ['我有两只耳朵。', '指着你的耳朵。', '我用耳朵听。'] },
    { word: 'shoulder', wordChinese: '肩膀', englishSentences: ['Point to your shoulder.', 'My shoulder is big.', 'Look at that robot! It\'s got shoulders.'], chineseSentences: ['指着你的肩膀。', '我的肩膀很大。', '看那个机器人！它有肩膀。'] },
    { word: 'knee', wordChinese: '膝盖', englishSentences: ['Point to your knee.', 'My knee is dirty.', 'Look at that dog! Its knee is dirty.'], chineseSentences: ['指着你的膝盖。', '我的膝盖很脏。', '看那只狗！它的膝盖脏了。'] },
    { word: 'toe', wordChinese: '脚趾', englishSentences: ['I\'ve got ten toes.', 'Point to your toes.', 'My toes are small.'], chineseSentences: ['我有十个脚趾。', '指着你的脚趾。', '我的脚趾很小。'] },
    { word: 'monster', wordChinese: '怪物', englishSentences: ['Look at that monster! It\'s ugly.', 'I don\'t like monsters.', 'That monster has got a big green head.'], chineseSentences: ['看那个怪物！它很丑。', '我不喜欢怪物。', '那个怪物有绿色的大头。'] },
    { word: 'hair', wordChinese: '头发', englishSentences: ['My hair is black.', 'That doll has got long hair.', 'Point to your hair.'], chineseSentences: ['我的头发是黑色的。', '那个洋娃娃有长头发。', '指着你的头发。'] },
    { word: 'but', wordChinese: '但是', englishSentences: ['I like cats, but I don\'t like spiders.', 'My grandfather is old, but he is happy.', 'I can swim, but I can\'t fly.'], chineseSentences: ['我喜欢猫，但是我不喜欢蜘蛛。', '我的爷爷很老，但是他很快乐。', '我会游泳，但是我不会飞。'] },
    { word: 'teeth', wordChinese: '牙齿', englishSentences: ['I\'ve got teeth. They are white.', 'Look at that tiger! It\'s got big teeth.', 'I can brush my teeth.'], chineseSentences: ['我有牙齿。它们是白色的。', '看那只老虎！它有大的牙齿。', '我会刷牙。'] },
    { word: 'nose', wordChinese: '鼻子', englishSentences: ['Point to your nose.', 'My nose is small.', 'I smell with my nose.'], chineseSentences: ['指着你的鼻子。', '我的鼻子很小。', '我用鼻子闻。'] },
    { word: 'show', wordChinese: '展示', englishSentences: ['Show me your toy.', 'Show me that book, please.', 'Show me your hand.'], chineseSentences: ['给我看看你的玩具。', '请给我看看那本书。', '给我看看你的手。'] },
    { word: 'boy', wordChinese: '男孩', englishSentences: ['That boy is my brother.', 'Look at that boy! He is happy.', 'I am a boy.'], chineseSentences: ['那个男孩是我的哥哥。', '看那个男孩！他很快乐。', '我是一个男孩。'] },
    { word: 'girl', wordChinese: '女孩', englishSentences: ['That girl is my sister.', 'Look at that girl! She is beautiful.', 'I am a girl.'], chineseSentences: ['那个女孩是我的妹妹。', '看那个女孩！她很漂亮。', '我是一个女孩。'] },
    { word: 'too', wordChinese: '也', englishSentences: ['I\'ve got a cat. My sister has got a cat too.', 'I like apples. I like bananas too.', 'I am happy. My sister is happy too.'], chineseSentences: ['我有一只猫。我妹妹也有一只猫。', '我喜欢苹果。我也喜欢香蕉。', '我很高兴。我妹妹也很高兴。'] },
    { word: 'very', wordChinese: '非常', englishSentences: ['That tiger is very big.', 'My mother is very beautiful.', 'I am very happy.'], chineseSentences: ['那只老虎非常大。', '我的妈妈非常漂亮。', '我非常快乐。'] },
    { word: 'sea', wordChinese: '大海', englishSentences: ['Look at the sea! It\'s blue.', 'Fish are in the sea.', 'I like the sea.'], chineseSentences: ['看那片海！它是蓝色的。', '鱼在海里。', '我喜欢海。'] },
    { word: 'smell', wordChinese: '闻', englishSentences: ['I smell with my nose.', 'Smell this cake. It is big.', 'This dog can smell the ball.'], chineseSentences: ['我用鼻子闻。', '闻一闻这个蛋糕。它很大。', '这只狗在闻球。'] },
    { word: 'taste', wordChinese: '尝', englishSentences: ['I taste with my mouth.', 'Taste this red apple.', 'I like to taste food.'], chineseSentences: ['我用嘴巴尝。', '尝一尝这个红色的苹果', '我喜欢尝食物。'] },
    { word: 'touch', wordChinese: '触摸', englishSentences: ['I touch with my hands.', 'Touch this cat. It is small.', 'Don\'t touch that spider!'], chineseSentences: ['我用手触摸。', '摸一摸这只猫。它很小。', '不要摸那个蜘蛛！'] },
    { word: 'brush', wordChinese: '刷', englishSentences: ['I can brush my teeth.', 'Brush your hair, please.', 'Look! That girl is brushing her teeth.'], chineseSentences: ['我会刷牙。', '请刷你的头发。', '看！那个女孩在刷牙。'] },
    { word: 'walk', wordChinese: '走路', englishSentences: ['I can walk.', 'Look! That boy is walking.', 'My dog can walk.'], chineseSentences: ['我会走路。', '看！那个男孩在走路。', '我的狗会走路。'] },
    { word: 'wash', wordChinese: '洗', englishSentences: ['I can wash my hands.', 'Wash your face, please.', 'Look! That girl is washing an apple.'], chineseSentences: ['我会洗手。', '请洗你的脸。', '看！那个女孩在洗苹果。'] },
    { word: 'feed', wordChinese: '喂养', englishSentences: ['I can feed my cat.', 'Feed that bird, please.', 'Look! That boy is feeding the dog.'], chineseSentences: ['我会喂我的猫。', '请喂那只鸟。', '看！那个男孩在喂狗。'] },
    { word: 'elephant', wordChinese: '大象', englishSentences: ['Look at the elephant! It\'s big.', 'Elephants have got long noses.', 'I like elephants.'], chineseSentences: ['看那头大象！它很大。', '大象有长鼻子。', '我喜欢大象。'] },
    { word: 'wild', wordChinese: '野生的', englishSentences: ['Tigers are wild animals.', 'I don\'t like wild animals.', 'Look at those wild animals!'], chineseSentences: ['老虎是野生动物。', '我不喜欢野生动物。', '看那些野生动物！'] },
    { word: 'hippo', wordChinese: '河马', englishSentences: ['Look at the hippo! It\'s big.', 'Hippos have got big mouths.', 'I like hippos.'], chineseSentences: ['看那只河马！它很大。', '河马有大的嘴。', '我喜欢河马。'] },
    { word: 'monkey', wordChinese: '猴子', englishSentences: ['Look at the monkey! It\'s got long arms.', 'Monkeys can jump.', 'I like monkeys.'], chineseSentences: ['看那只猴子！它有长手臂。', '猴子会跳。', '我喜欢猴子。'] },
    { word: 'snake', wordChinese: '蛇', englishSentences: ['Look at the snake! It\'s long.', 'I don\'t like snakes.', 'That snake is green.'], chineseSentences: ['看那条蛇！它很长。', '我不喜欢蛇。', '那条蛇是绿色的。'] },
    { word: 'crocodile', wordChinese: '鳄鱼', englishSentences: ['Look at the crocodile! It\'s got a big mouth.', 'Crocodiles have got long legs.', 'I don\'t like crocodiles.'], chineseSentences: ['看那只鳄鱼！它有大的嘴。', '鳄鱼有长腿。', '我不喜欢鳄鱼。'] },
    { word: 'these', wordChinese: '这些', englishSentences: ['These are my books.', 'These books are my favourite.', 'I like these apples.'], chineseSentences: ['这些是我的书。', '这些是我最喜欢的书。', '我喜欢这些苹果。'] },
    { word: 'those', wordChinese: '那些', englishSentences: ['Those are her toys.', 'Look at those birds!', 'I don\'t like crocodiles.'], chineseSentences: ['那些是她的玩具。', '看那些鸟！', '我不喜欢那些蜘蛛。'] },
    { word: 'tail', wordChinese: '尾巴', englishSentences: ['Look at that cat! It\'s got a long tail.', 'That dog has got a short tail.', 'The monkey\'s tail is very long.'], chineseSentences: ['看那只猫！它有一条长尾巴。', '那只狗有一条短尾巴。', '猴子的尾巴很长。'] },
    { word: 'clothes', wordChinese: '衣服', englishSentences: ['These are my clothes. They are clean.', 'I like red clothes.', 'Those clothes are dirty. Please wash them.'], chineseSentences: ['这些是我的衣服。它们是干净的。', '我喜欢红色的衣服。', '那些衣服是脏的。请洗它们。'] },
    { word: 'shoes', wordChinese: '鞋子', englishSentences: ['My shoes are under the bed.', 'I\'ve got a pair of black shoes.', 'Look! His shoes are big.'], chineseSentences: ['我的鞋子在床下面。', '我有一双黑色的鞋子。', '看！他的鞋子很大。'] },
    { word: 'trousers', wordChinese: '裤子', englishSentences: ['These are my trousers. They are blue.', 'Your trousers are on the chair.', 'I don\'t like those trousers. They are ugly.'], chineseSentences: ['这些是我的裤子。它们是蓝色的。', '你的裤子在椅子上。', '我不喜欢那条裤子。它很丑。'] },
    { word: 'skirt', wordChinese: '裙子', englishSentences: ['My sister has got a pink skirt.', 'This skirt is beautiful.', 'Where\'s your skirt? It\'s in the bedroom.'], chineseSentences: ['我妹妹有一条粉色的裙子。', '这条裙子很漂亮。', '你的裙子在哪里？它在卧室里。'] },
    { word: 'jacket', wordChinese: '夹克', englishSentences: ['I\'ve got a red jacket.', 'His jacket is on the sofa.', 'That jacket is small.'], chineseSentences: ['我有一件红色的夹克。', '他的夹克在沙发上。', '那件夹克很小。'] },
    { word: 't-shirt', wordChinese: 'T恤', englishSentences: ['I like this white t-shirt.', 'Your t-shirt is dirty. Please wash it.', 'My brother has got a blue t-shirt.'], chineseSentences: ['我喜欢这件白色的T恤。', '你的T恤是脏的。请洗它。', '我哥哥有一件蓝色的T恤。'] },
    { word: 'ask', wordChinese: '问', englishSentences: ['Can I ask you a question?', 'I ask my mother: Where is my bag?', 'The teacher says: Please ask me.'], chineseSentences: ['我可以问你一个问题吗？', '我问妈妈："我的书包在哪里？"', '老师说：请问我。'] },
    { word: 'catch', wordChinese: '接住、抓住', englishSentences: ['I can catch the ball.', 'Look! That cat can catch a mouse.', 'Please catch my hand.'], chineseSentences: ['我能接住球', '我问妈妈："我的书包在哪里？"', '请抓住我的手。'] },
  ];
}

// ========== 单词列表页 ==========
export class AdminWordList {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.allWords = getAllWords();
    this.customWords = getCustomWords();
    this.searchKeyword = '';
  }

  init() {
    this.render();
    this.bindEvents();
  }

  getFilteredWords() {
    if (!this.searchKeyword.trim()) return this.allWords;
    const kw = this.searchKeyword.toLowerCase();
    return this.allWords.filter(w =>
      w.english.toLowerCase().includes(kw) ||
      w.chinese.toLowerCase().includes(kw)
    );
  }

  getQuestionCount(word) {
    const hardcoded = getHardcodedQuestions();
    const stored = getStoredQuestions();
    let count = 0;
    const hcItem = hardcoded.find(q => q.word === word);
    if (hcItem) count += hcItem.englishSentences.length;
    const storedItem = stored[word];
    if (storedItem) count += (storedItem.englishSentences?.length || 0);
    return count;
  }

  isCustomWord(word) {
    return this.customWords.some(w => w.english === word);
  }

  render() {
    const words = this.getFilteredWords();
    this.container.innerHTML = `
      <div class="admin-container">
        <div class="admin-header">
          <div class="admin-word-info">
            <h2>单词列表</h2>
            <span class="word-progress">共 ${words.length} 个单词</span>
          </div>
          <div class="admin-actions">
            <button class="admin-btn add-word-btn" id="add-word-btn">
              <i class="fas fa-plus"></i> 新增单词
            </button>
          </div>
        </div>

        <div class="admin-section">
          <div class="search-box">
            <i class="fas fa-search search-icon"></i>
            <input type="text" id="word-search" placeholder="搜索单词或中文..." value="${this.searchKeyword}">
          </div>
        </div>

        <div class="admin-section">
          <div class="word-list">
            ${words.length === 0 ? '<p class="empty-tip">暂无单词</p>' : ''}
            ${words.map(w => {
              const qCount = this.getQuestionCount(w.english);
              const isCustom = this.isCustomWord(w.english);
              return `
                <div class="word-item">
                  <div class="word-info">
                    <div class="word-en">${w.english}</div>
                    <div class="word-zh">${w.chinese}</div>
                  </div>
                  <div class="word-meta">
                    <span class="question-count">${qCount} 题</span>
                    <div class="word-actions">
                      <button class="admin-btn detail-btn" data-word="${w.english}">
                        <i class="fas fa-edit"></i> 详情
                      </button>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    // 搜索
    const searchInput = this.container.querySelector('#word-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchKeyword = e.target.value;
        this.render();
        this.bindEvents();
      });
    }

    // 详情按钮
    this.container.querySelectorAll('.detail-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const word = e.currentTarget.dataset.word;
        window.router.navigate(`/admin/word-to-sentence/${word}`);
      });
    });

    // 新增单词
    const addBtn = this.container.querySelector('#add-word-btn');
    if (addBtn) {
      addBtn.addEventListener('click', () => this.handleAddWord());
    }
  }

  handleAddWord() {
    window.router.navigate('/admin/add-word');
  }

  cleanup() {
    this.container.innerHTML = '';
  }
}

// ========== 单词出题详情页 ==========
export class AdminWordToSentence {
  constructor(containerId, wordEnglish) {
    this.container = document.getElementById(containerId);
    this.wordEnglish = wordEnglish;
    this.allWords = getAllWords();
    this.currentWord = this.allWords.find(w => w.english === wordEnglish);
    this.generatedQuestions = [];
    this.editingIndex = -1;
    this.isLoading = false;
    this.errorMessage = '';
  }

  init() {
    this.render();
    this.bindEvents();
  }

  // 获取合并后的题目（硬编码 + localStorage）
  getMergedQuestions(word) {
    const stored = getStoredQuestions();
    const hardcoded = getHardcodedQuestions();
    const hardcodedItem = hardcoded.find(q => q.word === word);
    const storedItem = stored[word];

    let englishSentences = [];
    let chineseSentences = [];

    if (hardcodedItem) {
      englishSentences = [...hardcodedItem.englishSentences];
      chineseSentences = [...hardcodedItem.chineseSentences];
    }

    if (storedItem) {
      englishSentences = [...englishSentences, ...storedItem.englishSentences];
      chineseSentences = [...chineseSentences, ...storedItem.chineseSentences];
    }

    return { englishSentences, chineseSentences };
  }

  render() {
    const word = this.currentWord;
    if (!word) {
      this.container.innerHTML = '<p class="empty-tip">单词不存在</p>';
      return;
    }

    const { englishSentences, chineseSentences } = this.getMergedQuestions(word.english);

    this.container.innerHTML = `
      <div class="admin-container">
        <div class="admin-header">
          <div class="admin-word-info">
            <h2>${word.english} <span class="word-chinese">${word.chinese}</span></h2>
            <span class="word-progress">${englishSentences.length} 题</span>
          </div>
          <div class="admin-actions">
            <button class="admin-btn back-btn" id="back-to-list">
              <i class="fas fa-arrow-left"></i> 返回列表
            </button>
            <button class="admin-btn generate-btn" id="generate-questions" ${this.isLoading ? 'disabled' : ''}>
              <i class="fas fa-magic"></i> ${this.isLoading ? '出题中...' : '出题'}
            </button>
          </div>
        </div>

        ${this.errorMessage ? `
          <div class="admin-section">
            <div class="error-message">
              <i class="fas fa-exclamation-circle"></i> ${this.errorMessage}
            </div>
          </div>
        ` : ''}

        ${this.isLoading ? `
          <div class="admin-section">
            <div class="loading-indicator">
              <div class="loading-spinner"></div>
              <span>AI正在生成题目，请稍候...</span>
            </div>
          </div>
        ` : ''}

        <div class="admin-section">
          <h3><i class="fas fa-list"></i> 已有题目 (${englishSentences.length}题)</h3>
          <div class="existing-questions">
            ${englishSentences.length === 0 ? '<p class="empty-tip">暂无题目</p>' : ''}
            ${englishSentences.map((en, idx) => `
              <div class="question-item ${this.editingIndex === idx ? 'editing' : ''}" data-index="${idx}">
                <div class="question-content">
                  <div class="question-en">${en}</div>
                  <div class="question-zh">${chineseSentences[idx] || ''}</div>
                </div>
                <div class="question-actions">
                  ${this.editingIndex === idx ? `
                    <button class="admin-btn update-btn" data-index="${idx}">
                      <i class="fas fa-save"></i> 更新
                    </button>
                    <button class="admin-btn cancel-btn" data-index="${idx}">
                      <i class="fas fa-times"></i> 取消
                    </button>
                  ` : `
                    <button class="admin-btn edit-btn" data-index="${idx}">
                      <i class="fas fa-edit"></i> 编辑
                    </button>
                  `}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="admin-section generated-section" id="generated-section" style="display: ${this.generatedQuestions.length > 0 ? 'block' : 'none'};">
          <h3><i class="fas fa-magic"></i> 生成题目 (${this.generatedQuestions.length}题)</h3>
          <div class="generated-questions">
            ${this.generatedQuestions.map((q, idx) => `
              <div class="question-item generated" data-gen-index="${idx}">
                <div class="question-content">
                  <div class="question-en">${q.english}</div>
                  <div class="question-zh">${q.chinese}</div>
                </div>
                <div class="question-actions">
                  <button class="admin-btn add-btn" data-gen-index="${idx}">
                    <i class="fas fa-plus"></i> 加入题目
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    // 返回列表
    const backBtn = this.container.querySelector('#back-to-list');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        window.router.navigate('/admin/word-to-sentence');
      });
    }

    // 出题按钮
    const generateBtn = this.container.querySelector('#generate-questions');
    if (generateBtn) {
      generateBtn.addEventListener('click', () => this.handleGenerate());
    }

    // 编辑按钮
    this.container.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.currentTarget.dataset.index);
        this.handleEdit(index);
      });
    });

    // 更新按钮
    this.container.querySelectorAll('.update-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.currentTarget.dataset.index);
        this.handleUpdate(index);
      });
    });

    // 取消按钮
    this.container.querySelectorAll('.cancel-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.editingIndex = -1;
        this.render();
        this.bindEvents();
      });
    });

    // 加入题目按钮
    this.container.querySelectorAll('.add-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.currentTarget.dataset.genIndex);
        this.handleAdd(index);
      });
    });
  }

  async handleGenerate() {
    const word = this.currentWord;
    this.errorMessage = '';
    this.isLoading = true;
    this.generatedQuestions = [];
    this.render();
    this.bindEvents();

    try {
      this.generatedQuestions = await generateSentences(word.english, word.chinese, 10);
      if (this.generatedQuestions.length === 0) {
        this.errorMessage = '未能生成有效题目，请重试';
      }
    } catch (error) {
      this.errorMessage = `出题失败：${error.message}`;
      this.generatedQuestions = [];
    } finally {
      this.isLoading = false;
      this.render();
      this.bindEvents();
    }
  }

  handleEdit(index) {
    this.editingIndex = index;
    this.render();
    this.bindEvents();

    // 将对应题目替换为输入框
    const item = this.container.querySelector(`.question-item[data-index="${index}"]`);
    if (item) {
      const word = this.currentWord;
      const { englishSentences, chineseSentences } = this.getMergedQuestions(word.english);
      const content = item.querySelector('.question-content');
      content.innerHTML = `
        <div class="edit-field">
          <label>英文句子</label>
          <textarea class="edit-en" rows="2">${englishSentences[index]}</textarea>
        </div>
        <div class="edit-field">
          <label>中文句子</label>
          <textarea class="edit-zh" rows="2">${chineseSentences[index]}</textarea>
        </div>
      `;
    }
  }

  handleUpdate(index) {
    const item = this.container.querySelector(`.question-item[data-index="${index}"]`);
    if (!item) return;

    const enInput = item.querySelector('.edit-en');
    const zhInput = item.querySelector('.edit-zh');
    if (!enInput || !zhInput) return;

    const newEn = enInput.value.trim();
    const newZh = zhInput.value.trim();
    if (!newEn || !newZh) {
      alert('中英文句子都不能为空');
      return;
    }

    const word = this.currentWord;
    const stored = getStoredQuestions();
    const hardcoded = getHardcodedQuestions();
    const hardcodedItem = hardcoded.find(q => q.word === word.english);

    if (hardcodedItem && index < hardcodedItem.englishSentences.length) {
      // 修改硬编码中的题目 - 采用覆盖策略
      if (!stored[word.english]) {
        stored[word.english] = {
          word: word.english,
          wordChinese: word.chinese,
          englishSentences: [],
          chineseSentences: []
        };
      }
      if (!stored[word.english]._overrides) {
        stored[word.english]._overrides = {};
      }
      stored[word.english]._overrides[index] = { english: newEn, chinese: newZh };
    } else {
      // 编辑的是localStorage中的题目
      if (!stored[word.english]) {
        stored[word.english] = {
          word: word.english,
          wordChinese: word.chinese,
          englishSentences: [],
          chineseSentences: []
        };
      }
      const hcCount = hardcodedItem ? hardcodedItem.englishSentences.length : 0;
      const localIndex = index - hcCount;
      if (localIndex >= 0) {
        stored[word.english].englishSentences[localIndex] = newEn;
        stored[word.english].chineseSentences[localIndex] = newZh;
      }
    }

    saveStoredQuestions(stored);
    this.editingIndex = -1;
    this.render();
    this.bindEvents();
  }

  handleAdd(genIndex) {
    const q = this.generatedQuestions[genIndex];
    if (!q) return;

    const word = this.currentWord;
    const stored = getStoredQuestions();
    if (!stored[word.english]) {
      stored[word.english] = {
        word: word.english,
        wordChinese: word.chinese,
        englishSentences: [],
        chineseSentences: []
      };
    }

    stored[word.english].englishSentences.push(q.english);
    stored[word.english].chineseSentences.push(q.chinese);
    saveStoredQuestions(stored);

    // 从生成列表中移除
    this.generatedQuestions.splice(genIndex, 1);
    this.render();
    this.bindEvents();
  }

  cleanup() {
    this.container.innerHTML = '';
  }
}

export function initAdminWordList() {
  const admin = new AdminWordList('admin-word-to-sentence-content');
  admin.init();
  return admin;
}

export function initAdminWordToSentence(wordEnglish) {
  const admin = new AdminWordToSentence('admin-word-to-sentence-content', wordEnglish);
  admin.init();
  return admin;
}
